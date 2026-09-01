"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import Badge from "@/components/Badge";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePermits } from "@/context/PermitContext";
import { PERMIT_STATUSES } from "@/lib/mockData";
import { PermitStatus } from "@/types/permit";

export default function PermitDetailPage() {
  return (
    <ProtectedRoute>
      <PermitDetail />
    </ProtectedRoute>
  );
}

function PermitDetail() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, updatePermit } = usePermits();

  const permit = getById(params.id);

  const [status, setStatus] = useState<PermitStatus>("Pending Approval");
  const [closeOutDetails, setCloseOutDetails] = useState("");
  const [closeOutPhotos, setCloseOutPhotos] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (permit) {
      setStatus(permit.status);
      setCloseOutDetails(permit.closeOutDetails);
      setCloseOutPhotos(permit.closeOutPhotos);
    }
  }, [permit]);

  if (!permit) {
    return (
      <div className="card text-center">
        <p className="text-sm text-brand-gray">Permit not found.</p>
        <Link href="/permit-to-work" className="btn-primary mt-4 inline-flex">
          {t.ptw.back}
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    setError("");
    const becameApproved = status === "Approved" && !permit.approvedBy;
    try {
      await updatePermit(permit.id, {
        status,
        closeOutDetails,
        closeOutPhotos,
        ...(becameApproved && user
          ? { approvedBy: `${user.name} (${user.employeeCode})` }
          : {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  const dateStr = new Date(permit.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/permit-to-work"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.ptw.back}
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            {t.ptw.detailTitle} #{permit.permitNumber}
          </h1>
          <p className="mt-1 text-sm text-brand-gray">
            {t.ptw.requestedOn} {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            value={permit.permitType}
            label={permit.permitType === "Other" ? permit.permitTypeOther || t.ptw.other : permit.permitType}
          />
          <Badge value={permit.status} />
        </div>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t.ptw.saved}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="card mb-5 space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={t.ptw.projectName} value={permit.projectName} />
          <Field label={t.ptw.workLocation} value={permit.workLocation} />
          <Field label={t.ptw.contractor} value={permit.contractor} />
          <Field label={t.ptw.numberOfWorkers} value={String(permit.numberOfWorkers)} />
          <Field label={t.ptw.requestedBy} value={permit.requestedBy} />
          <Field label={t.ptw.approvedBy} value={permit.approvedBy || t.ptw.notApprovedYet} />
          <Field
            label={t.ptw.startDate}
            value={`${permit.startDate} ${permit.startTime}`}
          />
          <Field label={t.ptw.endDate} value={`${permit.endDate} ${permit.endTime}`} />
        </dl>

        <div>
          <p className="label-field">{t.ptw.workDescription}</p>
          <p className="whitespace-pre-wrap rounded-xl bg-brand-grayLight/50 px-4 py-3 text-sm text-brand-grayDark">
            {permit.workDescription}
          </p>
        </div>

        {permit.hazardsIdentified.length > 0 && (
          <div>
            <p className="label-field">{t.ptw.hazardsIdentified}</p>
            <div className="flex flex-wrap gap-2">
              {permit.hazardsIdentified.map((h) => (
                <Badge key={h} value="Medium" label={h} />
              ))}
            </div>
          </div>
        )}

        {permit.ppeRequired.length > 0 && (
          <div>
            <p className="label-field">{t.ptw.ppeRequired}</p>
            <div className="flex flex-wrap gap-2">
              {permit.ppeRequired.map((p) => (
                <Badge key={p} value="Good" label={p} />
              ))}
            </div>
          </div>
        )}

        <Field
          label={t.ptw.isolationRequired}
          value={permit.isolationRequired ? t.ptw.isolationYes : t.ptw.isolationNo}
        />

        <div>
          <p className="label-field">{t.ptw.precautions}</p>
          <p className="whitespace-pre-wrap rounded-xl bg-brand-grayLight/50 px-4 py-3 text-sm text-brand-grayDark">
            {permit.precautions}
          </p>
        </div>

        {permit.permitPhotos.length > 0 && (
          <div>
            <p className="label-field">{t.ptw.permitPhoto}</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {permit.permitPhotos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`ptw-${i}`}
                  className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {permit.attachments.length > 0 && (
          <div>
            <p className="label-field">{t.ptw.attachments}</p>
            <ul className="space-y-1">
              {permit.attachments.map((f, i) => (
                <li key={i} className="text-sm font-medium text-brand-grayDark">
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card space-y-5">
        <h2 className="text-base font-semibold text-brand-black">
          {t.ptw.updateStatus}
        </h2>

        <div className="max-w-xs">
          <label className="label-field">{t.ptw.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PermitStatus)}
            className="input-field"
          >
            {PERMIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">{t.ptw.closeOutDetails}</label>
          <textarea
            rows={3}
            value={closeOutDetails}
            onChange={(e) => setCloseOutDetails(e.target.value)}
            placeholder={t.ptw.closeOutDetailsPlaceholder}
            className="input-field resize-none"
          />
        </div>

        <ImageUpload
          label={t.ptw.closeOutPhoto}
          images={closeOutPhotos}
          onChange={setCloseOutPhotos}
        />

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button onClick={handleSave} className="btn-primary">
            {t.ptw.save}
          </button>
        </div>
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
