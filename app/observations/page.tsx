"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { ChevronDown, FolderOpen, LockKeyhole, LockKeyholeOpen, Search, Tag, ThumbsUp, UserRound, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectFilter from "@/components/ProjectFilter";
import ConfirmDialog from "@/components/ConfirmDialog";
import ExportExcelButton from "@/components/ExportExcelButton";
import { ColumnFilter, useColumnFilters, type FilterColumn } from "@/components/table/ColumnFilter";
import { BarList, MonthAreaChart, PILL_SELECT, SEARCH_INPUT, TABLE_TITLE, TH_ROW } from "@/components/charts/InjuryStyle";
import { PhotoThumbPair, useLinkedPhotosForObservations, type PhotoUrl } from "@/components/observations/ObservationPhotos";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import type { Observation } from "@/types/observation";

// Same geometric sans as the Injury, PMV and Incidents pages.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function ObservationsPage() {
  return (
    // The project filter lives in this page's own header (as on PMV and Incidents).
    <ProtectedRoute hideProjectFilter>
      <ObservationsList />
    </ProtectedRoute>
  );
}

// ---------------------------------------------------------------------------

const ORANGE = "#f36f24";
const ORANGE_HI = "#ff8a3d";
const CARD_BG = "linear-gradient(160deg, #1a1a1d 0%, #121214 100%)";
const CARD = "rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]";

/** Shared app components (export button, dialogs, photo thumbs) read these tokens; flip them dark here. */
const DARK_TOKENS = {
  "--brand-black-rgb": "245 245 247",
  "--brand-gray-dark-rgb": "205 207 213",
  "--brand-gray-rgb": "150 153 162",
  "--brand-gray-light-rgb": "40 40 46",
  "--brand-surface-rgb": "24 24 27",
  "--brand-border-rgb": "52 52 58",
} as React.CSSProperties;

const GOOD_PRACTICE = "Good Practice";
const OPEN_STATUSES = new Set(["Open", "In Progress", "Overdue"]);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAGE_SIZE = 100;

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

/** Columns the table can be filtered by (header funnels). */
const OBS_FILTERS: FilterColumn<Observation>[] = [
  { key: "report", get: (o) => `#${o.reportNumber}` },
  { key: "project", get: (o) => o.projectName },
  { key: "type", get: (o) => typeLabel(o) },
  { key: "classification", get: (o) => o.classification },
  { key: "risk", get: (o) => (isGoodPractice(o) ? GOOD_PRACTICE : o.riskRating) },
  { key: "status", get: (o) => (isGoodPractice(o) && o.status !== "Cancelled" ? GOOD_PRACTICE : o.status) },
  { key: "date", get: (o) => shortDate(o.createdAt) },
];

function isGoodPractice(o: Observation) {
  return o.observationType === GOOD_PRACTICE || o.classification === GOOD_PRACTICE;
}

function typeLabel(o: Observation) {
  return o.observationType === "Others" && o.observationTypeOther ? o.observationTypeOther : o.observationType;
}

