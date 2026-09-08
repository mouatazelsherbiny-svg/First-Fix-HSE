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
                <svg viewBox="0 0 200 420" className="h-[420px] w-auto shrink-0 mx-auto">
                  {/* Simple front-view body silhouette — not anatomically
                      precise, just a visual anchor for the region dots. */}
                  <g fill="none" stroke="#8B92A0" strokeWidth={2} opacity={0.5}>
                    <circle cx="100" cy="30" r="20" />
                    <path d="M70 55 L130 55 L140 130 L60 130 Z" />
                    <path d="M65 90 L30 160 L38 170 L70 115" />
                    <path d="M135 90 L170 160 L162 170 L130 115" />
                    <path d="M70 130 L65 260 L95 260 L98 140" />
                    <path d="M130 130 L135 260 L105 260 L102 140" />
                    <path d="M65 260 L60 385 L85 385 L90 265" />
                    <path d="M135 260 L140 385 L115 385 L110 265" />
                  </g>
                  {diagramRegions.map((region) => {
                    const count = regionCounts.get(region.id) ?? 0;
                    if (count === 0) return null;
                    const radius = 6 + (count / maxCount) * 14;
                    const opacity = 0.35 + (count / maxCount) * 0.55;
                    return (
                      <g key={region.id}>
                        <circle
                          cx={region.x}
                          cy={region.y}
                          r={radius}
                          fill="#E8590C"
                          opacity={opacity}
                        />
                        <title>
                          {region.label[locale === "ar" ? "ar" : "en"]}: {count}
                        </title>
                        <text
                          x={region.x}
                          y={region.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={10}
                          fontWeight={700}
                          fill="#fff"
                        >
                          {count}
                        </text>
                      </g>
                    );
                  })}
                </svg>

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
