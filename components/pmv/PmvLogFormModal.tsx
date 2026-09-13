"use client";

/**
 * Generic add/edit form modal for a PMV Log, entirely driven by a
 * PmvLogDefinition (lib/pmvLogs.ts) — one component serves all 11 logs.
 * `initial === null` means "add new"; a row means "edit that row".
 */

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PROJECTS } from "@/lib/mockData";
import type { PmvLogDefinition } from "@/lib/pmvLogs";
import type { PmvLogRow } from "@/lib/usePmvLogRecords";

interface PmvLogFormModalProps {
  definition: PmvLogDefinition;
  initial: PmvLogRow | null;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

export default function PmvLogFormModal({
  definition,
  initial,
  onClose,
  onSubmit,
}: PmvLogFormModalProps) {
  const { t, locale } = useLanguage();
  const isEdit = !!initial;

  // Rendered via a portal straight into <body> (below) rather than in place,
  // because this app's scroll-reveal effect (ScrollReveal.tsx) puts a
  // `transform` on every `.card` once it animates in — and any ancestor
  // with a non-"none" transform becomes a CSS containing block for
  // `position: fixed` descendants, which silently traps this modal inside
  // whichever `.card` it was opened from instead of covering the viewport.
  // A portal sidesteps that regardless of where the component is used.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [projectName, setProjectName] = useState(
    (initial?.project_name as string) ?? ""
  );
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    definition.columns.forEach((col) => {
      const raw = initial ? initial[col.key] : undefined;
      init[col.key] = raw === null || raw === undefined ? "" : String(raw);
    });
    return init;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const updateValue = (key: string, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        project_name: projectName || null,
      };
      definition.columns.forEach((col) => {
        const raw = values[col.key];
        if (raw === "" || raw === undefined) {
          payload[col.key] = null;
        } else if (col.type === "number") {
          const n = Number(raw);
          payload[col.key] = Number.isNaN(n) ? null : n;
        } else {
          payload[col.key] = raw;
        }
      });
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card !bg-brand-surface max-h-[90vh] w-full max-w-3xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-brand-black">
            {isEdit ? t.common.edit : t.common.addRecord} —{" "}
            {locale === "ar" ? definition.titleAr : definition.titleEn}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="shrink-0 text-brand-gray transition hover:text-brand-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-field">{t.pmv.projectName}</label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input-field"
              >
                <option value="">{t.pmv.projectPlaceholder}</option>
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {definition.columns.map((col) => {
              const label = locale === "ar" ? col.ar : col.en;
              if (col.type === "select") {
                return (
                  <div key={col.key}>
                    <label className="label-field">{label}</label>
                    <select
                      value={values[col.key]}
                      onChange={(e) => updateValue(col.key, e.target.value)}
                      className="input-field"
                    >
                      <option value="">{t.common.select}</option>
                      {(col.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <div key={col.key}>
                  <label className="label-field">{label}</label>
                  <input
                    type={
                      col.type === "number"
                        ? "number"
                        : col.type === "date"
                          ? "date"
                          : "text"
                    }
                    value={values[col.key]}
                    onChange={(e) => updateValue(col.key, e.target.value)}
                    className="input-field"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? t.common.saving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
