"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import FileUpload from "@/components/FileUpload";
import SignaturePad from "@/components/SignaturePad";
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

  const [receiver, setReceiver] = useState("");
  const [hseValidator, setHseValidator] = useState("");
  const [supervisorForeman, setSupervisorForeman] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");

  const [projectName, setProjectName] = useState("");
  const [permitType, setPermitType] = useState("");
  const [permitTypeOther, setPermitTypeOther] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [contractorType, setContractorType] = useState<"First Fix" | "Subcontractor" | "">("");
  const [subcontractorName, setSubcontractorName] = useState("");
  const [numberOfWorkers, setNumberOfWorkers] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hazardsIdentified, setHazardsIdentified] = useState<string[]>([]);
  const [customHazards, setCustomHazards] = useState<string[]>([]);
  const [newHazard, setNewHazard] = useState("");
  const [ppeRequired, setPpeRequired] = useState<string[]>([]);
  const [isolationRequired, setIsolationRequired] = useState(false);
  const [precautions, setPrecautions] = useState("");
  const [permitPhotos, setPermitPhotos] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<UploadedPermitFile[]>([]);
  const [issuerSignature, setIssuerSignature] = useState("");
  const [receiverSignature, setReceiverSignature] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const addCustomHazard = () => {
    const value = newHazard.trim();
    if (!value) return;
    setCustomHazards((prev) => [...prev, value]);
    setNewHazard("");
  };

  const removeCustomHazard = (index: number) => {
    setCustomHazards((prev) => prev.filter((_, i) => i !== index));
  };

  const isOther = permitType === "Other";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!contractorType) {
      setError(t.ptw.contractorTypeRequired);
      return;
    }
    if (contractorType === "Subcontractor" && !subcontractorName.trim()) {
      setError(t.ptw.subcontractorNameRequired);
      return;
    }
    if (!issuerSignature || !receiverSignature) {
      setError(t.ptw.signatureRequired);
      return;
    }

    // Store the canonical English value regardless of UI language, same as
    // every other semantic value in this app (statuses, hazard names, etc.)
    // — only the button *label* is translated.
    const contractor =
      contractorType === "First Fix" ? "First Fix" : subcontractorName.trim();

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
        hazardsIdentified: [...hazardsIdentified, ...customHazards],
        ppeRequired,
        isolationRequired,
        precautions,
        permitPhotos,
        attachments,
        status: "Pending Approval",
        requestedBy,
        receiver,
        hseValidator,
        supervisorForeman,
        emergencyContactNumber,
        issuerSignature,
        receiverSignature,
        permitStatus: "New Permit",
        closeOutDetails: "",
        closeOutPhotos: [],
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.ptw.formTitle}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.ptw.formSubtitle}</p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
          {t.ptw.success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <label className="label-field">{t.ptw.issuerBy}</label>
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
            <div className="sm:col-span-2 lg:col-span-1">
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
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setContractorType("First Fix")}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  contractorType === "First Fix"
                    ? "bg-brand-orange text-brand-onAccent"
                    : "border border-brand-border bg-brand-surface/85 text-brand-grayDark hover:bg-brand-grayLight"
                }`}
              >
                {t.ptw.contractorFirstFix}
              </button>
              <button
                type="button"
                onClick={() => setContractorType("Subcontractor")}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  contractorType === "Subcontractor"
                    ? "bg-brand-orange text-brand-onAccent"
                    : "border border-brand-border bg-brand-surface/85 text-brand-grayDark hover:bg-brand-grayLight"
                }`}
              >
                {t.ptw.contractorSubcontractor}
              </button>
            </div>
            {contractorType === "Subcontractor" && (
              <input
                type="text"
                required
                value={subcontractorName}
                onChange={(e) => setSubcontractorName(e.target.value)}
                placeholder={t.ptw.subcontractorNamePlaceholder}
                className="input-field mt-3"
              />
            )}
          </div>

          <div>
            <label className="label-field">{t.ptw.receiver}</label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder={t.ptw.receiverPlaceholder}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.hseValidator}</label>
            <input
              type="text"
              value={hseValidator}
              onChange={(e) => setHseValidator(e.target.value)}
              placeholder={t.ptw.hseValidatorPlaceholder}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.supervisorForeman}</label>
            <input
              type="text"
              value={supervisorForeman}
              onChange={(e) => setSupervisorForeman(e.target.value)}
              placeholder={t.ptw.supervisorForemanPlaceholder}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">{t.ptw.emergencyContactNumber}</label>
            <input
              type="tel"
              value={emergencyContactNumber}
              onChange={(e) => setEmergencyContactNumber(e.target.value)}
              placeholder={t.ptw.emergencyContactNumberPlaceholder}
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
          <label className="label-field">{t.ptw.permitStatus}</label>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-semibold text-brand-onAccent">
              {t.ptw.statusNewPermit}
            </span>
            <span className="rounded-xl border border-brand-border bg-brand-surface/85 px-4 py-2 text-sm font-semibold text-brand-gray">
              {t.ptw.statusInProgress}
            </span>
            <span className="rounded-xl border border-brand-border bg-brand-surface/85 px-4 py-2 text-sm font-semibold text-brand-gray">
              {t.ptw.statusClosed}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-gray">{t.ptw.permitStatusHint}</p>
        </div>

        <div>
          <label className="label-field">{t.ptw.hazardsIdentified}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {HAZARD_CATEGORIES.map((h) => (
              <label
                key={h}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border bg-brand-surface/85 px-3 py-2 text-sm text-brand-grayDark transition hover:border-brand-orange"
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

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newHazard}
              onChange={(e) => setNewHazard(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomHazard();
                }
              }}
              placeholder={t.ptw.addHazardPlaceholder}
              className="input-field"
            />
            <button
              type="button"
              onClick={addCustomHazard}
              className="btn-secondary shrink-0 whitespace-nowrap"
            >
              {t.ptw.addHazardBtn}
            </button>
          </div>

          {customHazards.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {customHazards.map((h, i) => (
                <span
                  key={`${h}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orangeLight px-3 py-1 text-xs font-semibold text-brand-orangeDark"
                >
                  {h}
                  <button
                    type="button"
                    onClick={() => removeCustomHazard(i)}
                    className="text-brand-orangeDark/70 hover:text-brand-orangeDark"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label-field">{t.ptw.ppeRequired}</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {PPE_FOR_PERMIT.map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-border bg-brand-surface/85 px-3 py-2 text-sm text-brand-grayDark transition hover:border-brand-orange"
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
                  ? "bg-brand-orange text-brand-onAccent"
                  : "border border-brand-border bg-brand-surface/85 text-brand-grayDark hover:bg-brand-grayLight"
              }`}
            >
              {t.ptw.isolationYes}
            </button>
            <button
              type="button"
              onClick={() => setIsolationRequired(false)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                !isolationRequired
                  ? "bg-brand-orange text-brand-onAccent"
                  : "border border-brand-border bg-brand-surface/85 text-brand-grayDark hover:bg-brand-grayLight"
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

        <div className="grid gap-5 border-t border-brand-border pt-5 sm:grid-cols-2">
          <SignaturePad
            label={t.ptw.issuerSignature}
            value={issuerSignature}
            onChange={setIssuerSignature}
          />
          <SignaturePad
            label={t.ptw.receiverSignature}
            value={receiverSignature}
            onChange={setReceiverSignature}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
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
