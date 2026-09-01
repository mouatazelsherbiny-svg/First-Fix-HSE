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
  /** Real profile photo URL, once uploads are wired up. Undefined today —
   *  components should fall back to an initials avatar (see components/Avatar). */
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Loads the profiles row created by the on_auth_user_created DB trigger.
 *  Falls back to bare session info if the row hasn't landed (or never will)
 *  so a missing profile can't crash the whole app. */
async function loadProfile(userId: string, email: string): Promise<AuthUser> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, employee_code, project, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return {
      id: userId,
      name: email,
      employeeCode: "",
      project: "KSP",
      email,
    };
  }

  return {
    id: userId,
    name: data.full_name || email,
    employeeCode: data.employee_code || "",
    project: data.project || "KSP",
    email,
    avatarUrl: data.avatar_url || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(
          session.user.id,
          session.user.email ?? ""
        );
        if (active) setUser(profile);
      }
      if (active) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return;
        if (session?.user) {
          const profile = await loadProfile(
            session.user.id,
            session.user.email ?? ""
          );
          if (active) setUser(profile);
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
        const profile = await loadProfile(data.user.id, data.user.email ?? email);
        setUser(profile);
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
