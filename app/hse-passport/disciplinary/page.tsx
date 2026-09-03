"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpFromLine,
  TriangleAlert,
  Box,
  Lock,
  TrafficCone,
  Truck,
  ShieldCheck,
  ClipboardCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import FileUpload from "@/components/FileUpload";
import ExportExcelButton from "@/components/ExportExcelButton";
import { useLanguage } from "@/context/LanguageContext";
import { useHsePassport } from "@/context/HsePassportContext";
import {
  EmployeeRecord,
  PROJECTS,
  LIFE_SAVING_RULES,
  VIOLATION_CATEGORIES,
  DISCIPLINARY_TYPES,
} from "@/lib/mockData";
import { DisciplinaryType } from "@/types/hsePassport";
import { UploadedFile } from "@/types/toolboxTalk";

// One icon per Life Saving Rule card, in the same order as LIFE_SAVING_RULES.
const LIFE_SAVING_RULE_ICONS: LucideIcon[] = [
  ArrowUpFromLine, // 1. Work at Height
  TriangleAlert, // 2. Dropped Objects
  Box, // 3. Confined Space
  Lock, // 4. Energy Isolation
  TrafficCone, // 5. Barricades & Signs
  Truck, // 6. Lifting Operations
  ShieldCheck, // 7. Safety Controls
  ClipboardCheck, // 8. Permit to Work
  Users, // 9. Mobile Equipment / Personnel Interface
  Zap, // 10. Energy Isolation
];

export default function DisciplinaryActionPage() {
  return (
    <ProtectedRoute>
      <DisciplinaryActionContent />
    </ProtectedRoute>
  );
}

