"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { TrainingRecord } from "@/types/toolboxTalk";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";

interface ToolboxTalkContextValue {
  records: TrainingRecord[];
  isLoading: boolean;
  getById: (id: string) => TrainingRecord | undefined;
  addRecord: (
    record: Omit<TrainingRecord, "id" | "createdAt">
  ) => Promise<TrainingRecord>;
}

const ToolboxTalkContext = createContext<ToolboxTalkContextValue | undefined>(
  undefined
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): TrainingRecord {
  return {
    id: row.id,
    projectName: row.project_name,
    siteLocation: row.site_location,
    date: row.date,
    inductedBy: row.inducted_by,
    topic: row.topic,
    sessions: row.sessions,
    attendees: row.attendees,
    lectureDuration: row.lecture_duration,
    trainingManHours: row.training_man_hours,
    details: row.details ?? "",
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
  };
}

export function ToolboxTalkProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("toolbox_talk_records")
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

  const value = useMemo<ToolboxTalkContextValue>(
    () => ({
      records,
      isLoading,
      getById: (id: string) => records.find((r) => r.id === id),
      addRecord: async (record) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("toolbox_talk_records")
          .insert({
            project_name: record.projectName,
            site_location: record.siteLocation,
            date: record.date,
            inducted_by: record.inductedBy,
            topic: record.topic,
            sessions: record.sessions,
            attendees: record.attendees,
            lecture_duration: record.lectureDuration,
            training_man_hours: record.trainingManHours,
            details: record.details,
            attachments: record.attachments,
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
    }),
    [records, isLoading]
  );

  return (
    <ToolboxTalkContext.Provider value={value}>
      {children}
    </ToolboxTalkContext.Provider>
  );
}

export function useToolboxTalk() {
  const ctx = useContext(ToolboxTalkContext);
  if (!ctx) {
    throw new Error("useToolboxTalk must be used within a ToolboxTalkProvider");
  }
  return ctx;
}
