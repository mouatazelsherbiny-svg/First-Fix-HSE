"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PROJECTS } from "@/lib/mockData";
import LanguageToggle from "@/components/LanguageToggle";

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
    <div className="relative min-h-screen w-full bg-[#F5F5F3]">
      {/* Same brand video background as the login page — this is still a
          pre-login, public page, so it carries the same look. Muted +
          looping: purely decorative here, unlike the login page which
          lets the visitor unmute it and freeze on the last frame. */}
      <video
        src="/login-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle className="bg-white/85 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-black/35 p-6 shadow-xl backdrop-blur-md sm:p-8">
          {success ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                {t.signup.successTitle}
              </h1>
              <p className="mt-3 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.signup.successMessage}
              </p>
              <Link
                href="/login"
                className="btn-primary mt-6 inline-flex w-full items-center justify-center"
              >
                {t.signup.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)]">
                {t.signup.title}
              </h1>
              <p className="mt-1 text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.signup.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="fullName" className="label-field-glass">
                    {t.signup.fullName}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.signup.fullNamePlaceholder}
                    className="input-field-glass"
                    autoComplete="name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="employeeCode" className="label-field-glass">
                      {t.signup.employeeCode}
                    </label>
                    <input
                      id="employeeCode"
                      type="text"
                      required
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder={t.signup.employeeCodePlaceholder}
                      className="input-field-glass"
                    />
                  </div>

                  <div>
                    <label htmlFor="project" className="label-field-glass">
                      {t.signup.project}
                    </label>
                    <select
                      id="project"
                      required
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="input-field-glass"
                    >
                      <option value="" disabled className="text-brand-black">
                        {t.signup.projectPlaceholder}
                      </option>
                      {PROJECTS.map((p) => (
                        <option key={p} value={p} className="text-brand-black">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label-field-glass">
                    {t.signup.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.signup.emailPlaceholder}
                    className="input-field-glass"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label-field-glass">
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
                    className="input-field-glass"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label-field-glass">
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
                    className="input-field-glass"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-500/90 px-3 py-2 text-xs font-medium text-white shadow">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? t.signup.submitting : t.signup.submit}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
                {t.signup.haveAccount}{" "}
                <Link href="/login" className="font-semibold text-white underline hover:no-underline">
                  {t.signup.loginLink}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