function countBy<T>(items: T[], key: (item: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item)?.trim();
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

const dateOf = (o: Observation) => {
  const d = new Date(o.createdAt);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Running total at 12 even steps across the whole record span, so every card with
 *  observations shows its line climbing (a gentle climb if nothing is dated). */
function runningSeries(items: Observation[], start: number, end: number) {
  const span = Math.max(1, end - start);
  const times = items.map((o) => dateOf(o)?.getTime());
  const series = Array.from({ length: 12 }, (_, k) => {
    const cut = start + ((k + 1) / 12) * span;
    return times.filter((t) => t === undefined || t <= cut).length;
  });
  if (items.length > 0 && series.every((v) => v === series[0])) return series.map((_, k) => (items.length * (k + 1)) / 12);
  return series;
}

/** Legacy photo stored on the observation row (data URL) — it is its own thumbnail. */
const rowPhoto = (photos: string[]): PhotoUrl | undefined => (photos[0] ? { src: photos[0], thumb: photos[0] } : undefined);

// ---- Pills (risk / status), coloured like the design ----
const PILL: Record<string, string> = {
  High: "bg-[#e5261f] text-white shadow-[0_0_10px_rgba(229,38,31,0.55)]",
  Medium: "bg-[#f5c518] text-[#1a1a1a] shadow-[0_0_10px_rgba(245,197,24,0.45)]",
  Low: "bg-[#16a34a] text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]",
  Closed: "bg-[#15a33a] text-white shadow-[0_0_10px_rgba(21,163,58,0.5)]",
  Open: "bg-[#f36f24] text-white shadow-[0_0_10px_rgba(243,111,36,0.55)]",
  "In Progress": "bg-[#f59e0b] text-[#1a1a1a] shadow-[0_0_10px_rgba(245,158,11,0.45)]",
  Overdue: "bg-[#b91c1c] text-white shadow-[0_0_10px_rgba(185,28,28,0.55)]",
  Cancelled: "bg-white/15 text-white/70",
  [GOOD_PRACTICE]: "bg-[#1d4ed8] text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]",
};

function Pill({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`inline-flex min-w-[5.5rem] justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${PILL[value] ?? "bg-white/15 text-white"}`}>
      {label ?? value}
    </span>
  );
}

// ---------------------------------------------------------------------------

function ObservationsList() {
  const { t, locale } = useLanguage();
  const { observations, isLoading, updateObservation } = useObservations();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Observation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // The whole page is dark, like Injury, PMV and Incidents: paint the app's content area black while here.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.background;
    main.style.background = "#0a0a0c";
    return () => {
      main.style.background = prev;
    };
  }, []);

  const handleCancelObservation = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await updateObservation(cancelTarget.id, { status: "Cancelled" });
      setCancelTarget(null);
    } catch {
      setCancelError(t.detail.cancelError);
    } finally {
      setIsCancelling(false);
    }
  };

  // The project filter in the header already narrows `observations`; the text search only narrows the table.
  const byProject = observations;

  const summary = useMemo(() => {
    const active = byProject.filter((o) => o.status !== "Cancelled");
    const hazards = active.filter((o) => !isGoodPractice(o));
    const open = active.filter((o) => OPEN_STATUSES.has(o.status));
    const closed = active.filter((o) => o.status === "Closed");
    const gp = active.filter(isGoodPractice);
    const times = active.map((o) => dateOf(o)?.getTime()).filter((t): t is number => t !== undefined);
    const end = Date.now();
    const start = times.length ? Math.min(...times) : end;
    const last12 = (items: Observation[]) => {
      const now = new Date();
      const monthly = Array.from({ length: 12 }, () => 0);
      items.forEach((o) => {
        const d = dateOf(o);
        if (!d) return;
        const back = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (back >= 0 && back < 12) monthly[11 - back] += 1;
      });
      return monthly.some((v) => v > 0) ? monthly : runningSeries(items, start, end);
    };
    return {
      total: active.length,
      kpis: [
        { key: "total", label: "Total No. of Observations", icon: ChecklistDoc, value: active.length, series: last12(active) },
        { key: "open", label: "Open", icon: LockKeyholeOpen, value: open.length, series: last12(open) },
        { key: "closed", label: "Closed", icon: LockKeyhole, value: closed.length, series: last12(closed) },
        { key: "gp", label: "Good Practice (G.P)", icon: ThumbsUp, value: gp.length, series: last12(gp) },
      ],
      topTypes: countBy(hazards, typeLabel).slice(0, 3),
      topProjects: countBy(active, (o) => o.projectName).slice(0, 3),
      topObservers: countBy(active, (o) => o.inspectedBy).slice(0, 3),
      perProject: countBy(active, (o) => o.projectName || "Not specified"),
      active,
    };
  }, [byProject]);

  // ---- Observations by month, for the chosen year ----
  const years = useMemo(() => {
    const set = new Set<number>();
    summary.active.forEach((o) => {
      const d = dateOf(o);
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [summary.active]);
  const [year, setYear] = useState<number | null>(null);
  const shownYear = year ?? years[0] ?? new Date().getFullYear();
  const monthly = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    summary.active.forEach((o) => {
      const d = dateOf(o);
      if (d && d.getFullYear() === shownYear) counts[d.getMonth()] += 1;
    });
    // The current year stops at this month.
    const now = new Date();
    const upTo = shownYear === now.getFullYear() ? now.getMonth() + 1 : 12;
    return counts.slice(0, upTo).map((value, i) => ({ label: MONTHS[i], value }));
  }, [summary.active, shownYear]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return byProject;
    return byProject.filter(
      (o) =>
        String(o.reportNumber).includes(q) ||
        o.projectName.toLowerCase().includes(q) ||
        o.observationType.toLowerCase().includes(q)
    );
  }, [byProject, query]);
  // Header funnels narrow the searched rows further.
  const columnFilters = useColumnFilters(searched, OBS_FILTERS);
  const filtered = columnFilters.filtered;

  // Keep the rendered table light — page the (already client-filtered) results.
  useEffect(() => {
    setPage(0);
  }, [query, filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  // Photos only for the rows on screen: one batched query + one signed-URL request.
  const linkedPhotos = useLinkedPhotosForObservations(pageItems.map((o) => o.id));

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });

  const exportSheets = useMemo(
    () => [
      {
        name: t.list.title,
        columns: [
          { header: t.list.col.reportNumber, key: "reportNumber", width: 14 },
          { header: t.list.col.project, key: "project" },
          { header: t.list.col.type, key: "type" },
          { header: t.list.col.classification, key: "classification" },
          { header: t.list.col.risk, key: "risk" },
          { header: t.list.col.status, key: "status" },
          { header: t.form.observationDetails, key: "details", width: 40 },
          { header: t.form.inspectedBy, key: "inspectedBy" },
          { header: t.list.col.date, key: "date" },
          { header: t.form.observationPhoto, key: "observationPhotos", type: "image" as const, width: 20 },
          { header: t.form.closeOutPhoto, key: "closeOutPhotos", type: "image" as const, width: 20 },
        ],
        rows: filtered.map((o) => ({
          reportNumber: o.reportNumber,
          project: o.projectName,
          type: o.observationType === "Others" ? o.observationTypeOther || t.form.other : o.observationType,
          classification: o.classification,
          risk: o.riskRating,
          status: o.status,
          details: o.observationDetails,
          inspectedBy: o.inspectedBy,
          date: fmtDate(o.createdAt),
          observationPhotos: o.observationPhotos,
          closeOutPhotos: o.closeOutPhotos,
        })),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, t, locale]
  );

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 min-h-[calc(100vh-4rem)] overflow-hidden p-4 text-white sm:-mx-6 sm:p-6 lg:-mx-8`}
      style={{
        ...DARK_TOKENS,
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(243,111,36,0.10), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(243,111,36,0.08), transparent 60%), #0a0a0c",
      }}
    >
      {/* ---- Header (same as PMV): title on the left; project filter and export on the right ---- */}
      <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4">
        <span className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]" style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}>
          Observations
        </span>
        <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
        <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">HSE Observations Summary</h1>
        <div className="ms-auto flex flex-wrap items-center justify-end gap-3">
          <ProjectFilter className="!text-white/75" />
          <ExportExcelButton
            filename={t.list.title}
            sheets={exportSheets}
            disabled={filtered.length === 0}
            className="!rounded-xl !border-white/20 !bg-white/[0.04] !text-white hover:!bg-white/10"
          />
        </div>
      </header>

      {/* ---- KPI cards ---- */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {summary.kpis.map((k) => (
          <KpiCard key={k.key} label={k.label} icon={k.icon} value={k.value} series={k.series} share={k.key === "total" ? 1 : summary.total ? k.value / summary.total : 0} />
        ))}
      </div>

      {/* ---- Top 3 rankings ---- */}
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <TopThree icon={Tag} title="Top 3 Observation Types" rows={summary.topTypes} empty={t.list.empty} />
        <TopThree icon={FolderOpen} title="Top 3 Observing Projects" rows={summary.topProjects} empty={t.list.empty} />
        <TopThree icon={UserRound} title="Top 3 Observers" rows={summary.topObservers} empty={t.list.empty} />
      </div>

      {/* ---- Month | Project ---- */}
      <div className="mb-5 grid gap-4 xl:grid-cols-2">
        <section className={`${CARD} min-w-0 p-4 sm:p-5`} style={{ background: CARD_BG }}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="flex-1 text-base font-semibold leading-tight sm:text-[17px]">Observations by Month</h2>
            {years.length > 0 && (
              <label className="relative">
                <span className="sr-only">Year</span>
                <select
                  value={shownYear}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={PILL_SELECT}
                >
                  {years.map((y) => (
                    <option key={y} value={y} className="bg-[#18181b]">
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
              </label>
            )}
          </div>
          <MonthAreaChart id="obs-month" data={monthly.map((p) => ({ name: p.label, value: p.value }))} valueLabel="Observations" />
        </section>
        <section className={`${CARD} min-w-0 p-4 sm:p-5`} style={{ background: CARD_BG }}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-base font-semibold leading-tight sm:text-[17px]">Observations by Project</h2>
          </div>
          <BarList rows={summary.perProject.map((r) => ({ name: r.label, value: r.count }))} visibleRows={8} empty={t.list.empty} />
        </section>
      </div>

      {/* ---- Table ---- */}
      {isLoading ? (
        <div className={`${CARD} flex items-center justify-center py-16`} style={{ background: CARD_BG }}>
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#f36f24] border-t-transparent" />
        </div>
      ) : byProject.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center justify-center py-16 text-center`} style={{ background: CARD_BG }}>
          <p className="text-sm font-medium text-white/60">{t.list.empty}</p>
          <Link href="/observations/new" className="btn-primary mt-4">
            {t.list.emptyCta}
          </Link>
        </div>
      ) : (
        <div className={`${CARD} p-4 sm:p-5`} style={{ background: CARD_BG }}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className={TABLE_TITLE}>Observation Details</h2>
            <label className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.list.search} className={SEARCH_INPUT} />
            </label>
          </div>
          <div className="max-h-[560px] overflow-auto rounded-lg">
            <table className="w-full min-w-[980px] text-start text-sm">
              <thead className="sticky top-0 z-10">
                <tr className={TH_ROW}>
                  <th className="rounded-s-lg whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.list.col.reportNumber} align="start" {...columnFilters.header("report")} /></th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-start">{t.list.col.photos}</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.list.col.project} align="start" {...columnFilters.header("project")} /></th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.list.col.type} align="start" {...columnFilters.header("type")} /></th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.list.col.classification} align="start" {...columnFilters.header("classification")} /></th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-center"><ColumnFilter label={t.list.col.risk} align="center" {...columnFilters.header("risk")} /></th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-center"><ColumnFilter label={t.list.col.status} align="center" {...columnFilters.header("status")} /></th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.list.col.date} align="start" {...columnFilters.header("date")} /></th>
                  <th className="rounded-e-lg whitespace-nowrap px-3 py-2.5 text-center">{t.list.col.actions}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-sm text-white/55">
                      No observations match these filters.{" "}
                      {columnFilters.activeCount > 0 && (
                        <button type="button" onClick={columnFilters.clearAll} className="font-semibold text-[#ff8a3d] hover:underline">
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
                {pageItems.map((o) => {
                  const gp = isGoodPractice(o);
                  return (
                    <tr key={o.id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.03]">
                      <td className="px-3 py-2.5 font-bold">#{o.reportNumber}</td>
                      <td className="px-3 py-2">
                        <PhotoThumbPair
                          observationPhoto={rowPhoto(o.observationPhotos) ?? linkedPhotos.get(o.id)?.observation[0]}
                          closeOutPhoto={rowPhoto(o.closeOutPhotos) ?? linkedPhotos.get(o.id)?.closeOut[0]}
                          beforeLabel={t.list.photoBefore}
                          afterLabel={t.list.photoAfter}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-white/80">{o.projectName}</td>
                      <td className="px-3 py-2.5 text-white/80">{o.observationType === "Others" ? o.observationTypeOther || t.form.other : o.observationType}</td>
                      <td className="px-3 py-2.5 text-white/80">{o.classification}</td>
                      <td className="px-3 py-2.5 text-center">{gp ? <Pill value={GOOD_PRACTICE} /> : <Pill value={o.riskRating} />}</td>
                      <td className="px-3 py-2.5 text-center">
                        {gp && o.status !== "Cancelled" ? <Pill value={GOOD_PRACTICE} /> : <Pill value={o.status} />}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-white/90">{fmtDate(o.createdAt)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-4 font-semibold">
                          <Link href={`/observations/${o.id}`} className="text-[#ffa31a] hover:underline">
                            {t.list.view}
                          </Link>
                          <Link href={`/observations/${o.id}/edit`} className="text-[#ffa31a] hover:underline">
                            {t.list.edit}
                          </Link>
                          {o.status !== "Cancelled" && (
                            <button type="button" onClick={() => setCancelTarget(o)} className="font-medium text-white hover:text-red-400 hover:underline">
                              {t.list.cancel}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-2 flex flex-col gap-3 border-t border-white/10 px-2 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-white/60">
                {t.common.pageOf.replace("{current}", String(currentPage + 1)).replace("{total}", String(totalPages))}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.common.previous}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.common.next}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title={t.detail.cancelConfirmTitle}
          message={t.detail.cancelConfirmMessage}
          confirmLabel={isCancelling ? t.detail.cancelling : t.detail.cancelConfirmConfirm}
          cancelLabel={t.common.close}
          isBusy={isCancelling}
          error={cancelError}
          onConfirm={handleCancelObservation}
          onClose={() => {
            setCancelError("");
            setCancelTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Outline sheet with a folded corner and three ticked rows (same stroke style as the lucide icons). */
function ChecklistDoc({ className, strokeWidth = 1.3 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 2.5h10l4.5 4.5v13a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 20V4A1.5 1.5 0 0 1 5 2.5Z" />
      <path d="M15 2.5V7h4.5" />
      <path d="m6.5 9.5 1 1 2-2M11.5 9.5h5M6.5 13.5l1 1 2-2M11.5 13.5h5M6.5 17.5l1 1 2-2M11.5 17.5h5" />
    </svg>
  );
}

function KpiCard({ label, icon: Icon, value, series, share }: { label: string; icon: LucideIcon | typeof ChecklistDoc; value: number; series: number[]; share: number }) {
  return (
    <div className={`${CARD} flex min-w-0 flex-col justify-between gap-3 px-5 pb-4 pt-5`} style={{ background: CARD_BG }}>
      <div className="flex items-center gap-4">
        <Icon className="h-9 w-9 shrink-0 text-white/75" strokeWidth={1.4} />
        <div className="min-w-0">
          <p className="text-[30px] font-bold leading-none tabular-nums">{value.toLocaleString("en-US")}</p>
          <p className="mt-1.5 text-sm font-medium tracking-wide text-white/70">{label}</p>
        </div>
        <Sparkline values={series} className="ms-auto h-8 w-20 shrink-0" />
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value ? 4 : 0, share * 100)}%`,
            background: `linear-gradient(90deg, #e2551a, ${ORANGE} 60%, ${ORANGE_HI})`,
            boxShadow: "0 0 8px rgba(243,111,36,0.8)",
          }}
        />
      </div>
    </div>
  );
}

/** Small glowing trend line of the monthly counts. */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const W = 80;
  const H = 30;
  // Scaled between the lowest and highest month so the ups and downs show clearly.
  const min = Math.min(...values);
  const range = Math.max(1, Math.max(...values) - min);
  const pts = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * W : W / 2, H - 4 - ((v - min) / range) * (H - 8)]);
  let d = pts.length ? `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}` : "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={ORANGE_HI} strokeWidth="2.2" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(243,111,36,0.9))" }} />
    </svg>
  );
}

function TopThree({ title, rows, empty }: { icon?: LucideIcon; title: string; rows: { label: string; count: number }[]; empty: string }) {
  const max = rows[0]?.count ?? 0;
  return (
    <section className={`${CARD} min-w-0 p-4 sm:p-5`} style={{ background: CARD_BG }}>
      <h2 className="mb-3 text-base font-semibold leading-tight sm:text-[17px]">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/55">{empty}</p>
      ) : (
        <ol className="space-y-2.5">
          {rows.map((r, i) => (
            <li key={r.label} className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: `linear-gradient(180deg, ${ORANGE_HI}, #e2551a)`, boxShadow: "0 0 10px rgba(243,111,36,0.6)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[15px] sm:text-base">
                  <span className="min-w-0 flex-1 truncate font-medium" title={r.label}>
                    {r.label}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums">{r.count.toLocaleString("en-US")}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${max ? (r.count / max) * 100 : 0}%`, background: `linear-gradient(90deg, #ffb03a, ${ORANGE})`, boxShadow: "0 0 6px rgba(243,111,36,0.7)" }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}



