"use client";

/**
 * "Equipment Tracker" tab — styled as a self-contained mobile-app screen
 * (fixed-height frame, dark header bar, internal scroll, floating "+"
 * button) per the reference mockup, rather than a plain in-page card. It's
 * a live, searchable/filterable view of every asset in pmv_asset_register
 * (the same table PMV Log → Asset Register edits), focused on "where is it
 * and what state is it in right now". It can also add a new asset or open
 * an existing one for editing — both go through the same generic
 * PmvLogFormModal the Asset Register tab itself uses, so there is still
 * exactly one form definition for this table. app/pmv/page.tsx renders
 * this beside the Asset Register log (the same data, in table form) so
 * both views sit side by side.
 *
 * Equipment photos: each card shows a real product photo (public/pmv/*.png)
 * rather than a generic icon, via the same equipment_category -> photo
 * bucket mapping the PMV Dashboard's "by Type" chart uses (lib/pmvLogs.ts)
 * — the 16 specific categories fold into 7 broad photo buckets, so every
 * card matches the equipment's real look at a glance.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { BrandMark } from "@/components/Sidebar";
import { Search, Plus, ChevronRight, MapPin, Calendar } from "lucide-react";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePmvLogRecords, type PmvLogRow } from "@/lib/usePmvLogRecords";
import { PMV_LOG_DEFINITIONS, PMV_CATEGORY_TO_BUCKET, PMV_BUCKET_IMAGES, assetStatusOf, assetTypeOf } from "@/lib/pmvLogs";
import PmvLogFormModal from "./PmvLogFormModal";

const ASSET_REGISTER_DEFINITION = PMV_LOG_DEFINITIONS.find((d) => d.key === "assetRegister")!;

const DUE_SOON_DAYS = 14;

function isDueForService(row: PmvLogRow) {
  const raw = row.next_periodic_maintenance_due;
  if (!raw) return false;
  const due = new Date(String(raw));
  if (Number.isNaN(due.getTime())) return false;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + DUE_SOON_DAYS);
  return due.getTime() <= threshold.getTime();
}

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
  const { rows, isLoading, error, addRow, updateRow } = usePmvLogRecords("pmv_asset_register");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "due">("all");
  // undefined = modal closed, null = add new, a row = editing that row
  const [modalRow, setModalRow] = useState<PmvLogRow | null | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "active" && assetStatusOf(row) !== "Active") return false;
      if (filter === "due" && !isDueForService(row)) return false;
      if (!q) return true;
      return [row.asset_id, row.equipment_name, row.plate_number ?? row.plate_serial_no, row.serial_number, row.project_code, row.project_name, row.operator_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, query, filter]);

  const filterPills: { key: "all" | "active" | "due"; label: string }[] = [
    { key: "all", label: t.pmv.trackerAllStatuses },
    { key: "active", label: t.pmv.trackerFilterActive },
    { key: "due", label: t.pmv.trackerFilterDueService },
  ];

  return (
    <div className="relative mx-auto flex h-[calc(100vh-9rem)] min-h-[720px] w-full max-w-sm flex-col lg:me-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111113] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]">
      {/* Header — brand orange, matching the app's accent colour. */}
      <div className="flex shrink-0 items-center gap-3 bg-brand-orange px-5 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <BrandMark size={38} />
        </div>
        <h2 className="truncate text-lg font-bold text-white">{t.pmv.tabTracker}</h2>
      </div>

      {/* Scrollable body — search, filters, and the equipment list all
          scroll together inside the fixed-height frame, like a real app
          screen, instead of growing the surrounding page. */}
      <div className="relative flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.pmv.trackerSearch}
            className="w-full rounded-full border border-white/15 bg-black ps-9 pe-4 py-2.5 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-brand-orange"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setFilter(pill.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === pill.key
                  ? "bg-brand-orange text-white shadow-[0_0_10px_rgba(243,111,36,0.5)]"
                  : "border border-white/15 bg-black text-white/80 hover:bg-white/10"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-white/55">{t.common.loading}</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/55">{t.common.noDataYet}</p>
          ) : (
            filtered.map((row) => {
              const bucket = PMV_CATEGORY_TO_BUCKET[assetTypeOf(row)] ?? "otherEquipment";
              const dueSoon = isDueForService(row);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setModalRow(row)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a1d] p-3.5 text-start transition hover:border-brand-orange/50 hover:bg-[#202024]"
                >
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
                    <Image
                      src={PMV_BUCKET_IMAGES[bucket]}
                      alt={assetTypeOf(row)}
                      fill
                      sizes="112px"
                      quality={100}
                      className="object-contain p-0.5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold text-white">
                        {row.equipment_name ?? "—"}
                      </p>
                      {dueSoon ? (
                        <Badge value="Due Soon" label={t.pmv.trackerFilterDueService} className="shrink-0 whitespace-nowrap" />
                      ) : (
                        <Badge value={assetStatusOf(row)} className="shrink-0 whitespace-nowrap" />
                      )}
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/65">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {row.asset_transfer_site || row.project_name || row.project_code || "—"}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/65">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {t.pmv.trackerLastInspection}: {formatDate(row.last_periodic_maintenance_date, locale)}
                      </span>
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-white/40 rtl:rotate-180" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Floating add button, anchored to this screen (not the browser
          viewport) so it stays put while the body above scrolls. */}
      <button
        type="button"
        onClick={() => setModalRow(null)}
        aria-label={t.pmv.trackerAddEquipment}
        title={t.pmv.trackerAddEquipment}
        className="absolute bottom-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-orange text-white shadow-cardHover transition hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </button>

      {modalRow !== undefined && (
        <PmvLogFormModal
          definition={ASSET_REGISTER_DEFINITION}
          initial={modalRow}
          onClose={() => setModalRow(undefined)}
          onSubmit={async (values) => {
            if (modalRow) {
              await updateRow(modalRow.id, values);
            } else {
              await addRow(values);
            }
          }}
        />
      )}
    </div>
  );
}
