"use client";

/**
 * HSE Audit — Audit Summary: headline cards, audit score per project (H&S and
 * Environmental), the overall score ring, a written summary, every audit with
 * its scores / findings / status and report links, then the open findings.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChartColumnIncreasing,
  CircleCheck,
  ClipboardList,
  Download,
  FileText,
  Layers,
  Leaf,
  Plus,
  Search,
  ShieldCheck,
  Target,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import SummaryCards from "@/components/SummaryCards";
import ExportExcelButton from "@/components/ExportExcelButton";
import { BrandMark } from "@/components/Sidebar";
import { CHART_TITLE, DarkPanel, SEARCH_INPUT, TABLE_TITLE, TD, TH, TH_ROW, TR } from "@/components/charts/InjuryStyle";
import { useLanguage } from "@/context/LanguageContext";
import { useProjectScoped } from "@/context/ProjectFilterContext";
import { fetchAllRows, supabase } from "@/lib/supabaseClient";
import { useProfileNames } from "@/lib/profileNames";
import {
  AUDIT_LIST_COLUMNS,
  AuditFinding,
  ENV_ITEMS,
  HS_ITEMS,
  HseAudit,
  PRIORITIES,
  PRIORITY_STYLE,
  TONE_STYLE,
  formatDate,
  isOverdue,
  ratingOf,
  levelOf,
  mapAudit,
  mapFinding,
  scoreOf,
} from "@/lib/hseAudit";
import PageTitle from "@/components/PageTitle";
import { Bullet, ENV_COLOR, HS_COLOR, MiniScore, ScoreChip, ScoreRing, overallOf, pct } from "@/components/hseAudit/SummaryWidgets";

export default function HseAuditPage() {
  return (
    <ProtectedRoute>
      <HseAuditDashboard />
    </ProtectedRoute>
  );
}

type FindingRow = AuditFinding & { auditId: string };

function HseAuditDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [audits, setAudits] = useState<HseAudit[]>([]);
  const [findings, setFindings] = useState<FindingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const names = useProfileNames();
  const creatorOf = (a: HseAudit) => (a.createdBy ? names.get(a.createdBy) ?? "…" : "—");

  useEffect(() => {
    let active = true;
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchAllRows<any>("hse_audits", (q) => q.select(AUDIT_LIST_COLUMNS).order("audit_date", { ascending: false }).order("id")),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchAllRows<any>("hse_audit_findings", (q) =>
        q.select("id,audit_id,item_no,category,observation,priority,close_out_date,status,closed_on,closure_note,corrective_action,responsible_dept,cap_status,completion_pct").order("id")
      ),
    ])
      .then(([a, f]) => {
        if (!active) return;
        setAudits(a.map((r) => mapAudit(r)));
        setFindings(f.map((r) => ({ ...mapFinding(r), auditId: r.audit_id })));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const scoped = useProjectScoped(audits, (a) => a.projectName);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .map((a) => ({
        audit: a,
        hs: scoreOf(a.hsScores, HS_ITEMS),
        env: scoreOf(a.envScores, ENV_ITEMS),
        findings: findings.filter((f) => f.auditId === a.id),
      }))
      .filter(({ audit }) =>
        !q ? true : [audit.projectName, audit.auditor, audit.hseManager, audit.projectManager].some((v) => v.toLowerCase().includes(q))
      );
  }, [scoped, findings, query]);

  const auditById = useMemo(() => new Map(scoped.map((a) => [a.id!, a])), [scoped]);
  const openFindings = useMemo(
    () =>
      findings
        .filter((f) => f.status === "Open" && auditById.has(f.auditId))
        .sort((x, y) => (x.closeOutDate || "9999").localeCompare(y.closeOutDate || "9999")),
    [findings, auditById]
  );

  const openByAudit = useMemo(() => {
    const groups = new Map<string, FindingRow[]>();
    for (const f of openFindings) groups.set(f.auditId, [...(groups.get(f.auditId) ?? []), f]);
    return Array.from(groups.entries())
      .map(([auditId, fs]) => {
        const audit = auditById.get(auditId)!;
        const byPriority: Record<string, number> = {};
        for (const f of fs) byPriority[f.priority] = (byPriority[f.priority] ?? 0) + 1;
        return {
          audit,
          open: fs.length,
          total: findings.filter((f) => f.auditId === auditId).length,
          overdue: fs.filter((f) => isOverdue(f)).length,
          next: fs.map((f) => f.closeOutDate).filter(Boolean).sort()[0] ?? "",
          byPriority,
          categories: Array.from(new Set(fs.map((f) => f.category).filter(Boolean))),
        };
      })
      .sort((x, y) => y.overdue - x.overdue || (x.next || "9999").localeCompare(y.next || "9999"));
  }, [openFindings, auditById, findings]);

  // Latest audit per project for the chart, best overall first.
  const chart = useMemo(() => {
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      const cur = latest.get(r.audit.projectName);
      if (!cur || r.audit.auditDate > cur.audit.auditDate) latest.set(r.audit.projectName, r);
    }
    return Array.from(latest.values())
      .map((r) => ({ project: r.audit.projectName, hs: r.hs.pct ?? 0, env: r.env.pct ?? 0, overall: overallOf(r.hs.pct, r.env.pct) ?? 0 }))
      .sort((a, b) => b.overall - a.overall);
  }, [rows]);

  // Headline numbers (cards, overall ring, summary).
  const stats = useMemo(() => {
    const mean = (v: (number | null)[]) => {
      const x = v.filter((n): n is number => n != null);
      return x.length ? x.reduce((s, n) => s + n, 0) / x.length : null;
    };
    const hsAvg = mean(rows.map((r) => r.hs.pct));
    const envAvg = mean(rows.map((r) => r.env.pct));
    const allFindings = rows.flatMap((r) => r.findings);
    const open = allFindings.filter((f) => f.status === "Open").length;
    const closed = allFindings.length - open;
    const cats = new Map<string, number>();
    for (const f of allFindings) if (f.status === "Open" && f.category) cats.set(f.category, (cats.get(f.category) ?? 0) + 1);
    const focus = Array.from(cats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    return {
      projects: new Set(rows.map((r) => r.audit.projectName)).size,
      hsAvg,
      envAvg,
      overall: overallOf(hsAvg, envAvg),
      findings: allFindings.length,
      open,
      closed,
      closure: allFindings.length ? (closed / allFindings.length) * 100 : null,
      focus,
      asOf: rows.reduce((d, r) => (r.audit.auditDate > d ? r.audit.auditDate : d), ""),
    };
  }, [rows]);
  const target = rows[0]?.audit.targetPct ?? 70;


  const exportSheets = [
    {
      name: "HSE Audits",
      columns: [
        { header: "Date", key: "date" },
        { header: "Project", key: "project" },
        { header: "Auditor", key: "auditor" },
        { header: "HSE Manager", key: "hseManager" },
        { header: "Created by", key: "createdBy" },
        { header: "H&S Score", key: "hs" },
        { header: "H&S %", key: "hsPct" },
        { header: "H&S Status", key: "hsStatus" },
        { header: "Env Score", key: "env" },
        { header: "Env %", key: "envPct" },
        { header: "Env Status", key: "envStatus" },
        { header: "H&S Rating", key: "hsRating" },
        { header: "Env Rating", key: "envRating" },
        { header: "Findings", key: "findings" },
        { header: "Open Findings", key: "open" },
      ],
      rows: rows.map(({ audit, hs, env, findings: fs }) => ({
        date: formatDate(audit.auditDate),
        project: audit.projectName,
        auditor: audit.auditor,
        hseManager: audit.hseManager,
        createdBy: creatorOf(audit),
        hs: hs.max ? `${hs.total}/${hs.max}` : "N/A",
        hsPct: hs.pct ?? "",
        hsStatus: hs.level?.label ?? "",
        env: env.max ? `${env.total}/${env.max}` : "N/A",
        envPct: env.pct ?? "",
        envStatus: env.level?.label ?? "",
        hsRating: ratingOf(audit.hsRating, hs.pct, audit.targetPct),
        envRating: ratingOf(audit.envRating, env.pct, audit.targetPct),
        findings: fs.length,
        open: fs.filter((f) => f.status === "Open").length,
      })),
    },
    {
      name: "Corrective Action Plan",
      columns: [
        { header: "Project", key: "project" },
        { header: "Audit Date", key: "date" },
        { header: "No", key: "no" },
        { header: "Category", key: "category" },
        { header: "Audit Findings / Observations", key: "observation" },
        { header: "Proposed Corrective Action", key: "action" },
        { header: "Priority", key: "priority" },
        { header: "Responsible Department", key: "dept" },
        { header: "Target Date", key: "target" },
        { header: "Status", key: "status" },
        { header: "Action Completion (%)", key: "pct" },
      ],
      rows: rows.flatMap(({ audit, findings: fs }) =>
        fs.map((f, i) => ({
          project: audit.projectName,
          date: formatDate(audit.auditDate),
          no: i + 1,
          category: f.category,
          observation: f.observation,
          action: f.correctiveAction,
          priority: f.priority,
          dept: f.responsibleDept,
          target: f.closeOutDate ? formatDate(f.closeOutDate) : "",
          status: f.capStatus,
          pct: f.completionPct,
        }))
      ),
    },
  ];

  return (
    <div>
      <PageTitle
        section={
          <span className="flex items-center gap-3">
            <BrandMark size={40} />
            {t.nav.hseAudit}
          </span>
        }
        title="Audit Summary"
      >
        {stats.asOf && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-[#f36f24]/50 px-3.5 py-2 text-sm font-semibold text-white/90">
            <CalendarDays className="h-4 w-4 text-[#ff8a3d]" />
            As of {formatDate(stats.asOf)}
          </span>
        )}
        <ExportExcelButton filename="HSE Audits" sheets={exportSheets} disabled={rows.length === 0} />
        <Link href="/hse-audit/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New Audit
        </Link>
      </PageTitle>

      <SummaryCards
        dark
        cards={[
          { label: "Projects Audited", value: stats.projects, icon: ClipboardList, color: "#F36F24" },
          { label: "Avg. Health & Safety", value: pct(stats.hsAvg), icon: ShieldCheck, color: "#F36F24" },
          { label: "Avg. Environmental", value: pct(stats.envAvg), icon: Leaf, color: "#16A34A" },
          { label: "Total Findings", value: stats.findings, icon: FileText, color: "#F36F24" },
          { label: "Open", value: stats.open, icon: TriangleAlert, color: "#D97706" },
          { label: "Closed", value: stats.closed, icon: CircleCheck, color: "#16A34A" },
        ]}
      />

      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* ---- Audit score by project ---- */}
        <DarkPanel>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <h2 className={`${CHART_TITLE} flex items-center gap-2`}>
              <ChartColumnIncreasing className="h-5 w-5 text-[#ff8a3d]" /> Audit Score by Project
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
            <p className="py-16 text-center text-sm text-white/50">No audits yet.</p>
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
              <Target className="h-5 w-5 text-[#ff8a3d]" /> Overall Audit Score
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
              <FileText className="h-5 w-5 text-[#ff8a3d]" /> Summary
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-white/85">
              <Bullet>
                <b>{stats.projects}</b> projects audited with an overall score of <b>{pct(stats.overall)}</b>.
              </Bullet>
              <Bullet>
                Average H&amp;S score: <b>{pct(stats.hsAvg)}</b> &nbsp;|&nbsp; Average Environmental score: <b>{pct(stats.envAvg)}</b>.
              </Bullet>
              <Bullet>
                <b>{stats.findings}</b> findings identified ({stats.open} open, {stats.closed} closed – {pct(stats.closure)} closure rate).
              </Bullet>
              {stats.focus.length > 0 && <Bullet>Key focus areas: {stats.focus.join(", ")}.</Bullet>}
            </ul>
          </DarkPanel>
        </div>
      </div>

      {/* ---- Audit details & reports ---- */}
      <DarkPanel className="mb-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className={`${TABLE_TITLE} flex items-center gap-2`}>
            <Layers className="h-5 w-5 text-[#ff8a3d]" /> Audit Details &amp; Reports
          </h2>
          <label className="relative w-full sm:ms-auto sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by project, auditor, manager…" className={SEARCH_INPUT} />
          </label>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full min-w-[1100px] text-start text-sm">
            <thead>
              <tr className={TH_ROW}>
                <th className={`${TH} rounded-s-lg`}>Project</th>
                <th className={TH}>Audit Date</th>
                <th className={TH}>Auditor</th>
                <th className={TH}>Created by</th>
                <th className={`${TH} !text-center`}>H&amp;S Score</th>
                <th className={`${TH} !text-center`}>ENV Score</th>
                <th className={`${TH} !text-center`}>Overall</th>
                <th className={`${TH} !text-center`}>Findings (O/C)</th>
                <th className={TH}>Status</th>
                <th className={`${TH} rounded-e-lg !text-center`}>Audit Report</th>
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
                    No audits yet — click New Audit to add the first one.
                  </td>
                </tr>
              ) : (
                rows.map(({ audit, hs, env, findings: fs }) => {
                  const open = fs.filter((f) => f.status === "Open").length;
                  const overall = overallOf(hs.pct, env.pct);
                  const level = overall == null ? null : levelOf(overall);
                  return (
                    <tr key={audit.id} onClick={() => router.push(`/hse-audit/${audit.id}`)} className={`${TR} cursor-pointer`}>
                      <td className={`${TD} font-bold text-white`}>{audit.projectName}</td>
                      <td className={`${TD} whitespace-nowrap text-white/80`}>{formatDate(audit.auditDate)}</td>
                      <td className={`${TD} text-white/80`}>{audit.auditor || "—"}</td>
                      <td className={`${TD} text-white/80`}>{creatorOf(audit)}</td>
                      <td className={`${TD} text-center`}>
                        <ScoreChip value={hs.pct} tint="rgba(243,111,36,0.22)" />
                      </td>
                      <td className={`${TD} text-center`}>
                        <ScoreChip value={env.pct} tint="rgba(34,197,94,0.2)" />
                      </td>
                      <td className={`${TD} text-center`}>
                        <ScoreChip value={overall} tint="rgba(255,255,255,0.08)" />
                      </td>
                      <td className={`${TD} whitespace-nowrap text-center text-white/90`}>
                        {fs.length} ({open}/{fs.length - open})
                      </td>
                      <td className={TD}>
                        {level ? (
                          <span
                            className="inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold"
                            style={{ background: TONE_STYLE[level.tone].bg, color: TONE_STYLE[level.tone].fg }}
                          >
                            {level.label}
                          </span>
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>
                      <td className={`${TD} text-center`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/hse-audit/${audit.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open the audit report (print / save as PDF)"
                            aria-label="Open the audit report"
                            className="flex h-9 w-8 flex-col items-center justify-center rounded-md bg-white text-[8px] font-extrabold leading-none text-[#dc2626] shadow transition hover:scale-105"
                          >
                            <FileText className="mb-0.5 h-4 w-4 text-[#dc2626]" />
                            PDF
                          </a>
                          <ReportDownload id={audit.id!} name={audit.reportFileName} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DarkPanel>

      <DarkPanel>
        <h2 className={TABLE_TITLE}>Open Findings</h2>
        <p className="mb-3 text-xs text-white/55">One row per audit — click a row to open the full audit and close out its findings.</p>
        <div className="overflow-x-auto rounded-lg">
        <table className="w-full min-w-[960px] text-start text-sm">
          <thead>
            <tr className={TH_ROW}>
              <th className="rounded-s-lg px-4 py-3 text-start">Project</th>
              <th className="px-4 py-3 text-start">Audit Date</th>
              <th className="px-4 py-3 text-start">Auditor</th>
              <th className="px-4 py-3 text-start">Open</th>
              <th className="px-4 py-3 text-start">Priority</th>
              <th className="px-4 py-3 text-start">Overdue</th>
              <th className="px-4 py-3 text-start">Next Close Out</th>
              <th className="rounded-e-lg px-4 py-3 text-start">Categories</th>
            </tr>
          </thead>
          <tbody>
            {openByAudit.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/50">
                  No open findings.
                </td>
              </tr>
            ) : (
              openByAudit.map(({ audit, open, total, overdue, next, byPriority, categories }) => (
                <tr
                  key={audit.id}
                  onClick={() => router.push(`/hse-audit/${audit.id}`)}
                  className={`${TR} cursor-pointer`}
                  style={overdue ? { background: "rgba(220,38,38,0.07)" } : undefined}
                >
                  <td className="px-4 py-3 font-semibold text-white">{audit.projectName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-white/75">{formatDate(audit.auditDate)}</td>
                  <td className="px-4 py-3 text-white/75">{audit.auditor || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-bold text-white">{open}</span>
                    <span className="text-xs text-white/50"> of {total}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {PRIORITIES.filter((p) => byPriority[p]).map((p) => (
                        <span
                          key={p}
                          className="rounded px-2 py-0.5 text-xs font-bold"
                          style={{ background: PRIORITY_STYLE[p].bg, color: PRIORITY_STYLE[p].fg }}
                        >
                          {byPriority[p]} {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: overdue ? "#f87171" : "#4ade80" }}>
                    {overdue || "—"}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold"
                    style={next && isOverdue({ status: "Open", closeOutDate: next }) ? { color: "#f87171" } : undefined}
                  >
                    {formatDate(next)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-white/75" title={categories.join(", ")}>
                    {categories.join(", ") || "—"}
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

function ReportDownload({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  if (!name) {
    return (
      <span title="No report file attached" className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/25">
        <Download className="h-4 w-4" />
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={busy}
      title={`Download ${name}`}
      aria-label={`Download ${name}`}
      onClick={async () => {
        setBusy(true);
        try {
          const { data } = await supabase.from("hse_audits").select("report_file").eq("id", id).single();
          const href = (data as { report_file?: string } | null)?.report_file;
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.download = name;
            a.click();
          }
        } finally {
          setBusy(false);
        }
      }}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 text-white transition hover:border-[#f36f24] hover:text-[#ff8a3d] disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
    </button>
  );
}
