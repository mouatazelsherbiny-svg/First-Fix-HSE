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
import LanguageToggle from "@/components/LanguageToggle";

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

  return (
    <div className="min-h-screen bg-app-base">
      {/* Hero: full-bleed brand banner, same background photo and
          bottom-anchored crop as the login page so the "Protect
          People / Protect Projects / Protect Future" strip at the
          bottom of the photo always stays visible. */}
      <div
        className="relative flex min-h-[92vh] w-full flex-col bg-[#1F2226] bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: 'url("/brand/login-bg.png?v=2")' }}
      >
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
          <Logo size={34} />
          <LanguageToggle className="bg-white/85 backdrop-blur-sm" />
        </div>

        <div className="flex flex-1 flex-col items-start justify-center gap-5 px-4 pb-[22vh] sm:px-10 md:px-16 lg:px-24">
          <p className="max-w-xl text-2xl font-bold text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.55)] sm:text-4xl">
            {t.landing.heroTagline}
          </p>
          <p className="max-w-md text-sm font-medium text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)] sm:text-base">
            {t.landing.heroSubtitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary">
              {t.landing.ctaLogin}
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {t.landing.ctaSignup}
            </Link>
          </div>
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
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {t.landing.footerTagline}
        </p>
      </div>
    </div>
  );
}