function DisciplinaryActionContent() {
  const { t } = useLanguage();
  const { disciplinaryRecords, addDisciplinaryRecord, employees } = useHsePassport();

  const [query, setQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [project, setProject] = useState("");
  const [department, setDepartment] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))),
    [employees]
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, employees]);

  const scopeEmployees = useMemo(() => {
    if (selectedEmployee) return [selectedEmployee];
    if (!project && !department) return [];
    return employees.filter(
      (e) => (!project || e.project === project) && (!department || e.department === department)
    );
  }, [selectedEmployee, project, department, employees]);

  const scopeIds = new Set(scopeEmployees.map((e) => e.id));
  const scopedRecords = disciplinaryRecords.filter((r) => scopeIds.has(r.employeeId));
  const hasSelection = scopeEmployees.length > 0;

  const viewTitle = selectedEmployee
    ? selectedEmployee.name
    : [project, department].filter(Boolean).join(" · ") || "";

  const counts: Record<DisciplinaryType, number> = {
    "Verbal Warning": 0,
    "Written Warning": 0,
    Violation: 0,
    LSR: 0,
  };
  scopedRecords.forEach((r) => {
    counts[r.type] += 1;
  });

  const chartData = VIOLATION_CATEGORIES.map((cat) => ({
    category: cat,
    count: scopedRecords.filter((r) => r.violationCategory === cat).length,
  }));
  const maxChartCount = Math.max(1, ...chartData.map((d) => d.count));

  const clearFilters = () => {
    setSelectedEmployee(null);
    setProject("");
    setDepartment("");
    setQuery("");
  };

  const exportSheets = useMemo(
    () => [
      {
        name: t.hse.disciplinary.title,
        columns: [
          { header: t.hse.employeeName, key: "employeeName" },
          { header: t.hse.employeeIdCol, key: "employeeIdCol" },
          { header: t.hse.projectCol, key: "project" },
          { header: t.hse.date, key: "date" },
          { header: t.hse.disciplinary.type, key: "type" },
          { header: t.hse.disciplinary.violationCategory, key: "violationCategory" },
          { header: t.hse.details, key: "details", width: 40 },
        ],
        rows: disciplinaryRecords.map((r) => {
          const emp = employees.find((e) => e.id === r.employeeId);
          return {
            employeeName: emp?.name ?? "—",
            employeeIdCol: emp?.employeeId ?? "—",
            project: emp?.project ?? "—",
            date: r.date,
            type: r.type,
            violationCategory: r.violationCategory ?? "—",
            details: r.details,
          };
        }),
      },
    ],
    [disciplinaryRecords, employees, t]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.hse.disciplinary.title}
        </h1>
        <ExportExcelButton
          filename={t.hse.disciplinary.title}
          sheets={exportSheets}
          disabled={disciplinaryRecords.length === 0}
        />
      </div>

      {/* Filter bar */}
      <div className="card relative mb-6">
        {selectedEmployee ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orangeLight text-sm font-bold text-brand-orange">
                {selectedEmployee.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-black">{selectedEmployee.name}</p>
                <p className="text-xs text-brand-gray">
                  {selectedEmployee.employeeId} · {selectedEmployee.project} · {selectedEmployee.department}
                </p>
              </div>
            </div>
            <button type="button" onClick={clearFilters} className="btn-secondary !px-4 !py-2 text-xs">
              {t.hse.changeEmployee}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="label-field">{t.hse.searchEmployee}</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.hse.searchPlaceholder}
                className="input-field"
                autoComplete="off"
              />
              {query.trim() && (
                <div className="absolute z-30 mt-1 max-h-64 w-full max-w-xs overflow-y-auto rounded-xl border border-brand-border bg-brand-surface shadow-lg">
                  {matches.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-brand-gray">{t.hse.noMatches}</p>
                  ) : (
                    matches.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmployee(e);
                          setQuery("");
                        }}
                        className="flex w-full flex-col border-b border-brand-border px-4 py-2.5 text-start transition last:border-0 hover:bg-brand-grayLight/50"
                      >
                        <span className="text-sm font-semibold text-brand-black">{e.name}</span>
                        <span className="text-xs text-brand-gray">
                          {e.employeeId} · {e.project} · {e.department}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label-field">{t.hse.disciplinary.filterByProject}</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="input-field"
              >
                <option value="">{t.hse.disciplinary.allProjects}</option>
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">{t.hse.disciplinary.filterByDepartment}</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field"
              >
                <option value="">{t.hse.disciplinary.allDepartments}</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!hasSelection ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.hse.emptyState}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-black">{viewTitle}</h2>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="btn-primary"
            >
              {t.hse.addBtn}
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(
              [
                ["Verbal Warning", t.hse.disciplinary.verbalWarning],
                ["Written Warning", t.hse.disciplinary.writtenWarning],
                ["Violation", t.hse.disciplinary.violation],
                ["LSR", t.hse.disciplinary.lsr],
              ] as [DisciplinaryType, string][]
            ).map(([key, label]) => (
              <div
                key={key}
                className="rounded-2xl bg-black p-5 text-center shadow-card"
              >
                <p className="text-3xl font-extrabold text-white">{counts[key]}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Life Saving Rules */}
          <div className="rounded-2xl bg-black p-5 shadow-card sm:p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              {t.hse.disciplinary.lifeSavingRulesTitle}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {LIFE_SAVING_RULES.map((rule, i) => {
                const Icon = LIFE_SAVING_RULE_ICONS[i];
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-xl bg-brand-orange p-4 text-center"
                  >
                    <Icon className="h-7 w-7 shrink-0 text-brand-onAccent" strokeWidth={1.8} />
                    <span className="text-lg font-extrabold text-brand-onAccent">{i + 1}</span>
                    <span className="text-xs font-medium text-brand-onAccent/80">{rule}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bar chart */}
          <div className="card">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.hse.disciplinary.chartTitle}
            </h3>
            <div className="flex h-52 items-end justify-between gap-3">
              {chartData.map((d) => (
                <div key={d.category} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-bold text-brand-black">{d.count}</span>
                  <div
                    className="w-full max-w-[36px] rounded-t-md bg-brand-orange transition-all"
                    style={{ height: `${(d.count / maxChartCount) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-center text-[11px] font-medium text-brand-gray">
                    {d.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Records list */}
          {scopedRecords.length > 0 && (
            <div className="card overflow-x-auto !p-0">
              <table className="w-full min-w-[560px] text-start text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    <th className="px-4 py-3 text-start sm:px-6">{t.hse.date}</th>
                    <th className="px-4 py-3 text-start sm:px-6">{t.hse.disciplinary.type}</th>
                    <th className="px-4 py-3 text-start sm:px-6">
                      {t.hse.disciplinary.violationCategory}
                    </th>
                    <th className="px-4 py-3 text-start sm:px-6">{t.hse.details}</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedRecords.map((r) => (
                    <tr key={r.id} className="border-b border-brand-border last:border-0">
                      <td className="px-4 py-3 text-brand-grayDark sm:px-6">{r.date}</td>
                      <td className="px-4 py-3 font-medium text-brand-black sm:px-6">{r.type}</td>
                      <td className="px-4 py-3 text-brand-grayDark sm:px-6">
                        {r.violationCategory ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-brand-grayDark sm:px-6">{r.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showAddForm && (
            <AddDisciplinaryForm
              scopeEmployees={scopeEmployees}
              lockedEmployee={selectedEmployee}
              onDone={() => setShowAddForm(false)}
              onAdd={addDisciplinaryRecord}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AddDisciplinaryForm({
  scopeEmployees,
  lockedEmployee,
  onDone,
  onAdd,
}: {
  scopeEmployees: EmployeeRecord[];
  lockedEmployee: EmployeeRecord | null;
  onDone: () => void;
  onAdd: (r: {
    employeeId: string;
    type: DisciplinaryType;
    violationCategory?: string;
    date: string;
    details: string;
    attachments: UploadedFile[];
  }) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [employeeId, setEmployeeId] = useState(lockedEmployee?.id ?? "");
  const [type, setType] = useState<DisciplinaryType | "">("");
  const [violationCategory, setViolationCategory] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId || !type || !date) return;
    setError("");
    try {
      await onAdd({
        employeeId,
        type,
        violationCategory: violationCategory || undefined,
        date,
        details,
        attachments,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brand-grayDark">
        {t.hse.disciplinary.addTitle}
      </h3>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">{t.hse.disciplinary.employee} *</label>
          <select
            required
            value={employeeId}
            disabled={!!lockedEmployee}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="input-field disabled:bg-brand-grayLight disabled:text-brand-gray"
          >
            <option value="" disabled>
              {t.hse.disciplinary.employee}
            </option>
            {scopeEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">{t.hse.disciplinary.type} *</label>
          <select
            required
            value={type}
            onChange={(e) => setType(e.target.value as DisciplinaryType)}
            className="input-field"
          >
            <option value="" disabled>
              {t.hse.disciplinary.type}
            </option>
            {DISCIPLINARY_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">{t.hse.disciplinary.violationCategory}</label>
          <select
            value={violationCategory}
            onChange={(e) => setViolationCategory(e.target.value)}
            className="input-field"
          >
            <option value="">—</option>
            {VIOLATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">{t.hse.date} *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="label-field">{t.hse.details}</label>
        <textarea
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="input-field resize-none"
        />
      </div>
      <FileUpload
        label={t.hse.attachments}
        files={attachments}
        onChange={setAttachments}
      />
      <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
        <button type="button" onClick={onDone} className="btn-secondary">
          {t.hse.cancel}
        </button>
        <button type="submit" className="btn-primary">
          {t.hse.submit}
        </button>
      </div>
    </form>
  );
}
