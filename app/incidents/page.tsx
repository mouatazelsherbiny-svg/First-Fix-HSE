"use client";

import { useMemo } from "react";
import {
  Ambulance,
  Bandage,
  BriefcaseMedical,
  CarFront,
  Flame,
  Leaf,
  OctagonAlert,
  ShieldX,
  Skull,
  Thermometer,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import type { Incident } from "@/types/incident";

export default function IncidentsPage() {
  return (
    <ProtectedRoute>
      <IncidentsOverview />
    </ProtectedRoute>
  );
}

// ---------------------------------------------------------------------------
// Everything on this page is counted live from the FICC records (the
// `incidents` table), one row per reported incident. A record counts toward
// a card when either its Incident Category or its Classification matches.
// ---------------------------------------------------------------------------

const ACCENT = "rgb(var(--brand-orange-rgb))";

interface CardDef {
  key: string;
  label: string;
  title: string;
  icon: LucideIcon;
  color: string;
  match: string[];
}

const CARDS: CardDef[] = [
  { key: "fatality", label: "Fatality", title: "Fatality", icon: Skull, color: "#7f1d1d", match: ["Fatality"] },
  { key: "lti", label: "LTI", title: "Lost Time Injury", icon: ShieldX, color: "#dc2626", match: ["Lost Time Incident", "Lost Time Injury", "LTI"] },
  { key: "rwc", label: "RWC", title: "Restricted Work Case", icon: BriefcaseMedical, color: "#ea580c", match: ["Restricted Work Case", "RWC"] },
  { key: "mtc", label: "MTC", title: "Medical Treatment Case", icon: Ambulance, color: "#f59e0b", match: ["Medical Treatment Case", "MTC"] },
  { key: "fac", label: "FAC", title: "First Aid Case", icon: Bandage, color: "#16a34a", match: ["First Aid Case", "FAC"] },
  { key: "noi", label: "NOI", title: "Non-Occupational Illness", icon: Thermometer, color: "#0891b2", match: ["Non-Occupational Illness", "NOI"] },
  { key: "lsr", label: "LSR", title: "LSR Violation", icon: OctagonAlert, color: "#b91c1c", match: ["LSR Violation", "LSR"] },
  { key: "nm", label: "SNM/NM", title: "Significant Near Miss / Near Miss", icon: TriangleAlert, color: "#d97706", match: ["Significant Near Miss", "Near Miss", "SNM", "NM"] },
  { key: "pd", label: "PD", title: "Property Damage", icon: Wrench, color: "#475569", match: ["Property Damage", "PD"] },
  { key: "fire", label: "Fire", title: "Fire", icon: Flame, color: "#ef4444", match: ["Fire", "Fire Incident"] },
  { key: "env", label: "Environmental", title: "Environmental", icon: Leaf, color: "#15803d", match: ["Environmental", "Environmental Incident"] },
  { key: "rta", label: "RTA", title: "Road Traffic Accident", icon: CarFront, color: "#2563eb", match: ["Road Traffic Accident", "RTA"] },
];

/**
 * Severity isn't stored on FICC records, so it is derived from the
 * incident type. Adjust these lists if the HSE team grades differently.
 */
const SEVERITY_LEVELS = [
  {
    name: "Critical",
    color: "#b91c1c",
    match: ["Fatality", "Lost Time Incident", "Lost Time Injury", "LTI", "Dangerous Occurrence", "Fire", "Fire Incident"],
  },
  {
    name: "High",
    color: "#ea580c",
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
  { name: "Moderate", color: "#eab308", match: [] as string[] }, // everything else
];

const TEAM_COLORS: Record<string, string> = {
  "First Fix": ACCENT,
  Subcontractor: "#475569",
  "Not specified": "#cbd5e1",
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

// ---------------------------------------------------------------------------

function IncidentsOverview() {
  const { t } = useLanguage();
  const { incidents, isLoading } = useIncidents();

  const data = useMemo(() => {
    const cards = CARDS.map((c) => ({ ...c, value: incidents.filter((i) => matches(i, c.match)).length }));
    const perProject = countBy(incidents, (i) => i.projectName || "Not specified");
    const perType = countBy(incidents, (i) => i.incidentCategory || "Not specified");
    const severity = SEVERITY_LEVELS.map((l) => ({
      name: l.name,
      value: incidents.filter((i) => severityOf(i) === l.name).length,
      color: l.color,
    })).filter((s) => s.value > 0);
    const team = countBy(incidents, teamOf).map((s) => ({
      ...s,
      color: TEAM_COLORS[s.name] ?? "#94a3b8",
    }));
    return { cards, perProject, perType, severity, team };
  }, [incidents]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.nav.incidents}</h1>
        <p className="mt-1 text-sm text-brand-gray">
          Live totals pulled from FICC records · {incidents.length.toLocaleString("en-US")} incidents
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-brand-border bg-brand-surface py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Compact KPI cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {data.cards.map((c) => (
              <div
                key={c.key}
                title={c.title}
                className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-surface px-3 py-3 shadow-card"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${c.color}1a`, color: c.color }}
                >
                  <c.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold leading-none text-brand-black tabular-nums">
                    {c.value.toLocaleString("en-US")}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-brand-grayDark">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts 2 x 2 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Incidents Per Project">
              <HorizontalBars rows={data.perProject} />
            </ChartCard>
            <ChartCard title="Incident By Severity">
              <FullPie rows={data.severity} />
            </ChartCard>
            <ChartCard title="Incidents Per Type">
              <HorizontalBars rows={data.perType} />
            </ChartCard>
            <ChartCard title="Incident By Team">
              <FullPie rows={data.team} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card">
      <h2 className="mb-3 text-base font-bold text-brand-black">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return (
    <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-gray">
      No FICC records yet
    </div>
  );
}

/** Horizontal bars, largest first. Scrolls inside the card when there are many rows. */
function HorizontalBars({ rows }: { rows: { name: string; value: number }[] }) {
  if (rows.length === 0) return <Empty />;
  const height = Math.max(220, rows.length * 30);
  return (
    <div className="max-h-80 overflow-y-auto pe-1">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={6}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={175}
              tick={{ fontSize: 12, fill: "#334155" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(v: string) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.12)" }}
              formatter={(v) => [Number(v).toLocaleString("en-US"), "Incidents"]}
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
            />
            <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>
              <LabelList dataKey="value" position="right" fontSize={11} fill="#334155" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Full (non-donut) pie with a legend showing count and share. */
function FullPie({ rows }: { rows: { name: string; value: number; color: string }[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total === 0) return <Empty />;
  const pct = (v: number) => `${((v / total) * 100).toFixed(1)}%`;
  return (
    <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              outerRadius="90%"
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={false}
              label={({ percent }) => ((percent ?? 0) >= 0.06 ? `${((percent ?? 0) * 100).toFixed(0)}%` : "")}
              labelLine={false}
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, n) => [`${Number(v).toLocaleString("en-US")} (${pct(Number(v))})`, String(n)]}
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 sm:w-1/2">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: r.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-brand-black">{r.name}</span>
            <span className="tabular-nums text-brand-black">{r.value.toLocaleString("en-US")}</span>
            <span className="w-14 text-end text-xs tabular-nums text-brand-gray">{pct(r.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
