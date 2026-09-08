"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ComingSoonPage from "@/components/ComingSoonPage";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useEditRequests } from "@/context/EditRequestsContext";
import { getStatusColorClasses } from "@/lib/statusColors";
import { EditRequestStatus } from "@/types/editRequest";

export default function EditRequestsPage() {
  return (
    <ProtectedRoute>
      <EditRequestsList />
    </ProtectedRoute>
  );
}

function EditRequestsList() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { requests, isLoading, updateStatus } = useEditRequests();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (user?.role !== "admin") {
    return <ComingSoonPage title={t.nav.editRequests} subtitle={t.common.comingSoon} />;
  }

  const statusLabel = (status: EditRequestStatus) =>
    status === "Approved"
      ? t.editRequests.statusApproved
      : status === "Rejected"
      ? t.editRequests.statusRejected
      : t.editRequests.statusPending;

  const handleStatus = async (id: string, status: EditRequestStatus) => {
    setBusyId(id);
    try {
      await updateStatus(id, status);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.editRequests.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.editRequests.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.editRequests.empty}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start sm:px-6">{t.editRequests.colRecord}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.editRequests.colRequester}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.editRequests.colProject}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.editRequests.colNotes}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.editRequests.colDate}</th>
                <th className="px-4 py-3 text-start sm:px-6">{t.editRequests.colStatus}</th>
                <th className="px-4 py-3 text-end sm:px-6" />
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="px-4 py-3 font-semibold text-brand-black sm:px-6">
                    {r.recordLabel}
                    <p className="text-xs font-normal text-brand-gray">{r.tableName}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark sm:px-6">{r.requesterName}</td>
                  <td className="px-4 py-3 text-brand-grayDark sm:px-6">{r.requesterProject}</td>
                  <td className="max-w-xs px-4 py-3 text-brand-grayDark sm:px-6">{r.notes}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-grayDark sm:px-6">
                    {new Date(r.createdAt).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                        r.status
                      )}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end sm:px-6">
                    {r.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleStatus(r.id, "Approved")}
                          className="rounded-lg bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400 transition hover:bg-green-500/30"
                        >
                          {t.editRequests.approve}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => handleStatus(r.id, "Rejected")}
                          className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/30"
                        >
                          {t.editRequests.reject}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
