"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PROJECTS } from "@/lib/mockData";
import LanguageToggle from "@/components/LanguageToggle";
import LandingHero from "@/components/LandingHero";

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

      {/* Full-bleed hero (shared with "/" and /login) with the sign-up
          card overlaid on top of it, below the illustration — see
          components/LandingHero. */}
      <LandingHero>
        <div className="card shadow-cardHover">
          {success ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-brand-black">{t.signup.successTitle}</h1>
              <p className="mt-3 text-sm text-brand-gray">{t.signup.successMessage}</p>
              <Link
                href="/login"
                className="btn-primary mt-6 inline-flex w-full items-center justify-center"
              >
                {t.signup.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-brand-black">{t.signup.title}</h1>
              <p className="mt-1 text-sm text-brand-gray">{t.signup.subtitle}</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="fullName" className="label-field">
                    {t.signup.fullName}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.signup.fullNamePlaceholder}
                    className="input-field"
                    autoComplete="name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="employeeCode" className="label-field">
                      {t.signup.employeeCode}
                    </label>
                    <input
                      id="employeeCode"
                      type="text"
                      required
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder={t.signup.employeeCodePlaceholder}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="project" className="label-field">
                      {t.signup.project}
                    </label>
                    <select
                      id="project"
                      required
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="input-field"
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
                  <label htmlFor="email" className="label-field">
                    {t.signup.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.signup.emailPlaceholder}
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label-field">
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
                    className="input-field"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label-field">
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
                    className="input-field"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? t.signup.submitting : t.signup.submit}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-brand-gray">
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
