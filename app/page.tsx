"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Network,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Signed-in visitors skip the landing page entirely and land straight on
  // the dashboard, same as before. Everyone else sees the marketing page
  // below instead of being bounced straight to /login.
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return <LandingPage />;
}

interface Feature {
  key: string;
  icon: LucideIcon;
  label: string;
}

function LandingPage() {
  const { t } = useLanguage();

  const features: Feature[] = [
    { key: "observations", icon: ClipboardList, label: t.nav.myObservations },
    { key: "incidents", icon: AlertTriangle, label: t.nav.incidents },
    { key: "permits", icon: ClipboardCheck, label: t.nav.permitToWork },
    { key: "kpi", icon: BarChart3, label: t.nav.weeklyKpi },
    { key: "training", icon: GraduationCap, label: t.nav.training },
    { key: "hseTeam", icon: Network, label: t.nav.hseTeam },
  ];

  // Percentage bounding boxes for each nav word baked into
  // /public/brand/landing-hero.jpg, measured against the source image
  // (2514x1664) so they stay aligned at any container width as long as
  // the wrapper below keeps the same aspect ratio. Each entry renders as
  // an invisible, real <Link> directly on top of the printed word.
  const heroNavHotspots: { href: string; label: string; left: number; width: number }[] = [
    { href: "/", label: t.landing.navHome, left: 34.0, width: 5.6 },
    { href: "/about", label: t.landing.navAbout, left: 40.5, width: 20.4 },
    { href: "/hse-kpis", label: t.landing.navKpis, left: 63.7, width: 8.4 },
    { href: "/contact", label: t.landing.navContact, left: 74.8, width: 6.5 },
    { href: "/login", label: t.landing.ctaLogin, left: 84.1, width: 6.5 },
    { href: "/signup", label: t.landing.ctaSignup, left: 93.4, width: 6.5 },
  ];

  return (
    <div className="min-h-screen bg-app-base px-3 py-4 sm:px-6 sm:py-8">
      {/* Hero: the reference graphic supplied by the client, used as-is
          (heading, illustration, and printed nav row all baked into the
          image) — see /public/brand/landing-hero.jpg. A matching set of
          real, invisible links sits on top of the printed nav row
          (heroNavHotspots above) so "Sign In"/"Sign Up" keep routing to
          /login and /signup exactly as before, and Home/About/KPI's/
          Contact route to their (placeholder-for-now) pages. The wrapper
          locks the image's own aspect ratio so those percentage-based
          hotspots stay lined up with the printed words at any width. */}
      <div className="relative mx-auto max-w-6xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/landing-hero.jpg"
          alt={t.landing.heroTagline}
          className="w-full rounded-[2rem] shadow-cardHover"
          style={{ aspectRatio: "2514 / 1664" }}
        />

        <nav aria-label="Primary" className="absolute inset-0">
          {heroNavHotspots.map((hotspot) => (
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

      {/* Feature highlights */}
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-xl font-bold text-brand-black sm:text-2xl">
            {t.landing.featuresTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-brand-gray">
            {t.landing.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.key}
              className="card flex flex-col items-center gap-3 !p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                <f.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-brand-grayDark">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-brand-border bg-brand-black px-4 py-6 text-center">
        <p className="text-xs font-semibold tracking-wide text-white/80">
          {t.landing.footerTagline}
        </p>
      </div>
    </div>
  );
}
