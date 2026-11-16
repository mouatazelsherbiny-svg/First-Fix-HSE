"use client";

/**
 * Reports → KPI Data: the four KPI charts from the monthly KPI report —
 * Average Manpower and Safe Work Hours by project, then Leading and Lagging
 * indicators by month (each with its numbers in a table under the chart).
 * Everything is worked out from the weekly KPI records (project-filtered).
 */

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock3, HardHat, TrendingDown, TrendingUp } from "lucide-react";
import SummaryCards from "@/components/SummaryCards";
import { CHART_TITLE, DarkPanel, TH_ROW, TR } from "@/components/charts/InjuryStyle";
import type { WeeklyKpiNumericField, WeeklyKpiRecord } from "@/types/weeklyKpi";

const GRID = "rgba(255,255,255,0.08)";
const TICK = { fontSize: 11, fill: "#d4d4d8" };
const TICK_MUTED = { fontSize: 11, fill: "#a1a1aa" };
const LABEL_FILL = "#e4e4e7";
const TOOLTIP = {
  contentStyle: { background: "#18181b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12, color: "#fff" },
  labelStyle: { color: "#fff", fontWeight: 600 },
  itemStyle: { color: "#e4e4e7" },
  cursor: { fill: "rgba(255,255,255,0.06)" },
};
const ORANGE = "#f36f24";
const BAR_STYLE = { filter: "drop-shadow(0 0 6px rgba(243,111,36,0.45))" };

const LEADING: { key: WeeklyKpiNumericField; label: string }[] = [
  { key: "hseMeetings", label: "HSE Meetings" },
  { key: "hseToolBoxTalk", label: "HSE Tool Box Talk" },
  { key: "hseInspection", label: "HSE Inspection / Site Walkthrough" },
  { key: "seniorLeaderTeam", label: "SLT Walkthrough" },
  { key: "hseAuditsInternal", label: "HSE Audits" },
  { key: "hseAwardsRecognition", label: "HSE Awards & Recognitions" },
  { key: "hseInitiatives", label: "HSE Initiatives / Campaigns" },
  { key: "emergencyDrill", label: "Emergency Drill" },
  { key: "nearMisses", label: "Near Misses (NMs)" },
  { key: "lifeSavingRules", label: "LSR Violations" },
];

const LAGGING: { key: WeeklyKpiNumericField; label: string; color: string }[] = [
  { key: "nearMisses", label: "Near Misses (NMs)", color: "#4caf6a" },
  { key: "lifeSavingRules", label: "LSR Violations", color: "#f5a97f" },
  { key: "fatality", label: "Fatality (FAT)", color: "#ef4444" },
  { key: "lostTimeIncidentRate", label: "Lost Time Incidents (LTI)", color: "#38bdf8" },
  { key: "restrictedWorkCases", label: "Restricted Work Cases (RWC)", color: "#7dd3fc" },
  { key: "medicalTreatmentCases", label: "Medical Treatment Cases (MTC)", color: "#86efac" },
  { key: "firstAidCases", label: "First Aid Cases (FAC)", color: "#f97316" },
  { key: "propertyDamage", label: "Property Damage", color: "#bef264" },
];

/** One colour per month (oldest → newest), as in the KPI report. */
const MONTH_COLORS = ["#ffb03a", "#f36f24", "#60a5fa", "#4ade80", "#c084fc", "#f472b6"];
const MONTHS_SHOWN = 4;

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).replace(" ", "-");
};

