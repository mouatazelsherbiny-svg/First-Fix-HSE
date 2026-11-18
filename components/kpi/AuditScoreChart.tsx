"use client";

/**
 * KPI's Dashboard → HSE Audit score per project: the average Health & Safety
 * audit score of each project, best first, against the audit target (70% by
 * default, dashed green line). Below 50% the bar is red. Full width, about 8
 * projects in view and the rest by scrolling.
 */

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { KpiPanel } from "@/components/kpi/KpiDashboard";
import { useProjectScoped } from "@/context/ProjectFilterContext";
import { fetchAllRows } from "@/lib/supabaseClient";
import { AUDIT_LIST_COLUMNS, HS_ITEMS, type HseAudit, mapAudit, scoreOf } from "@/lib/hseAudit";

const ROW = 46;
const IN_VIEW = 8;
const RED_BELOW = 50;

export default function AuditScoreChart() {
  const [audits, setAudits] = useState<HseAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchAllRows<any>("hse_audits", (q) => q.select(AUDIT_LIST_COLUMNS).order("audit_date", { ascending: false }).order("id"))
      .then((rows) => active && setAudits(rows.map((r) => mapAudit(r))))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const scoped = useProjectScoped(audits, (a) => a.projectName);
  const { rows, target } = useMemo(() => {
    const by = new Map<string, number[]>();
    for (const a of scoped) {
      const pct = scoreOf(a.hsScores, HS_ITEMS).pct;
      if (pct == null) continue;
      by.set(a.projectName, [...(by.get(a.projectName) ?? []), pct]);
    }
    const rows = Array.from(by, ([name, v]) => ({ name, pct: Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 100) / 100 })).sort(
      (a, b) => b.pct - a.pct
    );
    return { rows, target: scoped[0]?.targetPct ?? 70 };
  }, [scoped]);

  const max = Math.max(80, Math.ceil(Math.max(target, ...rows.map((r) => r.pct)) / 10) * 10);

  return (
    <KpiPanel title="HSE Audit Score" subtitle={`Per Project · average Health & Safety score · target ${target}%`}>
      {loading ? (
        <p className="py-12 text-center text-sm text-white/50">Loading…</p>
      ) : !rows.length ? (
        <p className="py-12 text-center text-sm text-white/50">No audits for this selection yet.</p>
      ) : (
        <div className="overflow-y-auto pe-1" style={{ maxHeight: IN_VIEW * ROW + 40 }}>
          <div style={{ height: rows.length * ROW + 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, left: 0, bottom: 4 }} barCategoryGap={12}>
                <defs>
                  <linearGradient id="auditGold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#b8860b" />
                    <stop offset="100%" stopColor="#ffd000" />
                  </linearGradient>
                  <linearGradient id="auditRed" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#b80000" />
                    <stop offset="100%" stopColor="#ff1a1a" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis
                  type="number"
                  orientation="top"
                  domain={[0, max]}
                  ticks={Array.from({ length: max / 10 + 1 }, (_, i) => i * 10)}
                  tickFormatter={(v: number) => `${v.toFixed(2)}%`}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#d4d4d8" }} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} width={130} interval={0} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(2)}%`, "H&S audit score"]}
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12, color: "#fff" }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                  cursor={{ fill: "rgba(255,255,255,0.06)" }}
                />
                <ReferenceLine x={target} stroke="#84cc16" strokeDasharray="6 4" strokeWidth={2} />
                <Bar dataKey="pct" radius={[0, 3, 3, 0]} barSize={22} isAnimationActive={false}>
                  {rows.map((r) => (
                    <Cell
                      key={r.name}
                      fill={r.pct < RED_BELOW ? "url(#auditRed)" : "url(#auditGold)"}
                      style={{ filter: `drop-shadow(0 0 6px ${r.pct < RED_BELOW ? "rgba(255,26,26,0.45)" : "rgba(255,208,0,0.35)"})` }}
                    />
                  ))}
                  <LabelList dataKey="pct" position="right" fontSize={11} fontWeight={700} fill="#f4f4f5" formatter={(v: unknown) => `${Number(v).toFixed(2)}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </KpiPanel>
  );
}
