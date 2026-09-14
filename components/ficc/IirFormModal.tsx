"use client";

/**
 * Full Incident Investigation Report (IIR) form, replicating FF-HSE-FOR-001.
 * Field config lives in lib/iirTemplate.ts (same pattern as the PMV Logs'
 * lib/pmvLogs.ts) so this component renders every section generically;
 * only the Corrective Actions grid, Attachments/Photos, and Sign-off block
 * are bespoke, since they don't fit the plain-field-list shape.
 *
 * One-shot submission, same as the FICC form: there is no draft/edit phase
 * (see lib/submitIir.ts) — fill in the form, submit once, done.
 */

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import { submitIir } from "@/lib/submitIir";
import ImageUpload from "@/components/ImageUpload";
import SignaturePad from "@/components/SignaturePad";
import {
  ATTACHMENT_OPTIONS,
  CORRECTIVE_ACTION_COLUMNS,
  IIR_SECTIONS,
  type IirField,
} from "@/lib/iirTemplate";
import type { CorrectiveActionDraft, IirValues } from "@/types/iir";
import type { Incident } from "@/types/incident";

interface IirFormModalProps {
  incident: Incident;
  onClose: () => void;
  onSubmitted: () => void;
}

function defaultValues(): IirValues {
  const values: IirValues = {};
  IIR_SECTIONS.forEach((section) => {
    if (section.naKey) values[section.naKey] = false;
    section.fields.forEach((f) => {
      values[f.key] = f.type === "multiselect" ? [] : f.type === "checkbox" ? false : "";
    });
  });
  return values;
}

const EMPTY_ACTION: CorrectiveActionDraft = {
  action: "",
  hierarchyOfControl: "",
  responsiblePerson: "",
  dueDate: "",
  completedDate: "",
};

