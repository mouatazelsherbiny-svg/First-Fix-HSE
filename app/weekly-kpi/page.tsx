"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { WEEKLY_KPI_NUMERIC_FIELDS } from "@/types/weeklyKpi";

export default function WeeklyKpiListPage() {
  return (
    <ProtectedRoute>
      <WeeklyKpiList />
    </ProtectedRoute>
  );
}

function WeeklyKpiList() {
  const { t, locale } = useLanguage();
  const { records, isLoading } = useWeeklyKpi();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => r.projectName.toLowerCase().includes(q));
  }, [records, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            {t.weeklyKpi.listTitle}
          </h1>
          <p className="mt-1 text-sm text-brand-gray">{t.weeklyKpi.listSubtitle}</p>
        </div>
        <Link href="/weekly-kpi/new" className="btn-primary">
          {t.weeklyKpi.newBtn}
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.list.search}
          className="input-field max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.weeklyKpi.empty}</p>
          <Link href="/weekly-kpi/new" className="btn-primary mt-4">
            {t.weeklyKpi.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-start text-sm" style={{ minWidth: 220 * 2 + 130 * WEEKLY_KPI_NUMERIC_FIELDS.length }}>
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="sticky start-0 z-10 bg-brand-grayLight/50 px-4 py-3 text-start sm:px-6">
                  {t.weeklyKpi.colProject}
                </th>
                <th className="px-4 py-3 text-start sm:px-6">{t.weeklyKpi.colDate}</th>
                {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
                  <th key={f.key} className="whitespace-nowrap px-4 py-3 text-start sm:px-6">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-end sm:px-6">{t.weeklyKpi.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="sticky start-0 z-10 bg-brand-surface px-4 py-3 font-semibold text-brand-black sm:px-6">
                    {r.projectName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {new Date(r.date).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </td>
                  {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
                    <td key={f.key} className="px-4 py-3 text-brand-grayDark sm:px-6">
                      {r[f.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-end sm:px-6">
                    <Link
                      href={`/weekly-kpi/${r.id}`}
                      className="font-medium text-brand-orange hover:underline"
                    >
                      {t.weeklyKpi.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
