"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import FileUpload from "@/components/FileUpload";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePermits } from "@/context/PermitContext";
import {
  PROJECTS,
  PERMIT_TYPES,
  HAZARD_CATEGORIES,
  PPE_FOR_PERMIT,
} from "@/lib/mockData";
import { UploadedPermitFile } from "@/types/permit";

export default function NewPermitPage() {
  return (
    <ProtectedRoute>
      <NewPermitForm />
    </ProtectedRoute>
  );
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function NewPermitForm() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addPermit } = usePermits();
  const router = useRouter();

  const requestedBy = user ? `${user.name} (${user.employeeCode})` : "";

  const [projectName, setProjectName] = useState("");
  const [permitType, setPermitType] = useState("");
  const [permitTypeOther, setPermitTypeOther] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [contractor, setContractor] = useState("");
  const [numberOfWorkers, setNumberOfWorkers] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hazardsIdentified, setHazardsIdentified] = useState<string[]>([]);
  const [ppeRequired, setPpeRequired] = useState<string[]>([]);
  const [isolationRequired, setIsolationRequired] = useState(false);
  const [precautions, setPrecautions] = useState("");
  const [permitPhotos, setPermitPhotos] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<UploadedPermitFile[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isOther = permitType === "Other";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await addPermit({
        projectName,
        permitType,
        permitTypeOther: isOther ? permitTypeOther : undefined,
        workLocation,
        workDescription,
        contractor,
        numberOfWorkers: Number(numberOfWorkers) || 0,
        startDate,
        startTime,
        endDate,
        endTime,
        hazardsIdentified,
        ppeRequired,
        isolationRequired,
        precautions,
        permitPhotos,
        attachments,
        status: "Pending Approval",
        requestedBy,
        closeOutDetails: "",
        closeOutPhotos: [],
      });
      setSuccess(true);
      setTimeout(() => router.push("/permit-to-work"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.ptw.formTitle}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.ptw.formSubtitle}</p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t.ptw.success}
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
            <label className="label-field">{t.ptw.permitNumber}</label>
            <input
              type="text"
              value={t.common.autoAssigned}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.requestedBy}</label>
            <input
              type="text"
              value={requestedBy}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.projectName} *</label>
            <select
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.ptw.projectPlaceholder}
              </option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">{t.ptw.permitType} *</label>
            <select
              required
              value={permitType}
              onChange={(e) => setPermitType(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.ptw.permitTypePlaceholder}
              </option>
              {PERMIT_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p === "Other" ? t.ptw.other : p}
                </option>
              ))}
            </select>
          </div>

          {isOther && (
            <div className="sm:col-span-2">
              <label className="label-field">{t.ptw.permitTypeOther} *</label>
              <input
                type="text"
                required
                value={permitTypeOther}
                onChange={(e) => setPermitTypeOther(e.target.value)}
                placeholder={t.ptw.permitTypeOtherPlaceholder}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="label-field">{t.ptw.workLocation} *</label>
            <input
              type="text"
              required
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              placeholder={t.ptw.workLocationPlaceholder}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.contractor} *</label>
            <input
              type="text"
              required
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              placeholder={t.ptw.contractorPlaceholder}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.numberOfWorkers} *</label>
            <input
              type="number"
              required
              min={1}
              value={numberOfWorkers}
              onChange={(e) => setNumberOfWorkers(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-field">{t.ptw.workDescription} *</label>
          <textarea
            required
            rows={4}
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            placeholder={t.ptw.workDescriptionPlaceholder}
            className="input-field resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field">{t.ptw.startDate} *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t.ptw.startTime} *</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t.ptw.endDate} *</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t.ptw.endTime} *</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-field">{t.ptw.hazardsIdentified}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {HAZARD_CATEGORIES.map((h) => (
              <label
                key={h}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-brand-grayDark transition hover:border-brand-orange"
              >
                <input
                  type="checkbox"
                  checked={hazardsIdentified.includes(h)}
                  onChange={() => setHazardsIdentified((prev) => toggleValue(prev, h))}
                  className="h-4 w-4 accent-brand-orange"
                />
                {h}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field">{t.ptw.ppeRequired}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PPE_FOR_PERMIT.map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-brand-grayDark transition hover:border-brand-orange"
              >
                <input
                  type="checkbox"
                  checked={ppeRequired.includes(p)}
                  onChange={() => setPpeRequired((prev) => toggleValue(prev, p))}
                  className="h-4 w-4 accent-brand-orange"
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field">{t.ptw.isolationRequired}</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsolationRequired(true)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isolationRequired
                  ? "bg-brand-orange text-white"
                  : "border border-gray-200 bg-white text-brand-grayDark hover:bg-brand-grayLight"
              }`}
            >
              {t.ptw.isolationYes}
            </button>
            <button
              type="button"
              onClick={() => setIsolationRequired(false)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                !isolationRequired
                  ? "bg-brand-orange text-white"
                  : "border border-gray-200 bg-white text-brand-grayDark hover:bg-brand-grayLight"
              }`}
            >
              {t.ptw.isolationNo}
            </button>
          </div>
        </div>

        <div>
          <label className="label-field">{t.ptw.precautions} *</label>
          <textarea
            required
            rows={3}
            value={precautions}
            onChange={(e) => setPrecautions(e.target.value)}
            placeholder={t.ptw.precautionsPlaceholder}
            className="input-field resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUpload
            label={t.ptw.permitPhoto}
            images={permitPhotos}
            onChange={setPermitPhotos}
          />
          <FileUpload
            label={t.ptw.attachments}
            files={attachments}
            onChange={setAttachments}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={() => router.push("/permit-to-work")}
            className="btn-secondary"
          >
            {t.ptw.cancel}
          </button>
          <button type="submit" className="btn-primary">
            {t.ptw.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
