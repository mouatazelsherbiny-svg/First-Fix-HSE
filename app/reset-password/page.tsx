"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import LanguageToggle from "@/components/LanguageToggle";

type SessionStatus = "checking" | "ready" | "invalid";

/** Landing page for the link Supabase emails from resetPasswordForEmail
 *  (see the "Forgot password?" flow on the login page). Supabase's client
 *  library auto-detects the recovery token in this page's URL and turns it
 *  into a temporary session, firing a PASSWORD_RECOVERY auth event — once
 *  that (or an already-established session) is seen, the person can set a
 *  new password via supabase.auth.updateUser(). No token handling here is
 *  manual; it all happens through the shared supabase client's own
 *  detectSessionInUrl behavior. */
export default function ResetPasswordPage() {
  const { t } = useLanguage();

  const [status, setStatus] = useState<SessionStatus>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let settled = false;

    const markReady = () => {
      if (!settled) {
        settled = true;
        setStatus("ready");
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        markReady();
      }
    });

    // Covers the case where the session was already established (e.g. the
    // recovery link finished processing) by the time this effect runs.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    // The recovery link is invalid/expired if no session shows up at all —
    // give it a few seconds before giving up.
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setStatus("invalid");
      }
    }, 5000);

    return () => {
      subscription.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t.resetPassword.errorMismatch);
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);

    if (updateError) {
      setError(t.resetPassword.errorGeneric);
      return;
    }
    setSuccess(true);
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#1F2226] bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(20, 22, 26, 0.45), rgba(20, 22, 26, 0.45)), url('/brand/first-fix-login-bg.png')",
      }}
    >
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle className="bg-white/85 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-black/35 p-6 shadow-xl backdrop-blur-md sm:p-8">
          {status === "checking" && (
            <p className="text-center text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
              {t.common.loading}
            </p>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                {t.resetPassword.title}
              </h1>
              <p className="mt-3 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.resetPassword.errorSession}
              </p>
              <Link
                href="/login"
                className="btn-primary mt-6 inline-flex w-full items-center justify-center"
              >
                {t.resetPassword.goToLogin}
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              {success ? (
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                    {t.resetPassword.title}
                  </h1>
                  <p className="mt-3 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                    {t.resetPassword.success}
                  </p>
                  <Link
                    href="/login"
                    className="btn-primary mt-6 inline-flex w-full items-center justify-center"
                  >
                    {t.resetPassword.goToLogin}
                  </Link>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                    {t.resetPassword.title}
                  </h1>
                  <p className="mt-1 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                    {t.resetPassword.subtitle}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="label-field-glass">
                        {t.resetPassword.newPassword}
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t.resetPassword.newPasswordPlaceholder}
                        className="input-field-glass"
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="label-field-glass">
                        {t.resetPassword.confirmPassword}
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.resetPassword.confirmPasswordPlaceholder}
                        className="input-field-glass"
                        autoComplete="new-password"
                      />
                    </div>

                    {error && (
                      <p className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-medium text-white shadow">
                        {error}
                      </p>
                    )}

                    <button type="submit" disabled={submitting} className="btn-primary w-full">
                      {submitting ? t.resetPassword.submitting : t.resetPassword.submit}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
