"use client";

/**
 * Generic table + toolbar for a single PMV Log, entirely driven by a
 * PmvLogDefinition (lib/pmvLogs.ts) — one component renders all 11 logs, no
 * per-log bespoke markup. Manages its own add/edit modal state.
 */

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { PmvLogDefinition, PmvLogColumn } from "@/lib/pmvLogs";
import { usePmvLogRecords, type PmvLogRow } from "@/lib/usePmvLogRecords";
import PmvLogFormModal from "./PmvLogFormModal";

export default function PmvLogTable({
  definition,
}: {
  definition: PmvLogDefinition;
}) {
  const { t, locale } = useLanguage();
  const { rows, isLoading, error, addRow, updateRow } = usePmvLogRecords(
    definition.table
  );
  // undefined = modal closed, null = add new, a row = editing that row
  const [modalRow, setModalRow] = useState<PmvLogRow | null | undefined>(
    undefined
  );

  const formatValue = (col: PmvLogColumn, raw: unknown) => {
    if (raw === null || raw === undefined || raw === "") return "—";
    if (col.type === "date") {
      const d = new Date(String(raw));
      if (Number.isNaN(d.getTime())) return String(raw);
      return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    if (col.type === "number") {
      const n = Number(raw);
      return Number.isNaN(n) ? String(raw) : n.toLocaleString();
    }
    return String(raw);
  };

  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
        <div>
          <h2 className="text-lg font-bold text-brand-black">
            {locale === "ar" ? definition.titleAr : definition.titleEn}
          </h2>
          <p className="mt-1 text-sm text-brand-gray">
            {locale === "ar" ? definition.purposeAr : definition.purposeEn}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalRow(null)}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.common.addRecord}
        </button>
      </div>

      {error && (
        <div className="mx-6 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
              <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">
                {t.pmv.projectName}
              </th>
              {definition.columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-start sm:px-6"
                >
                  {locale === "ar" ? col.ar : col.en}
                </th>
              ))}
              <th className="whitespace-nowrap px-4 py-3 text-end sm:px-6">
                {t.common.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={definition.columns.length + 2}
                  className="px-6 py-8 text-center text-brand-gray"
                >
                  {t.common.loading}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={definition.columns.length + 2}
                  className="px-6 py-8 text-center text-brand-gray"
                >
                  {t.common.noDataYet}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {row.project_name ?? "—"}
                  </td>
                  {definition.columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6"
                    >
                      {formatValue(col, row[col.key])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-end sm:px-6">
                    <button
                      type="button"
                      onClick={() => setModalRow(row)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t.common.edit}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalRow !== undefined && (
        <PmvLogFormModal
          definition={definition}
          initial={modalRow}
          onClose={() => setModalRow(undefined)}
          onSubmit={async (values) => {
            if (modalRow) {
              await updateRow(modalRow.id, values);
            } else {
              await addRow(values);
            }
          }}
        />
      )}
    </div>
  );
}
