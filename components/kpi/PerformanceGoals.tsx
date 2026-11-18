"use client";

/**
 * KPI → Performance Goals.
 *
 * Two tables built from the KPI records (weekly entries + weeks totalled
 * from Reports → Daily), already narrowed by the app-wide project filter:
 *  - Lagging: rates per 1,000,000 manhours, previous full year vs the
 *    selected year so far.
 *  - Leading: counts, Q4 of the previous year vs the selected year so far.
 * Targets are not set yet — fill LAGGING_TARGETS when they are provided.
 */

import { useMemo, useState } from "react";
import { CHART_TITLE, DarkPanel, TH_ROW, TR } from "@/components/charts/InjuryStyle";
import type { WeeklyKpiNumericField, WeeklyKpiRecord } from "@/types/weeklyKpi";

const RATE_BASE = 1_000_000;

type Better = "down" | "up";

interface LaggingRow {
  label: string;
  fields: WeeklyKpiNumericField[];
  /** false = plain count (Fatal Events), true = rate per RATE_BASE manhours. */
  rate: boolean;
  better: Better;
}

const LAGGING_ROWS: LaggingRow[] = [
  { label: "Fatal Events", fields: ["fatality"], rate: false, better: "down" },
  { label: "Lost Time Incidents (LTI)", fields: ["lostTimeIncidentRate"], rate: true, better: "down" },
  {
    label: "Recordable Injury Rate",
    fields: ["fatality", "lostTimeIncidentRate", "restrictedWorkCases", "medicalTreatmentCases"],
    rate: true,
    better: "down",
  },
  { label: "First Aid Rate", fields: ["firstAidCases"], rate: true, better: "down" },
  { label: "Near Miss Reporting", fields: ["nearMisses"], rate: true, better: "up" },
  { label: "Life Saving Rule Rate", fields: ["lifeSavingRules"], rate: true, better: "up" },
  { label: "Property Damage Rate", fields: ["propertyDamage"], rate: true, better: "down" },
  { label: "Environmental Spill Rate", fields: ["environmentalIncident"], rate: true, better: "down" },
];

/** Target text per lagging row label (e.g. "↓ 10% (0.122)"). Empty until targets are provided. */
const LAGGING_TARGETS: Record<string, string> = {};

const LEADING_ROWS: { label: string; hint?: string; field: WeeklyKpiNumericField }[] = [
  { label: "HSE Training", hint: "(No. of Session)", field: "hseTrainingSession" },
  { label: "HSE Meetings", field: "hseMeetings" },
  { label: "HSE Toolbox Talk", hint: "(No. of Session)", field: "hseToolBoxTalk" },
  { label: "HSE Inspection / Site Walkthrough", field: "hseInspection" },
  { label: "Senior Leadership Team (SLT) Walkthrough", field: "seniorLeaderTeam" },
  { label: "HSE Audits", hint: "(Internal / External)", field: "hseAuditsInternal" },
  { label: "HSE Awards and Recognitions", field: "hseAwardsRecognition" },
  { label: "HSE Initiatives / Campaigns", field: "hseInitiatives" },
  { label: "Emergency Drill", field: "emergencyDrill" },
  { label: "Near Misses (NMs)", field: "nearMisses" },
  { label: "Life Saving Rule", hint: "(LSR Violations)", field: "lifeSavingRules" },
];

const GREEN = "#4ade80";
const RED = "#f87171";

function sum(rows: WeeklyKpiRecord[], fields: WeeklyKpiNumericField[]) {
  return rows.reduce((s, r) => s + fields.reduce((a, f) => a + (Number(r[f]) || 0), 0), 0);
}

