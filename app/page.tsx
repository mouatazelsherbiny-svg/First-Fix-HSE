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
import Logo from "@/components/Logo";
import HseHeroIllustration from "@/components/HseHeroIllustration";

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

  const navLinks: { href: string; label: string }[] = [
    { href: "/", label: t.landing.navHome },
    { href: "/about", label: t.landing.navAbout },
    { href: "/hse-kpis", label: t.landing.navKpis },
    { href: "/contact", label: t.landing.navContact },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-3 py-4 sm:px-6 sm:py-8">
      {/* Hero card: a clean white panel over a soft multi-color gradient
          canvas — no photo/video background. Nav is plain text links;
          Home/About/KPI's/Contact are placeholders for now (see
          components/PublicComingSoon.tsx), Sign In/Sign Up keep working
          exactly as before. */}
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-cardHover">
        <div className="pointer-events-none absolute -start-24 -top-24 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -end-24 -top-16 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -start-16 bottom-0 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <Link href="/">
            <Logo size={32} />
          </Link>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-brand-black">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-x-3">
                {i > 0 && <span className="text-brand-gray">-</span>}
                <Link href={link.href} className="transition hover:text-brand-orange">
                  {link.label}
                </Link>
              </span>
            ))}
            <span className="text-brand-gray">-</span>
            <Link href="/login" className="transition hover:text-brand-orange">
              {t.landing.ctaLogin}
            </Link>
            <span className="text-brand-gray">-</span>
            <Link href="/signup" className="transition hover:text-brand-orange">
              {t.landing.ctaSignup}
            </Link>
          </nav>
        </div>

        <div className="relative grid gap-10 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-6 lg:pb-20">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              {t.landing.heroTagline.split(" ").map((word) => (
                <span key={word} className="block">
                  {word}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-md text-base text-brand-gray">{t.landing.heroSubtitle}</p>
          </div>

          <HseHeroIllustration />
        </div>
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