export default function KpiDashboard({ records }: { records: WeeklyKpiRecord[] }) {
  const data = useMemo(() => {
    // Per project: average of the weekly average manpower, and the total safe work hours.
    const byProject = new Map<string, { mp: number[]; swh: number }>();
    for (const r of records) {
      const p = byProject.get(r.projectName) ?? { mp: [], swh: 0 };
      if (n(r.averageManpower) > 0) p.mp.push(n(r.averageManpower));
      p.swh += n(r.totalSafeWorkHours);
      byProject.set(r.projectName, p);
    }
    const projects = Array.from(byProject, ([name, p]) => ({
      name,
      manpower: p.mp.length ? Math.round(p.mp.reduce((a, b) => a + b, 0) / p.mp.length) : 0,
      swh: Math.round(p.swh),
    })).sort((a, b) => a.name.localeCompare(b.name));
    const manpowerRows = projects.filter((p) => p.manpower > 0);
    const swhRows = projects.filter((p) => p.swh > 0);

    // Per month totals of every field, for the latest few months.
    const months = Array.from(new Set(records.map((r) => monthKey(r.date)))).sort().slice(-MONTHS_SHOWN);
    const sum = (m: string, key: WeeklyKpiNumericField) =>
      records.reduce((s, r) => (monthKey(r.date) === m ? s + n(r[key]) : s), 0);
    const leading = LEADING.map((f) => ({ name: f.label, ...Object.fromEntries(months.map((m) => [m, sum(m, f.key)])) }));
    const lagging = months.map((m) => ({ name: monthLabel(m), ...Object.fromEntries(LAGGING.map((f) => [f.key, sum(m, f.key)])) }));

    const leadingTotal = months.reduce((t, m) => t + LEADING.reduce((u, f) => u + sum(m, f.key), 0), 0);
    const laggingTotal = months.reduce((t, m) => t + LAGGING.reduce((u, f) => u + sum(m, f.key), 0), 0);
    return {
      leadingTotal,
      laggingTotal,
      manpowerRows,
      swhRows,
      totalManpower: manpowerRows.reduce((s, p) => s + p.manpower, 0),
      totalSwh: swhRows.reduce((s, p) => s + p.swh, 0),
      months,
      leading,
      lagging,
      sum,
    };
  }, [records]);

  if (!records.length) {
    return (
      <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] py-14 text-center text-sm text-white/60">
        No KPI data for this selection yet.
      </div>
    );
  }

  return (
    <div className="mb-5">
      {/* KPI cards, same as the other dashboards. */}
      <SummaryCards
        dark
        cards={[
          { label: "Average Manpower", value: data.totalManpower, icon: HardHat, color: ORANGE },
          { label: "Safe Work Hours", value: data.totalSwh, icon: Clock3, color: ORANGE },
          { label: `Leading Indicators (${data.months.length} mo.)`, value: data.leadingTotal, icon: TrendingUp, color: ORANGE },
          { label: `Lagging Indicators (${data.months.length} mo.)`, value: data.laggingTotal, icon: TrendingDown, color: ORANGE },
        ]}
      />
    <div className="grid gap-5 xl:grid-cols-2">
      {/* ---- Average Manpower by project ---- */}
      <KpiPanel title="Average Manpower" subtitle="By Project">
        <div style={{ height: Math.max(260, data.manpowerRows.length * 26 + 50) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.manpowerRows} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={TICK_MUTED} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={TICK} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} width={118} interval={0} />
              <Tooltip {...TOOLTIP} formatter={(v) => [fmt(Number(v)), "Average manpower"]} />
              <Bar dataKey="manpower" fill={ORANGE} style={BAR_STYLE} radius={[0, 4, 4, 0]} maxBarSize={14} isAnimationActive={false}>
                <LabelList dataKey="manpower" position="right" fontSize={11} fill={LABEL_FILL} formatter={(v: unknown) => fmt(Number(v))} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </KpiPanel>

      {/* ---- Safe Work Hours by project ---- */}
      <KpiPanel title="Safe Work Hours" subtitle="By Project">
        <div style={{ height: Math.max(320, data.manpowerRows.length * 26 + 50) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.swhRows} margin={{ top: 22, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10.5 }} angle={-40} textAnchor="end" height={78} interval={0} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} />
              <YAxis tick={TICK_MUTED} axisLine={false} tickLine={false} width={64} tickFormatter={(v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : String(v))} />
              <Tooltip {...TOOLTIP} formatter={(v) => [fmt(Number(v)), "Safe work hours"]} />
              <Bar dataKey="swh" fill={ORANGE} style={BAR_STYLE} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false}>
                <LabelList dataKey="swh" position="top" fontSize={9.5} fill={LABEL_FILL} formatter={(v: unknown) => fmt(Number(v))} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </KpiPanel>

      {/* ---- Leading indicators: each indicator, one bar per month ---- */}
      <KpiPanel title="Leading Indicators" subtitle="By Month">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.leading} margin={{ top: 18, right: 6, left: 0, bottom: 4 }} barGap={1}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10 }} angle={-35} textAnchor="end" height={92} interval={0} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)} />
              <YAxis tick={TICK_MUTED} axisLine={false} tickLine={false} width={44} tickFormatter={fmt} />
              <Tooltip {...TOOLTIP} formatter={(v, name) => [fmt(Number(v)), monthLabel(String(name))]} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#e4e4e7", paddingTop: 4 }} formatter={(v: string) => monthLabel(v)} />
              {data.months.map((m, i) => (
                <Bar key={m} dataKey={m} fill={MONTH_COLORS[i % MONTH_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={14} isAnimationActive={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <KpiTable
          head={["Month", ...LEADING.map((f) => f.label)]}
          rows={data.months.map((m, i) => ({
            key: m,
            swatch: MONTH_COLORS[i % MONTH_COLORS.length],
            label: monthLabel(m),
            cells: LEADING.map((f) => data.sum(m, f.key)),
          }))}
        />
      </KpiPanel>

      {/* ---- Lagging indicators: each month, one bar per incident type ---- */}
      <KpiPanel title="Lagging Indicators" subtitle="Incidents by Month">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.lagging} margin={{ top: 18, right: 6, left: 0, bottom: 4 }} barGap={1}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={TICK} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} />
              <YAxis tick={TICK_MUTED} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
              <Tooltip {...TOOLTIP} formatter={(v, key) => [fmt(Number(v)), LAGGING.find((f) => f.key === key)?.label ?? String(key)]} />
              {LAGGING.map((f) => (
                <Bar key={f.key} dataKey={f.key} fill={f.color} radius={[3, 3, 0, 0]} maxBarSize={16} isAnimationActive={false}>
                  <LabelList dataKey={f.key} position="top" fontSize={9.5} fill={LABEL_FILL} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <KpiTable
          head={["", ...data.months.map(monthLabel)]}
          rows={LAGGING.map((f) => ({
            key: f.key,
            swatch: f.color,
            label: f.label,
            cells: data.months.map((m) => data.sum(m, f.key)),
          }))}
        />
      </KpiPanel>
    </div>
    </div>
  );
}

function KpiPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <DarkPanel>
      <h2 className={CHART_TITLE}>{title}</h2>
      {subtitle && <p className="mb-3 mt-0.5 text-xs text-white/55">{subtitle}</p>}
      {children}
    </DarkPanel>
  );
}

function KpiTable({
  head,
  rows,
}: {
  head: string[];
  rows: { key: string; swatch: string; label: string; cells: number[] }[];
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className={TH_ROW}>
            {head.map((h, i) => (
              <th key={i} className={`px-2.5 py-2.5 ${i === 0 ? "rounded-s-lg text-start" : "min-w-[64px] text-center"} ${i === head.length - 1 ? "rounded-e-lg" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={TR}>
              <td className="whitespace-nowrap px-2.5 py-1.5 font-medium text-white/90">
                <span className="me-2 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: r.swatch }} />
                {r.label}
              </td>
              {r.cells.map((c, i) => (
                <td key={i} className="px-2.5 py-1.5 text-center tabular-nums text-white/85">
                  {fmt(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