const fmt3 = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const fmt0 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function PerformanceGoals({ records }: { records: WeeklyKpiRecord[] }) {
  const years = useMemo(() => {
    const ys = new Set<number>([new Date().getFullYear()]);
    records.forEach((r) => r.date && ys.add(Number(r.date.slice(0, 4))));
    return Array.from(ys).sort((a, b) => b - a);
  }, [records]);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const prev = year - 1;

  const { lagging, leading } = useMemo(() => {
    const yearOf = (r: WeeklyKpiRecord) => Number((r.date ?? "").slice(0, 4));
    const monthOf = (r: WeeklyKpiRecord) => Number((r.date ?? "").slice(5, 7));
    const actual = records.filter((r) => yearOf(r) === year);
    const base = records.filter((r) => yearOf(r) === prev);
    const baseQ4 = base.filter((r) => monthOf(r) >= 10);

    const mhActual = sum(actual, ["totalManhours"]);
    const mhBase = sum(base, ["totalManhours"]);
    const value = (rows: WeeklyKpiRecord[], mh: number, row: LaggingRow) => {
      const n = sum(rows, row.fields);
      if (!row.rate) return n;
      return mh > 0 ? (n * RATE_BASE) / mh : 0;
    };

    return {
      lagging: LAGGING_ROWS.map((row) => {
        const b = value(base, mhBase, row);
        const a = value(actual, mhActual, row);
        const improved = row.better === "down" ? a <= b : a >= b;
        return { ...row, base: b, actual: a, diff: Math.abs(a - b), improved };
      }),
      leading: LEADING_ROWS.map((row) => {
        const b = sum(baseQ4, [row.field]);
        const a = sum(actual, [row.field]);
        return { ...row, base: b, actual: a, diff: a - b };
      }),
    };
  }, [records, year, prev]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-sm text-white/70">Performance Goals · Year</label>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field !w-auto !py-1.5">
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="text-xs text-brand-gray">
          Rates per 1,000,000 manhours · {year} figures are year to date
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Lagging */}
        <Panel title="Performance Goals (Lagging Indicators)">
          <div className="overflow-x-auto rounded-lg border border-white/15">
          <table className="kpi-grid w-full text-sm">
            <thead>
              <tr className={TH_ROW}>
                <Th className="text-start">Performance Subject</Th>
                <Th>{prev}</Th>
                <Th>{year} Actual</Th>
                <Th>Difference</Th>
                <Th>{year} Target</Th>
              </tr>
            </thead>
            <tbody>
              {lagging.map((r) => (
                <tr key={r.label} className={TR}>
                  <td className="px-3 py-3 font-semibold text-white">{r.label}</td>
                  <Td>{r.rate ? fmt3(r.base) : fmt0(r.base)}</Td>
                  <Td>{r.rate ? fmt3(r.actual) : fmt0(r.actual)}</Td>
                  <Td>
                    <span className="font-semibold" style={{ color: r.improved ? GREEN : RED }}>
                      {r.rate ? fmt3(r.diff) : fmt0(r.diff)}
                    </span>
                  </Td>
                  <Td>{LAGGING_TARGETS[r.label] ?? <span className="text-white/40">—</span>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Panel>

        {/* Leading */}
        <Panel title="Performance Goals (Leading Indicators)">
          <div className="overflow-x-auto rounded-lg border border-white/15">
          <table className="kpi-grid w-full text-sm">
            <thead>
              <tr className={TH_ROW}>
                <Th className="text-start">Performance Subject</Th>
                <Th>Q4 {prev}</Th>
                <Th>{year} Actual</Th>
                <Th>Difference</Th>
              </tr>
            </thead>
            <tbody>
              {leading.map((r) => (
                <tr key={r.label} className={TR}>
                  <td className="px-3 py-2.5 text-white">
                    <span className="font-semibold">{r.label}</span>
                    {r.hint && <span className="text-white/55"> {r.hint}</span>}
                  </td>
                  <Td>{fmt0(r.base)}</Td>
                  <Td>{fmt0(r.actual)}</Td>
                  <Td>
                    <span
                      className="font-semibold"
                      style={{ color: r.diff > 0 ? GREEN : r.diff < 0 ? RED : undefined }}
                    >
                      {fmt0(Math.abs(r.diff))}
                      {r.diff > 0 ? " ↑" : r.diff < 0 ? " ↓" : ""}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <DarkPanel>
      <h2 className={`${CHART_TITLE} mb-3`}>{title}</h2>
      <div className="overflow-x-auto rounded-lg">{children}</div>
    </DarkPanel>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`whitespace-nowrap px-3 py-3 text-center text-xs font-semibold first:rounded-s-lg last:rounded-e-lg ${className}`}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-2.5 text-center tabular-nums text-white/85">{children}</td>;
}
