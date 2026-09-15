export interface Incident {
  id: string;
  incidentNumber: number;
  reportYear: string | null;
  incidentDate: string | null;
  incidentCategory: string;
  recordType: string;
  classification: string | null;
  projectName: string;
  incidentLocation: string;
  team: string | null;
  subcontractorName: string | null;
  incidentDescription: string;
  bodyPart: string | null;
  projectDirector: string | null;
  projectManager: string | null;
  spic: string | null;
  iirSubmissionDate: string | null;
  comment: string | null;
  iirStatus: string | null;
  sourceCreatedBy: string | null;
  sourceModifiedBy: string | null;
  createdAt: string;
  updatedAt: string;

  // FICC / IIR workflow fields (see [[ficc]])
  constructionManager: string | null;
  investigationCommenced: boolean;
  ficcSubmittedBy: string | null;
  /** Deadline (48h after FICC submission) by which the IIR must be filed. */
  iirDueAt: string | null;
  ficcDeadlineEmailSent: boolean;
  /** Report number / incident number shared by the FICC row and its IIR
   *  detail row (see incident_number above) — the link the user asked for
   *  ("هيكون المميز بينهم رقم التقرير"). */

  /** The completed IIR document, attached as a file instead of filled in
   *  through the in-app form (see components/ficc/IirFileAttach.tsx).
   *  Stored as a base64 data URL, same convention as observation photos —
   *  no Supabase Storage bucket in this app. */
  iirFileUrl: string | null;
  iirFileName: string | null;
}

/** A FICC submission — the subset of Incident fields the "Add FICC" form
 *  actually collects. Everything else on the row is either derived
 *  (incident_number, iir_due_at) or filled in later by the IIR. */
export interface FiccInput {
  incidentCategory: string;
  projectName: string;
  incidentLocation: string;
  incidentDate: string;
  incidentTime: string;
  incidentDescription: string;
  projectDirector: string;
  projectManager: string;
  constructionManager: string;
  spic: string;
  investigationCommenced: boolean;
}
