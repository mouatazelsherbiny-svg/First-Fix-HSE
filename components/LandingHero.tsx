"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form (or any other card) rendered as an overlay on
      top of the hero image, positioned just below the illustration — used
      by /login and /signup so the same image "hosts" whichever auth card
      belongs on that page. Omitted on the plain landing page ("/"). */
  children?: ReactNode;
}

export default function LandingHero({ children }: LandingHeroProps) {
  const { t } = useLanguage();

  // Only "Sign In" / "Sign Up" are wired to real routes for now. "Home",
  // "About HSE Departement", "HSE KPI's" and "Contact" stay printed in the
  // image (baked into landing-hero.jpg) but are intentionally inert until
  // those pages are actually built — no hotspot, no command.
  const hotspots: { href: string; label: string; left: number; width: number }[] = [
    { href: "/login", label: t.landing.ctaLogin, left: 84.1, width: 6.5 },
    { href: "/signup", label: t.landing.ctaSignup, left: 93.4, width: 6.5 },
  ];

  return (
    <div className="flex w-full justify-center px-3 pt-3 sm:px-6 sm:pt-6">
      {/* Capped at max-w-2xl (rather than stretched edge-to-edge) so the
          image plus the card overlapping it below always fit inside a
          normal browser window without needing to scroll — a wider hero
          would push its own height (it keeps its 2514:1664 aspect ratio)
          past the average screen. */}
      <div className="relative w-full max-w-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/landing-hero.jpg"
          alt={t.landing.heroTagline}
          className="block w-full rounded-2xl shadow-cardHover"
          style={{ aspectRatio: "2514 / 1664" }}
        />

        <nav aria-label="Primary" className="absolute inset-0">
          {hotspots.map((hotspot) => (
            <Link
              key={hotspot.href}
              href={hotspot.href}
              aria-label={hotspot.label}
              title={hotspot.label}
              className="absolute"
              style={{
                left: `${hotspot.left}%`,
                width: `${hotspot.width}%`,
                top: "6%",
                height: "5%",
              }}
            />
          ))}
        </nav>

        {children && (
          <div className="absolute left-1/2 top-[55%] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
