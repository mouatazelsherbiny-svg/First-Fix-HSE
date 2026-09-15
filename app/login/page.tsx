"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import LanguageToggle from "@/components/LanguageToggle";
import LandingHero from "@/components/LandingHero";

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

      {/* Full-bleed hero (shared with "/" and /signup) with the sign-in
          card overlaid on top of it, below the illustration — see
          components/LandingHero. */}
      <LandingHero>
        <div className="card !p-4 shadow-cardHover">
          {mode === "login" ? (
            <>
              <h1 className="text-lg font-bold text-brand-black">{t.login.title}</h1>
              <p className="mt-1 text-sm text-brand-gray">{t.login.subtitle}</p>

              <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
                <div>
                  <label htmlFor="email" className="label-field">
                    {t.login.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label-field">
                    {t.login.password}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className="input-field"
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-brand-grayDark">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange/40"
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

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? t.login.submitting : t.login.submit}
                </button>
              </form>

              <p className="mt-3 text-center text-sm text-brand-gray">
                {t.login.noAccount}{" "}
                <Link href="/signup" className="font-semibold text-brand-orange hover:underline">
                  {t.login.signUpLink}
                </Link>
              </p>

              <p className="mt-3 text-center text-xs font-medium text-brand-gray">
                {t.login.footer}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-brand-black">{t.login.forgotTitle}</h1>
              <p className="mt-1 text-sm text-brand-gray">{t.login.forgotSubtitle}</p>

              <form onSubmit={handleForgotSubmit} className="mt-3 space-y-2.5">
                <div>
                  <label htmlFor="forgot-email" className="label-field">
                    {t.login.email}
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                {forgotStatus === "success" && (
                  <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                    {t.login.forgotSuccess}
                  </p>
                )}
                {forgotStatus === "error" && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {t.login.forgotError}
                  </p>
                )}

                <button type="submit" disabled={forgotSubmitting} className="btn-primary w-full">
                  {forgotSubmitting ? t.login.forgotSubmitting : t.login.forgotSubmit}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full text-center text-sm font-medium text-brand-gray hover:text-brand-black hover:underline"
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
