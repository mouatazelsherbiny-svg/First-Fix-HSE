"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PhotoSection, useLinkedObservationPhotos } from "@/components/observations/ObservationPhotos";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import PageTitle from "@/components/PageTitle";

export default function ObservationDetailPage() {
  return (
    <ProtectedRoute>
      <ObservationDetail />
    </ProtectedRoute>
  );
}

function ObservationDetail() {
  const { t, locale } = useLanguage();
  const params = useParams<{ id: string }>();
  const { getById, updateObservation } = useObservations();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const observation = getById(params.id);
  const linkedPhotos = useLinkedObservationPhotos(observation?.id);

  const handleCancelObservation = async () => {
    if (!observation) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await updateObservation(observation.id, { status: "Cancelled" });
      setCancelOpen(false);
    } catch {
      setCancelError(t.detail.cancelError);
    } finally {
      setIsCancelling(false);
    }
  };

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

  const dateStr = new Date(observation.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div>
      <Link
        href="/observations"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.detail.back}
      </Link>

      <PageTitle section="Observations" title={`${t.detail.title} #${observation.reportNumber}`}>
        <span className="text-sm text-white/60">
          {t.detail.reportedOn} {dateStr}
        </span>
        <div className="flex items-center gap-2">
          <Badge value={observation.riskRating} />
          <Badge value={observation.status} />
          <Link href={`/observations/${observation.id}/edit`} className="btn-primary">
            {t.list.edit}
          </Link>
          {observation.status !== "Cancelled" && (
            <button type="button" onClick={() => setCancelOpen(true)} className="btn-secondary">
              {t.detail.cancelBtn}
            </button>
          )}
        </div>
      </PageTitle>

      <div className="card mb-5 space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={t.form.projectName} value={observation.projectName} />
          <div>
            <dt className="mb-1 text-xs font-medium tracking-wide text-brand-gray">
              {t.form.observationType}
            </dt>
            <dd>
              <Badge
                value={observation.observationType}
                label={
                  observation.observationType === "Others"
                    ? observation.observationTypeOther || t.form.other
                    : observation.observationType
                }
              />
            </dd>
          </div>
          <Field label={t.form.classification} value={observation.classification} />
          <Field label={t.form.inspectedBy} value={observation.inspectedBy} />
        </dl>

        <div>
          <p className="label-field">{t.form.observationDetails}</p>
          <p className="whitespace-pre-wrap rounded-xl bg-brand-grayLight/50 px-4 py-3 text-sm text-brand-grayDark">
            {observation.observationDetails}
          </p>
        </div>

        <PhotoSection
          label={t.form.observationPhoto}
          urls={[...observation.observationPhotos, ...linkedPhotos.observation.map((p) => p.src)]}
          altPrefix="obs"
        />
      </div>

      <div className="card space-y-5">
        <h2 className="text-base font-semibold text-brand-black">
          {t.detail.updateStatus}
        </h2>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={t.form.status} value={observation.status} />
        </dl>

        {observation.closeOutDetails && (
          <div>
            <p className="label-field">{t.form.closeOutDetails}</p>
            <p className="whitespace-pre-wrap rounded-xl bg-brand-grayLight/50 px-4 py-3 text-sm text-brand-grayDark">
              {observation.closeOutDetails}
            </p>
          </div>
        )}

        <PhotoSection
          label={t.form.closeOutPhoto}
          urls={[...observation.closeOutPhotos, ...linkedPhotos.closeOut.map((p) => p.src)]}
          altPrefix="close-out"
        />
      </div>

      {cancelOpen && (
        <ConfirmDialog
          title={t.detail.cancelConfirmTitle}
          message={t.detail.cancelConfirmMessage}
          confirmLabel={isCancelling ? t.detail.cancelling : t.detail.cancelConfirmConfirm}
          cancelLabel={t.common.close}
          isBusy={isCancelling}
          error={cancelError}
          onConfirm={handleCancelObservation}
          onClose={() => {
            setCancelError("");
            setCancelOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium tracking-wide text-brand-gray">
        {label}
      </dt>
      <dd className="text-sm font-medium text-brand-black">{value}</dd>
    </div>
  );
}
