"use client";

import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";
import {
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Construction,
  Container,
  FileClock,
  Forklift,
  LayoutDashboard,
  MapPinned,
  Tractor,
  Truck,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectFilter from "@/components/ProjectFilter";
import { useLanguage } from "@/context/LanguageContext";
import { usePmvDashboard, type PmvOwnershipFilter } from "@/lib/usePmvDashboard";
import { PMV_LOG_DEFINITIONS, PMV_BUCKET_IMAGES } from "@/lib/pmvLogs";
import PmvLogTable from "@/components/pmv/PmvLogTable";
import EquipmentTracker from "@/components/pmv/EquipmentTracker";
import type { InspectionStatus, PmvTypeBreakdown } from "@/types/pmv";

// Same geometric sans as the Injury page.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function PmvPage() {
  return (
    // The project filter lives in this page's own header (as on Injury).
    <ProtectedRoute hideProjectFilter>
      <PmvPageContent />
    </ProtectedRoute>
  );
}

type PmvTab = "dashboard" | "log" | "tracker";

const ORANGE = "#f36f24";
const ORANGE_HI = "#ff8a3d";
const PANEL_BG = "linear-gradient(160deg, #18181b 0%, #111113 100%)";

// Dark values for the app's brand colour tokens (see app/globals.css), used by
// the Logistic and Equipment Register tabs so their tables read white-on-black.
const DARK_TOKENS = {
  "--brand-black-rgb": "245 245 247",
  "--brand-gray-dark-rgb": "205 207 213",
  "--brand-gray-rgb": "150 153 162",
  "--brand-gray-light-rgb": "40 40 46",
  "--brand-surface-rgb": "24 24 27",
  "--brand-border-rgb": "52 52 58",
} as React.CSSProperties;

const TYPE_ICONS: Record<PmvTypeBreakdown["key"], React.ElementType> = {
  vehicles: Truck,
  excavators: Construction,
  loaders: Tractor,
  forklifts: Forklift,
  dumpTrucks: Truck,
  generators: Zap,
  otherEquipment: Container,
};

// Glowing bar colour per equipment type, as in the reference design.
const TYPE_BAR_COLORS: Record<PmvTypeBreakdown["key"], string> = {
  vehicles: "#2563EB",
  excavators: "#F59E0B",
  loaders: "#22C55E",
  forklifts: "#8B5CF6",
  dumpTrucks: "#14B8A6",
  generators: "#94A3B8",
  otherEquipment: "#F43F5E",
};

// Real product photos — shared with the Equipment Tracker's cards via lib/pmvLogs.ts.
const EQUIPMENT_IMAGES = PMV_BUCKET_IMAGES;

const MAX_BAR_HEIGHT_PX = 110;
const IMAGE_BOX_HEIGHT_PX = 84;
const IMAGE_BOX_WIDTH_PX = 118;

function PmvPageContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<PmvTab>("dashboard");
  const [logKey, setLogKey] = useState<string>(PMV_LOG_DEFINITIONS[0]?.key ?? "");
  const openLog = (key: string) => {
    setLogKey(key);
    setTab("log");
  };

  // The whole page is dark, like Injury: paint the app's content area black while here.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.background;
    main.style.background = "#0a0a0c";
    return () => {
      main.style.background = prev;
    };
  }, []);

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 min-h-[calc(100vh-4rem)] overflow-hidden p-4 text-white sm:-mx-6 sm:p-6 lg:-mx-8`}
      style={{
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(243,111,36,0.10), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(243,111,36,0.08), transparent 60%), #0a0a0c",
      }}
    >
      {/* ---- Header: title on the left; project filter with the tabs under it on the right ---- */}
      <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4">
        <span className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]" style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}>
          {t.pmv.title}
        </span>
        <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
        <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">Plant, Machinery, and Vehicles</h1>
        <div className="ms-auto flex flex-col items-end gap-2.5">
          <ProjectFilter className="!text-white/75" />
          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Dashboard and Equipment Register together; Logistic (PMV) on its own as a separate choice. */}
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
              <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={LayoutDashboard} label={t.pmv.tabDashboard} />
              <TabButton active={tab === "tracker"} onClick={() => setTab("tracker")} icon={MapPinned} label={t.pmv.tabTracker} />
            </div>
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
              <TabButton active={tab === "log"} onClick={() => setTab("log")} icon={ClipboardList} label={t.pmv.tabLog} />
            </div>
          </div>
        </div>
      </header>

      {tab === "dashboard" ? (
        <PmvDashboard onOpenLog={openLog} />
      ) : (
        // The log tables are built from the app's brand colour tokens (made for its
        // light background). Here those tokens are switched to a dark palette, so
        // the same tables show light text on dark cards, matching the dashboard.
        <div className="text-white" style={DARK_TOKENS}>
          {tab === "log" ? <PmvLogSection activeKey={logKey} setActiveKey={setLogKey} /> : <EquipmentTrackerSection />}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-[#f36f24] text-white shadow-[0_0_14px_rgba(243,111,36,0.55)]" : "text-white/75 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PmvLogSection({
  activeKey,
  setActiveKey,
}: {
  activeKey: string;
  setActiveKey: (key: string) => void;
}) {
  const { locale } = useLanguage();
  const activeDefinition =
    PMV_LOG_DEFINITIONS.find((d) => d.key === activeKey) ??
    PMV_LOG_DEFINITIONS[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {PMV_LOG_DEFINITIONS.map((def) => (
          <button
            key={def.key}
            type="button"
            onClick={() => setActiveKey(def.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              def.key === activeDefinition?.key
                ? "bg-brand-orange text-brand-onAccent shadow-sm"
                : "border border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
            }`}
          >
            {locale === "ar" ? def.titleAr : def.titleEn}
          </button>
        ))}
      </div>

      {activeDefinition && <PmvLogTable definition={activeDefinition} />}
    </div>
  );
}

// Equipment Tracker tab: the Asset Register log on the left (the same
// pmv_asset_register table, in its normal spreadsheet-style view) beside
// the mobile-app-style tracker screen on the right, so both views of the
// same equipment sit side by side.
const ASSET_REGISTER_DEFINITION = PMV_LOG_DEFINITIONS.find((d) => d.key === "assetRegister");

function EquipmentTrackerSection() {
  return (
    // Log takes all the remaining width; the tracker keeps its phone-sized
    // column pinned to the far right, with a small gap between the two.
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="min-w-0">
        {ASSET_REGISTER_DEFINITION && <PmvLogTable definition={ASSET_REGISTER_DEFINITION} />}
      </div>
      {/* The tracker is a white phone-style screen: keep its text dark. */}
      <div className="text-slate-800">
        <EquipmentTracker />
      </div>
    </div>
  );
}

const INSPECTION_BADGE: Record<InspectionStatus, { bg: string; fg: string }> = {
  Overdue: { bg: "#7f1d1d", fg: "#fecaca" },
  "Due in 2 weeks": { bg: "#7f1d1d", fg: "#fecaca" },
  "Due this month": { bg: "#7c2d12", fg: "#fed7aa" },
};

const STATUS_COLORS = { Active: ORANGE, Inactive: "#8b8b94", Suspended: "#ef4444" };

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:p-5 ${className}`}
      style={{ background: PANEL_BG }}
    >
      {children}
    </section>
  );
}

/** Same size and layout as the KPI cards on Observations and Incidents. */
function KpiCard({ icon: Icon, label, value, share, series }: { icon: LucideIcon; label: string; value: number; share: number; series: number[] }) {
  return (
    <div
      className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] px-3 pb-4 pt-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:px-5"
      style={{ background: "linear-gradient(160deg, #1a1a1d 0%, #121214 100%)" }}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <Icon className="h-11 w-11 shrink-0 text-white/85 sm:h-[60px] sm:w-[60px]" strokeWidth={1.4} />
        <span className="h-12 w-px shrink-0 bg-white/20 sm:h-16" />
        <div className="min-w-0">
          <p className="text-[24px] font-extrabold leading-none tabular-nums sm:text-[36px]">{value.toLocaleString("en-US")}</p>
          <p className="mt-1.5 text-[12px] font-medium leading-tight text-white/90 sm:text-[16px]">{label}</p>
        </div>
        <Sparkline values={series} className="ms-auto hidden h-10 w-24 min-w-[3rem] shrink self-start sm:block" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value ? 4 : 0, Math.min(1, share) * 100)}%`,
            background: `linear-gradient(90deg, #ffb03a, ${ORANGE} 55%, #e2551a)`,
            boxShadow: "0 0 8px rgba(243,111,36,0.8)",
          }}
        />
      </div>
    </div>
  );
}

