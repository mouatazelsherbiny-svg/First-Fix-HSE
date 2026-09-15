"use client";

/**
 * "Equipment Tracker" tab — a live, searchable/filterable card view of
 * every asset in pmv_asset_register (the same table PMV Log → Asset
 * Register edits), focused on "where is it and what state is it in right
 * now". Unlike the old read-only table, this view can also add a new
 * asset or open an existing one for editing — both go through the same
 * generic PmvLogFormModal the Asset Register tab itself uses, so there is
 * still exactly one form definition for this table.
 */

import { useMemo, useState } from "react";
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
// lib/pmvLogs.ts) so each card is recognizable at a glance, matching the
// reference design. Falls back to a generic wrench for anything else.
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
    <div className="card overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
        <div>
          <h2 className="text-lg font-bold text-brand-black">{t.pmv.tabTracker}</h2>
          <p className="mt-1 text-sm text-brand-gray">{t.pmv.trackerNote}</p>
        </div>
        <button type="button" onClick={() => setModalRow(null)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          {t.pmv.trackerAddEquipment}
        </button>
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
          {filterPills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setFilter(pill.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === pill.key
                  ? "bg-brand-orange text-brand-onAccent shadow-sm"
                  : "border border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3 px-6 pb-6">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-brand-gray">{t.common.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-gray">{t.common.noDataYet}</p>
        ) : (
          filtered.map((row) => {
            const Icon = CATEGORY_ICONS[row.equipment_category as string] ?? Wrench;
            const dueSoon = isDueForService(row);
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setModalRow(row)}
                className="flex w-full items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface/60 p-4 text-start shadow-sm transition hover:bg-brand-grayLight/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-brand-black">
                      {row.equipment_name ?? "—"}
                    </p>
                    {dueSoon ? (
                      <Badge value="Due Soon" label={t.pmv.trackerFilterDueService} />
                    ) : row.current_status ? (
                      <Badge value={row.current_status} />
                    ) : null}
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-gray">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {row.asset_transfer_site || row.project_name || row.project_code || "—"}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-gray">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t.pmv.trackerLastInspection}: {formatDate(row.last_periodic_maintenance_date, locale)}
                    </span>
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-brand-gray rtl:rotate-180" />
              </button>
            );
          })
        )}
      </div>

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
