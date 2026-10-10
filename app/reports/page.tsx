"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, ChartColumn, Eye, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DailyKpiGrid from "@/components/reports/DailyKpiGrid";
import ObservationForm from "@/components/observations/ObservationForm";
import { useLanguage } from "@/context/LanguageContext";

type ReportTab = "daily" | "monthly";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<ReportTab>("daily");
  const [dailyView, setDailyView] = useState<"observation" | "kpi" | "good">("kpi");
  // Bumped after a save / cancel so the form comes back empty.
  const [formKey, setFormKey] = useState(0);

  const DAILY_VIEWS = [
    { key: "observation" as const, label: t.list.newBtn.replace(/^\+\s*/, ""), icon: Eye },
    { key: "kpi" as const, label: "KPI", icon: ChartColumn },
    { key: "good" as const, label: t.list.goodPracticeBtn.replace(/^\+\s*/, ""), icon: Sparkles },
  ];

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
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-brand-gray">
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
        <div>
          <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl border border-brand-border bg-brand-surface p-1">
            {DAILY_VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setDailyView(v.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  dailyView === v.key
                    ? "bg-brand-orange text-brand-onAccent shadow-sm"
                    : "text-brand-grayDark hover:bg-brand-grayLight/60 hover:text-brand-black"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            ))}
          </div>
          {dailyView === "kpi" ? (
            <DailyKpiGrid />
          ) : (
            <div>
              <ObservationForm
                key={`${dailyView}-${formKey}`}
                embedded
                presetType={dailyView === "good" ? "Good Practice" : ""}
                onDone={() => setFormKey((k) => k + 1)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
