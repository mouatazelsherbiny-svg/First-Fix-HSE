"use client";

/**
 * "Equipment Tracker" tab — a live, read-only snapshot of every asset in
 * pmv_asset_register (the same table PMV Log → Asset Register edits),
 * focused on "where is it and what state is it in right now" rather than
 * the Asset Register's full editable field set. Search + status filter
 * only; adding/editing an asset still happens in PMV Log → Asset Register
 * so there is exactly one place that writes this data.
 */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePmvLogRecords } from "@/lib/usePmvLogRecords";
import { PMV_OPTIONS_ASSET_STATUS } from "@/lib/pmvLogs";

function formatDate(raw: unknown, locale: string) {
  if (!raw) return "—";
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EquipmentTracker() {
  const { t, locale } = useLanguage();
  const { rows, isLoading, error } = usePmvLogRecords("pmv_asset_register");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter && row.current_status !== statusFilter) return false;
      if (!q) return true;
      return [
        row.asset_id,
        row.equipment_name,
        row.plate_serial_no,
        row.project_code,
        row.project_name,
        row.operator_name,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, query, statusFilter]);

  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
        <div>
          <h2 className="text-lg font-bold text-brand-black">{t.pmv.tabTracker}</h2>
          <p className="mt-1 text-sm text-brand-gray">{t.pmv.trackerNote}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.pmv.trackerSearch}
            className="input-field ps-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              statusFilter === ""
                ? "bg-brand-orange text-brand-onAccent shadow-sm"
                : "border border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
            }`}
          >
            {t.pmv.trackerAllStatuses}
          </button>
          {PMV_OPTIONS_ASSET_STATUS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                statusFilter === status
                  ? "bg-brand-orange text-brand-onAccent shadow-sm"
                  : "border border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColAssetId}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColEquipment}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColCategory}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColSite}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColOperator}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColDeployment}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColUtilization}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColStatus}</th>
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.pmv.trackerColNextMaintenance}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-brand-gray">
                  {t.common.loading}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-brand-gray">
                  {t.common.noDataYet}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-black sm:px-6">
                    {row.asset_id ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {row.equipment_name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {row.equipment_category ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {row.asset_transfer_site || row.project_name || row.project_code || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {row.operator_name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                    {row.deployment_status ? <Badge value={row.deployment_status} /> : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                    {row.utilization_status ? <Badge value={row.utilization_status} /> : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                    {row.current_status ? <Badge value={row.current_status} /> : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {formatDate(row.next_periodic_maintenance_due, locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
