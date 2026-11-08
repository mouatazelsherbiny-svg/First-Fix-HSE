"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { BarChart3, ChevronDown, FolderOpen, Search, Tag, UserRound, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectFilter from "@/components/ProjectFilter";
import ConfirmDialog from "@/components/ConfirmDialog";
import ExportExcelButton from "@/components/ExportExcelButton";
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

/** Counts per month for the last 12 months, oldest first (for the small trend lines). */
function last12(items: Observation[]) {
  const now = new Date();
  const out = Array.from({ length: 12 }, () => 0);
  for (const o of items) {
    const d = dateOf(o);
    if (!d) continue;
    const back = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (back >= 0 && back < 12) out[11 - back] += 1;
  }
  return out;
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
    <span className={`inline-flex min-w-[6.5rem] justify-center whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-semibold ${PILL[value] ?? "bg-white/15 text-white"}`}>
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
    return {
      total: active.length,
      kpis: [
        { key: "total", label: "Total No. of Observations", img: "/brand/observations/total.svg", value: active.length, series: last12(active) },
        { key: "open", label: "Open", img: "/brand/observations/open.svg", value: open.length, series: last12(open) },
        { key: "closed", label: "Closed", img: "/brand/observations/closed.svg", value: closed.length, series: last12(closed) },
        { key: "gp", label: "Good Practice (G.P)", img: "/brand/observations/gp.svg", value: gp.length, series: last12(gp) },
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return byProject;
    return byProject.filter(
      (o) =>
        String(o.reportNumber).includes(q) ||
        o.projectName.toLowerCase().includes(q) ||
        o.observationType.toLowerCase().includes(q)
    );
  }, [byProject, query]);

  // Keep the rendered table light — page the (already client-filtered) results.
  useEffect(() => {
    setPage(0);
  }, [query]);

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
      className={`${montserrat.className} relative -mt-6 overflow-hidden p-4 text-white sm:p-6`}
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
          <KpiCard key={k.key} label={k.label} img={k.img} value={k.value} series={k.series} share={k.key === "total" ? 1 : summary.total ? k.value / summary.total : 0} />
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
            <BarChart3 className="h-6 w-6 shrink-0" style={{ color: ORANGE }} strokeWidth={2.4} />
            <h2 className="flex-1 text-lg font-bold sm:text-xl">Observations by Month</h2>
            {years.length > 0 && (
              <label className="relative">
                <span className="sr-only">Year</span>
                <select
                  value={shownYear}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="appearance-none rounded-full border border-white/25 bg-white/[0.04] py-1 pe-8 ps-4 text-sm font-semibold text-white outline-none focus:border-[#f36f24]"
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
          {/* On phones the chart scrolls sideways so its labels stay readable. */}
          <div className="-mx-1 overflow-x-auto px-1">
            <div className="min-w-[560px] sm:min-w-0">
              <MonthArea points={monthly} />
            </div>
          </div>
        </section>
        <section className={`${CARD} min-w-0 p-4 sm:p-5`} style={{ background: CARD_BG }}>
          <div className="mb-3 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 shrink-0" style={{ color: ORANGE }} strokeWidth={2.4} />
            <h2 className="text-lg font-bold sm:text-xl">Observations by Project</h2>
          </div>
          <ProjectBars rows={summary.perProject} />
        </section>
      </div>

      {/* ---- Search ---- */}
      <div className="mb-3 flex items-center">
        <label className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.list.search}
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2.5 pe-3 ps-9 text-sm text-white placeholder:text-white/45 outline-none focus:border-[#f36f24]"
          />
        </label>
      </div>

      {/* ---- Table ---- */}
      {isLoading ? (
        <div className={`${CARD} flex items-center justify-center py-16`} style={{ background: CARD_BG }}>
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#f36f24] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center justify-center py-16 text-center`} style={{ background: CARD_BG }}>
          <p className="text-sm font-medium text-white/60">{t.list.empty}</p>
          <Link href="/observations/new" className="btn-primary mt-4">
            {t.list.emptyCta}
          </Link>
        </div>
      ) : (
        <div className={`${CARD} overflow-hidden p-2 sm:p-3`} style={{ background: CARD_BG }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-start text-[15px]">
              <thead>
                <tr className="bg-white/[0.06] text-[15px] font-bold text-white">
                  <th className="rounded-s-xl px-4 py-3 text-start">{t.list.col.reportNumber}</th>
                  <th className="px-3 py-3 text-start">{t.list.col.photos}</th>
                  <th className="px-4 py-3 text-start">{t.list.col.project}</th>
                  <th className="px-4 py-3 text-start">{t.list.col.type}</th>
                  <th className="px-4 py-3 text-start">{t.list.col.classification}</th>
                  <th className="px-4 py-3 text-center">{t.list.col.risk}</th>
                  <th className="px-4 py-3 text-center">{t.list.col.status}</th>
                  <th className="px-4 py-3 text-start">{t.list.col.date}</th>
                  <th className="rounded-e-xl px-4 py-3 text-center">{t.list.col.actions}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((o) => {
                  const gp = isGoodPractice(o);
                  return (
                    <tr key={o.id} className="border-b border-white/[0.07] transition last:border-0 hover:bg-white/[0.04]">
                      <td className="px-4 py-2.5 font-bold">#{o.reportNumber}</td>
                      <td className="px-3 py-2">
                        <PhotoThumbPair
                          observationPhoto={rowPhoto(o.observationPhotos) ?? linkedPhotos.get(o.id)?.observation[0]}
                          closeOutPhoto={rowPhoto(o.closeOutPhotos) ?? linkedPhotos.get(o.id)?.closeOut[0]}
                          beforeLabel={t.list.photoBefore}
                          afterLabel={t.list.photoAfter}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-white/90">{o.projectName}</td>
                      <td className="px-4 py-2.5 text-white/90">{o.observationType === "Others" ? o.observationTypeOther || t.form.other : o.observationType}</td>
                      <td className="px-4 py-2.5 text-white/90">{o.classification}</td>
                      <td className="px-4 py-2.5 text-center">{gp ? <Pill value={GOOD_PRACTICE} /> : <Pill value={o.riskRating} />}</td>
                      <td className="px-4 py-2.5 text-center">
                        {gp && o.status !== "Cancelled" ? <Pill value={GOOD_PRACTICE} /> : <Pill value={o.status} />}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-white/90">{fmtDate(o.createdAt)}</td>
                      <td className="px-4 py-2.5">
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

function KpiCard({ label, img, value, series, share }: { label: string; img: string; value: number; series: number[]; share: number }) {
  return (
    <div className={`${CARD} flex min-w-0 flex-col justify-between gap-4 px-3 pb-4 pt-4 sm:px-5`} style={{ background: CARD_BG }}>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="h-11 w-11 shrink-0 object-contain sm:h-[72px] sm:w-[72px]" />
        <span className="h-12 w-px shrink-0 bg-white/20 sm:h-16" />
        <div className="min-w-0">
          <p className="text-[24px] font-bold leading-none tabular-nums sm:text-[34px]">{value.toLocaleString("en-US")}</p>
          <p className="mt-1.5 text-[12px] font-medium leading-tight text-white/90 sm:text-[16px]">
            {label}
          </p>
        </div>
        <Sparkline values={series} className="ms-auto hidden h-9 w-12 min-w-[2.5rem] shrink-0 self-start sm:block" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value ? 4 : 0, share * 100)}%`,
            background: `linear-gradient(90deg, #ffb03a, ${ORANGE} 55%, #e2551a)`,
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
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * W : W / 2, H - 4 - (v / max) * (H - 8)]);
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

function TopThree({ icon: Icon, title, rows, empty }: { icon: LucideIcon; title: string; rows: { label: string; count: number }[]; empty: string }) {
  const max = rows[0]?.count ?? 0;
  return (
    <section className={`${CARD} min-w-0 p-4 sm:p-5`} style={{ background: CARD_BG }}>
      <h2 className="mb-3 flex items-center gap-3 text-lg font-bold sm:text-xl">
        <Icon className="h-6 w-6 shrink-0" style={{ color: ORANGE }} strokeWidth={2.2} />
        {title}
      </h2>
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

/** "Nice" axis maximum and tick step. */
function niceAxis(max: number, steps = 5) {
  const raw = Math.max(1, max) / steps;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const top = Math.ceil(max / step) * step || step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

/** Orange area chart with a value over every month. */
function MonthArea({ points }: { points: { label: string; value: number }[] }) {
  const W = 640;
  const H = 230;
  const L = 52;
  const R = 16;
  const T = 26;
  const B = 26;
  const { top, ticks } = niceAxis(Math.max(...points.map((p) => p.value), 1) * 1.3);
  const n = points.length;
  const x = (i: number) => L + (n > 1 ? (i / (n - 1)) * (W - L - R) : (W - L - R) / 2);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${H - B} L${x(0).toFixed(1)},${H - B} Z`;
  if (!n) return <div className="flex h-48 items-center justify-center text-sm text-white/50">No observations yet</div>;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Observations by month">
      <defs>
        <linearGradient id="obsArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c2410c" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {ticks.map((tk) => (
        <g key={tk}>
          <line x1={L} x2={W - R} y1={y(tk)} y2={y(tk)} stroke="rgba(255,255,255,0.08)" />
          <text x={L - 8} y={y(tk) + 4} textAnchor="end" fill="rgba(255,255,255,0.85)" fontSize="12">
            {tk.toLocaleString("en-US")}
          </text>
        </g>
      ))}
      {points.map((_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={T} y2={H - B} stroke="rgba(255,255,255,0.05)" />
      ))}
      <path d={area} fill="url(#obsArea)" />
      <path d={line} fill="none" stroke={ORANGE_HI} strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 4px rgba(243,111,36,0.9))" }} />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="#fff" stroke={ORANGE} strokeWidth="2.5" />
          <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">
            {p.value.toLocaleString("en-US")}
          </text>
          <text x={x(i)} y={H - 7} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="12">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Compact glowing bars: one row per project, largest first. */
function ProjectBars({ rows }: { rows: { label: string; count: number }[] }) {
  if (rows.length === 0) return <div className="flex h-48 items-center justify-center text-sm text-white/50">No observations yet</div>;
  const max = rows[0].count * 1.18;
  return (
    <div className="max-h-[15rem] overflow-y-auto pe-1">
      <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <span className="truncate text-end text-[14px] leading-5 text-white/90" title={r.label}>
              {r.label}
            </span>
            <div className="flex items-center">
              <div
                className="h-3.5 rounded-full"
                style={{
                  width: `${(r.count / max) * 100}%`,
                  minWidth: 4,
                  background: "linear-gradient(180deg, #ffab52 0%, #ff7a1a 45%, #e8590c 100%)",
                  boxShadow: "0 0 10px rgba(255,122,26,0.55)",
                }}
              />
              <span className="ms-2 text-[14px] font-semibold tabular-nums">{r.count.toLocaleString("en-US")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
