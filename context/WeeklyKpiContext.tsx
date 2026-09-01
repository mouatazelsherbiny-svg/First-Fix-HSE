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

interface WeeklyKpiContextValue {
  records: WeeklyKpiRecord[];
  isLoading: boolean;
  getById: (id: string) => WeeklyKpiRecord | undefined;
  addRecord: (
    r: Omit<WeeklyKpiRecord, "id" | "createdAt" | "updatedAt">
  ) => Promise<WeeklyKpiRecord>;
  updateRecord: (id: string, patch: Partial<WeeklyKpiRecord>) => Promise<void>;
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

export function WeeklyKpiProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<WeeklyKpiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("weekly_kpi_records")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setRecords(data.map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<WeeklyKpiContextValue>(
    () => ({
      records,
      isLoading,
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
    [records, isLoading]
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
