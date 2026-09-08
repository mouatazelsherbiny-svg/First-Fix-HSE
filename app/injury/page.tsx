"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import { getStatusColorClasses } from "@/lib/statusColors";
import { BODY_REGIONS, normalizeBodyPart } from "@/lib/bodyParts";

export default function InjuryPage() {
  return (
    <ProtectedRoute>
      <InjuryList />
    </ProtectedRoute>
  );
}

function InjuryList() {
  const { t, locale } = useLanguage();
  const { incidents, isLoading } = useIncidents();
  const [query, setQuery] = useState("");

  const injuries = useMemo(
    () => incidents.filter((i) => i.recordType === "Injury"),
    [incidents]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return injuries;
    return injuries.filter((i) => i.projectName.toLowerCase().includes(q));
  }, [injuries, query]);

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((i) => {
      const region = normalizeBodyPart(i.bodyPart);
      if (!region) return;
      counts.set(region, (counts.get(region) ?? 0) + 1);
    });
    return counts;
  }, [filtered]);

  const maxCount = Math.max(1, ...Array.from(regionCounts.values()));
  const diagramRegions = BODY_REGIONS.filter((r) => r.id !== "other");
  const otherCount = regionCounts.get("other") ?? 0;
  const hasBodyData = regionCounts.size > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.injury.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.injury.subtitle}</p>
      </div>

      <div className="mb-6">
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
      ) : (
        <>
          <div className="card mb-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.injury.bodyMapTitle}
            </h2>
            {!hasBodyData ? (
              <p className="text-sm font-medium text-brand-gray">{t.injury.bodyMapEmpty}</p>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="relative mx-auto h-[480px] w-[320px] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/body-diagram.png"
                    alt=""
                    className="h-full w-full object-contain"
                  />
                  {diagramRegions.map((region) => {
                    const count = regionCounts.get(region.id) ?? 0;
                    if (count === 0) return null;
                    const size = 20 + (count / maxCount) * 26;
                    const opacity = 0.45 + (count / maxCount) * 0.5;
                    return (
                      <div
                        key={region.id}
                        title={`${region.label[locale === "ar" ? "ar" : "en"]}: ${count}`}
                        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold text-white"
                        style={{
                          left: `${region.x * 100}%`,
                          top: `${region.y * 100}%`,
                          width: size,
                          height: size,
                          fontSize: 11,
                          backgroundColor: `rgba(232, 89, 12, ${opacity})`,
                        }}
                      >
                        {count}
                      </div>
                    );
                  })}
                </div>

                <ul className="flex-1 space-y-2">
                  {diagramRegions
                    .map((r) => ({ region: r, count: regionCounts.get(r.id) ?? 0 }))
                    .filter((r) => r.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map(({ region, count }) => (
                      <li
                        key={region.id}
                        className="flex items-center justify-between rounded-lg bg-brand-grayLight/30 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-brand-grayDark">
                          {region.label[locale === "ar" ? "ar" : "en"]}
                        </span>
                        <span className="font-bold text-brand-black">{count}</span>
                      </li>
                    ))}
                  {otherCount > 0 && (
                    <li className="flex items-center justify-between rounded-lg bg-brand-grayLight/30 px-3 py-2 text-sm">
                      <span className="font-medium text-brand-grayDark">
                        {locale === "ar" ? "أخرى / متعددة" : "Other / Multiple"}
                      </span>
                      <span className="font-bold text-brand-black">{otherCount}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.injury.listTitle}
            </h2>
            {filtered.length === 0 ? (
              <p className="text-sm font-medium text-brand-gray">{t.injury.empty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-xs font-semibold uppercase tracking-wide text-brand-gray">
                      <th className="px-3 py-3 text-start">{t.injury.colDate}</th>
                      <th className="px-3 py-3 text-start">{t.injury.colProject}</th>
                      <th className="px-3 py-3 text-start">{t.injury.colClassification}</th>
                      <th className="px-3 py-3 text-start">{t.injury.colBodyPart}</th>
                      <th className="px-3 py-3 text-start">{t.injury.colStatus}</th>
                      <th className="px-3 py-3 text-start">{t.injury.colDescription}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr
                        key={i.id}
                        className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-brand-grayDark">
                          {i.incidentDate
                            ? new Date(i.incidentDate).toLocaleDateString(
                                locale === "ar" ? "ar-EG" : "en-US",
                                { year: "numeric", month: "short", day: "numeric" }
                              )
                            : "—"}
                        </td>
                        <td className="px-3 py-3 font-semibold text-brand-black">
                          {i.projectName}
                        </td>
                        <td className="px-3 py-3 text-brand-grayDark">
                          {i.classification || i.incidentCategory}
                        </td>
                        <td className="px-3 py-3 text-brand-grayDark">
                          {i.bodyPart || t.injury.unspecifiedBodyPart}
                        </td>
                        <td className="px-3 py-3">
                          {i.iirStatus ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                                i.iirStatus
                              )}`}
                            >
                              {i.iirStatus}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="max-w-sm px-3 py-3 text-brand-grayDark">
                          {i.incidentDescription || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
