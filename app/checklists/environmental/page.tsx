"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ChecklistTemplate from "@/components/checklist/ChecklistTemplate";
import { environmentalChecklist } from "@/lib/checklists/environmental";

export default function EnvironmentalChecklistPage() {
  return (
    <ProtectedRoute>
      <ChecklistTemplate template={environmentalChecklist} />
    </ProtectedRoute>
  );
}