/** Small glowing trend line. */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const W = 80;
  const H = 30;
  // Scaled between the lowest and highest point so the ups and downs show clearly.
  const min = values.length ? Math.min(...values) : 0;
  const range = Math.max(1, (values.length ? Math.max(...values) : 0) - min);
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

/** Upcoming due dates bucketed into `bins` even steps from the earliest to the latest. */
function dueDateSeries(dates: string[], bins = 10) {
  const t = dates.map((d) => new Date(d).getTime()).filter((n) => !Number.isNaN(n));
  if (t.length === 0) return [];
  const lo = Math.min(...t);
  const span = Math.max(1, Math.max(...t) - lo);
  const out = Array.from({ length: bins }, () => 0);
  t.forEach((n) => (out[Math.min(bins - 1, Math.floor(((n - lo) / span) * bins))] += 1));
  return out;
}

/** Segmented ring: one glowing tick per share of active / inactive / suspended. */
function SegmentRing({ active, inactive, suspended }: { active: number; inactive: number; suspended: number }) {
  const total = active + inactive + suspended;
  const N = 40;
  const R = 64;
  const r = 46;
  const nA = total ? Math.round((active / total) * N) : 0;
  const nI = total ? Math.round((inactive / total) * N) : 0;
  const step = (2 * Math.PI) / N;
  const gap = 0.02;
  const seg = (i: number) => {
    const a0 = i * step + gap - Math.PI / 2;
    const a1 = (i + 1) * step - gap - Math.PI / 2;
    const p = (rad: number, a: number) => `${(rad * Math.cos(a)).toFixed(2)},${(rad * Math.sin(a)).toFixed(2)}`;
    return `M${p(R, a0)} A${R},${R} 0 0 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 0 0 ${p(r, a0)} Z`;
  };
  return (
    <svg viewBox="-72 -72 144 144" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="pmvGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Array.from({ length: N }, (_, i) => {
        const color = !total ? "#2a2a31" : i < nA ? ORANGE : i < nA + nI ? STATUS_COLORS.Inactive : STATUS_COLORS.Suspended;
        return <path key={i} d={seg(i)} fill={color} filter={total && i < nA ? "url(#pmvGlow)" : undefined} />;
      })}
    </svg>
  );
}

