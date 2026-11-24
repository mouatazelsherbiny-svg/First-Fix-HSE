"use client";

/**
 * The New Observation / Good Practice form. In the main app it opens as a
 * pop-up drawn like PMV → Asset Register's "Add Record" (modal): Reports →
 * Daily and /observations/new. The phone app shows it in the page (embedded).
 */

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import {
  PROJECTS,
  OBSERVATION_TYPES,
  CLASSIFICATIONS,
  RISK_RATINGS,
  STATUSES,
} from "@/lib/mockData";
import { ObservationStatus } from "@/types/observation";
import PageTitle from "@/components/PageTitle";

export default function ObservationForm({
  presetType = "",
  embedded = false,
  modal = false,
  onDone,
}: {
  /** Pop-up like PMV / Asset Register "Add Record" (closes with onDone). */
  modal?: boolean;
  /** "Good Practice" pre-fills type, classification and risk rating. */
  presetType?: string;
  /** Inside another page (Reports): smaller heading, stays on the page after saving. */
  embedded?: boolean;
  /** Called after a successful save (embedded) or on Cancel. */
  onDone?: () => void;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addObservation } = useObservations();
  const router = useRouter();

  const inspectedBy = user ? `${user.name} (${user.employeeCode})` : "";

  // Reached from the Observations list's dedicated "Good Practice" button
  // (?type=Good%20Practice) as a shortcut that pre-fills the type,
  // classification, and risk rating instead of leaving the user to pick
  // all three by hand — the fields stay fully editable either way.
  const isGoodPracticeShortcut = presetType === "Good Practice";

  const [projectName, setProjectName] = useState("");
  const [observationType, setObservationType] = useState(presetType);
  const [observationTypeOther, setObservationTypeOther] = useState("");
  const [observationDetails, setObservationDetails] = useState("");
  const [classification, setClassification] = useState(
    isGoodPracticeShortcut ? "Good Practice" : ""
  );
  const [riskRating, setRiskRating] = useState(
    isGoodPracticeShortcut ? "Good Practice" : ""
  );
  const [observationPhotos, setObservationPhotos] = useState<string[]>([]);
  const [closeOutPhotos, setCloseOutPhotos] = useState<string[]>([]);
  const [closeOutDetails, setCloseOutDetails] = useState("");
  const [status, setStatus] = useState<ObservationStatus | "">("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [error, setError] = useState("");

  const isOther = observationType === "Others";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await addObservation({
        projectName,
        observationType,
        observationTypeOther: isOther ? observationTypeOther : undefined,
        observationDetails,
        classification,
        riskRating,
        observationPhotos,
        closeOutPhotos,
        closeOutDetails,
        status: (status || "Open") as ObservationStatus,
        inspectedBy,
      });
      setSuccess(true);
      setTimeout(() => ((embedded || modal) && onDone ? onDone() : router.push(modal ? "/observations" : "/dashboard")), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  const formTitle = isGoodPracticeShortcut ? t.list.goodPracticeBtn.replace(/^\+\s*/, "") : t.form.title;
  const content = (
    <div>
      {!modal && (
      <div className="mb-6">
        {embedded ? (
          <h2 className="text-lg font-bold text-brand-black">{formTitle}</h2>
        ) : (
          <PageTitle section="Observations" title={t.form.title} className="!mb-0" />
        )}
        {embedded && <p className="mt-1 text-sm text-brand-gray">{t.form.subtitle}</p>}
      </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
          {t.form.success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={modal ? "space-y-5" : "card space-y-5"}>
        <div className={`grid gap-5 sm:grid-cols-2 ${modal ? "lg:grid-cols-3" : ""}`}>
          <div>
            <label className="label-field">{t.form.reportNumber}</label>
            <input
              type="text"
              value={t.common.autoAssigned}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>

          <div>
            <label className="label-field">{t.form.inspectedBy}</label>
            <input
              type="text"
              value={inspectedBy}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>

          <div>
            <label className="label-field">{t.form.projectName} *</label>
            <select
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.form.projectPlaceholder}
              </option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.form.observationType} *</label>
            <select
              required
              value={observationType}
              onChange={(e) => setObservationType(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.form.observationTypePlaceholder}
              </option>
              {OBSERVATION_TYPES.map((o) => (
                <option key={o} value={o}>
                  {o === "Others" ? t.form.other : o}
                </option>
              ))}
            </select>
          </div>

          {isOther && (
            <div className={modal ? "sm:col-span-2 lg:col-span-1" : "sm:col-span-2"}>
              <label className="label-field">{t.form.observationTypeOther} *</label>
              <input
                type="text"
                required
                value={observationTypeOther}
                onChange={(e) => setObservationTypeOther(e.target.value)}
                placeholder={t.form.observationTypeOtherPlaceholder}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="label-field">{t.form.classification} *</label>
            <select
              required
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.form.classificationPlaceholder}
              </option>
              {CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.form.riskRating} *</label>
            <select
              required
              value={riskRating}
              onChange={(e) => setRiskRating(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.form.riskRatingPlaceholder}
              </option>
              {RISK_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.form.status}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ObservationStatus)}
              className="input-field"
            >
              <option value="" disabled>
                {t.form.statusPlaceholder}
              </option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-field">{t.form.observationDetails} *</label>
          <textarea
            required
            rows={4}
            value={observationDetails}
            onChange={(e) => setObservationDetails(e.target.value)}
            placeholder={t.form.observationDetailsPlaceholder}
            className="input-field resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUpload
            label={t.form.observationPhoto}
            images={observationPhotos}
            onChange={setObservationPhotos}
          />
          <ImageUpload
            label={t.form.closeOutPhoto}
            images={closeOutPhotos}
            onChange={setCloseOutPhotos}
          />
        </div>

        <div>
          <label className="label-field">{t.form.closeOutDetails}</label>
          <textarea
            rows={3}
            value={closeOutDetails}
            onChange={(e) => setCloseOutDetails(e.target.value)}
            placeholder={t.form.closeOutDetailsPlaceholder}
            className="input-field resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
          <button
            type="button"
            onClick={() => (onDone ? onDone() : router.push("/observations"))}
            className="btn-secondary"
          >
            {t.form.cancel}
          </button>
          <button type="submit" className="btn-primary">
            {modal ? t.common.save : t.form.submit}
          </button>
        </div>
      </form>
    </div>
  );

  if (!modal) return content;
  if (!mounted) return null;
  const close = () => (onDone ? onDone() : router.push("/observations"));
  // Same pop-up as PMV → Asset Register "Add Record" (portal: see PmvLogFormModal).
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={close}>
      <div className="card !bg-brand-surface max-h-[90vh] w-full max-w-3xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-brand-black">
            {t.common.addRecord} — {formTitle}
          </h2>
          <button type="button" onClick={close} aria-label={t.common.close} className="shrink-0 text-brand-gray transition hover:text-brand-black">
            <X className="h-5 w-5" />
          </button>
        </div>
        {content}
      </div>
    </div>,
    document.body
  );
}
