"use client";

/**
 * HSE Passport → PPE. Every employee's PPE issues from the PPE Passport
 * sheet (table ppe_passport). An item issued more than once is listed in
 * Remarks with its dates; a re-issue within 6 months turns the row red.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Footprints, Glasses, Hand, HardHat, Package, Repeat, Shirt, Upload, Users, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PassportTabs from "@/components/hsePassport/PassportTabs";
import SummaryCards from "@/components/SummaryCards";
import ExportExcelButton from "@/components/ExportExcelButton";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useProjectFilter } from "@/context/ProjectFilterContext";
import { fetchAllRows, getCurrentUserId, supabase } from "@/lib/supabaseClient";
import {
  PPE_ITEMS,
  PPE_LABELS,
  PPE_OPTIONS,
  PpeIssueLine,
  PpeItem,
  PpePassportRow,
  analyzeRow,
  applyIssues,
  formatPpeDate,
  normalizeProject,
  parseCsv,
  parseIssueSheet,
  parsePpeCsv,
} from "@/lib/ppePassport";

export default function PpePage() {
  return (
    <ProtectedRoute>
      <PpeContent />
    </ProtectedRoute>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any): PpePassportRow {
  return {
    id: r.id,
    employeeCode: r.employee_code,
    name: r.name,
    project: r.project ?? "",
    designation: r.designation ?? "",
    sponsor: r.sponsor ?? "",
    items: r.items ?? {},
  };
}

function toDb(r: PpePassportRow, created_by: string | null) {
  return {
    employee_code: r.employeeCode,
    name: r.name,
    project: r.project || null,
    designation: r.designation || null,
    sponsor: r.sponsor || null,
    items: r.items,
    created_by,
    updated_at: new Date().toISOString(),
  };
}

const PAGE = 100;
type View = "all" | "repeat" | "early";

function PpeContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { project } = useProjectFilter();
  const [rows, setRows] = useState<PpePassportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("all");
  const [limit, setLimit] = useState(PAGE);
  // null = closed; "" = new employee; otherwise the employee code to pre-fill.
  const [addFor, setAddFor] = useState<string | null>(null);
  const [detailCode, setDetailCode] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchAllRows<any>("ppe_passport", (q) => q.select("*").order("name").order("id"))
      .then((data) => active && setRows(data.map(mapRow)))
      .catch(() => {})
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const analyzed = useMemo(() => rows.map((r) => ({ row: r, a: analyzeRow(r) })), [rows]);

  const inProject = useMemo(
    () => (project ? analyzed.filter(({ row }) => row.project.split(" / ").includes(project)) : analyzed),
    [analyzed, project]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inProject.filter(({ row, a }) => {
      if (view === "repeat" && a.repeats.length === 0) return false;
      if (view === "early" && a.earlyItems.length === 0) return false;
      if (!q) return true;
      return [row.name, row.employeeCode, row.project, row.designation].some((v) => v.toLowerCase().includes(q));
    });
  }, [inProject, query, view]);

  useEffect(() => setLimit(PAGE), [query, view, project]);

  const totals = useMemo(
    () => ({
      employees: inProject.length,
      issues: inProject.reduce((s, x) => s + x.a.totalIssues, 0),
      repeat: inProject.filter((x) => x.a.repeats.length > 0).length,
      early: inProject.filter((x) => x.a.earlyItems.length > 0).length,
      // Times each item was issued (a cell with no date still counts once).
      perItem: Object.fromEntries(
        PPE_ITEMS.map((item) => [
          item,
          inProject.reduce((s, x) => {
            const issue = x.row.items[item];
            return s + (issue ? Math.max(1, issue.dates.length) : 0);
          }, 0),
        ])
      ) as Record<PpeItem, number>,
    }),
    [inProject]
  );

  const exportSheets = useMemo(
    () => [
      {
        name: "PPE Passport",
        columns: [
          { header: "Employee ID", key: "code" },
          { header: "Name", key: "name", width: 28 },
          { header: "Project", key: "project" },
          { header: "Designation", key: "designation", width: 24 },
          ...PPE_ITEMS.map((i) => ({ header: i, key: i, width: 24 })),
          { header: "Remarks", key: "remarks", width: 50 },
        ],
        rows: filtered.map(({ row, a }) => ({
          code: row.employeeCode,
          name: row.name,
          project: row.project,
          designation: row.designation,
          ...Object.fromEntries(PPE_ITEMS.map((i) => [i, cellText(row, i)])),
          remarks: remarkText(a),
        })),
      },
    ],
    [filtered]
  );

  const reload = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fresh = await fetchAllRows<any>("ppe_passport", (q) => q.select("*").order("name").order("id"));
    setRows(fresh.map(mapRow));
  };

  const saveRows = async (list: PpePassportRow[], progress?: (done: number) => void) => {
    const created_by = await getCurrentUserId();
    for (let i = 0; i < list.length; i += 500) {
      const { error } = await supabase
        .from("ppe_passport")
        .upsert(list.slice(i, i + 500).map((r) => toDb(r, created_by)), { onConflict: "employee_code" });
      if (error) throw new Error(error.message);
      progress?.(Math.min(i + 500, list.length));
    }
  };

  /**
   * Two kinds of file are accepted:
   *  - the manual-entry template (Excel or CSV with a "PPE Item" column):
   *    each line ADDS one issue to that employee's record;
   *  - the full PPE Passport sheet (CSV, one column per item): replaces
   *    each listed employee's record.
   */
  const handleImport = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      let table: unknown[][] | null = null;
      let wide: PpePassportRow[] | null = null;
      if (/\.xlsx$/i.test(file.name)) {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(await file.arrayBuffer());
        const ws = wb.getWorksheet("PPE Issues") ?? wb.worksheets[0];
        const t2: unknown[][] = [];
        ws.eachRow({ includeEmpty: false }, (row) => {
          const values = (row.values as unknown[]).slice(1).map((v) => {
            if (v && typeof v === "object" && !(v instanceof Date)) {
              const o = v as { result?: unknown; text?: unknown; richText?: { text: string }[] };
              if (o.result !== undefined) return o.result;
              if (o.richText) return o.richText.map((x) => x.text).join("");
              if (o.text !== undefined) return o.text;
            }
            return v;
          });
          t2.push(values);
        });
        table = t2;
      } else {
        const text = await file.text();
        const parsed = parseCsv(text);
        if ((parsed[0] ?? []).some((h) => /ppe item/i.test(h))) table = parsed;
        else wide = parsePpeCsv(text);
      }

      if (table) {
        const { lines, skipped } = parseIssueSheet(table);
        if (lines.length === 0) throw new Error("No PPE lines found — fill Employee ID and PPE Item on each line.");
        const changed = applyIssues(rows, lines);
        await saveRows(changed, (n) => setImportMsg(`Saving… ${n} / ${changed.length}`));
        await reload();
        setImportMsg(
          `Added ${lines.length} PPE issue(s) for ${changed.length} employee(s).` +
            (skipped.length ? ` Skipped row(s) ${skipped.slice(0, 15).join(", ")} — Employee ID or PPE Item missing.` : "")
        );
      } else if (wide && wide.length) {
        const list = wide;
        await saveRows(list, (n) => setImportMsg(`Importing… ${n} / ${list.length}`));
        await reload();
        setImportMsg(`Imported ${list.length.toLocaleString("en-US")} employees.`);
      } else {
        throw new Error("No rows found — check the file is the PPE template or the PPE Passport sheet.");
      }
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const saveLines = async (lines: PpeIssueLine[]) => {
    const changed = applyIssues(rows, lines);
    await saveRows(changed);
    setRows((list) => {
      const byCode = new Map(changed.map((r) => [r.employeeCode, r]));
      const kept = list.map((r) => byCode.get(r.employeeCode) ?? r);
      const added = changed.filter((r) => !list.some((x) => x.employeeCode === r.employeeCode));
      return [...added, ...kept];
    });
  };

  const cards = [
    { label: "Employees with PPE", value: totals.employees, icon: Users, color: "#2563EB" },
    { label: "Total PPE Issued", value: totals.issues, icon: Package, color: "#F36F24" },
    { label: "Received More Than Once", value: totals.repeat, icon: Repeat, color: "#D97706" },
    { label: "Re-issued Within 6 Months", value: totals.early, icon: AlertTriangle, color: "#DC2626" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-black">{t.nav.hsePassport}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="btn-secondary gap-2 disabled:opacity-60"
                title="Upload the filled PPE template (Excel) or the PPE Passport sheet (CSV)"
              >
                <Upload className="h-4 w-4" />
                {importing ? "Importing…" : "Import File"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => {
                  handleImport(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </>
          )}
          <ExportExcelButton filename="PPE Passport" sheets={exportSheets} disabled={filtered.length === 0} />
        </div>
      </div>

      <PassportTabs />
      <SummaryCards cards={cards} />
      <SummaryCards
        cards={[
          { label: "Helmet", value: totals.perItem.Helmet, icon: HardHat, color: "#F59E0B" },
          { label: "Safety Shoes", value: totals.perItem.Shoes, icon: Footprints, color: "#78716C" },
          { label: "Vest", value: totals.perItem.Vest, icon: Shirt, color: "#F36F24" },
          { label: "Gloves", value: totals.perItem.Gloves, icon: Hand, color: "#16A34A" },
          { label: "Glasses", value: totals.perItem.Glasses, icon: Glasses, color: "#0EA5E9" },
        ]}
      />

      {importMsg && <p className="mb-4 text-sm font-medium text-brand-grayDark">{importMsg}</p>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, employee ID, project…"
            className="input-field max-w-sm"
          />
          <div className="inline-flex rounded-xl border border-brand-border bg-brand-surface p-1">
            {([
              ["all", "All"],
              ["repeat", "Received more than once"],
              ["early", "Within 6 months"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  view === key ? "bg-brand-orange text-brand-onAccent" : "text-brand-grayDark hover:bg-brand-grayLight/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => setAddFor("")} className="btn-primary">
          {t.hse.addBtn}
        </button>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[1100px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="px-4 py-3 text-start">Employee</th>
              <th className="px-4 py-3 text-start">Project</th>
              {PPE_ITEMS.map((i) => (
                <th key={i} className="px-3 py-3 text-start">
                  {PPE_LABELS[i]}
                </th>
              ))}
              <th className="px-4 py-3 text-start">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={PPE_ITEMS.length + 3} className="px-6 py-10 text-center text-brand-gray">
                  {t.common.loading}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={PPE_ITEMS.length + 3} className="px-6 py-10 text-center text-brand-gray">
                  {rows.length === 0
                    ? isAdmin
                      ? "No PPE data yet — click Import File (top right) and choose PPE_Passport_clean.csv from your Claude outputs folder."
                      : "No PPE data yet."
                    : "No matching employees."}
                </td>
              </tr>
            ) : (
              filtered.slice(0, limit).map(({ row, a }) => {
                const red = a.earlyItems.length > 0;
                return (
                  <tr
                    key={row.employeeCode}
                    onClick={() => setDetailCode(row.employeeCode)}
                    className="cursor-pointer border-b border-brand-border align-top transition last:border-0 hover:bg-brand-orange/5"
                    style={red ? { background: "rgba(220,38,38,0.08)" } : undefined}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-black">{row.name}</p>
                      <p className="text-xs text-brand-gray">
                        {row.employeeCode.startsWith("name:") ? "—" : row.employeeCode}
                        {row.designation ? ` · ${row.designation}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-brand-grayDark">{row.project || "—"}</td>
                    {PPE_ITEMS.map((item) => {
                      const issue = row.items[item];
                      const early = a.earlyItems.includes(item);
                      return (
                        <td key={item} className="px-3 py-3 text-xs" style={early ? { color: "#B91C1C", fontWeight: 600 } : undefined}>
                          {!issue ? (
                            <span className="text-brand-gray">—</span>
                          ) : (
                            <>
                              {issue.dates.map((d) => (
                                <p key={d} className="whitespace-nowrap">{formatPpeDate(d)}</p>
                              ))}
                              {issue.dates.length === 0 && <p className="text-brand-grayDark">Received</p>}
                              {issue.note && <p className="text-[11px] font-normal text-brand-gray">{issue.note}</p>}
                            </>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-xs" style={red ? { color: "#B91C1C" } : undefined}>
                      {a.repeats.length === 0 ? (
                        <span className="text-brand-gray">—</span>
                      ) : (
                        a.repeats.map((r) => (
                          <p key={r.item} className={a.earlyItems.includes(r.item) ? "font-semibold" : "text-brand-grayDark"}>
                            {r.item}: received {r.dates.length} times ({r.dates.map(formatPpeDate).join(", ")})
                            {a.earlyItems.includes(r.item) ? " — within 6 months" : ""}
                          </p>
                        ))
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > limit && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-brand-gray">
          Showing {limit.toLocaleString("en-US")} of {filtered.length.toLocaleString("en-US")}
          <button type="button" onClick={() => setLimit((l) => l + PAGE * 5)} className="btn-secondary !py-1.5">
            Show more
          </button>
        </div>
      )}

      {detailCode !== null && rows.some((r) => r.employeeCode === detailCode) && (
        <PpeDetailsModal
          row={rows.find((r) => r.employeeCode === detailCode)!}
          onClose={() => setDetailCode(null)}
          onAdd={() => {
            setAddFor(detailCode);
            setDetailCode(null);
          }}
        />
      )}
      {addFor !== null && (
        <AddIssueModal rows={rows} initialCode={addFor} onClose={() => setAddFor(null)} onSave={saveLines} />
      )}
    </div>
  );
}

function cellText(row: PpePassportRow, item: PpeItem) {
  const issue = row.items[item];
  if (!issue) return "";
  return [issue.dates.map(formatPpeDate).join(", ") || "Received", issue.note].filter(Boolean).join(" — ");
}

function remarkText(a: ReturnType<typeof analyzeRow>) {
  return a.repeats
    .map(
      (r) =>
        `${r.item}: received ${r.dates.length} times (${r.dates.map(formatPpeDate).join(", ")})${
          a.earlyItems.includes(r.item) ? " — within 6 months" : ""
        }`
    )
    .join("; ");
}

const ITEM_ICONS: Record<PpeItem, typeof HardHat> = {
  Helmet: HardHat,
  Shoes: Footprints,
  Vest: Shirt,
  Gloves: Hand,
  Glasses: Glasses,
};

function ModalShell({ title, onClose, children }: { title: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-brand-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-4">
          <div className="min-w-0">{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-brand-gray hover:text-brand-black">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/** One employee's PPE, item by item, with ticked boxes for what they received. */
function PpeDetailsModal({ row, onClose, onAdd }: { row: PpePassportRow; onClose: () => void; onAdd: () => void }) {
  const a = analyzeRow(row);
  const received = PPE_ITEMS.filter((i) => row.items[i]).length;
  return (
    <ModalShell
      onClose={onClose}
      title={
        <>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-orange">PPE Passport</p>
          <h2 className="mt-1 truncate text-xl font-bold text-brand-black">{row.name}</h2>
          <p className="text-sm text-brand-gray">
            {[row.employeeCode.startsWith("name:") ? "" : `ID ${row.employeeCode}`, row.designation, row.project, row.sponsor]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="px-4 py-3 text-start">PPE Description</th>
              <th className="px-4 py-3 text-start">Received</th>
              <th className="px-4 py-3 text-start">Last Received</th>
              <th className="px-4 py-3 text-start">Times</th>
              <th className="px-4 py-3 text-start">All Dates</th>
              <th className="px-4 py-3 text-start">Size / Note</th>
            </tr>
          </thead>
          <tbody>
            {PPE_ITEMS.map((item) => {
              const issue = row.items[item];
              const early = a.earlyItems.includes(item);
              const Icon = ITEM_ICONS[item];
              return (
                <tr
                  key={item}
                  className="border-b border-brand-border last:border-0"
                  style={early ? { background: "rgba(220,38,38,0.08)" } : undefined}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orangeLight text-brand-orange">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-brand-black">{PPE_LABELS[item]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!issue}
                      readOnly
                      className="h-4 w-4 rounded border-brand-border accent-[rgb(var(--brand-orange-rgb))]"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark">
                    {issue?.dates.length ? formatPpeDate(issue.dates[issue.dates.length - 1]) : issue ? "Date not recorded" : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={early ? { color: "#B91C1C" } : undefined}>
                    {issue ? Math.max(1, issue.dates.length) : 0}
                  </td>
                  <td className="px-4 py-3 text-xs" style={early ? { color: "#B91C1C", fontWeight: 600 } : undefined}>
                    {issue?.dates.length ? issue.dates.map(formatPpeDate).join(", ") : "—"}
                    {early && <p className="font-semibold">Re-issued within 6 months</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-grayDark">{issue?.note || "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-brand-grayLight/40">
              <td className="px-4 py-3 font-bold text-brand-black" colSpan={5}>
                Total PPE
              </td>
              <td className="px-4 py-3 font-bold text-brand-orange">
                {received} / {PPE_ITEMS.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          Close
        </button>
        <button type="button" onClick={onAdd} className="btn-primary">
          + Add PPE
        </button>
      </div>
    </ModalShell>
  );
}

interface ItemDraft {
  checked: boolean;
  date: string;
  size: string;
}

/** Add form: tick the items handed over, with the date and size for each. */
function AddIssueModal({
  rows,
  initialCode,
  onClose,
  onSave,
}: {
  rows: PpePassportRow[];
  initialCode: string;
  onClose: () => void;
  onSave: (lines: PpeIssueLine[]) => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [designation, setDesignation] = useState("");
  const [items, setItems] = useState<Record<PpeItem, ItemDraft>>(
    () => Object.fromEntries(PPE_ITEMS.map((i) => [i, { checked: false, date: today, size: "" }])) as Record<PpeItem, ItemDraft>
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const known = rows.find((r) => r.employeeCode === code.trim());

  const setItem = (item: PpeItem, patch: Partial<ItemDraft>) =>
    setItems((prev) => ({ ...prev, [item]: { ...prev[item], ...patch } }));

  const submit = async () => {
    setError("");
    const c = code.trim();
    const chosen = PPE_ITEMS.filter((i) => items[i].checked);
    if (!c || (!known && !name.trim())) return setError("Employee ID and name are required.");
    if (chosen.length === 0) return setError("Tick at least one PPE item.");
    if (chosen.some((i) => !items[i].date)) return setError("Enter the date received for each ticked item.");
    setSaving(true);
    try {
      await onSave(
        chosen.map((item) => ({
          employeeCode: c,
          name: known?.name ?? name.trim(),
          project: known?.project ?? normalizeProject(projectName),
          designation: known?.designation ?? designation.trim(),
          item,
          date: items[item].date,
          note: items[item].size,
        }))
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      title={
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-black">
          <HardHat className="h-5 w-5 text-brand-orange" />
          Add PPE
        </h2>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Employee ID *</label>
          <input className="input-field" list="ppe-employee-codes" value={code} onChange={(e) => setCode(e.target.value)} />
          <datalist id="ppe-employee-codes">
            {rows.slice(0, 5000).map((r) => (
              <option key={r.employeeCode} value={r.employeeCode}>
                {r.name}
              </option>
            ))}
          </datalist>
        </div>
        <div>
          <label className="label-field">Name {known ? "" : "*"}</label>
          <input className="input-field" value={known ? known.name : name} disabled={!!known} onChange={(e) => setName(e.target.value)} />
        </div>
        {!known && (
          <>
            <div>
              <label className="label-field">Project</label>
              <input className="input-field" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div>
              <label className="label-field">Designation</label>
              <input className="input-field" value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full min-w-[620px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="px-4 py-3 text-start">PPE Description</th>
              <th className="px-4 py-3 text-start">Received</th>
              <th className="px-4 py-3 text-start">Date Received</th>
              <th className="px-4 py-3 text-start">Size / Type</th>
              <th className="px-4 py-3 text-start">Previously</th>
            </tr>
          </thead>
          <tbody>
            {PPE_ITEMS.map((item) => {
              const d = items[item];
              const Icon = ITEM_ICONS[item];
              const prev = known?.items[item];
              return (
                <tr key={item} className="border-b border-brand-border last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orangeLight text-brand-orange">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-brand-black">{PPE_LABELS[item]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={d.checked}
                      onChange={(e) => setItem(item, { checked: e.target.checked })}
                      className="h-5 w-5 cursor-pointer rounded border-brand-border accent-[rgb(var(--brand-orange-rgb))]"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="date"
                      value={d.date}
                      disabled={!d.checked}
                      onChange={(e) => setItem(item, { date: e.target.value })}
                      className="input-field !py-1.5 disabled:opacity-40"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={d.size}
                      disabled={!d.checked}
                      onChange={(e) => setItem(item, { size: e.target.value })}
                      className="input-field !py-1.5 disabled:opacity-40"
                    >
                      <option value="">—</option>
                      {PPE_OPTIONS[item].map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-brand-grayDark">
                    {prev?.dates.length ? prev.dates.map(formatPpeDate).join(", ") : prev ? "Received" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </ModalShell>
  );
}
