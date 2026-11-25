"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { signupClient, supabase } from "@/lib/supabaseClient";

interface AuthUser {
  /** Supabase auth user id (uuid) — not for display, use employeeCode. */
  id: string;
  name: string;
  employeeCode: string;
  project: string;
  email: string;
  role: string;
  /** Real profile photo URL, once uploads are wired up. Undefined today —
   *  components should fall back to an initials avatar (see components/Avatar). */
  avatarUrl?: string;
}

export interface SignUpInput {
  fullName: string;
  employeeCode: string;
  project: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; pending?: boolean }>;
  signUp: (input: SignUpInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface ProfileRow {
  full_name: string | null;
  employee_code: string | null;
  project: string | null;
  avatar_url: string | null;
  role: string | null;
  is_approved: boolean | null;
}

/** Loads the profiles row created by the on_auth_user_created DB trigger.
 *  Returns `isApproved` separately so callers can decide whether to
 *  actually let the visitor into the app (see login() below) —
 *  self-registered accounts (see app/signup/page.tsx) start out with
 *  is_approved = false until an admin approves them (see
 *  app/user-management/page.tsx).
 *
 *  No row found means fail CLOSED (isApproved: false), not open. The
 *  trigger fires in the same transaction as the auth.users insert, so a
 *  missing row here in practice means the person's account was deleted
 *  (app/user-management/page.tsx's "delete-user" edge function removes
 *  the auth.users row, which cascades to profiles) — but their browser
 *  can still be holding an unexpired access token. Without this, that
 *  token kept working (as a synthesized "approved" guest profile) until
 *  it happened to expire on its own; treating "not found" as "not
 *  approved" instead makes the very next getSession()/refresh check
 *  (see the effect below, which runs on every page load) sign them
 *  straight back out. */
async function loadProfile(
  userId: string,
  email: string
): Promise<{ user: AuthUser; isApproved: boolean | null }> {
  // A failed lookup (network blip, a request racing a token refresh) is NOT
  // the same as "not approved": it used to sign people out at random. Retry,
  // and if it still fails report `null` (unknown) so the caller keeps the
  // session. A deleted account still ends up signed out: its refresh token
  // stops working, which signs the session out on its own.
  let data: ProfileRow | null = null;
  let missing = false;
  for (let attempt = 0; attempt < 3 && !data; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 400 * attempt));
    const res = await supabase
      .from("profiles")
      .select("full_name, employee_code, project, avatar_url, role, is_approved")
      .eq("id", userId)
      .maybeSingle<ProfileRow>();
    data = res.data;
    missing = !res.error && !res.data;
  }

  if (!data) {
    return {
      user: { id: userId, name: email, employeeCode: "", project: "KSP", email, role: "employee" },
      isApproved: missing ? false : null,
    };
  }

  return {
    user: {
      id: userId,
      name: data.full_name || email,
      employeeCode: data.employee_code || "",
      project: data.project || "KSP",
      email,
      role: data.role || "employee",
      avatarUrl: data.avatar_url || undefined,
    },
    isApproved: data.is_approved !== false,
  };
}

/** Automatic sign-outs end this browser's session only, never the person's
 *  sessions on their other devices. */
const signOutHere = () => supabase.auth.signOut({ scope: "local" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { user: profile, isApproved } = await loadProfile(
          session.user.id,
          session.user.email ?? ""
        );
        // A pending account shouldn't silently ride an existing session —
        // sign it back out so the login page can show the pending message.
        if (isApproved === false) {
          await signOutHere();
          if (active) setUser(null);
        } else if (active) {
          setUser(profile);
        }
      }
      if (active) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      // Only (re)check the profile when someone signs in or the token is
      // refreshed (roughly hourly) — not on every tab focus. Run it outside
      // the auth callback: calling Supabase from inside it can stall the
      // client's session lock.
      if (event !== "SIGNED_IN" && event !== "TOKEN_REFRESHED" && event !== "USER_UPDATED") return;
      const { id, email } = session.user;
      setTimeout(async () => {
        const { user: profile, isApproved } = await loadProfile(id, email ?? "");
        if (!active) return;
        if (isApproved === false) {
          // Access was revoked (or never approved) since this session started.
          await signOutHere();
          if (active) setUser(null);
        } else if (isApproved) {
          setUser(profile);
        }
        // isApproved === null: lookup failed — keep the current session.
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error || !data.user) {
          return { ok: false, error: error?.message };
        }
        const { user: profile, isApproved } = await loadProfile(
          data.user.id,
          data.user.email ?? email
        );
        if (isApproved === false) {
          // Valid credentials, but an admin hasn't approved this account
          // yet — don't let them into the app, and don't leave a signed-in
          // session sitting around either.
          await signOutHere();
          return { ok: false, pending: true };
        }
        setUser(profile);
        return { ok: true };
      },
      signUp: async ({ fullName, employeeCode, project, email, password }) => {
        // Separate client: a sign-up never touches the session already
        // signed in on this browser (and its other tabs).
        const { data, error } = await signupClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              employee_code: employeeCode,
              project,
              // Read by the handle_new_user DB trigger — marks this
              // profile as pending admin approval instead of the default
              // "approved" state used for accounts created any other way
              // (e.g. directly in the Supabase dashboard).
              self_registered: "true",
            },
          },
        });
        if (error || !data.user) {
          return { ok: false, error: error?.message };
        }
        // Self-registered accounts are pending; the sign-up client keeps no
        // session, so nothing to sign out here.
        return { ok: true };
      },
      logout: () => {
        void signOutHere();
        setUser(null);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
