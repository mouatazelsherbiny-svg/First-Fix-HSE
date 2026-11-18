"use client";

/**
 * KPI's — Key Project Indicator. Two pages (tabs):
 *  - KPI's Dashboard: headline cards, the KPI charts, Performance Goals and
 *    the HSE audit score per project.
 *  - KPI's Details: the weekly KPI records table.
 */

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import KpiData from "@/components/kpi/KpiData";
import KpiDashboard from "@/components/kpi/KpiDashboard";
import PerformanceGoals from "@/components/kpi/PerformanceGoals";
import AuditScoreChart from "@/components/kpi/AuditScoreChart";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useHomeDashboard } from "@/lib/useHomeDashboard";

export default function WeeklyKpiPage() {
  return (
    <ProtectedRoute>
      <WeeklyKpi />
    </ProtectedRoute>
  );
}

const TABS = [
  ["dashboard", "KPI's Dashboard"],
  ["details", "KPI's Details"],
] as const;

function WeeklyKpi() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("dashboard");

  return (
    <div>
      <PageTitle section="KPI's" title="Key Project Indicator" />

      <div className="mb-5 flex gap-1 border-b border-brand-border">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === key
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-brand-grayDark hover:text-brand-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "details" ? <KpiData /> : <Dashboard loadingText={t.common.loading} />}
    </div>
  );
}

function Dashboard({ loadingText }: { loadingText: string }) {
  const { records, isLoading } = useWeeklyKpi();
  const { hero } = useHomeDashboard();

  if (isLoading) {
    return <div className="card py-16 text-center text-sm font-medium text-brand-gray">{loadingText}</div>;
  }
  return (
    <div className="space-y-5">
      <KpiDashboard records={records} headline={hero} />
      <PerformanceGoals records={records} />
      <AuditScoreChart />
    </div>
  );
}
