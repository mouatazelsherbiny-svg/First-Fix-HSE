"use client";

/**
 * FICC records (First Incident / Contributing Cause reports and their linked
 * IIRs) — shown at the bottom of the Incidents page, in the same dark table
 * style as the Observations list. /ficc now redirects here.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ChevronDown, Filter, ImagePlus, Paperclip, Plus, Search, X } from "lucide-react";
import { compressImage } from "@/lib/compressImage";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import { useAuth } from "@/context/AuthContext";
import FiccFormModal from "@/components/ficc/FiccFormModal";
import { ColumnFilter, useColumnFilters, type FilterColumn } from "@/components/table/ColumnFilter";
import { SEARCH_INPUT, TABLE_TITLE, TH_ROW } from "@/components/charts/InjuryStyle";
import type { FiccInput, Incident } from "@/types/incident";

// Base64 data URLs are this app's established convention for storing
// uploaded files directly on the row (see observation_photos) — no
// Supabase Storage bucket anywhere in this codebase. 10MB keeps a single
// incidents row (and the client-side fetch of the whole table) reasonable.
const MAX_IIR_FILE_BYTES = 10 * 1024 * 1024;
const PAGE_SIZE = 100;

const fmtDay = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

/** Columns the FICC table can be filtered by (header funnels). */
const FICC_FILTERS: FilterColumn<Incident>[] = [
  { key: "report", get: (i) => `#${i.incidentNumber}` },
  { key: "project", get: (i) => i.projectName },
  { key: "type", get: (i) => i.incidentCategory },
  { key: "location", get: (i) => i.incidentLocation },
  { key: "date", get: (i) => fmtDay(i.incidentDate) },
  { key: "status", get: (i) => i.iirStatus },
];

const CARD = "rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]";
const CARD_BG = "linear-gradient(160deg, #1a1a1d 0%, #121214 100%)";

/** Shared app components (forms, dialogs) read these tokens; flip them dark here. */
const DARK_TOKENS = {
  "--brand-black-rgb": "245 245 247",
  "--brand-gray-dark-rgb": "205 207 213",
  "--brand-gray-rgb": "150 153 162",
  "--brand-gray-light-rgb": "40 40 46",
  "--brand-surface-rgb": "24 24 27",
  "--brand-border-rgb": "52 52 58",
} as React.CSSProperties;

