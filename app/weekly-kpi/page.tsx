"use client";

/**
 * KPI's — Key Project Indicator. Two tabs:
 *  - KPI Data: the KPI charts, then the weekly KPI records table.
 *  - Performance Goals.
 */

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import KpiData from "@/components/kpi/KpiData";
import PerformanceGoals from "@/components/kpi/PerformanceGoals";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";

export default function WeeklyKpiPage() {
  return (
    <ProtectedRoute>
      <WeeklyKpi />
    </ProtectedRoute>
  );
}

function WeeklyKpi() {
  const { t } = useLanguage();
  const { records, isLoading } = useWeeklyKpi();
  const [tab, setTab] = useState<"data" | "goals">("data");

  return (
    <div>
      <PageTitle section="KPI's" title="Key Project Indicator" />

      <div className="mb-5 flex gap-1 border-b border-brand-border">
        {([
          ["data", "KPI Data"],
          ["goals", "Performance Goals"],
        ] as const).map(([key, label]) => (
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

      {tab === "goals" ? (
        isLoading ? (
          <div className="card py-16 text-center text-sm font-medium text-brand-gray">{t.common.loading}</div>
        ) : (
          <PerformanceGoals records={records} />
        )
      ) : (
        <KpiData />
      )}
    </div>
  );
}
