"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import ExportExcelButton from "@/components/ExportExcelButton";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";

export default function MyObservationsPage() {
  return (
    <ProtectedRoute>
      <ObservationsList />
    </ProtectedRoute>
  );
}

function ObservationsList() {
  const { t, locale } = useLanguage();
  const { observations, isLoading } = useObservations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return observations;
    return observations.filter(
      (o) =>
        String(o.reportNumber).includes(q) ||
        o.projectName.toLowerCase().includes(q) ||
        o.observationType.toLowerCase().includes(q)
    );
  }, [observations, query]);

  const exportSheets = useMemo(
    () => [
      {
        name: t.list.title,
        columns: [
          { header: t.list.col.reportNumber, key: "reportNumber", width: 14 },
          { header: t.list.col.project, key: "project" },
          { header: t.list.col.type, key: "type" },
          { header: t.list.col.classification, key: "classification" },
          { header: t.list.col.risk, key: "risk" },
          { header: t.list.col.status, key: "status" },
          { header: t.form.observationDetails, key: "details", width: 40 },
          { header: t.form.inspectedBy, key: "inspectedBy" },
          { header: t.list.col.date, key: "date" },
        ],
        rows: observations.map((o) => ({
          reportNumber: o.reportNumber,
          project: o.projectName,
          type:
            o.observationType === "Others"
              ? o.observationTypeOther || t.form.other
              : o.observationType,
          classification: o.classification,
          risk: o.riskRating,
          status: o.status,
          details: o.observationDetails,
          inspectedBy: o.inspectedBy,
          date: new Date(o.createdAt).toLocaleDateString(
            locale === "ar" ? "ar-EG" : "en-US",
            { year: "numeric", month: "short", day: "numeric" }
          ),
        })),
      },
    ],
    [observations, t, locale]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">{t.list.title}</h1>
          <p className="mt-1 text-sm text-brand-gray">{t.list.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportExcelButton filename={t.list.title} sheets={exportSheets} disabled={observations.length === 0} />
          <Link href="/observations/new" className="btn-primary">
            {t.list.newBtn}
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.list.search}
          className="input-field max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.list.empty}</p>
          <Link href="/observations/new" className="btn-primary mt-4">
            {t.list.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[820px] text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start">{t.list.col.reportNumber}</th>
                <th className="px-4 py-3 text-start">{t.list.col.project}</th>
                <th className="px-4 py-3 text-start">{t.list.col.type}</th>
                <th className="px-4 py-3 text-start">{t.list.col.classification}</th>
                <th className="px-4 py-3 text-start">{t.list.col.risk}</th>
                <th className="px-4 py-3 text-start">{t.list.col.status}</th>
                <th className="px-4 py-3 text-start">{t.list.col.date}</th>
                <th className="px-4 py-3 text-end">{t.list.col.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="px-4 py-3 font-semibold text-brand-black">
                    #{o.reportNumber}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{o.projectName}</td>
                  <td className="px-4 py-3">
                    <Badge
                      value={o.observationType}
                      label={
                        o.observationType === "Others"
                          ? o.observationTypeOther || t.form.other
                          : o.observationType
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{o.classification}</td>
                  <td className="px-4 py-3">
                    <Badge value={o.riskRating} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={o.status} />
                  </td>
                  <td className="px-4 py-3 text-brand-gray">
                    {new Date(o.createdAt).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/observations/${o.id}`}
                      className="font-medium text-brand-orange hover:underline"
                    >
                      {t.list.view}
                    </Link>
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
