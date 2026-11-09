"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Montserrat } from "next/font/google";
import { GraduationCap, HardHat, LayoutGrid, ShieldAlert, type LucideIcon } from "lucide-react";
import ProjectFilter from "@/components/ProjectFilter";
import { useLanguage } from "@/context/LanguageContext";

// Same geometric sans as the PMV, Incidents and Observations pages.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

/** Shared app components (cards, inputs, tables, dialogs) read these tokens; flip them dark here. */
export const PASSPORT_DARK_TOKENS = {
  "--brand-black-rgb": "245 245 247",
  "--brand-gray-dark-rgb": "205 207 213",
  "--brand-gray-rgb": "150 153 162",
  "--brand-gray-light-rgb": "40 40 46",
  "--brand-surface-rgb": "24 24 27",
  "--brand-border-rgb": "52 52 58",
} as React.CSSProperties;

/**
 * Dark page frame for the three HSE Passport dashboards, built like the PMV
 * page: orange section name, divider, title; project filter, page actions
 * and the section tabs on the right.
 */
export default function PassportShell({
  title,
  actions,
  children,
}: {
  title: string;
  /** Export / import buttons for this section. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  // The whole page is dark: paint the app's content area black while here.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.background;
    main.style.background = "#0a0a0c";
    return () => {
      main.style.background = prev;
    };
  }, []);

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 min-h-[calc(100vh-4rem)] overflow-hidden p-4 text-white sm:-mx-6 sm:p-6 lg:-mx-8`}
      style={{
        ...PASSPORT_DARK_TOKENS,
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(243,111,36,0.10), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(243,111,36,0.08), transparent 60%), #0a0a0c",
      }}
    >
      <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4">
        <span className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]" style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}>
          HSE Passport
        </span>
        <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
        <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">{title}</h1>
        <div className="ms-auto flex flex-col items-end gap-2.5">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <ProjectFilter className="!text-white/75" />
            {actions}
          </div>
          <PassportTabs />
        </div>
      </header>
      {children}
    </div>
  );
}

/** The three sections as PMV-style tabs, plus a way back to the section cards. */
export function PassportTabs() {
  const { t } = useLanguage();
  const pathname = usePathname() ?? "";
  const tabs: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/hse-passport/ppe", label: t.nav.ppe, icon: HardHat },
    { href: "/hse-passport/training", label: t.nav.training, icon: GraduationCap },
    { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction, icon: ShieldAlert },
  ];
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-white/[0.04] p-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-[#f36f24] text-white shadow-[0_0_14px_rgba(243,111,36,0.55)]" : "text-white/75 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/hse-passport"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
      >
        <LayoutGrid className="h-4 w-4" />
        Sections
      </Link>
    </div>
  );
}
