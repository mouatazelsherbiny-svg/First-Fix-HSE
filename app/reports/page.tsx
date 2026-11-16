"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChartColumn, Eye, Flame, HeartPulse, Leaf, Sparkles, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DailyKpiGrid from "@/components/reports/DailyKpiGrid";
import ObservationForm from "@/components/observations/ObservationForm";
import PhotoCards from "@/components/PhotoCards";
import { useLanguage } from "@/context/LanguageContext";
import PageTitle from "@/components/PageTitle";
import KpiData from "@/components/kpi/KpiData";
import PerformanceGoals from "@/components/kpi/PerformanceGoals";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";

type ReportTab = "daily" | "monthly" | "kpi" | "goals";
const REPORT_TABS: ReportTab[] = ["daily", "monthly", "kpi", "goals"];

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
  const { records: kpiRecords, isLoading: kpiLoading } = useWeeklyKpi();
  // Links can open a tab directly: /reports?tab=kpi (the old KPI page sends you here).
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("tab") as ReportTab | null;
    if (want && REPORT_TABS.includes(want)) setTab(want);
  }, []);
  const [dailyView, setDailyView] = useState<"observation" | "kpi" | "good">("kpi");
  // Bumped after a save / cancel so the form comes back empty.
  const [formKey, setFormKey] = useState(0);

  const DAILY_VIEWS = [
    { key: "observation" as const, label: t.list.newBtn.replace(/^\+\s*/, ""), icon: Eye, color: "#f36f24" },
    { key: "kpi" as const, label: "KPI", icon: ChartColumn, color: "#4f8fd6" },
    { key: "good" as const, label: t.list.goodPracticeBtn.replace(/^\+\s*/, ""), icon: Sparkles, color: "#22c55e" },
  ];

  // The 4 monthly HSE checklist templates — previously their own sidebar
  // group, now surfaced here under Reports → Monthly (see the sidebar
  // restructure). The pages themselves are unchanged.
  const monthlyChecklists = [
    { href: "/checklists/environmental", label: t.nav.envChecklist, icon: Leaf, color: "#2dd4bf" },
    { href: "/checklists/fire-assessment", label: t.nav.fireChecklist, icon: Flame, color: "#ef4444" },
    { href: "/checklists/safety-health", label: t.nav.shChecklist, icon: HeartPulse, color: "#f472b6" },
    { href: "/checklists/tc-energization", label: t.nav.tcChecklist, icon: Zap, color: "#facc15" },
  ];

  const TABS: { key: ReportTab; label: string }[] = [
    { key: "daily", label: t.reports.tabDaily },
    { key: "monthly", label: t.reports.tabMonthly },
    { key: "kpi", label: "KPI Data" },
    { key: "goals", label: "Performance Goals" },
  ];

  return (
    <div>
      <PageTitle section={t.nav.reports} title="HSE Reporting" />

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

      {tab === "kpi" ? (
        <KpiData />
      ) : tab === "goals" ? (
        kpiLoading ? (
          <div className="card py-16 text-center text-sm font-medium text-brand-gray">{t.common.loading}</div>
        ) : (
          <PerformanceGoals records={kpiRecords} />
        )
      ) : tab === "monthly" ? (
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 text-center text-sm font-semibold tracking-wide text-brand-gray">
              {t.reports.monthlyIntro}
            </h2>
            <PhotoCards
              className=""
              items={monthlyChecklists.map((c) => ({ key: c.href, label: c.label, icon: c.icon, color: c.color, href: c.href }))}
            />
          </div>
          <div className="flex justify-center">
            <Link href="/my-checklists" className="btn-secondary inline-flex">
              {t.reports.viewMyChecklist}
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <PhotoCards
            className="mb-5"
            items={DAILY_VIEWS.map((v) => ({
              key: v.key,
              label: v.label,
              icon: v.icon,
              color: v.color,
              active: dailyView === v.key,
              onClick: () => setDailyView(v.key),
            }))}
          />
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
