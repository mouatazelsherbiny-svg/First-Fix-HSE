"use client";

import { useEffect, useMemo, useState } from "react";
import { Montserrat } from "next/font/google";
import { HardHat } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectFilter from "@/components/ProjectFilter";
import { useIncidents } from "@/context/IncidentsContext";
import type { Incident } from "@/types/incident";

// Same geometric sans as the Injury and PMV pages.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function IncidentsPage() {
  return (
    // The project filter lives in this page's own header (as on Injury and PMV).
    <ProtectedRoute hideProjectFilter>
      <IncidentsOverview />
    </ProtectedRoute>
  );
}

// ---------------------------------------------------------------------------
// Everything on this page is counted live from the FICC records (the
// `incidents` table), one row per reported incident. A record counts toward
// a card when either its Incident Category or its Classification matches.
// ---------------------------------------------------------------------------

const ORANGE = "#f36f24";
const ORANGE_HI = "#ff8a3d";
const PANEL_BG = "linear-gradient(160deg, #18181b 0%, #111113 100%)";

interface CardDef {
  key: string;
  label: string;
  title: string;
  /** Colour icon in public/brand/incidents/v2. */
  img: string;
  match: string[];
}

const icon = (k: string) => `/brand/incidents/v2/${k}.png`;

const CARDS: CardDef[] = [
  { key: "fatality", label: "Fatality", title: "Fatality", img: icon("fatality"), match: ["Fatality"] },
  { key: "lti", label: "LTI", title: "Lost Time Injury", img: icon("lti"), match: ["Lost Time Incident", "Lost Time Injury", "LTI"] },
  { key: "rwc", label: "RWC", title: "Restricted Work Case", img: icon("rwc"), match: ["Restricted Work Case", "RWC"] },
  { key: "mtc", label: "MTC", title: "Medical Treatment Case", img: icon("mtc"), match: ["Medical Treatment Case", "MTC"] },
  { key: "fac", label: "FAC", title: "First Aid Case", img: icon("fac"), match: ["First Aid Case", "FAC"] },
  { key: "noi", label: "NOI", title: "Non-Occupational Illness", img: icon("noi"), match: ["Non-Occupational Illness", "NOI"] },
  { key: "lsr", label: "LSR", title: "LSR Violation", img: icon("lsr"), match: ["LSR Violation", "LSR"] },
  { key: "nm", label: "SNM/NM", title: "Significant Near Miss / Near Miss", img: icon("nm"), match: ["Significant Near Miss", "Near Miss", "SNM", "NM"] },
  { key: "pd", label: "PD", title: "Property Damage", img: icon("pd"), match: ["Property Damage", "PD"] },
  { key: "fire", label: "Fire", title: "Fire", img: icon("fire"), match: ["Fire", "Fire Incident"] },
  { key: "env", label: "Environmental", title: "Environmental", img: icon("env"), match: ["Environmental", "Environmental Incident"] },
  { key: "rta", label: "RTA", title: "Road Traffic Accident", img: icon("rta"), match: ["Road Traffic Accident", "RTA"] },
];

/**
 * Severity isn't stored on FICC records, so it is derived from the
 * incident type. Adjust these lists if the HSE team grades differently.
 */
const SEVERITY_LEVELS = [
  {
    name: "Critical",
    color: "#ef4444",
    match: ["Fatality", "Lost Time Incident", "Lost Time Injury", "LTI", "Dangerous Occurrence", "Fire", "Fire Incident"],
  },
  {
    name: "High",
    color: "#f97316",
    match: [
      "Restricted Work Case",
      "Medical Treatment Case",
      "Recordable Injury",
      "Road Traffic Accident",
      "Significant Near Miss",
      "Environmental",
      "Environmental Incident",
    ],
  },
  { name: "Moderate", color: "#facc15", match: [] as string[] }, // everything else
];

const TEAM_COLORS: Record<string, string> = {
  "First Fix": ORANGE,
  "Not specified": "#cbd5e1",
  Subcontractor: "#3f4656",
};

const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();

function matches(incident: Incident, list: string[]) {
  const values = [norm(incident.incidentCategory), norm(incident.classification)];
  return list.some((m) => values.includes(m.toLowerCase()));
}