const STATUS_PILL: Record<string, string> = {
  Closed: "bg-[#15a33a] text-white shadow-[0_0_10px_rgba(21,163,58,0.5)]",
  Open: "bg-[#f36f24] text-white shadow-[0_0_10px_rgba(243,111,36,0.55)]",
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FiccSection() {
  const { t, locale } = useLanguage();
  const { incidents, isLoading, submitFicc, attachIirFile, setIncidentPhotos, setIirStatus } = useIncidents();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [showAddModal, setShowAddModal] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
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

  // Every FICC record in the incidents table, newest first. The page's project filter already narrows `incidents`.
  const categories = useMemo(
    () =>
      Array.from(new Set(incidents.map((i) => i.incidentCategory?.trim()).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [incidents]
  );

  const searched = useMemo(() => {
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
  // Header funnels narrow the searched rows further.
  const columnFilters = useColumnFilters(searched, FICC_FILTERS);
  const ficcRecords = columnFilters.filtered;

  useEffect(() => {
    setPage(0);
  }, [query, category, ficcRecords.length]);

  const totalPages = Math.max(1, Math.ceil(ficcRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = ficcRecords.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const now = Date.now();
  const hoursRemaining = (incident: Incident) => {
    if (!incident.iirDueAt) return null;
    const diffMs = new Date(incident.iirDueAt).getTime() - now;
    return Math.ceil(diffMs / (60 * 60 * 1000));
  };

  return (
    <section id="ficc" className="mt-5 scroll-mt-24" style={DARK_TOKENS}>
      <div className={`${CARD} p-4 sm:p-5`} style={{ background: CARD_BG }}>
      {/* ---- Title, search, category, add — as on the Injury details table ---- */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className={TABLE_TITLE}>{t.ficc.pageTitle}</h2>
          <p className="mt-0.5 text-xs text-white/55">{t.ficc.pageSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.list.search} className={SEARCH_INPUT} />
          </label>
          <label className="relative flex items-center">
            <span className="sr-only">Category</span>
            <Filter className="pointer-events-none absolute start-3 h-3.5 w-3.5 text-[#f36f24]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`appearance-none rounded-full border bg-black/40 py-1.5 pe-8 ps-8 text-sm text-white outline-none [color-scheme:dark] focus:border-[#f36f24] ${
                category ? "border-[#f36f24] font-semibold" : "border-white/15"
              }`}
            >
              <option value="" style={{ backgroundColor: "#000", color: "#fff" }}>
                All Categories
              </option>
              {categories.map((c) => (
                <option key={c} value={c} style={{ backgroundColor: "#000", color: "#fff" }}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-2.5 h-4 w-4 text-white/80" />
          </label>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#f36f24] px-4 py-1.5 text-sm font-bold text-white shadow-[0_0_14px_rgba(243,111,36,0.55)] transition hover:bg-[#ff7d33]"
          >
            <Plus className="h-4 w-4" />
            {t.ficc.addFicc}
          </button>
        </div>
      </div>
      <p className="mb-3 text-xs text-white/55">
        {ficcRecords.length.toLocaleString("en-US")} records · click a row to view its details
      </p>
      {uploadError && <p className="mb-3 text-xs font-semibold text-red-400">{uploadError}</p>}

      {/* One shared, hidden file input for every row's "Attach IIR" button — handleAttachClick records which incident it's for. */}
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

      {/* ---- Table ---- */}
        <div className="max-h-[560px] overflow-auto rounded-lg">
          <table className="w-full min-w-[980px] text-start text-sm text-white">
            <thead className="sticky top-0 z-10">
              <tr className={TH_ROW}>
                <th className="whitespace-nowrap rounded-s-lg px-3 py-2.5 text-start"><ColumnFilter label={t.ficc.colReportNumber} align="start" {...columnFilters.header("report")} /></th>
                <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.ficc.colProject} align="start" {...columnFilters.header("project")} /></th>
                <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.ficc.colType} align="start" {...columnFilters.header("type")} /></th>
                <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.ficc.colLocation} align="start" {...columnFilters.header("location")} /></th>
                <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.ficc.colDate} align="start" {...columnFilters.header("date")} /></th>
                <th className="whitespace-nowrap px-3 py-2.5 text-center"><ColumnFilter label={t.ficc.colStatus} align="center" {...columnFilters.header("status")} /></th>
                <th className="whitespace-nowrap px-3 py-2.5 text-start">{t.ficc.colDeadline}</th>
                <th className="whitespace-nowrap rounded-e-lg px-3 py-2.5 text-center">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#f36f24] border-t-transparent" />
                  </td>
                </tr>
              ) : ficcRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-white/55">
                    {columnFilters.activeCount > 0 ? (
                      <>
                        No records match these filters.{" "}
                        <button type="button" onClick={columnFilters.clearAll} className="font-semibold text-[#ff8a3d] hover:underline">
                          Clear filters
                        </button>
                      </>
                    ) : (
                      t.common.noDataYet
                    )}
                  </td>
                </tr>
              ) : (
                pageItems.map((incident) => {
                  const remaining = hoursRemaining(incident);
                  const isOpen = incident.iirStatus === "Open";
                  const overdue = isOpen && remaining !== null && remaining <= 0;
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedId(incident.id)}
                      className="cursor-pointer border-b border-white/[0.07] last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 font-bold">
                        <span className="inline-flex items-center gap-1.5">
                          #{incident.incidentNumber}
                          {(incident.incidentPhotos?.length ?? 0) > 0 && (
                            <span
                              title={`${incident.incidentPhotos.length} photo(s)`}
                              className="inline-flex items-center gap-0.5 rounded-full bg-[#f36f24]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#ff8a3d]"
                            >
                              <Camera className="h-3 w-3" />
                              {incident.incidentPhotos.length}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-white/80">{incident.projectName}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-white/80">{incident.incidentCategory}</td>
                      <td className="px-3 py-2.5 text-white/80">{incident.incidentLocation || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-white/90">
                        {incident.incidentDate
                          ? new Date(incident.incidentDate).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-center">
                        {incident.iirStatus ? (
                          <span
                            className={`inline-flex min-w-[5rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              STATUS_PILL[incident.iirStatus] ?? "bg-white/15 text-white"
                            }`}
                          >
                            {incident.iirStatus}
                          </span>
                        ) : (
                          <span className="text-white/45">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {isOpen && remaining !== null ? (
                          overdue ? (
                            <span className="text-sm font-semibold text-red-400">{t.ficc.deadlinePassed}</span>
                          ) : (
                            <span className="text-sm font-medium text-white/75">
                              {t.ficc.hoursRemaining.replace("{hours}", String(remaining))}
                            </span>
                          )
                        ) : (
                          <span className="text-white/45">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {isOpen ? (
                          <button
                            type="button"
                            onClick={() => handleAttachClick(incident)}
                            disabled={uploadingId === incident.id}
                            title={t.ficc.attachIirHint}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#f36f24] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            {uploadingId === incident.id ? t.ficc.uploadingFile : t.ficc.iirButton}
                          </button>
                        ) : incident.iirFileUrl ? (
                          <a
                            href={incident.iirFileUrl}
                            download={incident.iirFileName || undefined}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ffa31a] hover:underline"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            {t.ficc.viewFile}
                          </a>
                        ) : (
                          <span className="text-white/45">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="mt-2 flex flex-col gap-3 border-t border-white/10 px-2 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-white/60">
              {t.common.pageOf.replace("{current}", String(currentPage + 1)).replace("{total}", String(totalPages))}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.common.previous}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.common.next}
              </button>
            </div>
          </div>
        )}
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
    </section>
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
