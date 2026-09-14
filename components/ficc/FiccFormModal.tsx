"use client";

/**
 * "Add FICC" form modal — collects the fields the user asked for (Incident
 * Type, Project, Location, Date, Time, Description, Project Director,
 * Project Manager, Construction Manager, Site Person In Charge,
 * Investigation commenced) and creates the incidents row via
 * IncidentsContext.submitFicc(), which also starts the 48h IIR window and
 * fires the deadline-notice email. Same portal-modal shell as
 * components/pmv/PmvLogFormModal.tsx (see that file's comment for why a
 * portal is required here).
 */

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PROJECTS } from "@/lib/mockData";
import EmployeeTextAutocomplete from "@/components/EmployeeTextAutocomplete";
import type { FiccInput } from "@/types/incident";

const INCIDENT_TYPE_OPTIONS = [
  "LSR Violation",
  "Near Miss",
  "Significant Near Miss",
  "First Aid Case",
  "Medical Treatment Case",
  "Restricted Work Case",
  "Recordable Injury",
  "Property Damage",
  "Dangerous Occurrence",
  "Road Traffic Accident",
  "Fire",
  "Environmental",
  "Non-Occupational Illness",
  "Altercation",
  "Other",
];

interface FiccFormModalProps {
  onClose: () => void;
  onSubmit: (values: FiccInput) => Promise<void>;
}

export default function FiccFormModal({ onClose, onSubmit }: FiccFormModalProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [values, setValues] = useState<FiccInput>({
    incidentCategory: "",
    projectName: "",
    incidentLocation: "",
    incidentDate: "",
    incidentTime: "",
    incidentDescription: "",
    projectDirector: "",
    projectManager: "",
    constructionManager: "",
    spic: "",
    investigationCommenced: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof FiccInput>(key: K, value: FiccInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await onSubmit(values);
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
        className="card !bg-brand-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-brand-black">{t.ficc.addFiccTitle}</h2>
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
              <label className="label-field">{t.ficc.incidentType}</label>
              <select
                required
                value={values.incidentCategory}
                onChange={(e) => update("incidentCategory", e.target.value)}
                className="input-field"
              >
                <option value="">{t.common.select}</option>
                {INCIDENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">{t.ficc.project}</label>
              <select
                required
                value={values.projectName}
                onChange={(e) => update("projectName", e.target.value)}
                className="input-field"
              >
                <option value="">{t.common.select}</option>
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">{t.ficc.location}</label>
              <input
                required
                type="text"
                value={values.incidentLocation}
                onChange={(e) => update("incidentLocation", e.target.value)}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">{t.ficc.date}</label>
                <input
                  required
                  type="date"
                  value={values.incidentDate}
                  onChange={(e) => update("incidentDate", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">{t.ficc.time}</label>
                <input
                  required
                  type="time"
                  value={values.incidentTime}
                  onChange={(e) => update("incidentTime", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label-field">{t.ficc.description}</label>
            <textarea
              required
              rows={4}
              value={values.incidentDescription}
              onChange={(e) => update("incidentDescription", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-field">{t.ficc.projectDirector}</label>
              <EmployeeTextAutocomplete
                value={values.projectDirector}
                onChange={(v) => update("projectDirector", v)}
              />
            </div>
            <div>
              <label className="label-field">{t.ficc.projectManager}</label>
              <EmployeeTextAutocomplete
                value={values.projectManager}
                onChange={(v) => update("projectManager", v)}
              />
            </div>
            <div>
              <label className="label-field">{t.ficc.constructionManager}</label>
              <EmployeeTextAutocomplete
                value={values.constructionManager}
                onChange={(v) => update("constructionManager", v)}
              />
            </div>
            <div>
              <label className="label-field">{t.ficc.spic}</label>
              <EmployeeTextAutocomplete
                value={values.spic}
                onChange={(v) => update("spic", v)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-brand-grayDark">
            <input
              type="checkbox"
              checked={values.investigationCommenced}
              onChange={(e) => update("investigationCommenced", e.target.checked)}
              className="h-4 w-4 rounded border-brand-border"
            />
            {t.ficc.investigationCommenced}
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? t.ficc.submitting : t.ficc.submitFicc}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
