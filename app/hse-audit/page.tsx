"use client";

/**
 * HSE Audit dashboard: every audit with its Health & Safety and
 * Environmental score, the latest score per project against target,
 * and the open findings waiting to be closed out.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlarmClock, ClipboardList, Leaf, ListChecks, Plus, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import SummaryCards from "@/components/SummaryCards";
import ExportExcelButton from "@/components/ExportExcelButton";
import { ScorePill } from "@/components/hseAudit/ScorePanel";
import { useLanguage } from "@/context/LanguageContext";
import { useProjectScoped } from "@/context/ProjectFilterContext";
import { fetchAllRows } from "@/lib/supabaseClient";
import {
  AUDIT_LIST_COLUMNS,
  AuditFinding,
  ENV_ITEMS,
  HS_ITEMS,
  HseAudit,
  PRIORITIES,
  PRIORITY_STYLE,
  formatDate,
  isOverdue,
  mapAudit,
  mapFinding,
  scoreOf,
} from "@/lib/hseAudit";

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

  useEffect(() => {
    let active = true;
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchAllRows<any>("hse_audits", (q) => q.select(AUDIT_LIST_COLUMNS).order("audit_date", { ascending: false }).order("id")),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchAllRows<any>("hse_audit_findings", (q) =>
        q.select("id,audit_id,item_no,category,observation,priority,close_out_date,status,closed_on,closure_note").order("id")
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

  const avg = (vals: (number | null)[]) => {
    const v = vals.filter((x): x is number => x != null);
    return v.length ? `${(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1)}%` : "—";
  };

  // Latest audit per project for the chart.
  const chart = useMemo(() => {
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      const cur = latest.get(r.audit.projectName);
      if (!cur || r.audit.auditDate > cur.audit.auditDate) latest.set(r.audit.projectName, r);
    }
    return Array.from(latest.values())
      .map((r) => ({ project: r.audit.projectName, hs: r.hs.pct ?? 0, env: r.env.pct ?? 0 }))
      .sort((a, b) => a.project.localeCompare(b.project));
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
        { header: "H&S Score", key: "hs" },
        { header: "H&S %", key: "hsPct" },
        { header: "H&S Status", key: "hsStatus" },
        { header: "Env Score", key: "env" },
        { header: "Env %", key: "envPct" },
        { header: "Env Status", key: "envStatus" },
        { header: "Findings", key: "findings" },
        { header: "Open Findings", key: "open" },
      ],
      rows: rows.map(({ audit, hs, env, findings: fs }) => ({
        date: formatDate(audit.auditDate),
        project: audit.projectName,
        auditor: audit.auditor,
        hseManager: audit.hseManager,
        hs: hs.max ? `${hs.total}/${hs.max}` : "N/A",
        hsPct: hs.pct ?? "",
        hsStatus: hs.level?.label ?? "",
        env: env.max ? `${env.total}/${env.max}` : "N/A",
        envPct: env.pct ?? "",
        envStatus: env.level?.label ?? "",
        findings: fs.length,
        open: fs.filter((f) => f.status === "Open").length,
      })),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-black">{t.nav.hseAudit}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ExportExcelButton filename="HSE Audits" sheets={exportSheets} disabled={rows.length === 0} />
          <Link href="/hse-audit/new" className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> New Audit
          </Link>
        </div>
      </div>

      <SummaryCards
        cards={[
          { label: "Audits", value: rows.length, icon: ClipboardList, color: "#2563EB" },
          { label: "Avg Health & Safety", value: avg(rows.map((r) => r.hs.pct)), icon: ShieldCheck, color: "#F36F24" },
          { label: "Avg Environmental", value: avg(rows.map((r) => r.env.pct)), icon: Leaf, color: "#16A34A" },
          { label: "Open Findings", value: openFindings.length, icon: ListChecks, color: "#D97706" },
          { label: "Overdue Findings", value: openFindings.filter((f) => isOverdue(f)).length, icon: AlarmClock, color: "#DC2626" },
        ]}
      />

      {chart.length > 0 && (
        <div className="card mb-6">
          <h2 className="mb-4 text-lg font-bold text-brand-black">Latest Score by Project</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="project" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                <ReferenceLine y={target} stroke="#DC2626" strokeDasharray="6 4" label={{ value: `Target ${target}%`, fontSize: 11, fill: "#DC2626", position: "insideTopRight" }} />
                <Bar dataKey="hs" name="Health & Safety" fill="#F36F24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="env" name="Environmental" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by project, auditor, manager…"
          className="input-field max-w-sm"
        />
      </div>

      <div className="card mb-6 overflow-x-auto !p-0">
        <table className="w-full min-w-[860px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Project</th>
              <th className="px-4 py-3 text-start">Auditor</th>
              <th className="px-4 py-3 text-start">Health &amp; Safety</th>
              <th className="px-4 py-3 text-start">Environmental</th>
              <th className="px-4 py-3 text-start">Findings</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-gray">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-gray">
                  No audits yet — click New Audit to add the first one.
                </td>
              </tr>
            ) : (
              rows.map(({ audit, hs, env, findings: fs }) => {
                const open = fs.filter((f) => f.status === "Open");
                const overdue = open.filter((f) => isOverdue(f)).length;
                return (
                  <tr
                    key={audit.id}
                    onClick={() => router.push(`/hse-audit/${audit.id}`)}
                    className="cursor-pointer border-b border-brand-border last:border-0 hover:bg-brand-grayLight/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark">{formatDate(audit.auditDate)}</td>
                    <td className="px-4 py-3 font-semibold text-brand-black">{audit.projectName}</td>
                    <td className="px-4 py-3 text-brand-grayDark">{audit.auditor || "—"}</td>
                    <td className="px-4 py-3">
                      <ScorePill result={hs} />
                    </td>
                    <td className="px-4 py-3">
                      <ScorePill result={env} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-brand-black">{fs.length}</span> total ·{" "}
                      <span className="font-semibold" style={{ color: open.length ? "#D97706" : "#16A34A" }}>
                        {open.length} open
                      </span>
                      {overdue > 0 && <span className="ms-1 font-semibold text-red-600">· {overdue} overdue</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto !p-0">
        <h2 className="px-5 pt-5 text-lg font-bold text-brand-black">Open Findings</h2>
        <p className="px-5 text-xs text-brand-gray">One row per audit — click a row to open the full audit and close out its findings.</p>
        <table className="mt-3 w-full min-w-[960px] text-start text-sm">
          <thead>
            <tr className="border-y border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="px-4 py-3 text-start">Project</th>
              <th className="px-4 py-3 text-start">Audit Date</th>
              <th className="px-4 py-3 text-start">Auditor</th>
              <th className="px-4 py-3 text-start">Open</th>
              <th className="px-4 py-3 text-start">Priority</th>
              <th className="px-4 py-3 text-start">Overdue</th>
              <th className="px-4 py-3 text-start">Next Close Out</th>
              <th className="px-4 py-3 text-start">Categories</th>
            </tr>
          </thead>
          <tbody>
            {openByAudit.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-brand-gray">
                  No open findings.
                </td>
              </tr>
            ) : (
              openByAudit.map(({ audit, open, total, overdue, next, byPriority, categories }) => (
                <tr
                  key={audit.id}
                  onClick={() => router.push(`/hse-audit/${audit.id}`)}
                  className="cursor-pointer border-b border-brand-border last:border-0 hover:bg-brand-grayLight/40"
                  style={overdue ? { background: "rgba(220,38,38,0.07)" } : undefined}
                >
                  <td className="px-4 py-3 font-semibold text-brand-black">{audit.projectName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark">{formatDate(audit.auditDate)}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{audit.auditor || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-bold text-brand-black">{open}</span>
                    <span className="text-xs text-brand-gray"> of {total}</span>
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
                  <td className="px-4 py-3 font-bold" style={{ color: overdue ? "#B91C1C" : "#16A34A" }}>
                    {overdue || "—"}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold"
                    style={next && isOverdue({ status: "Open", closeOutDate: next }) ? { color: "#B91C1C" } : undefined}
                  >
                    {formatDate(next)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-brand-grayDark" title={categories.join(", ")}>
                    {categories.join(", ") || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
