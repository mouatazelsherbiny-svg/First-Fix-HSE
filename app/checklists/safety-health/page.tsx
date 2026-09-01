"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ChecklistTemplate from "@/components/checklist/ChecklistTemplate";
import { safetyHealthChecklist } from "@/lib/checklists/safetyHealth";

export default function SafetyHealthChecklistPage() {
  return (
    <ProtectedRoute>
      <ChecklistTemplate template={safetyHealthChecklist} />
    </ProtectedRoute>
  );
}
