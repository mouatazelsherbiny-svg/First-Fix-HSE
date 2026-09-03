"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { PROJECTS } from "@/lib/mockData";
import {
  WEEKLY_KPI_NUMERIC_FIELDS,
  WeeklyKpiNumericField,
} from "@/types/weeklyKpi";

export default function WeeklyKpiDetailPage() {
  return (
    <ProtectedRoute>
      <WeeklyKpiDetail />
    </ProtectedRoute>
  );
}

function WeeklyKpiDetail() {
  const { t, locale } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, updateRecord } = useWeeklyKpi();

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
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  const dateStr = new Date(record.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/weekly-kpi"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.weeklyKpi.back}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.weeklyKpi.detailTitle}
        </h1>
        <p className="mt-1 text-sm text-brand-gray">
          {t.weeklyKpi.recordedOn} {dateStr}
        </p>
      </div>

      {saved && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t.weeklyKpi.saved}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

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
    </div>
  );
}