export default function IirFormModal({ incident, onClose, onSubmitted }: IirFormModalProps) {
  const { t, locale } = useLanguage();
  const { markIirSubmitted } = useIncidents();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [values, setValues] = useState<IirValues>(defaultValues);
  const [actions, setActions] = useState<CorrectiveActionDraft[]>([{ ...EMPTY_ACTION }]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentOther, setAttachmentOther] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [hseSignature, setHseSignature] = useState("");
  const [pmSignature, setPmSignature] = useState("");
  const [hseName, setHseName] = useState("");
  const [hseDate, setHseDate] = useState("");
  const [pmName, setPmName] = useState("");
  const [pmDate, setPmDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const setValue = (key: string, v: unknown) => setValues((prev) => ({ ...prev, [key]: v }));

  const toggleMultiselect = (key: string, option: string) => {
    setValues((prev) => {
      const current: string[] = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [key]: next };
    });
  };

  const updateAction = (index: number, key: keyof CorrectiveActionDraft, v: string) => {
    setActions((prev) => prev.map((a, i) => (i === index ? { ...a, [key]: v } : a)));
  };

  const toggleAttachment = (key: string) => {
    setAttachments((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderField = (field: IirField, disabled: boolean) => {
    const label = locale === "ar" ? field.ar : field.en;
    const wideClass = field.wide ? "sm:col-span-2" : "";

    if (field.type === "checkbox") {
      return (
        <label key={field.key} className={`flex items-center gap-2.5 text-sm font-medium text-brand-grayDark ${wideClass}`}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={!!values[field.key]}
            onChange={(e) => setValue(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-brand-border"
          />
          {label}
        </label>
      );
    }

    if (field.type === "multiselect") {
      return (
        <div key={field.key} className={wideClass}>
          <label className="label-field">{label}</label>
          <div className="flex flex-wrap gap-2">
            {(field.options ?? []).map((opt) => {
              const selected = Array.isArray(values[field.key]) && values[field.key].includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  disabled={disabled}
                  onClick={() => toggleMultiselect(field.key, opt)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-brand-orange bg-brand-orangeLight text-brand-orange"
                      : "border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
                  } disabled:opacity-40`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className={wideClass}>
          <label className="label-field">{label}</label>
          <select
            disabled={disabled}
            value={values[field.key] ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            className="input-field"
          >
            <option value="">{t.common.select}</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key} className={wideClass}>
          <label className="label-field">{label}</label>
          <textarea
            disabled={disabled}
            rows={3}
            value={values[field.key] ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            className="input-field"
          />
        </div>
      );
    }

    return (
      <div key={field.key} className={wideClass}>
        <label className="label-field">{label}</label>
        <input
          type={field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
          disabled={disabled}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          className="input-field"
        />
      </div>
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const payload: IirValues = { ...values };
      payload.attachments = attachments;
      payload.attachment_other = attachmentOther || null;
      payload.photo_urls = photos;
      payload.signoff_hse_name = hseName || null;
      payload.signoff_hse_date = hseDate || null;
      payload.signoff_hse_signature = hseSignature || null;
      payload.signoff_pm_name = pmName || null;
      payload.signoff_pm_date = pmDate || null;
      payload.signoff_pm_signature = pmSignature || null;

      await submitIir(incident.id, payload, actions);
      await markIirSubmitted(incident.id);
      onSubmitted();
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
        className="card !bg-brand-surface max-h-[90vh] w-full max-w-5xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-black">{t.ficc.iirFormTitle}</h2>
            <p className="mt-1 text-sm text-brand-gray">
              {t.ficc.reportNumberLabel}: <span className="font-semibold">{incident.incidentNumber}</span>
              {" · "}
              {incident.projectName}
            </p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {IIR_SECTIONS.map((section) => {
            const naChecked = section.naKey ? !!values[section.naKey] : false;
            return (
              <div key={section.key} className="border-t border-brand-border pt-6 first:border-0 first:pt-0">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-brand-black">
                    {locale === "ar" ? section.titleAr : section.titleEn}
                  </h3>
                  {section.naKey && (
                    <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-brand-grayDark">
                      <input
                        type="checkbox"
                        checked={naChecked}
                        onChange={(e) => setValue(section.naKey!, e.target.checked)}
                        className="h-4 w-4 rounded border-brand-border"
                      />
                      {t.ficc.notApplicable}
                    </label>
                  )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.fields.map((f) => renderField(f, naChecked))}
                </div>
              </div>
            );
          })}

          {/* Corrective Actions */}
          <div className="border-t border-brand-border pt-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-brand-black">{t.ficc.correctiveActionsTitle}</h3>
              <button
                type="button"
                onClick={() => setActions((prev) => [...prev, { ...EMPTY_ACTION }])}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline"
              >
                <Plus className="h-4 w-4" />
                {t.ficc.addAction}
              </button>
            </div>
            <div className="space-y-4">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-brand-border p-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                  {CORRECTIVE_ACTION_COLUMNS.map((col) => {
                    const label = locale === "ar" ? col.ar : col.en;
                    const key = (
                      { action: "action", hierarchy_of_control: "hierarchyOfControl", responsible_person: "responsiblePerson", due_date: "dueDate", completed_date: "completedDate" } as const
                    )[col.key] as keyof CorrectiveActionDraft;
                    return (
                      <div key={col.key}>
                        <label className="label-field">{label}</label>
                        {col.type === "select" ? (
                          <select
                            value={action[key]}
                            onChange={(e) => updateAction(index, key, e.target.value)}
                            className="input-field"
                          >
                            <option value="">{t.common.select}</option>
                            {(col.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type === "date" ? "date" : "text"}
                            value={action[key]}
                            onChange={(e) => updateAction(index, key, e.target.value)}
                            className="input-field"
                          />
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setActions((prev) => prev.filter((_, i) => i !== index))}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t.ficc.removeAction}
                    </button>
                  </div>
                </div>
              ))}
              {actions.length === 0 && (
                <p className="text-sm text-brand-gray">{t.ficc.noActions}</p>
              )}
            </div>
          </div>

          {/* Attachments & Photos */}
          <div className="border-t border-brand-border pt-6">
            <h3 className="mb-4 text-base font-bold text-brand-black">{t.ficc.attachmentsTitle}</h3>
            <div className="mb-5 flex flex-wrap gap-2">
              {ATTACHMENT_OPTIONS.map((opt) => {
                const selected = attachments.includes(opt.key);
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => toggleAttachment(opt.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-brand-orange bg-brand-orangeLight text-brand-orange"
                        : "border-brand-border bg-brand-surface/60 text-brand-grayDark hover:bg-brand-grayLight/60"
                    }`}
                  >
                    {locale === "ar" ? opt.ar : opt.en}
                  </button>
                );
              })}
            </div>
            {attachments.includes("other") && (
              <input
                type="text"
                value={attachmentOther}
                onChange={(e) => setAttachmentOther(e.target.value)}
                placeholder={locale === "ar" ? "أخرى - وضّح" : "Other — specify"}
                className="input-field mb-5"
              />
            )}
            <ImageUpload
              label={t.ficc.photosTitle}
              images={photos}
              onChange={setPhotos}
            />
          </div>

          {/* Sign-Off */}
          <div className="border-t border-brand-border pt-6">
            <h3 className="mb-4 text-base font-bold text-brand-black">{t.ficc.signOffTitle}</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-brand-grayDark">{t.ficc.hseSignOff}</p>
                <div>
                  <label className="label-field">{t.ficc.signOffName}</label>
                  <input
                    type="text"
                    value={hseName}
                    onChange={(e) => setHseName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">{t.ficc.signOffDate}</label>
                  <input
                    type="date"
                    value={hseDate}
                    onChange={(e) => setHseDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <SignaturePad label={t.ficc.hseSignOff} value={hseSignature} onChange={setHseSignature} />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-brand-grayDark">{t.ficc.pmSignOff}</p>
                <div>
                  <label className="label-field">{t.ficc.signOffName}</label>
                  <input
                    type="text"
                    value={pmName}
                    onChange={(e) => setPmName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">{t.ficc.signOffDate}</label>
                  <input
                    type="date"
                    value={pmDate}
                    onChange={(e) => setPmDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <SignaturePad label={t.ficc.pmSignOff} value={pmSignature} onChange={setPmSignature} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? t.ficc.submitting : t.ficc.submitIir}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
