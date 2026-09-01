"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Background video starts muted because browsers block autoplay-with-sound
  // without a prior user gesture — this ref + state pair lets the visitor
  // opt in to sound with one click via the speaker button below.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);

  const toggleVideoSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setVideoMuted(video.muted);
  };

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
      setError(t.login.error);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F3]">
      {/* Fixed, viewport-locked background video. Plays once (no loop) and
          freezes on its last frame — deliberate, per request. Autoplay
          requires muted + playsInline to work without a user gesture on
          mobile browsers; the speaker button below lets the visitor turn
          sound on afterwards. poster="/logo.png" shows the old static image
          for the instant before the video has enough data to paint its
          first frame, and as the fallback if video can't load at all. File
          lives at public/login-bg.mp4, which Next.js serves from the site
          root as "/login-bg.mp4" (NOT "/assets/..." — only the public/
          folder is web-servable; assets/ is a source-only folder outside
          the build's static output). */}
      <video
        ref={videoRef}
        src="/login-bg.mp4"
        poster="/logo.png"
        autoPlay
        muted
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

      {/* Pinned to the true top-right screen corner via physical `right`/
          `top` (not the logical `end-*` utilities), so it stays put on the
          right no matter the page's text direction (English or Arabic). */}
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle className="bg-white/85 backdrop-blur-sm" />
      </div>

      {/* Sound toggle for the background video — opposite corner (physical
          left) from the language toggle, same glass styling. Stays put on
          the left no matter the page's text direction. */}
      <button
        type="button"
        onClick={toggleVideoSound}
        aria-label={videoMuted ? "Unmute video" : "Mute video"}
        className="fixed left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-brand-grayDark shadow-sm backdrop-blur-sm transition hover:bg-white sm:left-6 sm:top-6"
      >
        {videoMuted ? (
          <VolumeX className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Volume2 className="h-4 w-4" strokeWidth={2} />
        )}
      </button>

      {/* Fields float directly on the photo — no card container. Pinned to
          the right side of the screen (physical `right`, not logical) and
          the lower third, well clear of the logo/headline on the left. */}
      <div className="absolute right-4 bottom-[9vh] z-10 w-[calc(100%-2rem)] max-w-sm sm:right-10 sm:bottom-[12vh] md:right-16 lg:right-24">
        <div className="max-sm:rounded-2xl max-sm:bg-black/30 max-sm:p-5 max-sm:backdrop-blur-sm">
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

          <p className="mt-6 text-center text-xs font-medium text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]">
            {t.login.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
