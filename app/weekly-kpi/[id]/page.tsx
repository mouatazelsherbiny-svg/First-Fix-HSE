"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { WEEKLY_KPI_NUMERIC_FIELDS } from "@/types/weeklyKpi";
import PageTitle from "@/components/PageTitle";

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
  const { getById } = useWeeklyKpi();

  const record = getById(params.id);

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

  const dateStr = new Date(record.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div>
      <Link
        href="/weekly-kpi"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-gray hover:text-brand-orange"
      >
        &larr; {t.weeklyKpi.back}
      </Link>

      <PageTitle section="KPI's" title={t.weeklyKpi.detailTitle}>
        <span className="text-sm text-white/60">
          {t.weeklyKpi.recordedOn} {dateStr}
        </span>
        <Link href={`/weekly-kpi/${record.id}/edit`} className="btn-primary">
          {t.weeklyKpi.edit}
        </Link>
      </PageTitle>

      <div className="card space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="label-field">{t.weeklyKpi.projectName}</p>
            <p className="text-lg font-semibold text-brand-black">{record.projectName}</p>
          </div>
          <div>
            <p className="label-field">{t.weeklyKpi.date}</p>
            <p className="text-lg font-semibold text-brand-black">
              {new Date(record.date).toLocaleDateString(
                locale === "ar" ? "ar-EG" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WEEKLY_KPI_NUMERIC_FIELDS.map((f) => (
            <div key={f.key}>
              <p className="label-field">{f.label}</p>
              <p className="text-lg font-semibold text-brand-black">{record[f.key]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
