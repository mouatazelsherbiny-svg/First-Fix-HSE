"use client";

/**
 * Phone app (HSE-Reporting) sign-in: the First Fix "hard hat" picture with the
 * sign-in form inside the helmet. The picture keeps its shape on any screen
 * (the form is placed in % of it and sized in container units, so it always
 * lands inside the helmet); a blurred copy fills the rest of the screen.
 * Signing in opens the phone app's home (Daily / Monthly).
 */

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { markMobileApp, MOBILE_HOME } from "@/lib/mobileApp";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

const BG = "/brand/m-login-bg.webp";

/** One rounded field: icon | divider | input (like the design). */
function Field({
  icon: Icon,
  trailing,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof User; trailing?: React.ReactNode }) {
  return (
    <label className="flex h-[8cqw] items-center rounded-[1.4cqw] border border-white/35 bg-black/25 px-[2.4cqw] transition focus-within:border-[#ff7a1a] focus-within:shadow-[0_0_0_1px_#ff7a1a,0_0_18px_rgba(255,122,26,0.35)]">
      <Icon className="h-[3.4cqw] w-[3.4cqw] shrink-0 text-white/85" strokeWidth={1.7} />
      <span className="mx-[2.2cqw] h-[4.4cqw] w-px bg-white/30" />
      <input
        {...input}
        className="h-full min-w-0 flex-1 bg-transparent text-[max(16px,2.7cqw)] text-white outline-none placeholder:text-white/80"
      />
      {trailing}
    </label>
  );
}

export default function MobileLoginPage() {
  const { user, isLoading, login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    markMobileApp();
  }, []);

  useEffect(() => {
    if (!isLoading && user) router.replace(MOBILE_HOME);
  }, [isLoading, user, router]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await login(email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.pending ? t.login.errorPending : t.login.error);
      return;
    }
    router.replace(MOBILE_HOME);
  };

  const sendReset = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setForgotStatus("idle");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    setForgotStatus(resetError ? "error" : "success");
  };

  return (
    <div className={`${montserrat.className} relative min-h-[100dvh] overflow-x-hidden bg-[#16130f] text-white`}>
      {/* Blurred copy of the picture fills whatever the picture itself does not cover. */}
      <div
        aria-hidden
        className="fixed inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl"
        style={{ backgroundImage: `url(${BG})` }}
      />
      <div className="relative flex min-h-[100dvh] items-center justify-center">
        {/* The picture, always whole and in its own shape (9:16). */}
        <div
          className="relative shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          style={{ width: "min(100vw, max(56.25dvh, min(100vw, 430px)))", aspectRatio: "9 / 16", containerType: "inline-size" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BG} alt="First Fix HSE Department" className="absolute inset-0 h-full w-full select-none object-cover" draggable={false} />

          {/* Form inside the helmet. */}
          <div className="absolute left-[25.3%] top-[38.4%] flex w-[48.8%] flex-col items-center">
            <h1 className="text-[6.9cqw] font-extrabold uppercase leading-none tracking-tight">
              {mode === "login" ? "Sign In" : "Reset"}
            </h1>
            <span className="mt-[2.4cqw] h-[0.55cqw] w-[11.5cqw] rounded-full bg-[#ff7a1a] shadow-[0_0_10px_rgba(255,122,26,0.7)]" />

            {mode === "login" ? (
              <form onSubmit={signIn} className="mt-[5cqw] flex w-full flex-col">
                <Field
                  icon={User}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  inputMode="email"
                  aria-label="Email"
                />
                <div className="mt-[2.9cqw]">
                  <Field
                    icon={Lock}
                    type={show ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    aria-label="Password"
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="ms-[1cqw] shrink-0 text-white/85 hover:text-white"
                      >
                        {show ? <EyeOff className="h-[3.6cqw] w-[3.6cqw]" /> : <Eye className="h-[3.6cqw] w-[3.6cqw]" />}
                      </button>
                    }
                  />
                </div>

                {error && (
                  <p className="mt-[2cqw] rounded-[1cqw] bg-red-600/85 px-[2cqw] py-[1.2cqw] text-center text-[max(11px,2.2cqw)] font-medium leading-snug">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-[4.8cqw] h-[8.6cqw] rounded-[1.6cqw] bg-[#ff7a1a] text-[3.9cqw] font-bold text-white shadow-[0_6px_20px_-4px_rgba(255,122,26,0.7)] transition hover:bg-[#ff8a33] active:scale-[0.98] disabled:opacity-60"
                >
                  {busy ? "…" : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  className="mx-auto mt-[4cqw] border-b border-white/80 pb-[0.3cqw] text-[max(12px,2.6cqw)] font-medium text-white/95 hover:text-[#ff8a3d]"
                >
                  Forgot Password?
                </button>
              </form>
            ) : (
              <form onSubmit={sendReset} className="mt-[5cqw] flex w-full flex-col">
                <p className="mb-[3cqw] text-center text-[max(11px,2.3cqw)] leading-snug text-white/80">{t.login.forgotSubtitle}</p>
                <Field
                  icon={Mail}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  inputMode="email"
                  aria-label="Email"
                />
                {forgotStatus !== "idle" && (
                  <p
                    className={`mt-[2cqw] rounded-[1cqw] px-[2cqw] py-[1.2cqw] text-center text-[max(11px,2.2cqw)] font-medium leading-snug ${
                      forgotStatus === "success" ? "bg-green-600/80" : "bg-red-600/85"
                    }`}
                  >
                    {forgotStatus === "success" ? t.login.forgotSuccess : t.login.forgotError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-[4.8cqw] h-[8.6cqw] rounded-[1.6cqw] bg-[#ff7a1a] text-[3.4cqw] font-bold text-white shadow-[0_6px_20px_-4px_rgba(255,122,26,0.7)] transition hover:bg-[#ff8a33] disabled:opacity-60"
                >
                  {busy ? t.login.forgotSubmitting : t.login.forgotSubmit}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setForgotStatus("idle");
                  }}
                  className="mx-auto mt-[4cqw] border-b border-white/80 pb-[0.3cqw] text-[max(12px,2.6cqw)] font-medium text-white/95 hover:text-[#ff8a3d]"
                >
                  {t.login.backToLogin}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
