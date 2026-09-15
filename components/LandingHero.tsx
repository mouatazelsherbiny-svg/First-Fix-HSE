"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// The native pixel size of /public/brand/landing-hero.jpg. Every position
// below is a fraction of THIS image; on the full-screen (children) branch
// they're converted to vw units via IMAGE_RATIO so they stay lined up with
// the printed artwork no matter how much of the image's bottom gets
// cropped off by object-cover (see the comment on that branch below).
const IMAGE_WIDTH = 2514;
const IMAGE_HEIGHT = 1664;
const IMAGE_RATIO = IMAGE_HEIGHT / IMAGE_WIDTH;

function vw(fractionOfImageHeight: number) {
  return `${fractionOfImageHeight * IMAGE_RATIO * 100}vw`;
}

interface LandingHeroProps {
  /** Sign-in / sign-up form (or any other card) rendered as an overlay on
      top of the hero image — used by /login and /signup so the same
      image "hosts" whichever auth card belongs on that page. Omitted on
      the plain landing page ("/"), which just shows the artwork inline. */
  children?: ReactNode;
}

const HOTSPOTS: { href: string; label: string; left: number; width: number }[] = [
  { href: "/login", label: "login", left: 84.1, width: 6.5 },
  { href: "/signup", label: "signup", left: 93.4, width: 6.5 },
];

export default function LandingHero({ children }: LandingHeroProps) {
  const { t } = useLanguage();
  const hotspots = HOTSPOTS.map((h) => ({
    ...h,
    label: h.href === "/login" ? t.landing.ctaLogin : t.landing.ctaSignup,
  }));

  if (!children) {
    // Plain landing page: no card to make room for, so just show the
    // artwork inline at a comfortable size instead of pinned full-screen.
    return (
      <div className="relative mx-auto w-full max-w-3xl px-3 pt-4 sm:px-6 sm:pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/landing-hero.jpg"
          alt={t.landing.heroTagline}
          className="block w-full rounded-2xl shadow-cardHover"
          style={{ aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` }}
        />
        <nav aria-label="Primary" className="absolute inset-0">
          {hotspots.map((hotspot) => (
            <Link
              key={hotspot.href}
              href={hotspot.href}
              aria-label={hotspot.label}
              title={hotspot.label}
              className="absolute"
              style={{ left: `${hotspot.left}%`, width: `${hotspot.width}%`, top: "6%", height: "5%" }}
            />
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* True full-screen background: fills the browser window exactly —
          no gaps, no scroll to reach it — by cropping the image instead
          of shrinking it to fit. Anchored to the TOP (object-top), so on
          any window wider than the image's own 2514:1664 shape (that's
          virtually every desktop/laptop window) only the BOTTOM gets
          cropped off; the header/nav row near the top is always fully
          visible, so the Sign In / Sign Up hotspots below still land
          exactly on the printed words. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/landing-hero.jpg"
        alt={t.landing.heroTagline}
        className="fixed inset-0 h-full w-full object-cover object-top"
      />

      <nav aria-label="Primary" className="absolute inset-x-0 top-0">
        {hotspots.map((hotspot) => (
          <Link
            key={hotspot.href}
            href={hotspot.href}
            aria-label={hotspot.label}
            title={hotspot.label}
            className="absolute"
            style={{ left: `${hotspot.left}%`, width: `${hotspot.width}%`, top: vw(0.06), height: vw(0.05) }}
          />
        ))}
      </nav>

      {/* Positioned (and sized) to stay fully inside the visible part of
          the image on a typical desktop window — see the compact spacing
          on the card itself in app/login and app/signup. */}
      <div
        className="absolute left-1/2 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2"
        style={{ top: vw(0.5) }}
      >
        {children}
      </div>
    </div>
  );
}
