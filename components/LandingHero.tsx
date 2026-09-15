"use client";

/** The client's reference graphic (public/brand/landing-hero.jpg), shared
 *  between every public/pre-login page (the "/" landing page, /login,
 *  /signup, ...) so they all lead with the same branded header instead of
 *  each having its own separate photo/video background. The image bakes
 *  in its own heading, illustration, AND a printed nav row ("Home - About
 *  HSE Departement - HSE KPI's - Contact - Sign In - Sign Up") — a
 *  matching set of real, invisible links sits on top of that printed row
 *  (percentage-positioned against the image's own 2514x1664 dimensions,
 *  so they stay aligned at any width as long as the wrapper below keeps
 *  the same aspect ratio) so every one of those words is actually
 *  clickable and routes correctly. */

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingHero() {
  const { t } = useLanguage();

  const hotspots: { href: string; label: string; left: number; width: number }[] = [
    { href: "/", label: t.landing.navHome, left: 34.0, width: 5.6 },
    { href: "/about", label: t.landing.navAbout, left: 40.5, width: 20.4 },
    { href: "/hse-kpis", label: t.landing.navKpis, left: 63.7, width: 8.4 },
    { href: "/contact", label: t.landing.navContact, left: 74.8, width: 6.5 },
    { href: "/login", label: t.landing.ctaLogin, left: 84.1, width: 6.5 },
    { href: "/signup", label: t.landing.ctaSignup, left: 93.4, width: 6.5 },
  ];

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/landing-hero.jpg"
        alt={t.landing.heroTagline}
        className="w-full rounded-[2rem] shadow-cardHover"
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
    </div>
  );
}