function severityOf(incident: Incident) {
  for (const level of SEVERITY_LEVELS) {
    if (level.match.length && matches(incident, level.match)) return level.name;
  }
  return "Moderate";
}

function teamOf(incident: Incident) {
  const team = (incident.team ?? "").trim();
  if (team) {
    if (/first\s*fix/i.test(team)) return "First Fix";
    if (/sub/i.test(team)) return "Subcontractor";
    return team;
  }
  if ((incident.subcontractorName ?? "").trim()) return "Subcontractor";
  return "Not specified";
}

function countBy(items: Incident[], key: (i: Incident) => string) {
  const map = new Map<string, number>();
  for (const i of items) {
    const k = key(i).trim();
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

const dateOf = (i: Incident) => {
  const d = i.incidentDate ? new Date(i.incidentDate) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

/** Running total at 12 even steps between start and end (undated records count from the start).
 *  If nothing is dated but there are records, a gentle climb to the total. */
function runningSeries(times: (number | undefined)[], total: number, start: number, end: number) {
  const span = Math.max(1, end - start);
  const series = Array.from({ length: 12 }, (_, k) => {
    const cut = start + ((k + 1) / 12) * span;
    return times.filter((t) => t === undefined || t <= cut).length;
  });
  if (total > 0 && series.every((v) => v === series[0])) return series.map((_, k) => Math.round((total * (k + 1)) / 12 * 10) / 10);
  return series;
}

// ---------------------------------------------------------------------------

function IncidentsOverview() {
  const { incidents, isLoading } = useIncidents();

  // The whole page is dark, like Injury and PMV: paint the app's content area black while here.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.background;
    main.style.background = "#0a0a0c";
    return () => {
      main.style.background = prev;
    };
  }, []);

  const data = useMemo(() => {
    // Small trend line per card: running total over the whole record span, 12 steps,
    // so every card with incidents shows its line climbing.
    const times = incidents.map((i) => dateOf(i)?.getTime()).filter((t): t is number => t !== undefined);
    const end = Date.now();
    const start = times.length ? Math.min(...times) : end;
    const cards = CARDS.map((c) => {
      const rows = incidents.filter((i) => matches(i, c.match));
      return { ...c, value: rows.length, series: runningSeries(rows.map((i) => dateOf(i)?.getTime()), rows.length, start, end) };
    });
    const perProject = countBy(incidents, (i) => i.projectName || "Not specified");
    const severity = SEVERITY_LEVELS.map((l) => ({
      name: l.name,
      value: incidents.filter((i) => severityOf(i) === l.name).length,
      color: l.color,
    }));
    const perType = countBy(incidents, (i) => i.incidentCategory || "Not specified");
    const team = countBy(incidents, teamOf).map((s) => ({ ...s, color: TEAM_COLORS[s.name] ?? "#94a3b8" }));
    return { cards, perProject, severity, perType, team };
  }, [incidents]);

  const total = incidents.length;

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 min-h-[calc(100vh-4rem)] overflow-hidden p-4 text-white sm:-mx-6 sm:p-6 lg:-mx-8`}
      style={{
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(243,111,36,0.10), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(243,111,36,0.08), transparent 60%), #0a0a0c",
      }}
    >
      {/* ---- Header (same as PMV): title on the left, project filter on the right ---- */}
      <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4">
        <span className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]" style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}>
          Incidents
        </span>
        <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
        <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">HSE Incident Summary at a Glance</h1>
        <div className="ms-auto flex flex-col items-end gap-2.5">
          <ProjectFilter className="!text-white/75" />
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#f36f24] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ---- KPI cards: two rows of six ---- */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
            {data.cards.map((c) => (
              <KpiCard key={c.key} card={c} value={c.value} series={c.series} share={total ? c.value / total : 0} />
            ))}
          </div>

          {/* ---- Per project | Severity ---- */}
          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Incidents Per Project">
              <HorizontalBars rows={data.perProject} />
            </Panel>
            <Panel title="Incident By Severity">
              <Severity rows={data.severity} total={total} />
            </Panel>
          </div>

          {/* ---- Per type | Team ---- */}
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Panel title="Incidents Per Type">
              <HorizontalBars rows={data.perType} />
            </Panel>
            <Panel title="Incident By Team">
              <TeamPie rows={data.team} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="flex min-w-0 flex-col rounded-2xl border border-white/[0.08] p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:p-6"
      style={{ background: PANEL_BG }}
    >
      <h2 className="mb-5 flex items-center gap-3 text-xl font-bold sm:text-2xl">
        <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-[#ff9a4a] to-[#f36f24] shadow-[0_0_10px_rgba(243,111,36,0.8)]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function KpiCard({ card, value, series, share }: { card: CardDef; value: number; series: number[]; share: number }) {
  return (
    <div
      title={card.title}
      className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] px-3 pb-4 pt-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:px-5"
      style={{ background: "linear-gradient(160deg, #1a1a1d 0%, #121214 100%)" }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.img} alt="" className="h-10 w-10 shrink-0 object-contain sm:h-[64px] sm:w-[64px]" />
        <div className="min-w-0">
          <p className="text-[26px] font-extrabold leading-none tabular-nums sm:text-[36px]">{value.toLocaleString("en-US")}</p>
          <p className={`mt-2 whitespace-nowrap font-medium text-white/90 ${card.label.length > 8 ? "text-[12px] sm:text-[15px]" : "text-[14px] sm:text-[17px]"}`}>{card.label}</p>
        </div>
        <Sparkline values={series} className="ms-auto hidden h-10 w-16 min-w-[2.5rem] shrink sm:block" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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
      <path d={d} fill="none" stroke={ORANGE_HI} strokeWidth="2.6" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(243,111,36,0.95))" }} />
    </svg>
  );
}

function Empty() {
  return <div className="flex h-56 items-center justify-center text-sm text-white/50">No FICC records yet</div>;
}

/** "Nice" axis maximum and tick step for the bar charts. */
function niceAxis(max: number) {
  const raw = Math.max(1, max) / 6;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const top = Math.ceil(max / step) * step || step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

const ROW_H = 40; // px per bar row
const VISIBLE_ROWS = 6; // rows shown before the list scrolls (e.g. KSP … ROSEWOOD)

/** Glowing horizontal bars with value labels and a numeric axis; largest first, scrolls after six rows.
 *  Names are never cut: the label column is as wide as the longest name. */
function HorizontalBars({ rows }: { rows: { name: string; value: number }[] }) {
  if (rows.length === 0) return <Empty />;
  const { top, ticks } = niceAxis(rows[0].value * 1.08);
  const pct = (v: number) => `${(v / top) * 100}%`;
  return (
    <div className="overflow-y-auto pe-5" style={{ maxHeight: ROW_H * VISIBLE_ROWS + 28 }}>
      <div className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3">
        {rows.map((r) => (
          <div key={r.name} className="contents">
            <span className="flex items-center justify-end whitespace-nowrap text-end text-[15px] text-white/90 sm:text-[18px]" style={{ height: ROW_H }}>
              {r.name}
            </span>
            <div className="relative flex items-center border-s border-white/30" style={{ height: ROW_H }}>
              {/* Vertical gridlines */}
              {ticks.slice(1).map((tk) => (
                <span key={tk} className="pointer-events-none absolute inset-y-0 w-px bg-white/[0.07]" style={{ left: pct(tk) }} />
              ))}
              <div
                className="relative h-[22px] rounded-e-[5px]"
                style={{
                  width: pct(r.value),
                  minWidth: 4,
                  background: "linear-gradient(180deg, #ffab52 0%, #ff7a1a 45%, #e8590c 100%)",
                  boxShadow: "0 0 12px rgba(255,122,26,0.55)",
                }}
              />
              <span className="relative ms-2 text-[15px] font-semibold tabular-nums sm:text-[18px]">{r.value.toLocaleString("en-US")}</span>
            </div>
          </div>
        ))}
        {/* Axis: stays pinned under the visible rows while the list scrolls */}
        <span className="sticky bottom-0 h-7" style={{ background: "#141416" }} />
        <div className="sticky bottom-0 h-7 border-t border-white/30" style={{ background: "#141416" }}>
          <div className="relative h-full">
            {ticks.map((tk) => (
              <span key={tk} className="absolute top-1 -translate-x-1/2 text-sm tabular-nums text-white/80" style={{ left: pct(tk) }}>
                {tk.toLocaleString("en-US")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Severity({ rows, total }: { rows: { name: string; value: number; color: string }[]; total: number }) {
  const pct = (v: number) => (total ? (v / total) * 100 : 0);
  // Circle beside the three rows, so this card is no taller than the bars next to it.
  return (
    <div className="flex flex-1 flex-col items-center gap-6 sm:flex-row">
      <div
        className="flex h-44 w-44 shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-[#f36f24] text-center"
        style={{ boxShadow: "0 0 30px rgba(243,111,36,0.6), inset 0 0 26px rgba(243,111,36,0.28)" }}
      >
        <HardHat className="h-8 w-8 text-white/90" strokeWidth={1.4} />
        <span className="mt-1 text-5xl font-extrabold leading-none tabular-nums">{total.toLocaleString("en-US")}</span>
        <span className="mt-1.5 text-base text-white/90">Total Incidents</span>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-4">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="flex items-center gap-3 text-lg font-medium sm:text-xl">
              <span className="h-5 w-5 shrink-0 rounded-md" style={{ background: r.color, boxShadow: `0 0 10px ${r.color}99` }} />
              <span className="flex-1">{r.name}</span>
              <span className="w-14 text-end font-bold tabular-nums">{r.value.toLocaleString("en-US")}</span>
              <span className="w-[4.5rem] text-end font-bold tabular-nums">{pct(r.value).toFixed(1)}%</span>
            </div>
            <div className="mt-2 ps-8">
              <div className="h-4 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(r.value ? 2 : 0, pct(r.value))}%`, background: r.color, boxShadow: `0 0 10px ${r.color}aa` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Full pie with a soft orange glow, percentage labels outside, and a legend with count and share. */
function TeamPie({ rows }: { rows: { name: string; value: number; color: string }[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const [hover, setHover] = useState<string | null>(null);
  if (total === 0) return <Empty />;
  const R = 100;
  let start = -Math.PI / 2 + 0.0001;
  const slices = rows.map((r) => {
    const angle = (r.value / total) * Math.PI * 2;
    const a0 = start;
    const a1 = start + angle;
    start = a1;
    const mid = (a0 + a1) / 2;
    const large = angle > Math.PI ? 1 : 0;
    const p = (a: number, rad = R) => `${(rad * Math.cos(a)).toFixed(2)},${(rad * Math.sin(a)).toFixed(2)}`;
    const d = angle >= Math.PI * 2 - 0.001 ? `M${p(0)} A${R},${R} 0 1 1 ${p(Math.PI)} A${R},${R} 0 1 1 ${p(0)} Z` : `M0,0 L${p(a0)} A${R},${R} 0 ${large} 1 ${p(a1)} Z`;
    return { ...r, d, mid, share: r.value / total };
  });
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row">
      <svg viewBox="-150 -130 300 260" className="w-full max-w-[17rem] overflow-visible">
        <defs>
          <filter id="teamGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <circle r={R + 2} fill="none" stroke={ORANGE} strokeWidth="6" opacity="0.75" filter="url(#teamGlow)" />
        {slices.map((s) => (
          <path
            key={s.name}
            d={s.d}
            fill={s.color}
            stroke="#e9eef5"
            strokeOpacity="0.85"
            strokeWidth="1.5"
            opacity={hover && hover !== s.name ? 0.55 : 1}
            onMouseEnter={() => setHover(s.name)}
            onMouseLeave={() => setHover(null)}
          >
            <title>{`${s.name}: ${s.value.toLocaleString("en-US")} (${(s.share * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
        <circle r={R} fill="none" stroke="#ffb066" strokeWidth="1.5" opacity="0.9" />
        {slices
          .filter((s) => s.share >= 0.06 && s.share < 0.5)
          .map((s) => (
            <text
              key={s.name}
              x={(R + 26) * Math.cos(s.mid)}
              y={(R + 26) * Math.sin(s.mid)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="17"
              fontWeight="500"
            >
              {Math.round(s.share * 100)}%
            </text>
          ))}
      </svg>
      <ul className="w-full max-w-sm space-y-4">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center gap-3 text-lg sm:text-xl" onMouseEnter={() => setHover(s.name)} onMouseLeave={() => setHover(null)}>
            <span className="h-5 w-5 shrink-0 rounded-md" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
            <span className="w-14 text-end font-bold tabular-nums">{s.value.toLocaleString("en-US")}</span>
            <span className="w-16 text-end tabular-nums text-white/85">{(s.share * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
