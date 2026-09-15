"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form, rendered small and see-through in the
      lower-right corner of the hero image — used by /login and /signup.
      Omitted on the plain landing page ("/"). */
  children?: ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <div className="relative isolate flex min-h-screen w-full flex-col">
      {/* Fills the whole screen: a plain (non-fixed) absolutely
          positioned cover-fit image behind everything. The nav and card
          are real HTML laid on top of it, so cropping this photo never
          breaks anything. This particular photo is dark, so the nav text
          and card below are styled light/translucent to stay legible
          over it (see the "glass" card in app/login and app/signup). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/landing-hero-v3.jpg"
        alt={t.landing.heroTagline}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Real, visible nav row. Only Sign In / Sign Up are wired to real
          routes for now — Home/About HSE Department/HSE KPI's/Contact
          are placeholders for pages that aren't built yet, so they carry
          no command. */}
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 pt-4 text-center text-xs font-medium text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.6)] sm:text-sm"
      >
        <span>{t.landing.navHome}</span>
        <span className="text-white/40">–</span>
        <span>{t.landing.navAbout}</span>
        <span className="text-white/40">–</span>
        <span>{t.landing.navKpis}</span>
        <span className="text-white/40">–</span>
        <span>{t.landing.navContact}</span>
        <span className="text-white/40">–</span>
        <Link href="/login" className="font-semibold text-white hover:text-brand-orange">
          {t.landing.ctaLogin}
        </Link>
        <span className="text-white/40">–</span>
        <Link href="/signup" className="font-semibold text-white hover:text-brand-orange">
          {t.landing.ctaSignup}
        </Link>
      </nav>

      {/* Small, see-through card pinned to the lower-right corner (under
          the right-hand vest in this photo), sized to comfortably fit
          without pushing the page past one screen. */}
      {children && (
        <div className="absolute bottom-5 right-4 w-full max-w-[220px] px-2 sm:bottom-10 sm:right-10 sm:px-0">
          {children}
        </div>
      )}
    </div>
  );
}
