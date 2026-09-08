"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";

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
  const { getById } = useObservations();

  const observation = getById(params.id);

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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            {t.detail.title} #{observation.reportNumber}
          </h1>
          <p className="mt-1 text-sm text-brand-gray">
            {t.detail.reportedOn} {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={observation.riskRating} />
          <Badge value={observation.status} />
          <Link href={`/observations/${observation.id}/edit`} className="btn-primary">
            {t.list.edit}
          </Link>
        </div>
      </div>

      <div className="card mb-5 space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={t.form.projectName} value={observation.projectName} />
          <div>
            <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-gray">
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

        {observation.observationPhotos.length > 0 && (
          <div>
            <p className="label-field">{t.form.observationPhoto}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {observation.observationPhotos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`obs-${i}`}
                  className="aspect-square w-full rounded-lg border border-brand-border object-cover"
                />
              ))}
            </div>
          </div>
        )}
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

        {observation.closeOutPhotos.length > 0 && (
          <div>
            <p className="label-field">{t.form.closeOutPhoto}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {observation.closeOutPhotos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`close-out-${i}`}
                  className="aspect-square w-full rounded-lg border border-brand-border object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-gray">
        {label}
      </dt>
      <dd className="text-sm font-medium text-brand-black">{value}</dd>
    </div>
  );
}
