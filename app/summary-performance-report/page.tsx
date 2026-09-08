"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { useObservations } from "@/context/ObservationsContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { searchEmployees } from "@/lib/employeeDirectory";
import { EmployeeRecord } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

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
  const { observations } = useObservations();
  const { records: toolboxRecords } = useToolboxTalk();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EmployeeRecord | null>(null);
  const [results, setResults] = useState<EmployeeRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

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
    const lsr = disciplinary.filter((r) => r.type === "LSR");
    const observationsInspected = observations.filter(
      (o) => o.inspectedBy === selected.employeeId
    );
    const normalizedName = normalizeName(selected.name);
    const toolboxInductions = toolboxRecords.filter(
      (r) => normalizeName(r.inductedBy) === normalizedName
    );
    return {
      disciplinaryCount: disciplinary.length,
      ppeCount: ppe.length,
      trainingCount: training.length,
      trainingHours,
      lsrCount: lsr.length,
      observationsCount: observationsInspected.length,
      toolboxCount: toolboxInductions.length,
    };
  }, [selected, disciplinaryRecords, ppeRecords, trainingRecords, observations, toolboxRecords]);

  const handlePhotoChange = (files: FileList | null) => {
    if (!files || files.length === 0 || !selected) return;
    const file = files[0];
    setPhotoError("");
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const { error } = await supabase
        .from("employees")
        .update({ photo_url: dataUrl })
        .eq("id", selected.id);
      if (error) {
        setPhotoError(t.summaryReport.uploadPhotoError);
      } else {
        setSelected({ ...selected, photoUrl: dataUrl });
      }
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

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
                    <PhotoThumb name={e.name} src={e.photoUrl} size={32} />
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
        <div className="space-y-6">
          <div className="card flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <PhotoThumb name={selected.name} src={selected.photoUrl} size={200} rounded="rounded-2xl" />
              {isAdmin && (
                <>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handlePhotoChange(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="btn-secondary w-full !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {photoUploading
                      ? t.summaryReport.uploadingPhoto
                      : selected.photoUrl
                        ? t.summaryReport.changePhoto
                        : t.summaryReport.uploadPhoto}
                  </button>
                  {photoError && (
                    <p className="text-xs font-medium text-red-400">{photoError}</p>
                  )}
                </>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-brand-black">{selected.name}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setQuery("");
                  }}
                  className="btn-secondary shrink-0"
                >
                  &times;
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField label={t.summaryReport.employeeCode} value={selected.employeeId} />
                <InfoField label={t.summaryReport.project} value={selected.project} />
                <InfoField label={t.summaryReport.department} value={selected.department} />
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
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.summaryReport.statsTitle}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label={t.summaryReport.observationsInspected} value={stats.observationsCount} />
              <StatCard label={t.summaryReport.lsrViolations} value={stats.lsrCount} />
              <StatCard label={t.summaryReport.disciplinaryTotal} value={stats.disciplinaryCount} />
              <StatCard label={t.summaryReport.toolboxInductions} value={stats.toolboxCount} />
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

function PhotoThumb({
  name,
  src,
  size,
  rounded = "rounded-full",
}: {
  name: string;
  src: string;
  size: number;
  rounded?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`shrink-0 object-cover ${rounded}`}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      title={name}
      className={`flex shrink-0 items-center justify-center bg-brand-orange font-bold text-brand-onAccent ${rounded}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initial}</span>
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
