"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useIncidents } from "@/context/IncidentsContext";
import FiccFormModal from "@/components/ficc/FiccFormModal";
import IirFormModal from "@/components/ficc/IirFormModal";
import type { FiccInput, Incident } from "@/types/incident";

export default function FiccPage() {
  return (
    <ProtectedRoute>
      <FiccPageContent />
    </ProtectedRoute>
  );
}

function FiccPageContent() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { incidents, isLoading, submitFicc } = useIncidents();
  const [showAddModal, setShowAddModal] = useState(false);
  const [iirIncident, setIirIncident] = useState<Incident | null>(null);

  // Only rows created through this workflow (they always carry a
  // ficc_submitted_by and an iir_due_at) — the 986 legacy-imported
  // incidents/injuries have neither and belong to the Incidents/Injury
  // pages instead.
  const ficcRecords = useMemo(
    () =>
      incidents
        .filter((i) => i.projectName === user?.project && !!i.iirDueAt)
        .sort((a, b) => (b.incidentDate ?? "").localeCompare(a.incidentDate ?? "")),
    [incidents, user]
  );

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

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="whitespace-nowrap px-4 py-3 text-start sm:px-6">{t.ficc.colReportNumber}</th>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-brand-gray">
                    {t.common.loading}
                  </td>
                </tr>
              ) : ficcRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-brand-gray">
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
                        {isOpen && (
                          <button
                            type="button"
                            onClick={() => setIirIncident(incident)}
                            className="inline-flex items-center rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-brand-onAccent transition hover:opacity-90"
                          >
                            {t.ficc.iirButton}
                          </button>
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

      {iirIncident && (
        <IirFormModal
          incident={iirIncident}
          onClose={() => setIirIncident(null)}
          onSubmitted={() => setIirIncident(null)}
        />
      )}
    </div>
  );
}
