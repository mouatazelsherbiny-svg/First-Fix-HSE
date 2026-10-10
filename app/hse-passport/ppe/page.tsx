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
  PpeItem,
  PpePassportRow,
  analyzeRow,
  formatPpeDate,
  normalizeProject,
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
  const [showAdd, setShowAdd] = useState(false);
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

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      const parsed = parsePpeCsv(await file.text());
      if (parsed.length === 0) throw new Error("No rows found — check the file has the PPE Passport columns.");
      const created_by = await getCurrentUserId();
      for (let i = 0; i < parsed.length; i += 500) {
        const { error } = await supabase
          .from("ppe_passport")
          .upsert(parsed.slice(i, i + 500).map((r) => toDb(r, created_by)), { onConflict: "employee_code" });
        if (error) throw new Error(error.message);
        setImportMsg(`Importing… ${Math.min(i + 500, parsed.length)} / ${parsed.length}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fresh = await fetchAllRows<any>("ppe_passport", (q) => q.select("*").order("name").order("id"));
      setRows(fresh.map(mapRow));
      setImportMsg(`Imported ${parsed.length.toLocaleString("en-US")} employees.`);
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const saveIssue = async (input: AddInput) => {
    const existing = rows.find((r) => r.employeeCode === input.employeeCode);
    const base: PpePassportRow = existing ?? {
      employeeCode: input.employeeCode,
      name: input.name,
      project: normalizeProject(input.project),
      designation: input.designation,
      sponsor: "",
      items: {},
    };
    const prev = base.items[input.item];
    const dates = Array.from(new Set([...(prev?.dates ?? []), input.date])).sort();
    const note = [prev?.note, input.note].filter(Boolean).join(", ") || undefined;
    const next: PpePassportRow = { ...base, items: { ...base.items, [input.item]: { dates, ...(note ? { note } : {}) } } };
    const { data, error } = await supabase
      .from("ppe_passport")
      .upsert(toDb(next, await getCurrentUserId()), { onConflict: "employee_code" })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to save");
    const saved = mapRow(data);
    setRows((list) => (existing ? list.map((r) => (r.employeeCode === saved.employeeCode ? saved : r)) : [saved, ...list]));
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
                title="Upload the PPE Passport sheet (CSV) — rows are added or updated by Employee ID"
              >
                <Upload className="h-4 w-4" />
                {importing ? "Importing…" : "Import CSV"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
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
        <button type="button" onClick={() => setShowAdd(true)} className="btn-primary">
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
                  {i}
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
                      ? "No PPE data yet — click Import CSV (top right) and choose PPE_Passport_clean.csv from your Claude outputs folder."
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
                    className="border-b border-brand-border align-top last:border-0"
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

      {showAdd && <AddIssueModal rows={rows} onClose={() => setShowAdd(false)} onSave={saveIssue} />}
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

interface AddInput {
  employeeCode: string;
  name: string;
  project: string;
  designation: string;
  item: PpeItem;
  date: string;
  note: string;
}

function AddIssueModal({
  rows,
  onClose,
  onSave,
}: {
  rows: PpePassportRow[];
  onClose: () => void;
  onSave: (input: AddInput) => Promise<void>;
}) {
  const [v, setV] = useState<AddInput>({
    employeeCode: "",
    name: "",
    project: "",
    designation: "",
    item: "Shoes",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const known = rows.find((r) => r.employeeCode === v.employeeCode.trim());

  const set = (patch: Partial<AddInput>) => setV((p) => ({ ...p, ...patch }));

  const submit = async () => {
    setError("");
    const code = v.employeeCode.trim();
    if (!code || (!known && !v.name.trim()) || !v.date) {
      setError("Employee ID, name and date are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...v, employeeCode: code, name: known?.name ?? v.name.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-brand-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-black">
            <HardHat className="h-5 w-5 text-brand-orange" />
            Add PPE Issue
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-brand-gray hover:text-brand-black">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Employee ID *</label>
            <input
              className="input-field"
              list="ppe-employee-codes"
              value={v.employeeCode}
              onChange={(e) => set({ employeeCode: e.target.value })}
            />
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
            <input
              className="input-field"
              value={known ? known.name : v.name}
              disabled={!!known}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          {!known && (
            <>
              <div>
                <label className="label-field">Project</label>
                <input className="input-field" value={v.project} onChange={(e) => set({ project: e.target.value })} />
              </div>
              <div>
                <label className="label-field">Designation</label>
                <input className="input-field" value={v.designation} onChange={(e) => set({ designation: e.target.value })} />
              </div>
            </>
          )}
          <div>
            <label className="label-field">PPE Item *</label>
            <select className="input-field" value={v.item} onChange={(e) => set({ item: e.target.value as PpeItem })}>
              {PPE_ITEMS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Date Received *</label>
            <input type="date" className="input-field" value={v.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Size / Note</label>
            <input className="input-field" value={v.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. XL, Volta 43" />
          </div>
        </div>
        {known && known.items[v.item]?.dates.length ? (
          <p className="mt-3 text-xs text-brand-grayDark">
            Previously received: {known.items[v.item]!.dates.map(formatPpeDate).join(", ")}
          </p>
        ) : null}
        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
