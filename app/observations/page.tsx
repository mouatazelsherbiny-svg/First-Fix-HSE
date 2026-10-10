"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badge from "@/components/Badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import ExportExcelButton from "@/components/ExportExcelButton";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import type { Observation } from "@/types/observation";
import {
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Sparkles,
  Tag,
  UserRound,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

const GOOD_PRACTICE = "Good Practice";
const OPEN_STATUSES = new Set(["Open", "In Progress", "Overdue"]);

function isGoodPractice(o: Observation) {
  return o.observationType === GOOD_PRACTICE || o.classification === GOOD_PRACTICE;
}

function typeLabel(o: Observation) {
  return o.observationType === "Others" && o.observationTypeOther ? o.observationTypeOther : o.observationType;
}

function top3<T>(items: T[], key: (item: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item)?.trim();
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${tone}1f`, color: tone }}>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-3xl font-extrabold leading-none text-brand-black tabular-nums">{value.toLocaleString("en-US")}</p>
        <p className="mt-1 truncate text-sm font-medium text-brand-grayDark">{label}</p>
      </div>
    </div>
  );
}

function TopThreeCard({
  icon: Icon,
  title,
  rows,
  emptyText,
}: {
  icon: LucideIcon;
  title: string;
  rows: { label: string; count: number }[];
  emptyText: string;
}) {
  const max = rows[0]?.count ?? 0;
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-black">
        <Icon className="h-5 w-5 text-brand-orange" />
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-brand-gray">{emptyText}</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((r, i) => (
            <li key={r.label}>
              <div className="mb-1 flex items-center gap-2.5 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-brand-onAccent">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold text-brand-black" title={r.label}>
                  {r.label}
                </span>
                <span className="shrink-0 font-bold tabular-nums text-brand-black">{r.count.toLocaleString("en-US")}</span>
              </div>
              <div className="ms-8 h-1.5 overflow-hidden rounded-full bg-brand-grayLight">
                <div className="h-full rounded-full bg-brand-orange" style={{ width: `${max ? (r.count / max) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function ObservationsPage() {
  return (
    <ProtectedRoute>
      <ObservationsList />
    </ProtectedRoute>
  );
}

const PAGE_SIZE = 100;

function ObservationsList() {
  const { t, locale } = useLanguage();
  const { observations, isLoading, updateObservation } = useObservations();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Observation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const handleCancelObservation = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await updateObservation(cancelTarget.id, { status: "Cancelled" });
      setCancelTarget(null);
    } catch {
      setCancelError(t.detail.cancelError);
    } finally {
      setIsCancelling(false);
    }
  };

  // The app-wide project filter (top of the page) already narrows
  // `observations`; the text search only narrows the table.
  const byProject = observations;

  const summary = useMemo(() => {
    const active = byProject.filter((o) => o.status !== "Cancelled");
    const hazards = active.filter((o) => !isGoodPractice(o));
    return {
      total: active.length,
      open: active.filter((o) => OPEN_STATUSES.has(o.status)).length,
      closed: active.filter((o) => o.status === "Closed").length,
      goodPractice: active.filter(isGoodPractice).length,
      topTypes: top3(hazards, typeLabel),
      topProjects: top3(active, (o) => o.projectName),
      topObservers: top3(active, (o) => o.inspectedBy),
    };
  }, [byProject]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return byProject;
    return byProject.filter(
      (o) =>
        String(o.reportNumber).includes(q) ||
        o.projectName.toLowerCase().includes(q) ||
        o.observationType.toLowerCase().includes(q)
    );
  }, [byProject, query]);

  // Keep the rendered table light — page the (already client-filtered)
  // results instead of rendering all matches at once.
  useEffect(() => {
    setPage(0);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

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
          { header: t.form.observationPhoto, key: "observationPhotos", type: "image" as const, width: 20 },
          { header: t.form.closeOutPhoto, key: "closeOutPhotos", type: "image" as const, width: 20 },
        ],
        rows: filtered.map((o) => ({
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
          observationPhotos: o.observationPhotos,
          closeOutPhotos: o.closeOutPhotos,
        })),
      },
    ],
    [filtered, t, locale]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">{t.list.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportExcelButton filename={t.list.title} sheets={exportSheets} disabled={filtered.length === 0} />
        </div>
      </div>

      {/* Summary: totals, then the top-3 rankings (follow the project filter) */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total No. of Observations" value={summary.total} tone="#475569" />
        <StatCard icon={CircleDot} label="Open" value={summary.open} tone="#f36f24" />
        <StatCard icon={CheckCircle2} label="Closed" value={summary.closed} tone="#16a34a" />
        <StatCard icon={Sparkles} label="Good Practice (G.P)" value={summary.goodPractice} tone="#2563eb" />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <TopThreeCard icon={Tag} title="Top 3 Observation Types" rows={summary.topTypes} emptyText={t.list.empty} />
        <TopThreeCard icon={FolderOpen} title="Top 3 Observing Projects" rows={summary.topProjects} emptyText={t.list.empty} />
        <TopThreeCard icon={UserRound} title="Top 3 Observers" rows={summary.topObservers} emptyText={t.list.empty} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
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
              {pageItems.map((o) => (
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
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/observations/${o.id}`}
                        className="font-medium text-brand-orange hover:underline"
                      >
                        {t.list.view}
                      </Link>
                      <Link
                        href={`/observations/${o.id}/edit`}
                        className="font-medium text-brand-orange hover:underline"
                      >
                        {t.list.edit}
                      </Link>
                      {o.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(o)}
                          className="font-medium text-brand-gray hover:text-red-500 hover:underline"
                        >
                          {t.list.cancel}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-brand-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-brand-gray">
                {t.common.pageOf
                  .replace("{current}", String(currentPage + 1))
                  .replace("{total}", String(totalPages))}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.common.previous}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.common.next}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title={t.detail.cancelConfirmTitle}
          message={t.detail.cancelConfirmMessage}
          confirmLabel={isCancelling ? t.detail.cancelling : t.detail.cancelConfirmConfirm}
          cancelLabel={t.common.close}
          isBusy={isCancelling}
          error={cancelError}
          onConfirm={handleCancelObservation}
          onClose={() => {
            setCancelError("");
            setCancelTarget(null);
          }}
        />
      )}
    </div>
  );
}