function StatusOverview({
  title,
  subtitle,
  counts,
}: {
  title: string;
  subtitle: string;
  counts: { active: number; inactive: number; suspended: number };
}) {
  const rows: { key: keyof typeof STATUS_COLORS; value: number }[] = [
    { key: "Active", value: counts.active },
    { key: "Inactive", value: counts.inactive },
    { key: "Suspended", value: counts.suspended },
  ];
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <h2 className="text-lg font-bold leading-tight sm:text-xl">{title}</h2>
      <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>
      <div className="relative mx-auto mt-4 h-40 w-40">
        <SegmentRing {...counts} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold leading-none tabular-nums">{counts.active.toLocaleString("en-US")}</span>
          <span className="mt-1 text-sm text-white/80">Active</span>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between text-[15px]">
            <span className="flex items-center gap-2.5 text-white/85">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[row.key], boxShadow: row.key === "Active" ? "0 0 8px rgba(243,111,36,0.8)" : undefined }} />
              {row.key}
            </span>
            <span className="font-bold tabular-nums">{row.value.toLocaleString("en-US")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PmvDashboard({ onOpenLog }: { onOpenLog: (logKey: string) => void }) {
  const { t, locale } = useLanguage();
  const [ownership, setOwnership] = useState<PmvOwnershipFilter>("all");
  const {
    summary: s,
    byType,
    operatorStatus,
    vehicleStatus,
    upcomingInspections,
    expiringDocuments,
  } = usePmvDashboard(ownership);

  const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

  // At least 1 so a chart with no data yet doesn't divide by zero.
  const maxTypeTotal = Math.max(1, ...byType.map((row) => row.total));

  const typeLabel = (key: PmvTypeBreakdown["key"]) =>
    ({
      vehicles: t.pmv.typeVehicles,
      excavators: t.pmv.typeExcavators,
      loaders: t.pmv.typeLoaders,
      forklifts: t.pmv.typeForklifts,
      dumpTrucks: t.pmv.typeDumpTrucks,
      generators: t.pmv.typeGenerators,
      otherEquipment: t.pmv.typeOtherEquipment,
    }[key]);

  return (
    <>
      {/* ---- KPI row ---- */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard icon={Truck} label={t.pmv.totalPmv} value={s.totalPmv} share={share(vehicleStatus.active, s.totalPmv)} series={byType.map((r) => r.total)} />
        <KpiCard
          icon={CalendarClock}
          label={t.pmv.dueForInspection}
          value={s.dueForInspection}
          share={share(s.dueForInspection, s.totalPmv)}
          series={dueDateSeries(upcomingInspections.map((r) => r.dueDate))}
        />
        <KpiCard
          icon={UserCheck}
          label={t.pmv.authorizedOperators}
          value={s.authorizedOperators}
          share={share(s.authorizedOperators, s.totalOperators)}
          series={[operatorStatus.suspended, operatorStatus.inactive, operatorStatus.active, operatorStatus.onLeave]}
        />
        <KpiCard
          icon={FileClock}
          label={t.pmv.expiringDocuments}
          value={s.expiringDocuments}
          share={share(s.expiringDocuments, s.totalDocuments)}
          series={expiringDocuments.map((r) => r.count)}
        />
      </div>

      {/* ---- PMV by Type | Operator & Vehicle overview ---- */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,7.4fr)_minmax(0,4.6fr)]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold leading-tight sm:text-xl">{t.pmv.byTypeTitle}</h2>
              <p className="mt-0.5 text-sm text-white/70">{t.pmv.byTypeSubtitle}</p>
            </div>
            <div className="inline-flex rounded-xl border border-white/15 bg-black/30 p-1">
              {([
                ["all", "All"],
                ["Owned", "FF"],
                ["Rented", "Rental"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOwnership(key)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                    ownership === key ? "bg-[#f36f24] text-white shadow-[0_0_14px_rgba(243,111,36,0.6)]" : "text-white/80 hover:bg-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-2 overflow-x-auto pb-1">
            {byType.map((row) => {
              const TypeIcon = TYPE_ICONS[row.key];
              const pct = row.total > 0 ? Math.round((row.available / row.total) * 100) : 0;
              const color = TYPE_BAR_COLORS[row.key];
              const barHeight = Math.max(18, Math.round((row.total / maxTypeTotal) * MAX_BAR_HEIGHT_PX));
              const stackHeight = MAX_BAR_HEIGHT_PX + IMAGE_BOX_HEIGHT_PX;
              return (
                <div key={row.key} className="flex min-w-[104px] flex-1 flex-col items-center">
                  <span className="text-2xl font-bold tabular-nums">{row.total}</span>
                  <div className="relative mt-1 w-full" style={{ height: `${stackHeight}px` }}>
                    <div
                      className="absolute bottom-0 left-1/2 w-11 -translate-x-1/2 rounded-xl"
                      style={{
                        height: `${barHeight}px`,
                        background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                        boxShadow: `0 0 18px ${color}99, inset 0 0 10px rgba(255,255,255,0.18)`,
                      }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={EQUIPMENT_IMAGES[row.key]}
                      alt={typeLabel(row.key)}
                      className="absolute left-1/2 -translate-x-1/2 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
                      style={{ bottom: `${barHeight + 4}px`, height: `${IMAGE_BOX_HEIGHT_PX}px`, width: `${IMAGE_BOX_WIDTH_PX}px` }}
                    />
                  </div>
                  <div
                    className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}99` }}
                  >
                    <TypeIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="mt-2 text-center text-sm font-bold">{typeLabel(row.key)}</span>
                  <span className="mt-0.5 text-center text-xs text-white/70">
                    {t.pmv.available} {row.available}/{row.total}
                  </span>
                  <span className="text-center text-xs text-white/70">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="flex flex-col gap-6 sm:flex-row">
          <StatusOverview
            title="Operator Overview"
            subtitle={`Total operators: ${s.totalOperators.toLocaleString("en-US")}`}
            counts={operatorStatus}
          />
          <span className="hidden w-px self-stretch bg-white/10 sm:block" />
          <StatusOverview
            title="Vehicle Overview"
            subtitle={`Total PMV: ${s.totalPmv.toLocaleString("en-US")}`}
            counts={vehicleStatus}
          />
        </Panel>
      </div>

      {/* ---- Upcoming inspections | Expiring documents ---- */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,7.4fr)_minmax(0,4.6fr)]">
        <Panel className="min-w-0 overflow-x-auto">
          <h2 className="text-lg font-bold leading-tight sm:text-xl">{t.pmv.upcomingInspectionsTitle}</h2>
          <p className="mt-0.5 text-sm text-white/70">{t.pmv.dueForInspectionSubtitle}</p>
          <table className="mt-4 w-full text-start text-sm">
            <thead>
              <tr className="bg-white/[0.05] text-xs font-semibold text-white/85">
                <th className="rounded-s-lg px-3 py-2.5 text-start">{t.pmv.colPmvId}</th>
                <th className="px-3 py-2.5 text-start">{t.pmv.colType}</th>
                <th className="px-3 py-2.5 text-start">{t.pmv.colDescription}</th>
                <th className="px-3 py-2.5 text-start">{t.pmv.colDueDate}</th>
                <th className="rounded-e-lg px-3 py-2.5 text-start">{t.pmv.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {upcomingInspections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-white/50">
                    {t.common.noDataYet}
                  </td>
                </tr>
              ) : (
                upcomingInspections.map((row) => (
                  <tr key={row.pmvId} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{row.pmvId}</td>
                    <td className="px-3 py-3 text-white/85">{row.type}</td>
                    <td className="px-3 py-3 text-white/85">{row.description}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-white/85">
                      {row.dueDate
                        ? new Date(row.dueDate).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: INSPECTION_BADGE[row.status].bg, color: INSPECTION_BADGE[row.status].fg }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Panel>

        <Panel className="min-w-0 overflow-x-auto">
          <h2 className="text-lg font-bold leading-tight sm:text-xl">{t.pmv.expiringDocumentsTitle}</h2>
          <table className="mt-4 w-full text-start text-sm">
            <thead>
              <tr className="bg-white/[0.05] text-xs font-semibold text-white/85">
                <th className="rounded-s-lg px-3 py-2.5 text-start">{t.pmv.colDocumentType}</th>
                <th className="rounded-e-lg px-3 py-2.5 text-end">{t.pmv.colCount}</th>
              </tr>
            </thead>
            <tbody>
              {expiringDocuments.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-3 py-8 text-center text-white/50">
                    {t.common.noDataYet}
                  </td>
                </tr>
              ) : (
                expiringDocuments.map((row) => (
                  <tr
                    key={row.documentType}
                    onClick={() => onOpenLog(row.logKey)}
                    title="Open the log"
                    className="cursor-pointer border-b border-white/[0.07] transition last:border-0 hover:bg-[#f36f24]/10"
                  >
                    <td className="px-3 py-3 font-semibold">{row.documentType}</td>
                    <td className="px-3 py-3 text-end">
                      <span
                        className="inline-flex items-center gap-1 text-base font-bold tabular-nums"
                        style={{ color: row.count > 0 ? ORANGE_HI : undefined, textShadow: row.count > 0 ? "0 0 10px rgba(243,111,36,0.5)" : undefined }}
                      >
                        {row.count}
                        <ChevronRight className="h-4 w-4 text-white/60 rtl:rotate-180" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
}
