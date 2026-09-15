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
    <div className="flex min-h-[100svh] w-full items-center justify-center px-3 py-4">
      {/* Sized by height (not width) so the image fills the available
          screen space edge to edge vertically — `max-h-[92svh]` plus
          `max-w-full` and the locked aspect ratio below make the browser
          scale it up as large as fits the viewport in both directions at
          once (the same technique as object-fit: contain), with no crop
          and no scroll. The wrapper is `inline-block` so it hugs the
          image's own rendered box exactly, keeping the percentage-based
          overlays below aligned with it. */}
      <div className="relative inline-block max-h-[92svh] max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/landing-hero.jpg"
          alt={t.landing.heroTagline}
          className="block h-auto max-h-[92svh] w-auto max-w-full rounded-2xl shadow-cardHover"
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

        {/* The card sits fully inside the image's own box (never past its
            edges) and stays see-through (see .card's own translucent
            white + blur) so the artwork underneath keeps showing through
            it, rather than a solid block hiding it. */}
        {children && (
          <div className="absolute left-1/2 top-[54%] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
