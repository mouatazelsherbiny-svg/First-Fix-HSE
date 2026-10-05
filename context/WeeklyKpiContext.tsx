"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  WeeklyKpiRecord,
  WeeklyKpiNumericField,
  WEEKLY_KPI_NUMERIC_FIELDS,
} from "@/types/weeklyKpi";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useProjectScoped } from "@/context/ProjectFilterContext";
import {
  DailyKpiKey,
  DailyKpiRecord,
  LAGGING_KEYS,
  LEADING_KEYS,
} from "@/types/dailyKpi";

interface WeeklyKpiContextValue {
  records: WeeklyKpiRecord[];
  isLoading: boolean;
  getById: (id: string) => WeeklyKpiRecord | undefined;
  addRecord: (
    r: Omit<WeeklyKpiRecord, "id" | "createdAt" | "updatedAt">
  ) => Promise<WeeklyKpiRecord>;
  updateRecord: (id: string, patch: Partial<WeeklyKpiRecord>) => Promise<void>;
  /** Day-by-day entries (Reports → Daily), project-filtered. */
  dailyRecords: DailyKpiRecord[];
  /** Insert or update whole days for one project. */
  saveDailyRecords: (
    days: { projectName: string; date: string; values: DailyKpiRecord["values"]; shift: string | null }[]
  ) => Promise<void>;
  /** Attach the PD/PM meeting minutes file to one project-day. */
  attachMeetingMinutes: (projectName: string, date: string, dataUrl: string, fileName: string) => Promise<void>;
}

const WeeklyKpiContext = createContext<WeeklyKpiContextValue | undefined>(
  undefined
);

