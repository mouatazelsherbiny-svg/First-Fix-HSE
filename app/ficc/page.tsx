"use client";

import { useMemo, useRef, useState } from "react";
import { Paperclip, Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
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
  const { incidents, isLoading, submitFicc, attachIirFile } = useIncidents();
  const [showAddModal, setShowAddModal] = useState(false);
  const [query, setQuery] = useState("");
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

  // Only rows created through this workflow (they always carry an
  // iir_due_at) — the 986 legacy-imported incidents/injuries have neither
  // and belong to the Incidents/Injury pages instead. Not restricted to
  // the viewer's own project — FICC/IIR reports can be filed for any
  // project (see the Project field in the Add FICC form), same as the
  // Injury page's own list, which is unfiltered by project too and just
  // offers a search box.
  const ficcRecords = useMemo(() => {
    const all = incidents
      .filter((i) => !!i.iirDueAt)
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
  }, [incidents, query]);

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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.list.search}
          className="input-field max-w-sm"
        />
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
                      className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-black sm:px-6">
                        {incident.incidentNumber}
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
                        <Badge value={incident.iirStatus ?? "Open"} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        {isOpen ? (
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
                      <td className="whitespace-nowrap px-4 py-3 text-end sm:px-6">
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

    </div>
  );
}
