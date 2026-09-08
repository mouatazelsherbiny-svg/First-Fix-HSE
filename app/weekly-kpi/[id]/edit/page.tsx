"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useAuth } from "@/context/AuthContext";
import { useEditRequests } from "@/context/EditRequestsContext";
import { PROJECTS } from "@/lib/mockData";
import {
  WEEKLY_KPI_NUMERIC_FIELDS,
  WeeklyKpiNumericField,
} from "@/types/weeklyKpi";

export default function WeeklyKpiEditPage() {
  return (
    <ProtectedRoute>
      <WeeklyKpiEdit />
    </ProtectedRoute>
  );
}

function WeeklyKpiEdit() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getById, updateRecord } = useWeeklyKpi();
  const { submitRequest } = useEditRequests();
  const isAdmin = user?.role === "admin";

  const record = getById(params.id);

  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [values, setValues] = useState<Record<WeeklyKpiNumericField, number>>(
    () =>
      Object.fromEntries(
        WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [f.key, 0])
      ) as Record<WeeklyKpiNumericField, number>
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [requestNotes, setRequestNotes] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (record) {
      setProjectName(record.projectName);
      setDate(record.date);
      setValues(
        Object.fromEntries(
          WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [f.key, record[f.key]])
        ) as Record<WeeklyKpiNumericField, number>
      );
    }
  }, [record]);

  if (!record) {
    return (
      <div className="card text-center">
        <p className="text-sm text-brand-gray">Record not found.</p>
        <Link href="/weekly-kpi" className="btn-primary mt-4 inline-flex">
          {t.weeklyKpi.back}
        </Link>
      </div>
    );
  }

  const updateValue = (key: WeeklyKpiNumericField, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw === "" ? 0 : Number(raw) }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateRecord(record.id, { projectName, date, ...values });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push(`/weekly-kpi/${record.id}`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setRequestSubmitting(true);
    try {
      await submitRequest({
        tableName: "weekly_kpi_records",
        recordId: record.id,
        recordLabel: `${record.projectName} — ${record.date}`,
        requesterName: user?.name ?? "",
        requesterProject: user?.project ?? "",
        notes: requestNotes,
      });
      setRequestDone(true);
      setRequestNotes("");
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : t.weeklyKpi.requestEditError);
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        href={`/weekly-kpi/${record.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.weeklyKpi.back}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.weeklyKpi.edit} — {record.projectName}
        </h1>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
          {t.weeklyKpi.saved}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      {isAdmin ? (
        <form onSubmit={handleSave} className="card space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-field">{t.weeklyKpi.projectName} *</label>
              <select
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input-field"
              >
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">{t.weeklyKpi.date} *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="label-field">{f.label}</label>
                <input
                  type="number"
                  value={values[f.key]}
                  onChange={(e) => updateValue(f.key, e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
            <button type="submit" className="btn-primary">
              {t.weeklyKpi.save}
            </button>
          </div>
        </form>
      ) : (
        <div className="card space-y-5">
          <h2 className="text-base font-semibold text-brand-black">
            {t.weeklyKpi.requestEditTitle}
          </h2>
          <p className="text-sm text-brand-gray">{t.weeklyKpi.readOnlyNotice}</p>

          {requestDone ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
              {t.weeklyKpi.requestEditSuccess}
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="label-field">{t.weeklyKpi.requestEditNotesLabel}</label>
                <textarea
                  required
                  rows={4}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder={t.weeklyKpi.requestEditNotesPlaceholder}
                  className="input-field"
                />
              </div>
              {requestError && (
                <p className="text-sm font-medium text-red-400">{requestError}</p>
              )}
              <div className="flex items-center justify-end gap-3">
                <button type="submit" disabled={requestSubmitting} className="btn-primary">
                  {requestSubmitting
                    ? t.weeklyKpi.requestEditSubmitting
                    : t.weeklyKpi.requestEditSubmit}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
