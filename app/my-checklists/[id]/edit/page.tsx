"use client";

/** Edit a submitted Monthly Checklist (all three pages). */

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChecklistTemplate from "@/components/checklist/ChecklistTemplate";
import { useChecklistSubmission } from "@/lib/useChecklistSubmission";

export default function EditChecklistPage() {
  return (
    <ProtectedRoute>
      <EditChecklist />
    </ProtectedRoute>
  );
}

function EditChecklist() {
  const { id } = useParams<{ id: string }>();
  const { submission, template, error } = useChecklistSubmission(id);
  if (error) return <p className="py-16 text-center text-sm text-red-400">{error}</p>;
  if (!submission || !template) return <p className="py-16 text-center text-sm text-white/60">Loading…</p>;
  return <ChecklistTemplate key={submission.id} template={template} initial={submission} />;
}
