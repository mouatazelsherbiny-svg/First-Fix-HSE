"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";

export default function ToolboxTalkListPage() {
  return (
    <ProtectedRoute>
      <ToolboxTalkList />
    </ProtectedRoute>
  );
}

function ToolboxTalkList() {
  const { t, locale } = useLanguage();
  const { records, isLoading } = useToolboxTalk();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.projectName.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.siteLocation.toLowerCase().includes(q)
    );
  }, [records, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            {t.toolbox.listTitle}
          </h1>
          <p className="mt-1 text-sm text-brand-gray">{t.toolbox.listSubtitle}</p>
        </div>
        <Link href="/toolbox-talk/new" className="btn-primary">
          {t.toolbox.newBtn}
        </Link>
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
          <p className="text-sm font-medium text-brand-gray">{t.toolbox.empty}</p>
          <Link href="/toolbox-talk/new" className="btn-primary mt-4">
            {t.toolbox.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start">{t.toolbox.col.date}</th>
                <th className="px-4 py-3 text-start">{t.toolbox.col.project}</th>
                <th className="px-4 py-3 text-start">{t.toolbox.col.topic}</th>
                <th className="px-4 py-3 text-start">{t.toolbox.col.attendees}</th>
                <th className="px-4 py-3 text-start">{t.toolbox.col.manHours}</th>
                <th className="px-4 py-3 text-end">{t.toolbox.col.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="px-4 py-3 text-brand-grayDark">
                    {r.date
                      ? new Date(r.date).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-black">
                    {r.projectName}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{r.topic}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{r.attendees}</td>
                  <td className="px-4 py-3 text-brand-grayDark">
                    {r.trainingManHours}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/toolbox-talk/${r.id}`}
                      className="font-medium text-brand-orange hover:underline"
                    >
                      {t.toolbox.view}
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
