"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Avatar from "@/components/Avatar";
import { useLanguage } from "@/context/LanguageContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { searchEmployees } from "@/lib/employeeDirectory";
import { EmployeeRecord } from "@/lib/mockData";

export default function SummaryPerformanceReportPage() {
  return (
    <ProtectedRoute>
      <SummaryPerformanceReport />
    </ProtectedRoute>
  );
}

function SummaryPerformanceReport() {
  const { t } = useLanguage();
  const { disciplinaryRecords, ppeRecords, trainingRecords } = useHsePassport();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EmployeeRecord | null>(null);
  const [results, setResults] = useState<EmployeeRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // The employees table holds the company's full real roster (thousands of
  // rows) — always search it server-side (see lib/employeeDirectory.ts)
  // rather than loading it all into the browser.
  useEffect(() => {
    const q = query.trim();
    if (!q || selected) {
      setResults([]);
      return;
    }
    let active = true;
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchEmployees(q, 20).then((matches) => {
        if (active) {
          setResults(matches);
          setIsSearching(false);
        }
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, selected]);

  const stats = useMemo(() => {
    if (!selected) return null;
    const disciplinary = disciplinaryRecords.filter((r) => r.employeeId === selected.id);
    const ppe = ppeRecords.filter((r) => r.employeeId === selected.id);
    const training = trainingRecords.filter((r) => r.employeeId === selected.id);
    const trainingHours = training.reduce((sum, r) => sum + (r.hours || 0), 0);
    return {
      disciplinaryCount: disciplinary.length,
      ppeCount: ppe.length,
      trainingCount: training.length,
      trainingHours,
    };
  }, [selected, disciplinaryRecords, ppeRecords, trainingRecords]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.summaryReport.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.summaryReport.subtitle}</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder={t.summaryReport.searchPlaceholder}
          className="input-field max-w-sm"
        />
      </div>

      {!selected && query.trim() && (
        <div className="card !p-0 max-w-xl overflow-hidden">
          {isSearching ? (
            <p className="p-6 text-sm font-medium text-brand-gray">{t.common.loading}</p>
          ) : results.length === 0 ? (
            <p className="p-6 text-sm font-medium text-brand-gray">
              {t.summaryReport.noResults}
            </p>
          ) : (
            <ul className="divide-y divide-brand-grayLight">
              {results.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(e)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-brand-grayLight/30"
                  >
                    <Avatar name={e.name} src={e.photoUrl || undefined} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-black">
                        {e.name}
                      </p>
                      <p className="truncate text-xs text-brand-gray">
                        {e.employeeId} · {e.project}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!selected && !query.trim() && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.summaryReport.noSelection}</p>
        </div>
      )}

      {selected && stats && (
        <div className="space-y-5">
          <div className="card flex flex-wrap items-center gap-5">
            <Avatar name={selected.name} src={selected.photoUrl || undefined} size={72} />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-brand-black">{selected.name}</h2>
              <p className="text-sm text-brand-gray">
                {selected.project} · {selected.department}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              className="btn-secondary"
            >
              &times;
            </button>
          </div>

          <div className="card">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoField label={t.summaryReport.employeeCode} value={selected.employeeId} />
              <InfoField label={t.summaryReport.project} value={selected.project} />
              <InfoField
                label={t.summaryReport.phone}
                value={selected.phone}
                placeholder={t.summaryReport.notProvided}
              />
              <InfoField
                label={t.summaryReport.jobGrade}
                value={selected.jobGrade}
                placeholder={t.summaryReport.notProvided}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.summaryReport.statsTitle}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label={t.summaryReport.disciplinaryTotal} value={stats.disciplinaryCount} />
              <StatCard label={t.summaryReport.ppeTotal} value={stats.ppeCount} />
              <StatCard label={t.summaryReport.trainingTotal} value={stats.trainingCount} />
              <StatCard label={t.summaryReport.trainingHoursTotal} value={stats.trainingHours} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">{label}</p>
      <p className="mt-1 text-base font-semibold text-brand-black">
        {value || <span className="font-normal text-brand-gray">{placeholder}</span>}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-3xl font-extrabold text-brand-black">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs font-medium text-brand-gray">{label}</p>
    </div>
  );
}
