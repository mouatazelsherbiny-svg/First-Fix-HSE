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
 * exactly one form definition for this table.
 *
 * Equipment photos: the app only has real product photos for 7 broad
 * equipment-type buckets (public/pmv/*.png, used by the PMV dashboard),
 * while this table's equipment_category is much more specific (16
 * values). Collapsing all 16 down to those 7 photos would make most cards
 * show the same generic "otherEquipment" picture, losing the "tell it
 * apart at a glance" purpose of an image. A distinct icon per category
 * (below) keeps every type visually unique instead; swap CATEGORY_ICONS
 * for real per-category photos later if/when those become available.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  ChevronRight,
  MapPin,
  Calendar,
  type LucideIcon,
  Forklift,
  Construction,
  Zap,
  Wind,
  Droplet,
  Lightbulb,
  Car,
  Flame,
  Container,
  Grid3x3,
  Scissors,
  Truck,
  Bus,
  Van,
  Wrench,
} from "lucide-react";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePmvLogRecords, type PmvLogRow } from "@/lib/usePmvLogRecords";
import { PMV_LOG_DEFINITIONS } from "@/lib/pmvLogs";
import PmvLogFormModal from "./PmvLogFormModal";

const ASSET_REGISTER_DEFINITION = PMV_LOG_DEFINITIONS.find((d) => d.key === "assetRegister")!;

// One icon per equipment_category (see PMV_OPTIONS_EQUIPMENT_CATEGORY in
// lib/pmvLogs.ts) so each card is recognizable at a glance. Falls back to
// a generic wrench for anything else.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Generator: Zap,
  Compressor: Wind,
  Pump: Droplet,
  Forklift: Forklift,
  Excavator: Construction,
  Lighting: Lightbulb,
  Vehicle: Car,
  "Welding Machine": Flame,
  "Concrete Mixer": Container,
  Crane: Construction,
  Scaffolding: Grid3x3,
  "Scissor Lift": Scissors,
  Truck: Truck,
  Bus: Bus,
  Pickup: Truck,
  "Mini Van": Van,
};

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
      if (filter === "active" && row.current_status !== "Active") return false;
      if (filter === "due" && !isDueForService(row)) return false;
      if (!q) return true;
      return [row.asset_id, row.equipment_name, row.plate_serial_no, row.project_code, row.project_name, row.operator_name]
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
    <div className="relative mx-auto flex h-[680px] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-cardHover">
      {/* Header — deliberately its own dark navy treatment (not the app's
          orange brand color) so this tab reads as a dedicated mobile-app
          screen, per the reference design. */}
      <div className="flex shrink-0 items-center gap-3 bg-[#102A4C] px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Image src="/logo-icon.png" alt="" width={22} height={22} className="object-contain" />
        </div>
        <h2 className="truncate text-base font-bold text-white">{t.pmv.tabTracker}</h2>
      </div>

      {/* Scrollable body — search, filters, and the equipment list all
          scroll together inside the fixed-height frame, like a real app
          screen, instead of growing the surrounding page. */}
      <div className="relative flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.pmv.trackerSearch}
            className="w-full rounded-full border border-slate-200 bg-slate-50 ps-9 pe-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#2F6FED] focus:bg-white"
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
                  ? "bg-[#2F6FED] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
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
            <p className="py-8 text-center text-sm text-slate-400">{t.common.loading}</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">{t.common.noDataYet}</p>
          ) : (
            filtered.map((row) => {
              const Icon = CATEGORY_ICONS[row.equipment_category as string] ?? Wrench;
              const dueSoon = isDueForService(row);
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setModalRow(row)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 text-start shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {row.equipment_name ?? "—"}
                      </p>
                      {dueSoon ? (
                        <Badge value="Due Soon" label={t.pmv.trackerFilterDueService} />
                      ) : row.current_status ? (
                        <Badge value={row.current_status} />
                      ) : null}
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {row.asset_transfer_site || row.project_name || row.project_code || "—"}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {t.pmv.trackerLastInspection}: {formatDate(row.last_periodic_maintenance_date, locale)}
                      </span>
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 rtl:rotate-180" />
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
