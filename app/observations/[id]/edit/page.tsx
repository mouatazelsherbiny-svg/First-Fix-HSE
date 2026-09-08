"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { STATUSES } from "@/lib/mockData";
import { ObservationStatus } from "@/types/observation";

export default function ObservationEditPage() {
  return (
    <ProtectedRoute>
      <ObservationEdit />
    </ProtectedRoute>
  );
}

function ObservationEdit() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, updateObservation } = useObservations();

  const observation = getById(params.id);

  const [status, setStatus] = useState<ObservationStatus>("Open");
  const [closeOutDetails, setCloseOutDetails] = useState("");
  const [closeOutPhotos, setCloseOutPhotos] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (observation) {
      setStatus(observation.status);
      setCloseOutDetails(observation.closeOutDetails);
      setCloseOutPhotos(observation.closeOutPhotos);
    }
  }, [observation]);

  if (!observation) {
    return (
      <div className="card text-center">
        <p className="text-sm text-brand-gray">Observation not found.</p>
        <Link href="/observations" className="btn-primary mt-4 inline-flex">
          {t.detail.back}
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setError("");
    try {
      await updateObservation(observation.id, {
        status,
        closeOutDetails,
        closeOutPhotos,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push(`/observations/${observation.id}`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <div>
      <Link
        href={`/observations/${observation.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.detail.back}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.list.edit} — #{observation.reportNumber}
        </h1>
        <p className="mt-1 text-sm text-brand-gray">{observation.projectName}</p>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
          {t.detail.saved}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <div className="card space-y-5">
        <h2 className="text-base font-semibold text-brand-black">
          {t.detail.updateStatus}
        </h2>

        <div className="max-w-xs">
          <label className="label-field">{t.form.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ObservationStatus)}
            className="input-field"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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

        <ImageUpload
          label={t.form.closeOutPhoto}
          images={closeOutPhotos}
          onChange={setCloseOutPhotos}
        />

        <div className="flex justify-end border-t border-brand-border pt-5">
          <button onClick={handleSave} className="btn-primary">
            {t.detail.save}
          </button>
        </div>
      </div>
    </div>
  );
}
