"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// Native pixel size of /public/brand/landing-hero-v2.jpg (a plain
// illustration — unlike the earlier reference graphic, it has no menu or
// headline printed on it, so both are built as real HTML below instead
// of invisible hotspots over baked-in image text).
const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 512;

interface LandingHeroProps {
  /** Sign-in / sign-up form rendered below the hero image — used by
      /login and /signup. Omitted on the plain landing page ("/"). */
  children?: ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      {/* Real, visible nav row. Only Sign In / Sign Up are wired to real
          routes for now — Home/About HSE Departement/HSE KPI's/Contact
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

      <div className="mx-auto mt-4 w-full max-w-xl px-3 sm:max-w-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/landing-hero-v2.jpg"
          alt={t.landing.heroTagline}
          className="block w-full rounded-2xl shadow-cardHover"
          style={{ aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` }}
        />
      </div>

      {/* The card sits below the artwork (rather than overlapping it) —
          this illustration has no built-in empty area to host a card the
          way the old reference graphic did. */}
      {children && <div className="mx-auto mt-4 w-full max-w-[280px] px-3">{children}</div>}
    </div>
  );
}
