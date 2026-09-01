"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ChecklistTemplate from "@/components/checklist/ChecklistTemplate";
import { fireAssessmentChecklist } from "@/lib/checklists/fireAssessment";

export default function FireAssessmentChecklistPage() {
  return (
    <ProtectedRoute>
      <ChecklistTemplate template={fireAssessmentChecklist} />
    </ProtectedRoute>
  );
}
