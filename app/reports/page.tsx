"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ComingSoonPage from "@/components/ComingSoonPage";
import { useLanguage } from "@/context/LanguageContext";

type ReportTab = "daily" | "weekly" | "monthly";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<ReportTab>("monthly");

  // The 4 monthly HSE checklist templates — previously their own sidebar
  // group, now surfaced here under Reports → Monthly (see the sidebar
  // restructure). The pages themselves are unchanged.
  const monthlyChecklists = [
    { href: "/checklists/environmental", label: t.nav.envChecklist },
    { href: "/checklists/fire-assessment", label: t.nav.fireChecklist },
    { href: "/checklists/safety-health", label: t.nav.shChecklist },
    { href: "/checklists/tc-energization", label: t.nav.tcChecklist },
  ];

  const TABS: { key: ReportTab; label: string }[] = [
    { key: "daily", label: t.reports.tabDaily },
    { key: "weekly", label: t.reports.tabWeekly },
    { key: "monthly", label: t.reports.tabMonthly },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.nav.reports}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.reports.subtitle}</p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-brand-border">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === tabItem.key
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-brand-grayDark hover:text-brand-black"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "monthly" ? (
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gray">
              {t.reports.monthlyIntro}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {monthlyChecklists.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="card flex flex-col items-start gap-3 transition hover:shadow-cardHover"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orangeLight text-brand-orange">
                    <CalendarCheck className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-semibold text-brand-black">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/my-checklists" className="btn-secondary inline-flex">
            {t.reports.viewMyChecklist}
          </Link>
        </div>
      ) : (
        <ComingSoonPage
          title={tab === "daily" ? t.reports.tabDaily : t.reports.tabWeekly}
          subtitle={t.common.comingSoon}
        />
      )}
    </div>
  );
}
