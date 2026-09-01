"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
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

export default function NewObservationPage() {
  return (
    <ProtectedRoute>
      <NewObservationForm />
    </ProtectedRoute>
  );
}

function NewObservationForm() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addObservation } = useObservations();
  const router = useRouter();

  const inspectedBy = user ? `${user.name} (${user.employeeCode})` : "";

  const [projectName, setProjectName] = useState("");
  const [observationType, setObservationType] = useState("");
  const [observationTypeOther, setObservationTypeOther] = useState("");
  const [observationDetails, setObservationDetails] = useState("");
  const [classification, setClassification] = useState("");
  const [riskRating, setRiskRating] = useState("");
  const [observationPhotos, setObservationPhotos] = useState<string[]>([]);
  const [closeOutPhotos, setCloseOutPhotos] = useState<string[]>([]);
  const [closeOutDetails, setCloseOutDetails] = useState("");
  const [status, setStatus] = useState<ObservationStatus | "">("");
  const [success, setSuccess] = useState(false);
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
      setTimeout(() => router.push("/observations"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.form.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.form.subtitle}</p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t.form.success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
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

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={() => router.push("/observations")}
            className="btn-secondary"
          >
            {t.form.cancel}
          </button>
          <button type="submit" className="btn-primary">
            {t.form.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
