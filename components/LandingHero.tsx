"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface LandingHeroProps {
  /** Sign-in / sign-up form (or any other card) rendered as an overlay on
      top of the hero image, positioned just below the illustration — used
      by /login and /signup so the same full-bleed image "hosts" whichever
      auth card belongs on that page. Omitted on the plain landing page
      ("/"), which has no card to show. */
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
    <div className="relative w-full">
      {/* Full-bleed: no max-width wrapper, no rounded corners/shadow added
          via CSS — the image spans the full width of the page edge to
          edge exactly as supplied (it already has its own card/border
          design baked in). Height follows the image's native aspect
          ratio so the printed nav row and the overlay card below both
          stay aligned with the artwork at any screen width. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/landing-hero.jpg"
        alt={t.landing.heroTagline}
        className="block w-full"
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
        <div className="absolute left-1/2 top-[58%] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:top-[60%]">
          {children}
        </div>
      )}
    </div>
  );
}
