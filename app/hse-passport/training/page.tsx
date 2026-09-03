"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeSearch from "@/components/hsePassport/EmployeeSearch";
import FileUpload from "@/components/FileUpload";
import Badge from "@/components/Badge";
import ExportExcelButton from "@/components/ExportExcelButton";
import { useLanguage } from "@/context/LanguageContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { EmployeeRecord } from "@/lib/mockData";
import { TrainingStatus } from "@/types/hsePassport";
import { UploadedFile } from "@/types/toolboxTalk";

const BENDING_ITEMS = ["5 Duties", "First Aid", "Fire Watcher"];

export default function TrainingPage() {
  return (
    <ProtectedRoute>
      <TrainingContent />
    </ProtectedRoute>
  );
}

function TrainingContent() {
  const { t, locale } = useLanguage();
  const { trainingRecords, addTrainingRecord, employees } = useHsePassport();
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const records = employee
    ? trainingRecords.filter((r) => r.employeeId === employee.id)
    : [];

  const totalCourses = records.length;
  const totalHours = records.reduce((a, r) => a + r.hours, 0);
  const validCount = records.filter((r) => r.status === "Valid").length;
  const expiredCount = records.filter((r) => r.status === "Expired").length;
  const completedPct = totalCourses > 0 ? Math.round((validCount / totalCourses) * 100) : 0;
  const remainingPct = 100 - completedPct;

  const exportSheets = useMemo(
    () => [
      {
        name: t.hse.training.title,
        columns: [
          { header: t.hse.employeeName, key: "employeeName" },
          { header: t.hse.employeeIdCol, key: "employeeIdCol" },
          { header: t.hse.projectCol, key: "project" },
          { header: t.hse.training.courseName, key: "courseName" },
          { header: t.hse.date, key: "date" },
          { header: t.hse.training.status, key: "status" },
          { header: t.hse.training.hours, key: "hours" },
        ],
        rows: trainingRecords.map((r) => {
          const emp = employees.find((e) => e.id === r.employeeId);
          return {
            employeeName: emp?.name ?? "—",
            employeeIdCol: emp?.employeeId ?? "—",
            project: emp?.project ?? "—",
            courseName: r.courseName,
            date: r.date,
            status: r.status,
            hours: r.hours,
          };
        }),
      },
    ],
    [trainingRecords, employees, t]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-black">{t.hse.training.title}</h1>
        <ExportExcelButton
          filename={t.hse.training.title}
          sheets={exportSheets}
          disabled={trainingRecords.length === 0}
        />
      </div>

      <div className="mb-6">
        <EmployeeSearch selected={employee} onSelect={setEmployee} />
      </div>

      {!employee ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.hse.emptyState}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-black">{employee.name}</h2>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="btn-primary"
            >
              {t.hse.addBtn}
            </button>
          </div>

          {/* Total Performance */}
          <div className="card">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.hse.training.totalPerformance}
            </h3>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-brand-grayLight">
              <div
                className="flex items-center justify-center bg-brand-orange text-[10px] font-bold text-brand-onAccent transition-all"
                style={{ width: `${completedPct}%` }}
              />
              <div
                className="flex items-center justify-center bg-red-500 text-[10px] font-bold text-white transition-all"
                style={{ width: `${remainingPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-brand-orange">
                {t.hse.training.completed} {completedPct}%
              </span>
              <span className="text-red-500">
                {t.hse.training.remaining} {remainingPct}%
              </span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              [t.hse.training.totalCourses, totalCourses],
              [t.hse.training.totalHours, totalHours],
              [t.hse.training.trainingEnded, expiredCount],
            ].map(([label, value]) => (
              <div key={label as string} className="card text-center">
                <p className="text-3xl font-extrabold text-brand-black">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Training History */}
          <div className="overflow-hidden rounded-2xl bg-brand-black shadow-card">
            <h3 className="px-5 pt-5 text-sm font-bold uppercase tracking-wide text-white sm:px-6">
              {t.hse.training.historyTitle}
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-start text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-white/60">
                    <th className="px-5 py-2 text-start sm:px-6">{t.hse.training.courseName}</th>
                    <th className="px-5 py-2 text-start sm:px-6">{t.hse.date}</th>
                    <th className="px-5 py-2 text-start sm:px-6">{t.hse.training.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-4 text-center text-sm text-white/60 sm:px-6">
                        —
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3 font-medium text-white sm:px-6">{r.courseName}</td>
                        <td className="px-5 py-3 text-white/70 sm:px-6">
                          {new Date(r.date).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </td>
                        <td className="px-5 py-3 sm:px-6">
                          <Badge
                            value={r.status}
                            label={r.status === "Valid" ? t.hse.training.valid : t.hse.training.expired}
                            dark
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="h-5" />
          </div>

          {/* Training Bending */}
          <div className="card">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.hse.training.bendingTitle}
            </h3>
            <ul className="space-y-2">
              {BENDING_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-brand-grayDark">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {showAddForm && (
            <AddTrainingForm
              employeeId={employee.id}
              onDone={() => setShowAddForm(false)}
              onAdd={addTrainingRecord}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AddTrainingForm({
  employeeId,
  onDone,
  onAdd,
}: {
  employeeId: string;
  onDone: () => void;
  onAdd: (r: {
    employeeId: string;
    courseName: string;
    date: string;
    status: TrainingStatus;
    hours: number;
    attachments: UploadedFile[];
  }) => Promise<void>;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<TrainingStatus>("Valid");
  const [hours, setHours] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseName || !date) return;
    setError("");
    try {
      await onAdd({
        employeeId,
        courseName,
        date,
        status,
        hours: Number(hours) || 0,
        attachments,
      });
      onDone();
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.genericError);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brand-grayDark">
        {t.hse.training.addTitle}
      </h3>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">{t.hse.training.courseName} *</label>
          <input
            type="text"
            required
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">{t.hse.date} *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">{t.hse.training.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TrainingStatus)}
            className="input-field"
          >
            <option value="Valid">{t.hse.training.valid}</option>
            <option value="Expired">{t.hse.training.expired}</option>
          </select>
        </div>
        <div>
          <label className="label-field">{t.hse.training.hours}</label>
          <input
            type="number"
            min={0}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <FileUpload
        label={t.hse.attachments}
        files={attachments}
        onChange={setAttachments}
      />
      <div className="flex justify-end gap-3 border-t border-brand-border pt-4">
        <button type="button" onClick={onDone} className="btn-secondary">
          {t.hse.cancel}
        </button>
        <button type="submit" className="btn-primary">
          {t.hse.submit}
        </button>
      </div>
    </form>
  );
}
