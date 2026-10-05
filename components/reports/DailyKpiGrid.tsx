"use client";

/**
 * Reports → Daily: the weekly KPI report as a month grid, filled in day by
 * day for one project (the app-wide project filter). Saved rows go to
 * `daily_kpi_records`; the KPI page totals them per week automatically.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Save } from "lucide-react";
import ProjectFilter from "@/components/ProjectFilter";
import { useProjectFilter } from "@/context/ProjectFilterContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { DAILY_KPI_SECTIONS, SHIFT_OPTIONS, type DailyKpiKey, type DailyKpiRecord } from "@/types/dailyKpi";

const MAX_MINUTES_BYTES = 10 * 1024 * 1024;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayDraft = { values: DailyKpiRecord["values"]; shift: string | null };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DailyKpiGrid() {
  const { project } = useProjectFilter();
  const { dailyRecords, saveDailyRecords, attachMeetingMinutes, isLoading } = useWeeklyKpi();

  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`);
  const [drafts, setDrafts] = useState<Record<string, DayDraft>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [minutesDate, setMinutesDate] = useState<string | null>(null);
  const [uploadingDate, setUploadingDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const date = `${y}-${pad(m)}-${pad(i + 1)}`;
      return { date, day: i + 1, weekday: WEEKDAYS[new Date(y, m - 1, i + 1).getDay()] };
    });
  }, [month]);

  const saved = useMemo(() => {
    const map: Record<string, DailyKpiRecord> = {};
    dailyRecords.forEach((d) => {
      if (d.projectName === project && d.date.startsWith(month)) map[d.date] = d;
    });
    return map;
  }, [dailyRecords, project, month]);

  // Unsaved edits belong to one project-month; drop them when either changes.
  useEffect(() => {
    setDrafts({});
    setMessage(null);
  }, [project, month]);

  const cellValue = (date: string, key: DailyKpiKey) => {
    const d = drafts[date];
    if (d && key in d.values) return d.values[key];
    return saved[date]?.values[key];
  };
  const shiftValue = (date: string) =>
    drafts[date] && drafts[date].shift !== undefined ? drafts[date].shift : saved[date]?.shift ?? null;

  const baseDraft = (date: string): DayDraft =>
    drafts[date] ?? { values: { ...(saved[date]?.values ?? {}) }, shift: saved[date]?.shift ?? null };

  const setCell = (date: string, key: DailyKpiKey, raw: string) => {
    const n = raw === "" ? undefined : Math.max(0, Number(raw));
    setDrafts((prev) => {
      const d = prev[date] ?? baseDraft(date);
      const values = { ...d.values };
      if (n === undefined || Number.isNaN(n)) delete values[key];
      else values[key] = n;
      return { ...prev, [date]: { ...d, values } };
    });
  };
  const setShift = (date: string, shift: string) =>
    setDrafts((prev) => ({ ...prev, [date]: { ...(prev[date] ?? baseDraft(date)), shift: shift || null } }));

  const dirtyCount = Object.keys(drafts).length;

  const handleSave = async () => {
    if (!project || dirtyCount === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveDailyRecords(
        Object.entries(drafts).map(([date, d]) => ({ projectName: project, date, values: d.values, shift: d.shift }))
      );
      setDrafts({});
      setMessage({ tone: "ok", text: `Saved ${dirtyCount} day${dirtyCount > 1 ? "s" : ""}.` });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save" });
    } finally {
      setSaving(false);
    }
  };

  const handleMinutes = async (file: File | null) => {
    if (!file || !minutesDate || !project) return;
    if (file.size > MAX_MINUTES_BYTES) {
      setMessage({ tone: "error", text: "Meeting minutes file must be 10 MB or smaller." });
      return;
    }
    setUploadingDate(minutesDate);
    setMessage(null);
    try {
      await attachMeetingMinutes(project, minutesDate, await readFileAsDataUrl(file), file.name);
      setMessage({ tone: "ok", text: `Meeting minutes attached to ${minutesDate}.` });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not attach file" });
    } finally {
      setUploadingDate(null);
      setMinutesDate(null);
    }
  };

  const rowTotal = (key: DailyKpiKey, mode: "sum" | "avg" | "none") => {
    if (mode === "none") return "";
    const vals = days.map((d) => Number(cellValue(d.date, key))).filter((v) => !Number.isNaN(v) && v > 0);
    if (vals.length === 0) return 0;
    const sum = vals.reduce((s, v) => s + v, 0);
    return (mode === "avg" ? Math.round(sum / vals.length) : sum).toLocaleString("en-US");
  };

  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  if (!project) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center shadow-card">
        <p className="mb-4 text-sm font-medium text-brand-grayDark">
          Choose a project to fill in its daily KPI report.
        </p>
        <div className="flex justify-center">
          <ProjectFilter />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-brand-grayDark">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="input-field !w-auto !py-2"
            />
          </label>
          <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold text-brand-orange">{project}</span>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-xs font-semibold ${message.tone === "ok" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </span>
          )}
          <button type="button" onClick={handleSave} disabled={saving || dirtyCount === 0} className="btn-primary gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : dirtyCount ? `Save ${dirtyCount} day${dirtyCount > 1 ? "s" : ""}` : "Saved"}
          </button>
        </div>
      </div>


      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={(e) => {
          handleMinutes(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-brand-border bg-brand-surface py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-auto rounded-2xl border border-brand-border bg-brand-surface shadow-card">
          <table className="border-collapse text-xs">
            <thead className="sticky top-0 z-20">
              <tr style={{ background: "#fdeccf" }}>
                <th className="sticky start-0 z-30 w-12 border border-slate-300 px-2 py-1.5" style={{ background: "#fdeccf" }} rowSpan={2} />
                <th
                  className="sticky start-12 z-30 min-w-[250px] border border-slate-300 px-3 py-1.5 text-center text-sm font-bold text-brand-black"
                  style={{ background: "#fdeccf" }}
                  rowSpan={2}
                >
                  {monthLabel}
                </th>
                <th className="min-w-[70px] border border-slate-300 px-2 py-1.5 font-bold text-brand-black" rowSpan={2}>
                  Total
                </th>
                {days.map((d) => (
                  <th key={d.date} className="min-w-[52px] border border-slate-300 px-1 py-1 font-bold text-brand-black">
                    {d.weekday}
                  </th>
                ))}
              </tr>
              <tr style={{ background: "#fdeccf" }}>
                {days.map((d) => (
                  <th key={d.date} className="border border-slate-300 px-1 py-1 font-bold text-brand-black">
                    {d.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAILY_KPI_SECTIONS.map((section) => (
                <SectionRows
                  key={section.key}
                  section={section}
                  days={days}
                  cellValue={cellValue}
                  shiftValue={shiftValue}
                  setCell={setCell}
                  setShift={setShift}
                  rowTotal={rowTotal}
                  dirty={drafts}
                  saved={saved}
                  uploadingDate={uploadingDate}
                  onAttach={(date) => {
                    setMinutesDate(date);
                    fileRef.current?.click();
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SectionRows({
  section,
  days,
  cellValue,
  shiftValue,
  setCell,
  setShift,
  rowTotal,
  dirty,
  saved,
  uploadingDate,
  onAttach,
}: {
  section: (typeof DAILY_KPI_SECTIONS)[number];
  days: { date: string; day: number; weekday: string }[];
  cellValue: (date: string, key: DailyKpiKey) => number | undefined;
  shiftValue: (date: string) => string | null;
  setCell: (date: string, key: DailyKpiKey, raw: string) => void;
  setShift: (date: string, shift: string) => void;
  rowTotal: (key: DailyKpiKey, mode: "sum" | "avg" | "none") => string | number;
  dirty: Record<string, DayDraft>;
  saved: Record<string, DailyKpiRecord>;
  uploadingDate: string | null;
  onAttach: (date: string) => void;
}) {
  const lagging = section.key === "lagging";
  return (
    <>
      {section.key !== "general" && (
        <tr>
          <td
            colSpan={3 + days.length}
            className="sticky start-0 border border-slate-300 bg-slate-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
          >
            {section.title}
          </td>
        </tr>
      )}
      {section.rows.map((row) => (
        <tr key={row.no} className="hover:bg-brand-orange/5">
          <td className="sticky start-0 z-10 border border-slate-300 bg-brand-surface px-2 py-1 text-center font-semibold text-brand-grayDark">
            {row.no}
          </td>
          <td className="sticky start-12 z-10 border border-slate-300 bg-brand-surface px-3 py-1 font-semibold text-brand-black">
            {row.label}
            {row.hint && <span className="ms-1 font-normal text-brand-gray">({row.hint})</span>}
          </td>
          <td className="border border-slate-300 px-2 py-1 text-center font-bold text-brand-black">
            {row.key === "shift" ? "" : rowTotal(row.key, row.total)}
          </td>
          {days.map((d) => {
            const isDirty = !!dirty[d.date];
            if (row.key === "shift") {
              return (
                <td key={d.date} className={`border border-slate-300 p-0 ${isDirty ? "bg-amber-50" : ""}`}>
                  <select
                    value={shiftValue(d.date) ?? ""}
                    onChange={(e) => setShift(d.date, e.target.value)}
                    className="w-full bg-transparent px-0.5 py-1 text-center text-[11px] outline-none focus:bg-brand-orange/10"
                  >
                    <option value="">–</option>
                    {SHIFT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }
            const v = cellValue(d.date, row.key);
            const flagged = lagging && Number(v) > 0;
            const minutes = row.key === "hseMeetings" ? saved[d.date] : undefined;
            return (
              <td
                key={d.date}
                className="border border-slate-300 p-0"
                style={{ background: flagged ? "#fecdd3" : isDirty ? "#fffbeb" : undefined }}
              >
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={v ?? ""}
                    onChange={(e) => setCell(d.date, row.key as DailyKpiKey, e.target.value)}
                    className="w-full min-w-0 bg-transparent px-1 py-1 text-center outline-none [appearance:textfield] focus:bg-brand-orange/10 [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {row.key === "hseMeetings" &&
                    (minutes?.meetingMinutesUrl ? (
                      <a
                        href={minutes.meetingMinutesUrl}
                        download={minutes.meetingMinutesName || undefined}
                        title={`Minutes: ${minutes.meetingMinutesName ?? "file"}`}
                        className="pe-1 text-green-600"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAttach(d.date)}
                        disabled={uploadingDate === d.date}
                        title="Upload PD/PM meeting minutes"
                        className="pe-1 text-brand-gray hover:text-brand-orange disabled:opacity-40"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </button>
                    ))}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
