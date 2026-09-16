"use client";

/** Lightweight public placeholder for landing-page nav links that don't
 *  have real content yet (HSE KPI's, Contact — see app/page.tsx; About HSE
 *  Department has real content now, see app/about/page.tsx). Unlike
 *  ComingSoonPage (components/ComingSoonPage.tsx) this renders its own
 *  minimal header/back-link instead of relying on ProtectedRoute, since
 *  these pages are reached before signing in. */

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function PublicComingSoon({ title }: { title: string }) {
  const { t, dir } = useLanguage();
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="flex min-h-screen flex-col bg-app-base">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <Link href="/">
          <Logo size={34} />
        </Link>
        <LanguageToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orangeLight text-brand-orange">
          <span className="text-2xl font-extrabold">{title.charAt(0)}</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-black">{title}</h1>
        <p className="max-w-md text-sm text-brand-gray">{t.landing.comingSoon}</p>
        <p className="max-w-md text-sm text-brand-gray">{t.landing.comingSoonSubtitle}</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
        >
          <BackIcon className="h-4 w-4" />
          {t.landing.backHome}
        </Link>
      </div>
    </div>
  );
}
