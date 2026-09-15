"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PROJECTS } from "@/lib/mockData";
import LanguageToggle from "@/components/LanguageToggle";
import LandingHero from "@/components/LandingHero";

// This page's hero photo (public/brand/landing-hero-v3.jpg) is dark, so
// the card below uses light/translucent "glass" styling (white text,
// faint white borders/fills) instead of the app's normal light .card —
// see the shared globals.css comment on .input-field-glass for the same
// pattern used on /reset-password.
const glassInput =
  "w-full rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-[10px] text-white outline-none backdrop-blur-sm transition placeholder:text-white/50 focus:border-white focus:bg-white/20 focus:ring-2 focus:ring-white/30";
const glassLabel = "mb-0.5 block text-[10px] font-medium text-white/90";

export default function SignupPage() {
  const { signUp } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [project, setProject] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.signup.errorMismatch);
      return;
    }

    setSubmitting(true);
    const result = await signUp({
      fullName,
      employeeCode,
      project,
      email,
      password,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || t.signup.errorGeneric);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-app-base">
      {/* The signup page has no Topbar (that only wraps signed-in pages),
          so it keeps its own language toggle, pinned to the true
          top-right screen corner regardless of text direction. */}
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle className="bg-white/90 backdrop-blur-sm shadow-card" />
      </div>

      {/* Hero (shared with "/" and /login) with a real, visible nav row
          and the compact, see-through sign-up card in its lower-right
          corner — see components/LandingHero. */}
      <LandingHero>
        <div className="rounded-2xl border border-white/20 bg-black/30 p-2.5 text-sm shadow-cardHover backdrop-blur-md">
          {success ? (
            <div className="text-center">
              <h1 className="text-xs font-bold text-white">{t.signup.successTitle}</h1>
              <p className="mt-2 text-[10px] text-white/80">{t.signup.successMessage}</p>
              <Link
                href="/login"
                className="btn-primary mt-3 inline-flex w-full items-center justify-center !py-1.5 !text-[10px]"
              >
                {t.signup.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xs font-bold text-white">{t.signup.title}</h1>
              <p className="mt-0.5 text-[10px] text-white/80">{t.signup.subtitle}</p>

              <form onSubmit={handleSubmit} className="mt-1.5 space-y-1">
                <div>
                  <label htmlFor="fullName" className={glassLabel}>
                    {t.signup.fullName}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.signup.fullNamePlaceholder}
                    className={glassInput}
                    autoComplete="name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label htmlFor="employeeCode" className={glassLabel}>
                      {t.signup.employeeCode}
                    </label>
                    <input
                      id="employeeCode"
                      type="text"
                      required
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder={t.signup.employeeCodePlaceholder}
                      className={glassInput}
                    />
                  </div>

                  <div>
                    <label htmlFor="project" className={glassLabel}>
                      {t.signup.project}
                    </label>
                    <select
                      id="project"
                      required
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className={glassInput}
                    >
                      <option value="" disabled className="bg-white text-gray-900">
                        {t.signup.projectPlaceholder}
                      </option>
                      {PROJECTS.map((p) => (
                        <option key={p} value={p} className="bg-white text-gray-900">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={glassLabel}>
                    {t.signup.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.signup.emailPlaceholder}
                    className={glassInput}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className={glassLabel}>
                    {t.signup.password}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.signup.passwordPlaceholder}
                    className={glassInput}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={glassLabel}>
                    {t.signup.confirmPassword}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.signup.confirmPasswordPlaceholder}
                    className={glassInput}
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-500/80 px-3 py-2 text-[10px] font-medium text-white">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full !py-1.5 !text-[10px]">
                  {submitting ? t.signup.submitting : t.signup.submit}
                </button>
              </form>

              <p className="mt-1.5 text-center text-[10px] text-white/80">
                {t.signup.haveAccount}{" "}
                <Link href="/login" className="font-semibold text-brand-orange hover:underline">
                  {t.signup.loginLink}
                </Link>
              </p>
            </>
          )}
        </div>
      </LandingHero>
    </div>
  );
}
