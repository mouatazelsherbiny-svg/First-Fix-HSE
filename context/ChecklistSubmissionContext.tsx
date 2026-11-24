"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ChecklistSubmission, ChecklistSignoff } from "@/types/checklistSubmission";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useProjectScoped } from "@/context/ProjectFilterContext";

interface ChecklistSubmissionContextValue {
  submissions: ChecklistSubmission[];
  isLoading: boolean;
  addSubmission: (
    s: Omit<ChecklistSubmission, "id" | "createdAt">
  ) => Promise<ChecklistSubmission>;
  /** Save changes to a submitted checklist (its author or the admin). */
  updateSubmission: (id: string, s: Omit<ChecklistSubmission, "id" | "createdAt">) => Promise<ChecklistSubmission>;
}

const ChecklistSubmissionContext = createContext<
  ChecklistSubmissionContextValue | undefined
>(undefined);

export const EMPTY_SIGNOFF: ChecklistSignoff = {
  preparedName: "",
  preparedSignature: "",
  preparedDate: "",
  approvedName: "Rabih ElChaar",
  approvedSignature: "",
  approvedDate: "",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapChecklistRow(row: any): ChecklistSubmission {
  return mapRow(row);
}

/** Insert / update payload (same columns both ways). */
function toRow(s: Omit<ChecklistSubmission, "id" | "createdAt">) {
  return {
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
    photos: s.photos,
    observations: s.observations,
    corrective_actions: s.correctiveActions,
    designations: s.designations,
    photo_items: s.photoItems,
    signoff: s.signoff,
  };
}

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
    photos: Array.isArray(row.photos) ? row.photos : [],
    observations: Array.isArray(row.observations) ? row.observations : [],
    correctiveActions: Array.isArray(row.corrective_actions) ? row.corrective_actions : [],
    designations: Array.isArray(row.designations) ? row.designations : [],
    // Older submissions only had loose photos: show them on the Photos page without an item.
    photoItems:
      Array.isArray(row.photo_items) && row.photo_items.length
        ? row.photo_items
        : (Array.isArray(row.photos) ? row.photos : []).map((image: string) => ({ image, item: "" })),
    signoff: { ...EMPTY_SIGNOFF, ...(row.signoff ?? {}) },
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
  };
}

export function ChecklistSubmissionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gated on `user` — see the matching comment in ObservationsContext.tsx.
  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
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
  }, [user]);

  const scopedSubmissions = useProjectScoped(submissions, (s) => s.projectName);

  const value = useMemo<ChecklistSubmissionContextValue>(
    () => ({
      submissions: scopedSubmissions,
      isLoading,
      addSubmission: async (s) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("checklist_submissions")
          .insert({ ...toRow(s), created_by })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to submit checklist");
        }
        const created = mapRow(data);
        setSubmissions((prev) => [created, ...prev]);
        return created;
      },
      updateSubmission: async (id, s) => {
        const { data, error } = await supabase
          .from("checklist_submissions")
          .update({ ...toRow(s), updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to save the checklist");
        }
        const updated = mapRow(data);
        setSubmissions((prev) => prev.map((x) => (x.id === id ? updated : x)));
        return updated;
      },
    }),
    [submissions, scopedSubmissions, isLoading]
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
