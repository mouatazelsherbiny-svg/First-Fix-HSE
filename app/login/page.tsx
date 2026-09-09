"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import LanguageToggle from "@/components/LanguageToggle";

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
    <div
      className="relative min-h-screen w-full bg-[#1F2226] bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: 'url("/brand/login-bg.png?v=2")' }}
    >
      {/* Pinned to the true top-right screen corner via physical `right`/
          `top` (not the logical `end-*` utilities), so it stays put on the
          right no matter the page's text direction (English or Arabic). */}
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle className="bg-white/85 backdrop-blur-sm" />
      </div>

      {/* Fields float directly on the photo — no card container. Pinned to
          the right side of the screen (physical `right`, not logical) and
          the lower third, well clear of the logo/headline on the left. */}
      <div className="absolute right-4 bottom-[20vh] z-10 w-[calc(100%-2rem)] max-w-sm sm:right-10 sm:bottom-[22vh] md:right-16 lg:right-24">
        <div className="max-sm:rounded-2xl max-sm:bg-black/30 max-sm:p-5 max-sm:backdrop-blur-sm">
          {mode === "login" ? (
            <>
              <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                {t.login.title}
              </h1>
              <p className="mt-1 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.login.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="label-field-glass">
                    {t.login.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className="input-field-glass"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label-field-glass">
                    {t.login.password}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className="input-field-glass"
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-medium text-white shadow">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/70 bg-white/10 text-brand-orange focus:ring-brand-orange/40"
                    />
                    {t.login.rememberMe}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="font-medium text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)] hover:text-white hover:underline"
                  >
                    {t.login.forgot}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? t.login.submitting : t.login.submit}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.login.noAccount}{" "}
                <Link href="/signup" className="font-semibold text-white underline hover:no-underline">
                  {t.login.signUpLink}
                </Link>
              </p>

              <p className="mt-6 text-center text-xs font-medium text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.login.footer}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                {t.login.forgotTitle}
              </h1>
              <p className="mt-1 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.login.forgotSubtitle}
              </p>

              <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="label-field-glass">
                    {t.login.email}
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className="input-field-glass"
                    autoComplete="email"
                  />
                </div>

                {forgotStatus === "success" && (
                  <p className="rounded-lg bg-green-600/90 px-3 py-2 text-xs font-medium text-white shadow">
                    {t.login.forgotSuccess}
                  </p>
                )}
                {forgotStatus === "error" && (
                  <p className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-medium text-white shadow">
                    {t.login.forgotError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="btn-primary w-full"
                >
                  {forgotSubmitting ? t.login.forgotSubmitting : t.login.forgotSubmit}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full text-center text-sm font-medium text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)] hover:text-white hover:underline"
                >
                  {t.login.backToLogin}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
