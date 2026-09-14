import { supabase } from "@/lib/supabaseClient";
import type { IirValues } from "@/types/iir";
import type { CorrectiveActionDraft } from "@/types/iir";

/**
 * Persists a completed IIR: one row in incident_investigations plus its
 * corrective_actions rows, in one shot (this form has no draft/edit phase —
 * see components/ficc/IirFormModal.tsx). Callers should follow this with
 * IncidentsContext.markIirSubmitted(incidentId) to flip the parent
 * incident's iir_status/iir_submission_date.
 */
export async function submitIir(
  incidentId: string,
  values: IirValues,
  correctiveActions: CorrectiveActionDraft[]
): Promise<void> {
  const { error: iirError } = await supabase
    .from("incident_investigations")
    .insert({ incident_id: incidentId, ...values });
  if (iirError) {
    throw new Error(iirError.message);
  }

  const rows = correctiveActions
    .filter((a) => a.action.trim() !== "")
    .map((a, index) => ({
      incident_id: incidentId,
      action: a.action || null,
      hierarchy_of_control: a.hierarchyOfControl || null,
      responsible_person: a.responsiblePerson || null,
      due_date: a.dueDate || null,
      completed_date: a.completedDate || null,
      sort_order: index,
    }));

  if (rows.length > 0) {
    const { error: actionsError } = await supabase
      .from("incident_corrective_actions")
      .insert(rows);
    if (actionsError) {
      throw new Error(actionsError.message);
    }
  }
}