// Every numeric field name (e.g. "hseToolBoxTalk") maps mechanically to its
// snake_case column name ("hse_tool_box_talk") — one helper instead of 26
// hand-written pairs that could drift out of sync with types/weeklyKpi.ts.
function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): WeeklyKpiRecord {
  const numericEntries = WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [
    f.key,
    Number(row[camelToSnake(f.key)]) || 0,
  ]);
  return {
    id: row.id,
    projectName: row.project_name,
    date: row.date,
    ...(Object.fromEntries(numericEntries) as Record<
      WeeklyKpiNumericField,
      number
    >),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toNumericPayload(
  record: Record<WeeklyKpiNumericField, number>
): Record<string, number> {
  return Object.fromEntries(
    WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [camelToSnake(f.key), record[f.key]])
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDaily(row: any): DailyKpiRecord {
  return {
    id: row.id,
    projectName: row.project_name,
    date: row.date,
    values: row.values ?? {},
    shift: row.shift ?? null,
    meetingMinutesUrl: row.meeting_minutes_url ?? null,
    meetingMinutesName: row.meeting_minutes_name ?? null,
  };
}

/** Saturday that closes the Sunday–Saturday week containing `date` (YYYY-MM-DD). */
function weekEnding(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (6 - d.getUTCDay()));
  return d.toISOString().slice(0, 10);
}

/**
 * Totals the daily entries into one weekly KPI row per project per week, so
 * the KPI page (and everything else built on weekly KPI) includes them.
 * Average Manpower is averaged over the days entered; everything else sums.
 */
function aggregateDaily(daily: DailyKpiRecord[]): WeeklyKpiRecord[] {
  const groups = new Map<string, DailyKpiRecord[]>();
  for (const d of daily) {
    const key = `${d.projectName}|${weekEnding(d.date)}`;
    const list = groups.get(key) ?? [];
    list.push(d);
    groups.set(key, list);
  }
  return Array.from(groups, ([key, days]) => {
    const [projectName, weekEnd] = key.split("|");
    const num = (k: DailyKpiKey) => days.reduce((s, d) => s + (Number(d.values[k]) || 0), 0);
    const fields = Object.fromEntries(
      WEEKLY_KPI_NUMERIC_FIELDS.map((f) => [f.key, num(f.key)])
    ) as Record<WeeklyKpiNumericField, number>;
    const manpowerDays = days.filter((d) => Number(d.values.averageManpower) > 0).length;
    fields.averageManpower = manpowerDays ? Math.round(num("averageManpower") / manpowerDays) : 0;
    fields.leading = LEADING_KEYS.reduce((s, k) => s + fields[k], 0);
    fields.lagging = LAGGING_KEYS.reduce((s, k) => s + fields[k], 0);
    return {
      id: `daily:${projectName}:${weekEnd}`,
      projectName,
      date: weekEnd,
      ...fields,
      createdAt: weekEnd,
      updatedAt: weekEnd,
      source: "daily" as const,
    };
  });
}

export function WeeklyKpiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<WeeklyKpiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daily, setDaily] = useState<DailyKpiRecord[]>([]);

  // Gated on `user` — see the matching comment in ObservationsContext.tsx.
  useEffect(() => {
    if (!user) {
      setRecords([]);
      setDaily([]);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    supabase
      .from("weekly_kpi_records")
      .select("*")
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (!active) return;
        if (!error && data) setRecords(data.map(mapRow));
        const dailyRes = await supabase.from("daily_kpi_records").select("*").order("date", { ascending: true });
        if (!active) return;
        if (!dailyRes.error && dailyRes.data) setDaily(dailyRes.data.map(mapDaily));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Weekly rows entered on the KPI page + weeks totalled from daily entries.
  const allRecords = useMemo(
    () =>
      [...records.map((r) => ({ ...r, source: "weekly" as const })), ...aggregateDaily(daily)].sort((a, b) =>
        (b.date ?? "").localeCompare(a.date ?? "")
      ),
    [records, daily]
  );
  const scopedRecords = useProjectScoped(allRecords, (r) => r.projectName);
  const scopedDaily = useProjectScoped(daily, (d) => d.projectName);

  const upsertDaily = (rows: DailyKpiRecord[]) =>
    setDaily((prev) => {
      const byKey = new Map(prev.map((d) => [`${d.projectName}|${d.date}`, d]));
      rows.forEach((r) => byKey.set(`${r.projectName}|${r.date}`, r));
      return Array.from(byKey.values()).sort((a, b) => a.date.localeCompare(b.date));
    });

  const value = useMemo<WeeklyKpiContextValue>(
    () => ({
      records: scopedRecords,
      isLoading,
      dailyRecords: scopedDaily,
      saveDailyRecords: async (days) => {
        if (days.length === 0) return;
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("daily_kpi_records")
          .upsert(
            days.map((d) => ({
              project_name: d.projectName,
              date: d.date,
              values: d.values,
              shift: d.shift,
              created_by,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "project_name,date" }
          )
          .select();
        if (error || !data) throw new Error(error?.message ?? "Failed to save daily KPI");
        upsertDaily(data.map(mapDaily));
      },
      attachMeetingMinutes: async (projectName, date, dataUrl, fileName) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("daily_kpi_records")
          .upsert(
            {
              project_name: projectName,
              date,
              meeting_minutes_url: dataUrl,
              meeting_minutes_name: fileName,
              created_by,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "project_name,date" }
          )
          .select()
          .single();
        if (error || !data) throw new Error(error?.message ?? "Failed to attach minutes");
        upsertDaily([mapDaily(data)]);
      },
      getById: (id: string) => records.find((r) => r.id === id),
      addRecord: async (r) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("weekly_kpi_records")
          .insert({
            project_name: r.projectName,
            date: r.date,
            ...toNumericPayload(r),
            created_by,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to create record");
        }
        const newRecord = mapRow(data);
        setRecords((prev) => [newRecord, ...prev]);
        return newRecord;
      },
      updateRecord: async (id, patch) => {
        const payload: Record<string, unknown> = {};
        if (patch.projectName !== undefined) payload.project_name = patch.projectName;
        if (patch.date !== undefined) payload.date = patch.date;
        WEEKLY_KPI_NUMERIC_FIELDS.forEach((f) => {
          if (patch[f.key] !== undefined) {
            payload[camelToSnake(f.key)] = patch[f.key];
          }
        });

        const { data, error } = await supabase
          .from("weekly_kpi_records")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to update record");
        }
        const updated = mapRow(data);
        setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      },
    }),
    [records, scopedRecords, scopedDaily, isLoading]
  );

  return (
    <WeeklyKpiContext.Provider value={value}>
      {children}
    </WeeklyKpiContext.Provider>
  );
}

export function useWeeklyKpi() {
  const ctx = useContext(WeeklyKpiContext);
  if (!ctx) {
    throw new Error("useWeeklyKpi must be used within a WeeklyKpiProvider");
  }
  return ctx;
}
