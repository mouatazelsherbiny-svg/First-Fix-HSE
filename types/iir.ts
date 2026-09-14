/**
 * Incident Investigation Report (IIR) — mirrors FF-HSE-FOR-001, stored 1:1
 * with an incidents row via incident_investigations.incident_id. Field
 * names/labels for the form itself live in lib/iirTemplate.ts (config,
 * same pattern as lib/pmvLogs.ts); this file is just the persisted shape.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IirValues = Record<string, any>;

export interface IncidentInvestigation extends IirValues {
  id: string;
  incidentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectiveAction {
  id: string;
  incidentId: string;
  action: string | null;
  hierarchyOfControl: string | null;
  responsiblePerson: string | null;
  dueDate: string | null;
  completedDate: string | null;
  sortOrder: number;
}

/** A new corrective action row being edited in the IIR form, before save
 *  (no id/incidentId yet). */
export interface CorrectiveActionDraft {
  action: string;
  hierarchyOfControl: string;
  responsiblePerson: string;
  dueDate: string;
  completedDate: string;
}
