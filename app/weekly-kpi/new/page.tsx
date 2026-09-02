"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { PROJECTS } from "@/lib/mockData";
import {
  WEEKLY_KPI_NUMERIC_FIELDS,
  WeeklyKpiNumericField,
} from "@/types/weeklyKpi";

const EMPTY_NUMERIC_VALUES = Object.fromEntries(
  WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [f.key, 0])
) as Record<WeeklyKpiNumericField, number>;

export default function NewWeeklyKpiPage() {
  return (
    <ProtectedRoute>
      <NewWeeklyKpiForm />
    </ProtectedRoute>
  );
}

function NewWeeklyKpiForm() {
  const { t } = useLanguage();
  const { addRecord } = useWeeklyKpi();
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [values, setValues] = useState<Record<WeeklyKpiNumericField, number>>(
    EMPTY_NUMERIC_VALUES
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const updateValue = (key: WeeklyKpiNumericField, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw === "" ? 0 : Number(raw) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await addRecord({
        projectName,
        date,
        ...values,
      });
      setSuccess(true);
      setTimeout(() => router.push("/weekly-kpi"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {t.weeklyKpi.formTitle}
        </h1>
        <p className="mt-1 text-sm text-brand-gray">{t.weeklyKpi.formSubtitle}</p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {t.weeklyKpi.success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field">{t.weeklyKpi.projectName} *</label>
            <select
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.weeklyKpi.projectPlaceholder}
              </option>
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
          <button
            type="button"
            onClick={() => router.push("/weekly-kpi")}
            className="btn-secondary"
          >
            {t.weeklyKpi.cancel}
          </button>
          <button type="submit" className="btn-primary">
            {t.weeklyKpi.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
