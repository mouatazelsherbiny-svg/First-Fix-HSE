"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ChecklistSubmission } from "@/types/checklistSubmission";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";

interface ChecklistSubmissionContextValue {
  submissions: ChecklistSubmission[];
  isLoading: boolean;
  addSubmission: (
    s: Omit<ChecklistSubmission, "id" | "createdAt">
  ) => Promise<ChecklistSubmission>;
}

const ChecklistSubmissionContext = createContext<
  ChecklistSubmissionContextValue | undefined
>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ChecklistSubmission {
  return {
    id: row.id,
    templateKey: row.template_key,
    inspectedBy: row.inspected_by ?? "",
    projectName: row.project_name ?? "",
    inspectionDate: row.inspection_date ?? "",
    projectDirector: row.project_director ?? "",
    totalManpower: Number(row.total_manpower) || 0,
    activity: row.activity ?? "",
    sectionStats: row.section_stats ?? [],
    possibleMap: row.possible_map ?? {},
    scoredMap: row.scored_map ?? {},
    grandPossible: Number(row.grand_possible) || 0,
    grandScored: Number(row.grand_scored) || 0,
    grandPct: Number(row.grand_pct) || 0,
    createdAt: row.created_at,
  };
}

export function ChecklistSubmissionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("checklist_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setSubmissions(data.map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ChecklistSubmissionContextValue>(
    () => ({
      submissions,
      isLoading,
      addSubmission: async (s) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("checklist_submissions")
          .insert({
            template_key: s.templateKey,
            inspected_by: s.inspectedBy,
            project_name: s.projectName,
            inspection_date: s.inspectionDate || null,
            project_director: s.projectDirector,
            total_manpower: s.totalManpower,
            activity: s.activity,
            section_stats: s.sectionStats,
            possible_map: s.possibleMap,
            scored_map: s.scoredMap,
            grand_possible: s.grandPossible,
            grand_scored: s.grandScored,
            grand_pct: s.grandPct,
            created_by,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to submit checklist");
        }
        const created = mapRow(data);
        setSubmissions((prev) => [created, ...prev]);
        return created;
      },
    }),
    [submissions, isLoading]
  );

  return (
    <ChecklistSubmissionContext.Provider value={value}>
      {children}
    </ChecklistSubmissionContext.Provider>
  );
}

export function useChecklistSubmissions() {
  const ctx = useContext(ChecklistSubmissionContext);
  if (!ctx) {
    throw new Error(
      "useChecklistSubmissions must be used within a ChecklistSubmissionProvider"
    );
  }
  return ctx;
}
