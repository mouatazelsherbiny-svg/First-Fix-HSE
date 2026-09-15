"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import LanguageToggle from "@/components/LanguageToggle";
import LandingHero from "@/components/LandingHero";

// This page's hero photo (public/brand/landing-hero-v3.jpg) is dark, so
// the card below uses light/translucent "glass" styling (white text,
// faint white borders/fills) instead of the app's normal light .card —
// see the shared globals.css comment on .input-field-glass for the same
// pattern used on /signup and /reset-password.
const glassInput =
  "w-full rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-[10px] text-white outline-none backdrop-blur-sm transition placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:ring-2 focus:ring-white/30";
const glassLabel = "mb-0.5 block text-[10px] font-medium text-white/90";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // "login" shows the normal sign-in form; "forgot" swaps it for the
  // password-reset request form (see the Forgot password? button below).
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.pending ? t.login.errorPending : t.login.error);
      return;
    }
    router.push("/dashboard");
  };

  // Sends a Supabase password-recovery email; the link in that email lands
  // on /reset-password (see app/reset-password/page.tsx), where the person
  // sets their new password. Requires /reset-password to be added to the
  // project's Supabase Auth "Redirect URLs" allow-list in the dashboard.
  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setForgotStatus("idle");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotSubmitting(false);
    setForgotStatus(resetError ? "error" : "success");
  };

  const backToLogin = () => {
    setMode("login");
    setForgotStatus("idle");
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen bg-app-base">
      {/* The login page has no Topbar (that only wraps signed-in pages),
          so it keeps its own language toggle, pinned to the true
          top-right screen corner regardless of text direction. */}
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle className="bg-white/90 backdrop-blur-sm shadow-card" />
      </div>

      {/* Hero (shared with "/" and /signup) with a real, visible nav row
          and the compact, see-through sign-in card in its lower-right
          corner — see components/LandingHero. */}
      <LandingHero>
        <div className="rounded-2xl border border-white/20 bg-black/30 p-2.5 text-sm shadow-cardHover backdrop-blur-md">
          {mode === "login" ? (
            <>
              <h1 className="text-xs font-bold text-white">{t.login.title}</h1>
              <p className="mt-0.5 text-[10px] text-white/80">{t.login.subtitle}</p>

              <form onSubmit={handleSubmit} className="mt-1.5 space-y-1">
                <div>
                  <label htmlFor="email" className={glassLabel}>
                    {t.login.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className={glassInput}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className={glassLabel}>
                    {t.login.password}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className={glassInput}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-500/80 px-3 py-2 text-[10px] font-medium text-white">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px]">
                  <label className="flex items-center gap-2 text-white/90">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-white/50 bg-white/10 text-brand-orange focus:ring-brand-orange/40"
                    />
                    {t.login.rememberMe}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="font-medium text-brand-orange hover:underline"
                  >
                    {t.login.forgot}
                  </button>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full !py-1.5 !text-[10px]">
                  {submitting ? t.login.submitting : t.login.submit}
                </button>
              </form>

              <p className="mt-1.5 text-center text-[10px] text-white/80">
                {t.login.noAccount}{" "}
                <Link href="/signup" className="font-semibold text-brand-orange hover:underline">
                  {t.login.signUpLink}
                </Link>
              </p>

              <p className="mt-1.5 text-center text-[9px] font-medium text-white/70">
                {t.login.footer}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xs font-bold text-white">{t.login.forgotTitle}</h1>
              <p className="mt-0.5 text-[10px] text-white/80">{t.login.forgotSubtitle}</p>

              <form onSubmit={handleForgotSubmit} className="mt-1.5 space-y-1">
                <div>
                  <label htmlFor="forgot-email" className={glassLabel}>
                    {t.login.email}
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className={glassInput}
                    autoComplete="email"
                  />
                </div>

                {forgotStatus === "success" && (
                  <p className="rounded-lg bg-green-600/80 px-3 py-2 text-[10px] font-medium text-white">
                    {t.login.forgotSuccess}
                  </p>
                )}
                {forgotStatus === "error" && (
                  <p className="rounded-lg bg-red-500/80 px-3 py-2 text-[10px] font-medium text-white">
                    {t.login.forgotError}
                  </p>
                )}

                <button type="submit" disabled={forgotSubmitting} className="btn-primary w-full !py-1.5 !text-[10px]">
                  {forgotSubmitting ? t.login.forgotSubmitting : t.login.forgotSubmit}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full text-center text-[10px] font-medium text-white/80 hover:text-white hover:underline"
                >
                  {t.login.backToLogin}
                </button>
              </form>
            </>
          )}
        </div>
      </LandingHero>
    </div>
  );
}
