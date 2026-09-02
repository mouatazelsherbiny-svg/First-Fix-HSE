"use client";

import { FormEvent, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeSearch from "@/components/hsePassport/EmployeeSearch";
import FileUpload from "@/components/FileUpload";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { EmployeeRecord, PPE_TYPES, PPE_CONDITIONS } from "@/lib/mockData";
import { PPECondition, PPERecord } from "@/types/hsePassport";
import { UploadedFile } from "@/types/toolboxTalk";

export default function PpePage() {
  return (
    <ProtectedRoute>
      <PpeContent />
    </ProtectedRoute>
  );
}

function PpeContent() {
  const { t } = useLanguage();
  const { ppeRecords, addPPERecord } = useHsePassport();
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const employeeRecords = employee
    ? ppeRecords.filter((r) => r.employeeId === employee.id)
    : [];

  // Latest record per PPE type
  const latestByType = new Map<string, (typeof employeeRecords)[number]>();
  employeeRecords.forEach((r) => {
    const existing = latestByType.get(r.ppeType);
    if (!existing || r.createdAt > existing.createdAt) {
      latestByType.set(r.ppeType, r);
    }
  });

  const totalIssued = PPE_TYPES.filter((tp) => latestByType.get(tp)?.received).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.hse.ppe.title}</h1>
      </div>

      <div className="mb-6">
        <EmployeeSearch selected={employee} onSelect={setEmployee} />
      </div>

      {!employee ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.hse.emptyState}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-black">{employee.name}</h2>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="btn-primary"
            >
              {t.hse.addBtn}
            </button>
          </div>

          <div className="card overflow-x-auto !p-0">
            <table className="w-full min-w-[820px] text-start text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  <th className="px-4 py-3 text-start sm:px-6">{t.hse.ppe.description}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.hse.ppe.received}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.hse.ppe.dateReceived}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.hse.ppe.replacementDue}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.hse.ppe.condition}</th>
                  <th className="px-4 py-3 text-start sm:px-6">{t.hse.ppe.remarks}</th>
                </tr>
              </thead>
              <tbody>
                {PPE_TYPES.map((tp) => {
                  const r = latestByType.get(tp);
                  return (
                    <tr key={tp} className="border-b border-brand-border last:border-0">
                      <td className="px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orangeLight text-brand-orange">
                            <PpeIcon type={tp} />
                          </span>
                          <span className="font-medium text-brand-black">{tp}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <input
                          type="checkbox"
                          checked={!!r?.received}
                          disabled
                          className="h-4 w-4 rounded border-brand-border text-brand-orange"
                        />
                      </td>
                      <td className="px-4 py-3 text-brand-grayDark sm:px-6">
                        {r?.dateReceived || "—"}
                      </td>
                      <td className="px-4 py-3 text-brand-grayDark sm:px-6">
                        {r?.replacementDueDate || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <Badge value={r?.conditionAtReturn ?? "N/A"} />
                      </td>
                      <td className="px-4 py-3 text-brand-grayDark sm:px-6">
                        {r?.remarks || "—"}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-brand-grayLight/40">
                  <td className="px-4 py-3 font-bold text-brand-black sm:px-6" colSpan={5}>
                    {t.hse.ppe.total}
                  </td>
                  <td className="px-4 py-3 font-bold text-brand-orange sm:px-6">
                    {totalIssued} / {PPE_TYPES.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {showAddForm && (
            <AddPpeForm
              employeeId={employee.id}
              latestByType={latestByType}
              onDone={() => setShowAddForm(false)}
              onAdd={addPPERecord}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PpeIcon({ type }: { type: string }) {
  if (type === "Helmet") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M4 14a8 8 0 0116 0v1H4v-1z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 15h20M12 6v3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type.startsWith("Safety Glasses")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <circle cx="6.5" cy="13" r="3.5" />
        <circle cx="17.5" cy="13" r="3.5" />
        <path d="M10 12h4M3 12l1-3M21 12l-1-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "Hi-Visibility Vest") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M7 4l5 3 5-3 2 4-3 2v10H8V10L5 8l2-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "Gloves") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M7 11V5a1.5 1.5 0 013 0v4M10 9V4a1.5 1.5 0 013 0v5M13 9V5a1.5 1.5 0 013 0v6M16 12V8a1.5 1.5 0 013 0v6a6 6 0 01-6 6H9a4 4 0 01-4-4v-4l2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 17c0-2 2-3 4-3h1l2-4 2 4h1c2 0 4 1 4 3v2H4v-2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface PpeRowState {
  received: boolean;
  dateReceived: string;
  replacementDueDate: string;
  conditionAtReturn: PPECondition;
  remarks: string;
}

function AddPpeForm({
  employeeId,
  latestByType,
  onDone,
  onAdd,
}: {
  employeeId: string;
  latestByType: Map<string, PPERecord>;
  onDone: () => void;
  onAdd: (r: {
    employeeId: string;
    ppeType: string;
    received: boolean;
    dateReceived: string;
    replacementDueDate: string;
    conditionAtReturn: PPECondition;
    remarks: string;
    attachments: UploadedFile[];
  }) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [rows, setRows] = useState<Record<string, PpeRowState>>(() =>
    Object.fromEntries(
      PPE_TYPES.map((tp) => {
        const existing = latestByType.get(tp);
        return [
          tp,
          {
            received: existing?.received ?? false,
            dateReceived: existing?.dateReceived ?? "",
            replacementDueDate: existing?.replacementDueDate ?? "",
            conditionAtReturn: existing?.conditionAtReturn ?? "N/A",
            remarks: existing?.remarks ?? "",
          },
        ];
      })
    )
  );
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");

  const updateRow = (tp: string, patch: Partial<PpeRowState>) =>
    setRows((prev) => ({ ...prev, [tp]: { ...prev[tp], ...patch } }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await Promise.all(
        PPE_TYPES.map((tp) => {
          const row = rows[tp];
          return onAdd({ employeeId, ppeType: tp, ...row, attachments });
        })
      );
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brand-grayDark">
        {t.hse.ppe.addTitle}
      </h3>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border text-xs font-semibold uppercase tracking-wide text-brand-gray">
              <th className="px-2 py-2 text-start">{t.hse.ppe.description}</th>
              <th className="px-2 py-2 text-start">{t.hse.ppe.received}</th>
              <th className="px-2 py-2 text-start">{t.hse.ppe.dateReceived}</th>
              <th className="px-2 py-2 text-start">{t.hse.ppe.replacementDue}</th>
              <th className="px-2 py-2 text-start">{t.hse.ppe.condition}</th>
              <th className="px-2 py-2 text-start">{t.hse.ppe.remarks}</th>
            </tr>
          </thead>
          <tbody>
            {PPE_TYPES.map((tp) => {
              const row = rows[tp];
              return (
                <tr key={tp} className="border-b border-brand-border last:border-0">
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orangeLight text-brand-orange">
                        <PpeIcon type={tp} />
                      </span>
                      <span className="font-medium text-brand-black">{tp}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <input
                      type="checkbox"
                      checked={row.received}
                      onChange={(e) => updateRow(tp, { received: e.target.checked })}
                      className="h-4 w-4 rounded border-brand-border text-brand-orange focus:ring-brand-orange/40"
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <input
                      type="date"
                      value={row.dateReceived}
                      onChange={(e) => updateRow(tp, { dateReceived: e.target.value })}
                      className="input-field !py-1.5"
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <input
                      type="date"
                      value={row.replacementDueDate}
                      onChange={(e) =>
                        updateRow(tp, { replacementDueDate: e.target.value })
                      }
                      className="input-field !py-1.5"
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <select
                      value={row.conditionAtReturn}
                      onChange={(e) =>
                        updateRow(tp, { conditionAtReturn: e.target.value as PPECondition })
                      }
                      className="input-field !py-1.5"
                    >
                      {PPE_CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2.5">
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => updateRow(tp, { remarks: e.target.value })}
                      className="input-field !py-1.5"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
