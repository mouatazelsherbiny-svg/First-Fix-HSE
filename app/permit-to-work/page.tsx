"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { usePermits } from "@/context/PermitContext";
import { getPermitProgress } from "@/lib/permitProgress";

export default function PermitToWorkPage() {
  return (
    <ProtectedRoute>
      <PermitList />
    </ProtectedRoute>
  );
}

function PermitList() {
  const { t, locale } = useLanguage();
  const { permits, isLoading } = usePermits();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permits;
    return permits.filter(
      (p) =>
        String(p.permitNumber).includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        p.permitType.toLowerCase().includes(q) ||
        p.workLocation.toLowerCase().includes(q)
    );
  }, [permits, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">{t.ptw.listTitle}</h1>
          <p className="mt-1 text-sm text-brand-gray">{t.ptw.listSubtitle}</p>
        </div>
        <Link href="/permit-to-work/new" className="btn-primary">
          {t.ptw.newBtn}
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.ptw.search}
          className="input-field max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.ptw.empty}</p>
          <Link href="/permit-to-work/new" className="btn-primary mt-4">
            {t.ptw.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[980px] text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start">{t.ptw.col.permitNumber}</th>
                <th className="px-4 py-3 text-start">{t.ptw.col.project}</th>
                <th className="px-4 py-3 text-start">{t.ptw.col.type}</th>
                <th className="px-4 py-3 text-start">{t.ptw.col.location}</th>
                <th className="px-4 py-3 text-start">{t.ptw.col.validity}</th>
                <th className="px-4 py-3 text-start">{t.ptw.col.status}</th>
                <th className="px-4 py-3 text-start">{t.ptw.col.permitStatus}</th>
                <th className="px-4 py-3 text-end">{t.ptw.col.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="px-4 py-3 font-semibold text-brand-black">
                    #{p.permitNumber}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{p.projectName}</td>
                  <td className="px-4 py-3">
                    <Badge
                      value={p.permitType}
                      label={p.permitType === "Other" ? p.permitTypeOther || t.ptw.other : p.permitType}
                    />
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{p.workLocation}</td>
                  <td className="px-4 py-3 text-xs text-brand-grayDark">
                    {p.startDate} {p.startTime} &rarr; {p.endDate} {p.endTime}
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const progress = getPermitProgress(p);
                      return (
                        <Badge
                          value={progress}
                          label={
                            progress === "New Permit"
                              ? t.ptw.statusNewPermit
                              : progress === "In Progress"
                              ? t.ptw.statusInProgress
                              : t.ptw.statusClosed
                          }
                        />
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/permit-to-work/${p.id}`}
                      className="text-sm font-semibold text-brand-orange hover:underline"
                    >
                      {t.ptw.view}
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
