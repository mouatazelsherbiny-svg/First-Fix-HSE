"use client";

/**
 * HSE Performance (every approved user; delete is admin only) — summary of the Weekly Performance Reports, drawn like HSE Audit →
 * Audit Summary: headline cards, performance score per project (H&S and
 * Environmental, latest report per project), the overall score ring, a
 * written summary, then every report with Edit / Word / PDF.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  ChartColumnIncreasing,
  ClipboardList,
  Eye,
  FileDown,
  FileText,
  Gauge,
  Layers,
  Leaf,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import SummaryCards from "@/components/SummaryCards";
import ExportExcelButton from "@/components/ExportExcelButton";
import PageTitle from "@/components/PageTitle";
import { BrandMark } from "@/components/Sidebar";
import { CHART_TITLE, DarkPanel, SEARCH_INPUT, TABLE_TITLE, TD, TH, TH_ROW, TR } from "@/components/charts/InjuryStyle";
import { Bullet, ENV_COLOR, HS_COLOR, MiniScore, ScoreChip, ScoreRing, pct } from "@/components/hseAudit/SummaryWidgets";
import { useProjectScoped } from "@/context/ProjectFilterContext";
import { useAuth } from "@/context/AuthContext";
import { fetchAllRows, supabase } from "@/lib/supabaseClient";
import { ENV_ITEMS, HS_ITEMS, RATING_STYLE, formatDate, itemsFor, type Rating } from "@/lib/hseAudit";
import { PERFORMANCE_LIST_COLUMNS, REPORT_TITLE, mapPerformance, performanceScores, weekLabel, type HsePerformance } from "@/lib/hsePerformance";
import { exportPerformanceWord } from "@/lib/hsePerformanceWord";

export default function HsePerformancePage() {
  return (
    <ProtectedRoute>
      <>
        <PerformanceDashboard />
      </>
    </ProtectedRoute>
  );
}

function RatingPill({ r }: { r: Rating }) {
  if (!r) return <span className="text-white/40">—</span>;
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: RATING_STYLE[r].bg, color: RATING_STYLE[r].fg }}>
      {r}
    </span>
  );
}

function PerformanceDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canEdit = isAdmin || !!user?.canEditPerformance;
  const [reports, setReports] = useState<HsePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchAllRows<any>("hse_performance", (q) => q.select(PERFORMANCE_LIST_COLUMNS).order("assessment_date", { ascending: false }).order("id"))
      .then((r) => active && setReports(r.map(mapPerformance)))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const scoped = useProjectScoped(reports, (r) => r.projectName);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .map((p) => ({ p, s: performanceScores(p) }))
      .filter(({ p }) => (!q ? true : [p.projectName, p.assessedBy, p.hseManager, p.contractor, p.projectDirector, weekLabel(p.assessmentDate)].some((v) => v.toLowerCase().includes(q))));
  }, [scoped, query]);

  // Latest report per project for the chart, best overall first.
  const chart = useMemo(() => {
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      const cur = latest.get(r.p.projectName);
      if (!cur || r.p.assessmentDate > cur.p.assessmentDate) latest.set(r.p.projectName, r);
    }
    return Array.from(latest.values())
      .map((r) => ({ project: r.p.projectName, hs: r.s.hs.pct ?? 0, env: r.s.env.pct ?? 0, overall: r.s.overall ?? 0 }))
      .sort((a, b) => b.overall - a.overall);
  }, [rows]);

  const stats = useMemo(() => {
    const mean = (v: (number | null)[]) => {
      const x = v.filter((n): n is number => n != null);
      return x.length ? x.reduce((s, n) => s + n, 0) / x.length : null;
    };
    const hsAvg = mean(rows.map((r) => r.s.hs.pct));
    const envAvg = mean(rows.map((r) => r.s.env.pct));
    const ratings = rows.flatMap((r) => [r.s.hsRating, r.s.envRating]).filter(Boolean);
    const compliant = ratings.filter((x) => x === "Compliant").length;
    const needs = ratings.filter((x) => x === "Needs Improvement").length;
    const non = ratings.filter((x) => x === "Non-Compliant").length;
    // Key focus areas: the categories with the lowest average score.
    const sums = new Map<string, { t: number; n: number }>();
    for (const { p } of rows) {
      for (const [scores, items] of [
        [p.hsScores, HS_ITEMS],
        [p.envScores, ENV_ITEMS],
      ] as const) {
        for (const i of itemsFor(items, scores)) {
          const v = scores[i];
          if (typeof v === "number") {
            const cur = sums.get(i) ?? { t: 0, n: 0 };
            sums.set(i, { t: cur.t + v, n: cur.n + 1 });
          }
        }
      }
    }
    const focus = Array.from(sums)
      .map(([k, v]) => ({ k, avg: v.t / v.n }))
      .filter((x) => x.avg < 7)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
      .map((x) => x.k);
    const overalls = rows.map((r) => r.s.overall);
    return {
      projects: new Set(rows.map((r) => r.p.projectName)).size,
      reports: rows.length,
      hsAvg,
      envAvg,
      overall: mean(overalls),
      compliant,
      needs: needs + non,
      atTarget: rows.filter((r) => r.s.overall != null && r.s.overall >= r.p.targetPct).length,
      focus,
      asOf: rows.reduce((d, r) => (r.p.assessmentDate > d ? r.p.assessmentDate : d), ""),
    };
  }, [rows]);
  const target = rows[0]?.p.targetPct ?? 70;

  const word = async (id: string) => {
    setBusy(id);
    try {
      const { data } = await supabase.from("hse_performance").select("*").eq("id", id).single();
      if (data) await exportPerformanceWord(mapPerformance(data));
    } finally {
      setBusy("");
    }
  };
  const remove = async (p: HsePerformance) => {
    if (!p.id || !window.confirm(`Delete the HSE Performance report for ${p.projectName}?`)) return;
    await supabase.from("hse_performance").delete().eq("id", p.id);
    setReports((x) => x.filter((y) => y.id !== p.id));
  };

  const exportSheets = [
    {
      name: "Weekly Performance",
      columns: [
        { header: "Week", key: "week" },
        { header: "Date", key: "date" },
        { header: "Project", key: "project" },
        { header: "Contractor", key: "contractor" },
        { header: "HSE Manager", key: "mgr" },
        { header: "Project Director", key: "director" },
        { header: "Auditor / Position", key: "by" },
        { header: "H&S Score", key: "hs" },
        { header: "H&S %", key: "hsPct" },
        { header: "H&S Rating", key: "hsRating" },
        { header: "Env Score", key: "env" },
        { header: "Env %", key: "envPct" },
        { header: "Env Rating", key: "envRating" },
        { header: "Overall %", key: "overall" },
        ...HS_ITEMS.map((i) => ({ header: `H&S: ${i}`, key: `h:${i}` })),
        ...ENV_ITEMS.map((i) => ({ header: `ENV: ${i}`, key: `e:${i}` })),
      ],
      rows: rows.map(({ p, s }) => ({
        week: weekLabel(p.assessmentDate),
        date: formatDate(p.assessmentDate),
        project: p.projectName,
        contractor: p.contractor,
        mgr: p.hseManager,
        director: p.projectDirector,
        by: p.assessedBy,
        hs: s.hs.max ? `${s.hs.total}/${s.hs.max}` : "N/A",
        hsPct: s.hs.pct == null ? "" : Number(s.hs.pct.toFixed(1)),
        hsRating: s.hsRating,
        env: s.env.max ? `${s.env.total}/${s.env.max}` : "N/A",
        envPct: s.env.pct == null ? "" : Number(s.env.pct.toFixed(1)),
        envRating: s.envRating,
        overall: s.overall == null ? "" : Number(s.overall.toFixed(1)),
        ...Object.fromEntries(HS_ITEMS.map((i) => [`h:${i}`, typeof p.hsScores[i] === "number" ? p.hsScores[i] : "N/A"])),
        ...Object.fromEntries(ENV_ITEMS.map((i) => [`e:${i}`, typeof p.envScores[i] === "number" ? p.envScores[i] : "N/A"])),
      })),
    },
  ];

  return (
    <div>
      <PageTitle
        section={
          <span className="flex items-center gap-3">
            <BrandMark size={40} />
            HSE Performance
          </span>
        }
        title="Weekly Performance Summary"
      >
        {stats.asOf && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-[#f36f24]/50 px-3.5 py-2 text-sm font-semibold text-white/90">
            <CalendarDays className="h-4 w-4 text-[#ff8a3d]" />
            As of {formatDate(stats.asOf)}
          </span>
        )}
        <ExportExcelButton filename="Weekly Performance Reports" sheets={exportSheets} disabled={rows.length === 0} />
        <Link href="/hse-performance/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Weekly Report
        </Link>
      </PageTitle>

      <SummaryCards
        dark
        cards={[
          { label: "Projects Assessed", value: stats.projects, icon: ClipboardList, color: "#F36F24" },
          { label: "Avg. Health & Safety", value: pct(stats.hsAvg), icon: ShieldCheck, color: "#F36F24" },
          { label: "Avg. Environmental", value: pct(stats.envAvg), icon: Leaf, color: "#16A34A" },
          { label: "Weekly Reports", value: stats.reports, icon: FileText, color: "#F36F24" },
          { label: "Compliant Ratings", value: stats.compliant, icon: BadgeCheck, color: "#16A34A" },
          { label: "Needs Improvement", value: stats.needs, icon: TriangleAlert, color: "#D97706" },
        ]}
      />

      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* ---- Performance score by project ---- */}
        <DarkPanel>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <h2 className={`${CHART_TITLE} flex items-center gap-2`}>
              <ChartColumnIncreasing className="h-5 w-5 text-[#ff8a3d]" /> Performance Score by Project · latest week
            </h2>
            <div className="ms-auto flex flex-wrap gap-4 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ background: HS_COLOR }} /> Health &amp; Safety (HSE)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ background: ENV_COLOR }} /> Environmental (ENV)
              </span>
            </div>
          </div>
          {loading ? (
            <p className="py-16 text-center text-sm text-white/50">Loading…</p>
          ) : !chart.length ? (
            <p className="py-16 text-center text-sm text-white/50">No reports yet — click New Weekly Report to add the first one.</p>
          ) : (
            <div className="overflow-y-auto pe-1" style={{ maxHeight: 10 * 44 + 40 }}>
              <div style={{ height: chart.length * 44 + 40 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 0 }} barGap={2} barCategoryGap={8}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} />
                    <YAxis type="category" dataKey="project" width={120} interval={0} tick={{ fontSize: 12.5, fill: "#f4f4f5", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v, name) => [`${Number(v).toFixed(1)}%`, name === "hs" ? "Health & Safety" : "Environmental"]} contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12, color: "#fff" }} labelStyle={{ color: "#fff", fontWeight: 600 }} cursor={{ fill: "rgba(255,255,255,0.06)" }} />
                    <ReferenceLine x={target} stroke="#84cc16" strokeDasharray="6 4" strokeOpacity={0.7} />
                    <Bar dataKey="hs" fill={HS_COLOR} radius={[0, 3, 3, 0]} barSize={12} isAnimationActive={false} style={{ filter: "drop-shadow(0 0 6px rgba(243,111,36,0.45))" }}>
                      <LabelList dataKey="hs" position="right" fontSize={10.5} fill="#e4e4e7" formatter={(v: unknown) => `${Number(v).toFixed(1)}%`} />
                    </Bar>
                    <Bar dataKey="env" fill={ENV_COLOR} radius={[0, 3, 3, 0]} barSize={12} isAnimationActive={false} style={{ filter: "drop-shadow(0 0 6px rgba(74,222,128,0.4))" }}>
                      <LabelList dataKey="env" position="right" fontSize={10.5} fontWeight={700} fill="#f4f4f5" formatter={(v: unknown) => `${Number(v).toFixed(1)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </DarkPanel>

        <div className="flex min-w-0 flex-col gap-5">
          {/* ---- Overall score ---- */}
          <DarkPanel>
            <h2 className={`${CHART_TITLE} mb-4 flex items-center gap-2`}>
              <Target className="h-5 w-5 text-[#ff8a3d]" /> Overall Performance Score
            </h2>
            <div className="flex flex-wrap items-center justify-around gap-5">
              <ScoreRing value={stats.overall} />
              <div className="hidden h-28 w-px bg-white/15 sm:block" />
              <div className="flex min-w-[190px] flex-col gap-3">
                <MiniScore icon={ShieldCheck} value={stats.hsAvg} label="Health & Safety" color={HS_COLOR} />
                <MiniScore icon={Leaf} value={stats.envAvg} label="Environmental" color={ENV_COLOR} />
              </div>
            </div>
          </DarkPanel>

          {/* ---- Summary ---- */}
          <DarkPanel className="flex-1">
            <h2 className={`${CHART_TITLE} mb-3 flex items-center gap-2`}>
              <Gauge className="h-5 w-5 text-[#ff8a3d]" /> Summary
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-white/85">
              <Bullet>
                <b>{stats.projects}</b> projects assessed in <b>{stats.reports}</b> reports, overall score <b>{pct(stats.overall)}</b>.
              </Bullet>
              <Bullet>
                Average H&amp;S score: <b>{pct(stats.hsAvg)}</b> &nbsp;|&nbsp; Average Environmental score: <b>{pct(stats.envAvg)}</b>.
              </Bullet>
              <Bullet>
                <b>{stats.atTarget}</b> of {stats.reports} reports at or above the {target}% target ({stats.compliant} compliant, {stats.needs} need improvement).
              </Bullet>
              {stats.focus.length > 0 && <Bullet>Key focus areas: {stats.focus.join(", ")}.</Bullet>}
            </ul>
          </DarkPanel>
        </div>
      </div>

      {/* ---- Reports ---- */}
      <DarkPanel className="mb-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className={`${TABLE_TITLE} flex items-center gap-2`}>
            <Layers className="h-5 w-5 text-[#ff8a3d]" /> {REPORT_TITLE}s
          </h2>
          <label className="relative w-full sm:ms-auto sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search project, contractor, auditor, week…" className={SEARCH_INPUT} />
          </label>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full min-w-[1240px] text-start text-sm">
            <thead>
              <tr className={TH_ROW}>
                <th className={`${TH} rounded-s-lg`}>Project</th>
                <th className={TH}>Week</th>
                <th className={TH}>Contractor</th>
                <th className={TH}>Auditor</th>
                <th className={`${TH} !text-center`}>H&amp;S Score</th>
                <th className={`${TH} !text-center`}>ENV Score</th>
                <th className={`${TH} !text-center`}>Overall</th>
                <th className={`${TH} !text-center`}>H&amp;S Rating</th>
                <th className={`${TH} !text-center`}>ENV Rating</th>
                <th className={`${TH} rounded-e-lg !text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-white/50">
                    No reports yet — click New Weekly Report to add the first one.
                  </td>
                </tr>
              ) : (
                rows.map(({ p, s }) => (
                  <tr key={p.id} onClick={() => router.push(`/hse-performance/${p.id}`)} className={`${TR} cursor-pointer`}>
                    <td className={`${TD} font-bold text-white`}>{p.projectName}</td>
                    <td className={`${TD} whitespace-nowrap text-white/80`}>
                      <span className="font-semibold text-white">{weekLabel(p.assessmentDate)}</span>
                      <span className="block text-xs text-white/50">{formatDate(p.assessmentDate)}</span>
                    </td>
                    <td className={`${TD} text-white/80`}>{p.contractor || "—"}</td>
                    <td className={`${TD} text-white/80`}>{p.assessedBy || "—"}</td>
                    <td className={`${TD} text-center`}>
                      <ScoreChip value={s.hs.pct} tint="rgba(243,111,36,0.22)" />
                    </td>
                    <td className={`${TD} text-center`}>
                      <ScoreChip value={s.env.pct} tint="rgba(34,197,94,0.2)" />
                    </td>
                    <td className={`${TD} text-center`}>
                      <ScoreChip value={s.overall} tint="rgba(255,255,255,0.08)" />
                    </td>
                    <td className={`${TD} text-center`}>
                      <RatingPill r={s.hsRating} />
                    </td>
                    <td className={`${TD} text-center`}>
                      <RatingPill r={s.envRating} />
                    </td>
                    <td className={`${TD} text-center`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/hse-performance/${p.id}`}
                          title={canEdit ? "Edit" : "View"}
                          className="flex h-9 items-center gap-1 rounded-md border border-white/20 bg-white/[0.06] px-2 text-xs font-bold text-white hover:border-[#f36f24]"
                        >
                          {canEdit ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {canEdit ? "Edit" : "View"}
                        </Link>
                        <button
                          type="button"
                          onClick={() => p.id && word(p.id)}
                          title="Download Word"
                          className="flex h-9 items-center gap-1 rounded-md border border-[#2b579a]/70 bg-[#2b579a]/25 px-2 text-xs font-bold text-white hover:bg-[#2b579a]/50"
                        >
                          {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Word
                        </button>
                        <a
                          href={`/hse-performance/${p.id}/print`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Print / save as PDF"
                          className="flex h-9 items-center gap-1 rounded-md border border-red-500/60 bg-red-500/15 px-2 text-xs font-bold text-white hover:bg-red-500/30"
                        >
                          <FileText className="h-4 w-4" /> PDF
                        </a>
                        {isAdmin && (
                          <button type="button" onClick={() => remove(p)} title="Delete" className="flex h-9 w-9 items-center justify-center rounded-md text-white/50 hover:bg-red-500/20 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DarkPanel>
    </div>
  );
}
