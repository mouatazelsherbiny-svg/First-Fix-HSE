"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form, rendered small and see-through, centered
      over the hero image — used by /login and /signup. Omitted on the
      plain landing page ("/"). */
  children?: ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <div className="relative isolate flex min-h-screen w-full flex-col">
      {/* Fills the whole screen: a plain (non-fixed) absolutely
          positioned cover-fit image behind everything, sized to at least
          one full viewport height/width. Using object-cover here is safe
          — unlike the earlier reference graphic, this artwork has no
          menu or headline baked into its pixels, so cropping it never
          breaks anything; the nav and card below are real HTML laid on
          top of it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/landing-hero-v2.jpg"
        alt={t.landing.heroTagline}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Real, visible nav row. Only Sign In / Sign Up are wired to real
          routes for now — Home/About HSE Department/HSE KPI's/Contact
          are placeholders for pages that aren't built yet, so they carry
          no command. */}
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 pt-4 text-center text-xs font-medium text-brand-grayDark sm:text-sm"
      >
        <span>{t.landing.navHome}</span>
        <span className="text-brand-border">–</span>
        <span>{t.landing.navAbout}</span>
        <span className="text-brand-border">–</span>
        <span>{t.landing.navKpis}</span>
        <span className="text-brand-border">–</span>
        <span>{t.landing.navContact}</span>
        <span className="text-brand-border">–</span>
        <Link href="/login" className="font-semibold text-brand-black hover:text-brand-orange">
          {t.landing.ctaLogin}
        </Link>
        <span className="text-brand-border">–</span>
        <Link href="/signup" className="font-semibold text-brand-black hover:text-brand-orange">
          {t.landing.ctaSignup}
        </Link>
      </nav>

      {/* Small, see-through card centered in whatever screen space is
          left below the nav. */}
      {children && (
        <div className="flex flex-1 items-center justify-center px-3 py-6">
          <div className="w-full max-w-[220px]">{children}</div>
        </div>
      )}
    </div>
  );
}
