"use client";

/**
 * KPI's page → KPI Data tab: the KPI charts on top (KpiDashboard), then the weekly
 * KPI records table with search, Excel export and "New".
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import ExportExcelButton from "@/components/ExportExcelButton";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { WEEKLY_KPI_NUMERIC_FIELDS } from "@/types/weeklyKpi";
import KpiDashboard from "@/components/kpi/KpiDashboard";
import { Search } from "lucide-react";
import { DarkPanel, SEARCH_INPUT, TABLE_TITLE, TD, TH, TH_ROW, TR } from "@/components/charts/InjuryStyle";
import { ColumnFilter, useColumnFilters, type FilterColumn } from "@/components/table/ColumnFilter";
import type { WeeklyKpiRecord } from "@/types/weeklyKpi";

const EN_DATE = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });
const dateText = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : EN_DATE.format(d);
};
/** Header funnels (Excel-style), as on the other tables. */
const KPI_FILTERS: FilterColumn<WeeklyKpiRecord>[] = [
  { key: "project", get: (r) => r.projectName },
  { key: "date", get: (r) => dateText(r.date), sortBy: (r) => Date.parse(r.date) },
];

export default function KpiData() {
  const { t } = useLanguage();
  const { records, isLoading } = useWeeklyKpi();
  const [query, setQuery] = useState("");
  
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => r.projectName.toLowerCase().includes(q));
  }, [records, query]);
  const columnFilters = useColumnFilters(searched, KPI_FILTERS);
  const filtered = columnFilters.filtered;

  // Totals across whatever rows are currently visible (all records, or just
  // the matching project once the user searches) — recomputes automatically
  // since it's derived straight from `filtered`.
  const totals = useMemo(
    () =>
      Object.fromEntries(
        WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [
          f.key,
          filtered.reduce((sum, r) => sum + (r[f.key] || 0), 0),
        ])
      ) as Record<(typeof WEEKLY_KPI_NUMERIC_FIELDS)[number]["key"], number>,
    [filtered]
  );

  const exportSheets = useMemo(
    () => [
      {
        name: t.weeklyKpi.listTitle,
        columns: [
          { header: t.weeklyKpi.colProject, key: "project" },
          { header: t.weeklyKpi.colDate, key: "date" },
          ...WEEKLY_KPI_NUMERIC_FIELDS.map((f) => ({ header: f.label, key: f.key })),
        ],
        rows: filtered.map((r) => ({
          project: r.projectName,
          date: dateText(r.date),
          ...Object.fromEntries(WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [f.key, r[f.key]])),
        })),
      },
    ],
    [filtered, t]
  );

  return (
    <div>
      {/* The charts (as in the monthly KPI report), then the records themselves. */}
      {isLoading ? null : <KpiDashboard records={filtered} />}

      {/* KPI records, in the same table style as Injury / Observations. */}
      <DarkPanel>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className={TABLE_TITLE}>KPI Records</h2>
          <label className="relative w-full sm:ms-auto sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.list.search} className={SEARCH_INPUT} />
          </label>
          <ExportExcelButton filename={t.weeklyKpi.listTitle} sheets={exportSheets} disabled={filtered.length === 0} />
          <Link href="/weekly-kpi/new" className="btn-primary">
            {t.weeklyKpi.newBtn}
          </Link>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-white/50">{t.common.loading}</p>
        ) : filtered.length === 0 && columnFilters.activeCount === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-white/50">{t.weeklyKpi.empty}</p>
            <Link href="/weekly-kpi/new" className="btn-primary mt-4">
              {t.weeklyKpi.emptyCta}
            </Link>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-auto rounded-lg">
            <table className="w-full text-start text-sm" style={{ minWidth: 200 * 2 + 120 * WEEKLY_KPI_NUMERIC_FIELDS.length }}>
              <thead className="sticky top-0 z-20">
                <tr className={TH_ROW}>
                  <th className={`${TH} sticky start-0 z-10 rounded-s-lg bg-[#1d1d21]`}>
                    <ColumnFilter label={t.weeklyKpi.colProject} {...columnFilters.header("project")} />
                  </th>
                  <th className={TH}>
                    <ColumnFilter label={t.weeklyKpi.colDate} {...columnFilters.header("date")} />
                  </th>
                  {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
                    <th key={f.key} className={TH}>
                      {f.label}
                    </th>
                  ))}
                  <th className={`${TH} rounded-e-lg !text-end`}>{t.weeklyKpi.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={TR}>
                    <td className={`${TD} sticky start-0 z-10 bg-[#141416] font-semibold`}>{r.projectName}</td>
                    <td className={`${TD} whitespace-nowrap text-white/80`}>{dateText(r.date)}</td>
                    {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
                      <td key={f.key} className={`${TD} tabular-nums text-white/80`}>
                        {Number(r[f.key] || 0).toLocaleString("en-US")}
                      </td>
                    ))}
                    <td className={`${TD} text-end`}>
                      {r.source === "daily" ? (
                        <span
                          className="whitespace-nowrap rounded-full bg-[#f36f24]/15 px-2.5 py-1 text-xs font-semibold text-[#ff8a3d]"
                          title="Totalled from the daily entries in Reports → Daily"
                        >
                          From daily
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                          <Link href={`/weekly-kpi/${r.id}`} className="font-semibold text-[#ff8a3d] hover:underline">
                            {t.weeklyKpi.view}
                          </Link>
                          <Link href={`/weekly-kpi/${r.id}/edit`} className="font-semibold text-[#ff8a3d] hover:underline">
                            {t.weeklyKpi.edit}
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-20">
                <tr className="bg-[#1d1d21] font-bold text-white">
                  <td className={`${TD} sticky start-0 z-10 rounded-s-lg bg-[#1d1d21]`}>{t.weeklyKpi.totalsRow}</td>
                  <td className={TD} />
                  {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
                    <td key={f.key} className={`${TD} tabular-nums`}>
                      {totals[f.key].toLocaleString("en-US")}
                    </td>
                  ))}
                  <td className={`${TD} rounded-e-lg`} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </DarkPanel>
    </div>
  );
}
