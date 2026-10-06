"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Filter, ImagePlus, Paperclip, Plus, X } from "lucide-react";
import { compressImage } from "@/lib/compressImage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import { useAuth } from "@/context/AuthContext";
import FiccFormModal from "@/components/ficc/FiccFormModal";
import type { FiccInput, Incident } from "@/types/incident";

// Base64 data URLs are this app's established convention for storing
// uploaded files directly on the row (see observation_photos) — no
// Supabase Storage bucket anywhere in this codebase. 10MB keeps a single
// incidents row (and the client-side fetch of the whole table) reasonable.
const MAX_IIR_FILE_BYTES = 10 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FiccPage() {
  return (
    <ProtectedRoute>
      <FiccPageContent />
    </ProtectedRoute>
  );
}

function FiccPageContent() {
  const { t, locale } = useLanguage();
  const { incidents, isLoading, submitFicc, attachIirFile, setIncidentPhotos, setIirStatus } = useIncidents();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [showAddModal, setShowAddModal] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => incidents.find((x) => x.id === selectedId) ?? null, [incidents, selectedId]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingIncidentId, setPendingIncidentId] = useState<string | null>(null);

  const handleAttachClick = (incident: Incident) => {
    setUploadError("");
    setPendingIncidentId(incident.id);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File | null) => {
    const incidentId = pendingIncidentId;
    setPendingIncidentId(null);
    if (!file || !incidentId) return;
    if (file.size > MAX_IIR_FILE_BYTES) {
      setUploadError(t.ficc.fileTooLarge);
      return;
    }
    setUploadingId(incidentId);
    setUploadError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await attachIirFile(incidentId, dataUrl, file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to attach file");
    } finally {
      setUploadingId(null);
    }
  };

  // Every FICC record in the incidents table — the records imported from
  // SharePoint plus the ones added here — newest first. The app-wide
  // project filter (top of the page) already narrows `incidents`.
  const categories = useMemo(
    () =>
      Array.from(new Set(incidents.map((i) => i.incidentCategory?.trim()).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [incidents]
  );

  const ficcRecords = useMemo(() => {
    const all = [...incidents]
      .filter((i) => !category || i.incidentCategory?.trim() === category)
      .sort((a, b) => (b.incidentDate ?? "").localeCompare(a.incidentDate ?? ""));
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (i) =>
        i.projectName.toLowerCase().includes(q) ||
        i.incidentLocation.toLowerCase().includes(q) ||
        i.incidentCategory.toLowerCase().includes(q) ||
        String(i.incidentNumber).includes(q)
    );
  }, [incidents, query, category]);

  const now = Date.now();
  const hoursRemaining = (incident: Incident) => {
    if (!incident.iirDueAt) return null;
    const diffMs = new Date(incident.iirDueAt).getTime() - now;
    return Math.ceil(diffMs / (60 * 60 * 1000));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">{t.ficc.pageTitle}</h1>
          <p className="mt-1 text-sm text-brand-gray">{t.ficc.pageSubtitle}</p>
        </div>
        <button type="button" onClick={() => setShowAddModal(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          {t.ficc.addFicc}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.list.search}
            className="input-field max-w-sm"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-brand-grayDark">
            <Filter className="h-4 w-4 text-brand-orange" />
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`input-field !w-auto min-w-[12rem] !py-2 ${category ? "!border-brand-orange font-semibold" : ""}`}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-brand-gray">
          {ficcRecords.length.toLocaleString("en-US")} records · click a row to view its details
        </p>
        {uploadError && (
          <p className="mt-2 text-xs font-semibold text-red-400">{uploadError}</p>
        )}
      </div>

      {/* One shared, hidden file input for every row's "Attach IIR"
          button — handleAttachClick records which incident it's for. */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={(e) => {
          handleFileSelected(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colReportNumber}</th>
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colProject}</th>
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colType}</th>
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colLocation}</th>
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colDate}</th>
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colStatus}</th>
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colDeadline}</th>
                <th className="whitespace-nowrap px-4 py-3 text-end sm:px-6">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-brand-gray">
                    {t.common.loading}
                  </td>
                </tr>
              ) : ficcRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-brand-gray">
                    {t.common.noDataYet}
                  </td>
                </tr>
              ) : (
                ficcRecords.map((incident) => {
                  const remaining = hoursRemaining(incident);
                  const isOpen = incident.iirStatus === "Open";
                  const overdue = isOpen && remaining !== null && remaining <= 0;
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedId(incident.id)}
                      className="cursor-pointer border-b border-brand-border transition last:border-0 hover:bg-brand-orange/5"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-black sm:px-6">
                        <span className="inline-flex items-center gap-1.5">
                          {incident.incidentNumber}
                          {(incident.incidentPhotos?.length ?? 0) > 0 && (
                            <span
                              title={`${incident.incidentPhotos.length} photo(s)`}
                              className="inline-flex items-center gap-0.5 rounded-full bg-brand-orange/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-orange"
                            >
                              <Camera className="h-3 w-3" />
                              {incident.incidentPhotos.length}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                        {incident.projectName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                        {incident.incidentCategory}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                        {incident.incidentLocation || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                        {incident.incidentDate
                          ? new Date(incident.incidentDate).toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        {incident.iirStatus ? <Badge value={incident.iirStatus} /> : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        {isOpen && remaining !== null ? (
                          overdue ? (
                            <span className="text-xs font-semibold text-red-400">
                              {t.ficc.deadlinePassed}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-brand-gray">
                              {t.ficc.hoursRemaining.replace("{hours}", String(remaining))}
                            </span>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-end sm:px-6" onClick={(e) => e.stopPropagation()}>
                        {isOpen ? (
                          <button
                            type="button"
                            onClick={() => handleAttachClick(incident)}
                            disabled={uploadingId === incident.id}
                            title={t.ficc.attachIirHint}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-brand-onAccent transition hover:opacity-90 disabled:opacity-60"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            {uploadingId === incident.id
                              ? t.ficc.uploadingFile
                              : t.ficc.iirButton}
                          </button>
                        ) : incident.iirFileUrl ? (
                          <a
                            href={incident.iirFileUrl}
                            download={incident.iirFileName || undefined}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            {t.ficc.viewFile}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <FiccFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (values: FiccInput) => {
            await submitFicc(values);
          }}
        />
      )}

      {selected && (
        <FiccDetails
          incident={selected}
          locale={locale}
          onClose={() => setSelectedId(null)}
          onPhotosChange={(photos) => setIncidentPhotos(selected.id, photos)}
          onStatusChange={isAdmin ? (status) => setIirStatus(selected.id, status) : undefined}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Details panel for one FICC record (opened by clicking a table row)
// ---------------------------------------------------------------------------

function FiccDetails({
  incident: i,
  locale,
  onClose,
  onPhotosChange,
  onStatusChange,
}: {
  incident: Incident;
  locale: string;
  onClose: () => void;
  onPhotosChange: (photos: string[]) => Promise<void>;
  /** Only passed for admins. */
  onStatusChange?: (status: "Open" | "Closed") => Promise<void>;
}) {
  const [statusBusy, setStatusBusy] = useState(false);
  const changeStatus = async (status: "Open" | "Closed") => {
    if (!onStatusChange || status === i.iirStatus) return;
    setStatusBusy(true);
    try {
      await onStatusChange(status);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusBusy(false);
    }
  };
  const photos = i.incidentPhotos ?? [];
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [viewing, setViewing] = useState<string | null>(null);

  const savePhotos = async (next: string[]) => {
    setPhotoBusy(true);
    setPhotoError("");
    try {
      await onPhotosChange(next);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to save photos");
    } finally {
      setPhotoBusy(false);
    }
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoBusy(true);
    try {
      const added = await Promise.all(Array.from(files).map((f) => compressImage(f)));
      await savePhotos([...photos, ...added]);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to read photo");
      setPhotoBusy(false);
    }
  };

  const fmt = (v: string | null, withTime = false) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleString(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  };

  const sections: { title: string; rows: [string, React.ReactNode][] }[] = [
    {
      title: "Incident",
      rows: [
        ["Report #", i.incidentNumber],
        ["Date & time", fmt(i.incidentDate, true)],
        ["Category", i.incidentCategory],
        ["Classification", i.classification],
        ["Record type", i.recordType],
        ["Body part", i.bodyPart],
      ],
    },
    {
      title: "Where & who",
      rows: [
        ["Project", i.projectName],
        ["Location", i.incidentLocation],
        ["Team", i.team],
        ["Subcontractor", i.subcontractorName],
      ],
    },
    {
      title: "Responsible",
      rows: [
        ["Project Director", i.projectDirector],
        ["Project Manager", i.projectManager],
        ["Construction Manager", i.constructionManager],
        ["SPIC", i.spic],
      ],
    },
    {
      title: "Investigation (IIR)",
      rows: [
        [
          "IIR status",
          onStatusChange ? (
            <select
              value={i.iirStatus ?? ""}
              disabled={statusBusy}
              onChange={(e) => changeStatus(e.target.value as "Open" | "Closed")}
              className="rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-sm font-semibold text-brand-black disabled:opacity-60"
            >
              {!i.iirStatus && <option value="">—</option>}
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          ) : i.iirStatus ? (
            <Badge value={i.iirStatus} />
          ) : null,
        ],
        ["IIR due", fmt(i.iirDueAt, true)],
        ["IIR submitted", fmt(i.iirSubmissionDate)],
        [
          "IIR file",
          i.iirFileUrl ? (
            <a
              href={i.iirFileUrl}
              download={i.iirFileName || undefined}
              className="inline-flex items-center gap-1 font-semibold text-brand-orange hover:underline"
            >
              <Paperclip className="h-3.5 w-3.5" />
              {i.iirFileName || "Download"}
            </a>
          ) : null,
        ],
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-brand-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-orange">FICC #{i.incidentNumber}</p>
            <h2 className="mt-1 text-xl font-bold text-brand-black">
              {i.incidentCategory}
              {i.classification && i.classification !== i.incidentCategory ? ` – ${i.classification}` : ""}
            </h2>
            <p className="text-sm text-brand-gray">
              {i.projectName}
              {i.incidentLocation ? ` · ${i.incidentLocation}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-gray transition hover:bg-brand-grayLight hover:text-brand-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 rounded-xl bg-brand-grayLight p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-grayDark">Description</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-black">
              {i.incidentDescription || "—"}
            </p>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-grayDark">
                Photos {photos.length > 0 && `(${photos.length})`}
              </p>
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                disabled={photoBusy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-orange transition hover:bg-brand-orange/5 disabled:opacity-60"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {photoBusy ? "Saving…" : "Add photos"}
              </button>
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {photoError && <p className="mb-2 text-xs font-medium text-red-500">{photoError}</p>}
            {photos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-brand-border px-4 py-5 text-center text-xs text-brand-gray">
                No photos yet
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((src, idx) => (
                  <div key={idx} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-brand-border">
                    <button type="button" onClick={() => setViewing(src)} className="h-full w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => savePhotos(photos.filter((_, k) => k !== idx))}
                      disabled={photoBusy}
                      aria-label="Remove photo"
                      className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white opacity-0 transition group-hover:opacity-100"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {sections.map((sec) => (
              <div key={sec.title}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-grayDark">{sec.title}</p>
                <dl className="divide-y divide-brand-border rounded-xl border border-brand-border">
                  {sec.rows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                      <dt className="shrink-0 text-brand-gray">{label}</dt>
                      <dd className="text-end font-medium text-brand-black">
                        {value === null || value === undefined || value === "" ? "—" : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {i.comment && (
            <div className="mt-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-grayDark">Comment</p>
              <p className="whitespace-pre-wrap text-sm text-brand-black">{i.comment}</p>
            </div>
          )}

          <p className="mt-5 text-xs text-brand-gray">
            {i.sourceCreatedBy ? `Imported from SharePoint · created by ${i.sourceCreatedBy}` : "Submitted through the app"}
          </p>
        </div>
      </div>
      {viewing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => {
            e.stopPropagation();
            setViewing(null);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewing} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
