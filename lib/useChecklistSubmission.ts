"use client";

/** Load one Monthly Checklist submission by id (for Edit / print), with its template. */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { mapChecklistRow } from "@/context/ChecklistSubmissionContext";
import { CHECKLIST_TEMPLATES } from "@/lib/checklists";
import type { ChecklistSubmission } from "@/types/checklistSubmission";

export function useChecklistSubmission(id: string) {
  const [submission, setSubmission] = useState<ChecklistSubmission | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    supabase
      .from("checklist_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (e || !data) setError("Checklist not found.");
        else setSubmission(mapChecklistRow(data));
      });
  }, [id]);
  const template = submission ? CHECKLIST_TEMPLATES[submission.templateKey] : undefined;
  return { submission, template, error };
}
