"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form, rendered in the lower-right corner of the
      hero image — used by /login and /signup. Omitted on the plain
      landing page ("/"). */
  children?: ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
  const { t } = useLanguage();

  return (
    <div className="relative isolate flex min-h-screen w-full flex-col">
      {/* Fills the whole screen: a plain (non-fixed) absolutely
          positioned cover-fit image behind everything. The nav and card
          are real HTML laid on top of it, so cropping this photo never
          breaks anything. This particular photo is dark, so the nav bar
          and card below are styled light/translucent to stay legible
          over it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/landing-hero-v3.jpg"
        alt={t.landing.heroTagline}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Real, visible nav row, on its own translucent bar rather than
          floating directly on the busy photo — keeps it readable no
          matter what part of the artwork sits behind it. About HSE
          Department has real content now (app/about/page.tsx); the old
          "Contact" placeholder (t.landing.navContact) was repurposed into
          a second link to that same page, labeled "About", rather than
          building a separate Contact page — Home/HSE KPI's are still
          placeholders for pages that aren't built yet, so they carry no
          command. */}
      <div className="bg-black/35 backdrop-blur-sm">
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 px-3 py-3 text-center text-sm font-medium text-white/90"
        >
          <span>{t.landing.navHome}</span>
          <span className="text-white/40">–</span>
          <Link href="/about" className="hover:text-brand-orange">
            {t.landing.navAbout}
          </Link>
          <span className="text-white/40">–</span>
          <span>{t.landing.navKpis}</span>
          <span className="text-white/40">–</span>
          <Link href="/about" className="hover:text-brand-orange">
            {t.landing.navContact}
          </Link>
          <span className="text-white/40">–</span>
          <Link href="/login" className="font-semibold text-white hover:text-brand-orange">
            {t.landing.ctaLogin}
          </Link>
          <span className="text-white/40">–</span>
          <Link href="/signup" className="font-semibold text-white hover:text-brand-orange">
            {t.landing.ctaSignup}
          </Link>
        </nav>
      </div>

      {/* See-through card, pinned to the lower-right corner (under the
          right-hand vest in this photo), sized to stay clear of the top
          nav bar and comfortably fit without needing to scroll. */}
      {children && (
        <div className="absolute bottom-5 right-4 w-[calc(100%-2rem)] max-w-sm sm:bottom-10 sm:right-10 sm:w-full">
          {children}
        </div>
      )}
    </div>
  );
}
