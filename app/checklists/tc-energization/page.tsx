"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ChecklistTemplate from "@/components/checklist/ChecklistTemplate";
import { tcEnergizationChecklist } from "@/lib/checklists/tcEnergization";

export default function TcEnergizationChecklistPage() {
  return (
    <ProtectedRoute>
      <ChecklistTemplate template={tcEnergizationChecklist} />
    </ProtectedRoute>
  );
}
