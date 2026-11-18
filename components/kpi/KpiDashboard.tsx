"use client";

/**
 * KPI's → KPI's Dashboard (charts part):
 *  - the four headline cards (safe manhours, training hours, days since LTI / MTC-RWC),
 *  - Average Manpower and Safe Work Hours per project in one horizontal chart
 *    (biggest first, ~8 projects in view, the rest by scrolling),
 *  - Leading and Lagging indicators per month, each with its numbers below.
 * Worked out from the weekly KPI records (project-filtered).
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
import { CalendarDays, Clock3, GraduationCap, ShieldCheck } from "lucide-react";
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
const BLUE = "#3b9cf0";
/** Small (non-zero) values still get a visible bar. */
const MIN_BAR = (v: number | undefined | null) => (Number(v) > 0 ? 5 : 0);
/** Rows of the manpower / safe hours chart, and how many show before scrolling. */
const PROJECT_ROW = 46;
const PROJECTS_IN_VIEW = 8;

const LEADING: { key: WeeklyKpiNumericField; label: string }[] = [
  { key: "hseMeetings", label: "HSE Meetings" },
  { key: "hseToolBoxTalk", label: "HSE Tool Box Talk" },
  { key: "hseInspection", label: "HSE Inspection / Site Walkthrough" },
  { key: "seniorLeaderTeam", label: "SLT Walkthrough" },
  { key: "hseAuditsInternal", label: "HSE Audits" },
  { key: "hseAwardsRecognition", label: "HSE Awards & Recognitions" },
  { key: "hseInitiatives", label: "HSE Initiatives / Campaigns" },
  { key: "emergencyDrill", label: "Emergency Drill" },
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

export interface KpiHeadline {
  totalSafeWorkHours: number;
  safeHoursAsOf: string | null;
  totalTrainingHours: number;
  daysSinceLti: number | null;
  daysSinceMtcRwc: number | null;
}

export default function KpiDashboard({ records, headline }: { records: WeeklyKpiRecord[]; headline: KpiHeadline }) {
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
    }))
      .filter((p) => p.manpower > 0 || p.swh > 0)
      // Biggest first (by safe work hours, then manpower).
      .sort((a, b) => b.swh - a.swh || b.manpower - a.manpower);

    // Per month totals of every field, for the latest few months.
    const months = Array.from(new Set(records.map((r) => monthKey(r.date)))).sort().slice(-MONTHS_SHOWN);
    const sum = (m: string, key: WeeklyKpiNumericField) =>
      records.reduce((s, r) => (monthKey(r.date) === m ? s + n(r[key]) : s), 0);
    const leading = LEADING.map((f) => ({ name: f.label, ...Object.fromEntries(months.map((m) => [m, sum(m, f.key)])) }));
    const lagging = months.map((m) => ({ name: monthLabel(m), ...Object.fromEntries(LAGGING.map((f) => [f.key, sum(m, f.key)])) }));
    return { projects, months, leading, lagging, sum };
  }, [records]);

  const days = (v: number | null) => (v === null ? "—" : v);

  return (
    <div className="mb-5">
      {/* Headline cards, same as the other dashboards. */}
      <SummaryCards
        dark
        cards={[
          { label: "Total Safe Manhours", value: headline.totalSafeWorkHours, icon: Clock3, color: ORANGE },
          { label: "Total Training Hours", value: headline.totalTrainingHours, icon: GraduationCap, color: ORANGE },
          { label: "Days Since Last LTI", value: days(headline.daysSinceLti), icon: CalendarDays, color: ORANGE },
          { label: "Days Since Last MTC / RWC", value: days(headline.daysSinceMtcRwc), icon: ShieldCheck, color: ORANGE },
        ]}
      />

      {!records.length ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] py-14 text-center text-sm text-white/60">
          No KPI data for this selection yet.
        </div>
      ) : (
        <div className="space-y-5">
          {/* ---- Average Manpower + Safe Work Hours per project, full width ---- */}
          <KpiPanel title="Average Manpower & Safe Work Hours" subtitle="Per Project · biggest first">
            <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ORANGE }} /> Average Manpower
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BLUE }} /> Safe Work Hours
              </span>
            </div>
            {/* About 8 projects in view; scroll (mouse wheel) for the rest. */}
            <div className="overflow-y-auto pe-1" style={{ maxHeight: PROJECTS_IN_VIEW * PROJECT_ROW + 12 }}>
              <div style={{ height: data.projects.length * PROJECT_ROW + 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.projects} layout="vertical" margin={{ top: 6, right: 90, left: 0, bottom: 6 }} barGap={3} barCategoryGap={8}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    {/* Each measure on its own scale, so both bars read well side by side. */}
                    <XAxis xAxisId="mp" type="number" hide domain={[0, "dataMax"]} />
                    <XAxis xAxisId="swh" type="number" hide domain={[0, "dataMax"]} />
                    <YAxis type="category" dataKey="name" tick={TICK} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} width={130} interval={0} />
                    <Tooltip
                      {...TOOLTIP}
                      formatter={(v, key) => [fmt(Number(v)), key === "manpower" ? "Average manpower" : "Safe work hours"]}
                    />
                    <Bar xAxisId="mp" dataKey="manpower" fill={ORANGE} style={BAR_STYLE} radius={[0, 4, 4, 0]} barSize={13} minPointSize={MIN_BAR} isAnimationActive={false}>
                      <LabelList dataKey="manpower" position="right" fontSize={11} fontWeight={600} fill={LABEL_FILL} formatter={(v: unknown) => fmt(Number(v))} />
                    </Bar>
                    <Bar xAxisId="swh" dataKey="swh" fill={BLUE} style={{ filter: "drop-shadow(0 0 6px rgba(59,156,240,0.45))" }} radius={[0, 4, 4, 0]} barSize={13} minPointSize={MIN_BAR} isAnimationActive={false}>
                      <LabelList dataKey="swh" position="right" fontSize={11} fontWeight={600} fill={LABEL_FILL} formatter={(v: unknown) => fmt(Number(v))} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </KpiPanel>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* ---- Leading indicators: each indicator, one bar per month ---- */}
            <KpiPanel title="Leading Indicators" subtitle="Per Month">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leading} margin={{ top: 22, right: 6, left: 0, bottom: 4 }} barGap={1}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="name" tick={{ ...TICK, fontSize: 10 }} angle={-35} textAnchor="end" height={92} interval={0} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)} />
                    <YAxis tick={TICK_MUTED} axisLine={false} tickLine={false} width={44} tickFormatter={fmt} />
                    <Tooltip {...TOOLTIP} formatter={(v, name) => [fmt(Number(v)), monthLabel(String(name))]} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#e4e4e7", paddingTop: 4 }} formatter={(v: string) => monthLabel(v)} />
                    {data.months.map((m, i) => (
                      <Bar key={m} dataKey={m} fill={MONTH_COLORS[i % MONTH_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={16} minPointSize={MIN_BAR} isAnimationActive={false}>
                        <LabelList dataKey={m} position="top" fontSize={9} fill={LABEL_FILL} formatter={(v: unknown) => (Number(v) > 0 ? fmt(Number(v)) : "")} />
                      </Bar>
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
            <KpiPanel title="Lagging Indicators" subtitle="Incidents Per Month">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.lagging} margin={{ top: 22, right: 6, left: 0, bottom: 4 }} barGap={1}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="name" tick={TICK} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} />
                    <YAxis tick={TICK_MUTED} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                    <Tooltip {...TOOLTIP} formatter={(v, key) => [fmt(Number(v)), LAGGING.find((f) => f.key === key)?.label ?? String(key)]} />
                    {LAGGING.map((f) => (
                      <Bar key={f.key} dataKey={f.key} fill={f.color} radius={[3, 3, 0, 0]} maxBarSize={18} minPointSize={MIN_BAR} isAnimationActive={false}>
                        <LabelList dataKey={f.key} position="top" fontSize={10} fill={LABEL_FILL} />
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
      )}
    </div>
  );
}

export function KpiPanel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
