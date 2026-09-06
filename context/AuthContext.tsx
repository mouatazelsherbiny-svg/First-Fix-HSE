"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

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
 *  Falls back to bare session info if the row hasn't landed (or never will)
 *  so a missing profile can't crash the whole app. Returns `isApproved`
 *  separately so callers can decide whether to actually let the visitor
 *  into the app (see login() below) — self-registered accounts (see
 *  app/signup/page.tsx) start out with is_approved = false until an admin
 *  approves them (see app/admin/users/page.tsx). */
async function loadProfile(
  userId: string,
  email: string
): Promise<{ user: AuthUser; isApproved: boolean }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, employee_code, project, avatar_url, role, is_approved")
    .eq("id", userId)
    .single<ProfileRow>();

  if (error || !data) {
    return {
      user: {
        id: userId,
        name: email,
        employeeCode: "",
        project: "KSP",
        email,
        role: "employee",
      },
      isApproved: true,
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
        if (!isApproved) {
          await supabase.auth.signOut();
          if (active) setUser(null);
        } else if (active) {
          setUser(profile);
        }
      }
      if (active) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return;
        if (session?.user) {
          const { user: profile, isApproved } = await loadProfile(
            session.user.id,
            session.user.email ?? ""
          );
          if (isApproved) {
            if (active) setUser(profile);
          }
        } else {
          setUser(null);
        }
      }
    );

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
        if (!isApproved) {
          // Valid credentials, but an admin hasn't approved this account
          // yet — don't let them into the app, and don't leave a signed-in
          // session sitting around either.
          await supabase.auth.signOut();
          return { ok: false, pending: true };
        }
        setUser(profile);
        return { ok: true };
      },
      signUp: async ({ fullName, employeeCode, project, email, password }) => {
        const { data, error } = await supabase.auth.signUp({
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
        // Self-registered accounts are pending — make sure no session
        // carries over from the sign-up call itself.
        await supabase.auth.signOut();
        return { ok: true };
      },
      logout: () => {
        void supabase.auth.signOut();
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
