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
import { getPermitProgress } from "@/lib/permitProgress";
import PermitQrCode from "@/components/PermitQrCode";

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
  const [isClosing, setIsClosing] = useState(false);
  const [permitUrl, setPermitUrl] = useState("");

  useEffect(() => {
    if (permit) {
      setStatus(permit.status);
      setCloseOutDetails(permit.closeOutDetails);
      setCloseOutPhotos(permit.closeOutPhotos);
    }
  }, [permit]);

  // Computed after mount only (window is unavailable during server
  // rendering) so the QR always encodes this permit's real, current URL.
  useEffect(() => {
    if (permit && typeof window !== "undefined") {
      setPermitUrl(`${window.location.origin}/permit-to-work/${permit.id}`);
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
      setTimeout(() => {
        setSaved(false);
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  const handleClosePermit = async () => {
    setError("");
    setIsClosing(true);
    try {
      await updatePermit(permit.id, { permitStatus: "Closed" });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    } finally {
      setIsClosing(false);
    }
  };

  const dateStr = new Date(permit.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="mx-auto max-w-5xl">
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            value={permit.permitType}
            label={permit.permitType === "Other" ? permit.permitTypeOther || t.ptw.other : permit.permitType}
          />
          <Badge value={permit.status} />
          <Badge
            value={getPermitProgress(permit)}
            label={
              getPermitProgress(permit) === "New Permit"
                ? t.ptw.statusNewPermit
                : getPermitProgress(permit) === "In Progress"
                ? t.ptw.statusInProgress
                : t.ptw.statusClosed
            }
          />
        </div>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
          {t.ptw.saved}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <div className="card mb-5 space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t.ptw.projectName} value={permit.projectName} />
          <Field label={t.ptw.workLocation} value={permit.workLocation} />
          <Field label={t.ptw.contractor} value={permit.contractor} />
          <Field label={t.ptw.numberOfWorkers} value={String(permit.numberOfWorkers)} />
          <Field label={t.ptw.issuerBy} value={permit.requestedBy} />
          <Field label={t.ptw.receiver} value={permit.receiver || "—"} />
          <Field label={t.ptw.hseValidator} value={permit.hseValidator || "—"} />
          <Field label={t.ptw.supervisorForeman} value={permit.supervisorForeman || "—"} />
          <Field
            label={t.ptw.emergencyContactNumber}
            value={permit.emergencyContactNumber || "—"}
          />
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
                  className="aspect-square w-full rounded-lg border border-brand-border object-cover"
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

        {(permit.issuerSignature || permit.receiverSignature) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {permit.issuerSignature && (
              <div>
                <p className="label-field">{t.ptw.issuerSignature}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={permit.issuerSignature}
                  alt={t.ptw.issuerSignature}
                  className="h-24 w-full rounded-xl border border-brand-border bg-brand-surface object-contain"
                />
              </div>
            )}
            {permit.receiverSignature && (
              <div>
                <p className="label-field">{t.ptw.receiverSignature}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={permit.receiverSignature}
                  alt={t.ptw.receiverSignature}
                  className="h-24 w-full rounded-xl border border-brand-border bg-brand-surface object-contain"
                />
              </div>
            )}
          </div>
        )}

        {permitUrl && (
          <div className="max-w-xs">
            <PermitQrCode label={t.ptw.qrCode} hint={t.ptw.qrCodeHint} value={permitUrl} />
          </div>
        )}
      </div>

      <div className="card mb-5 space-y-4">
        <h2 className="text-base font-semibold text-brand-black">
          {t.ptw.permitProgressTitle}
        </h2>
        <div className="flex flex-wrap gap-3">
          <span
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              getPermitProgress(permit) === "New Permit"
                ? "bg-brand-orange text-brand-onAccent"
                : "border border-brand-border bg-brand-surface text-brand-gray"
            }`}
          >
            {t.ptw.statusNewPermit}
          </span>
          <span
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              getPermitProgress(permit) === "In Progress"
                ? "bg-brand-orange text-brand-onAccent"
                : "border border-brand-border bg-brand-surface text-brand-gray"
            }`}
          >
            {t.ptw.statusInProgress}
          </span>
          <button
            type="button"
            onClick={handleClosePermit}
            disabled={permit.permitStatus === "Closed" || isClosing}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
              permit.permitStatus === "Closed"
                ? "bg-brand-orange text-brand-onAccent"
                : "border border-brand-border bg-brand-surface text-brand-grayDark hover:bg-brand-grayLight"
            }`}
          >
            {isClosing ? t.common.loading : t.ptw.statusClosed}
          </button>
        </div>
        {permit.permitStatus === "Closed" && (
          <p className="text-xs font-medium text-brand-gray">{t.ptw.permitClosedNote}</p>
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

        <div className="flex justify-end border-t border-brand-border pt-5">
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
