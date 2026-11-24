export interface ChecklistSectionStat {
  id: string;
  title: string;
  possible: number;
  scored: number;
  pct: number;
}

/** Corrective Actions page → "Observations" table. */
export interface ChecklistObservation {
  description: string;
  dateRequired: string;
}
/** Corrective Actions page → "Contractor Corrective Actions" table. */
export interface ChecklistCorrectiveAction {
  action: string;
  dateCompleted: string;
}
/** Corrective Actions page → the "Designation" table at the bottom. */
export interface ChecklistDesignation {
  name: string;
  signature: string;
  designation: string;
}
/** Photos page: a picture and the checklist item it shows (question id, e.g. "A14"). */
export interface ChecklistPhotoItem {
  image: string;
  item: string;
}
/** Cover page sign-off. */
export interface ChecklistSignoff {
  preparedName: string;
  preparedSignature: string;
  preparedDate: string;
  approvedName: string;
  approvedSignature: string;
  approvedDate: string;
}

export interface ChecklistSubmission {
  id: string;
  templateKey: string;
  inspectedBy: string;
  projectName: string;
  inspectionDate: string;
  projectDirector: string;
  totalManpower: number;
  activity: string;
  sectionStats: ChecklistSectionStat[];
  possibleMap: Record<string, string>;
  scoredMap: Record<string, string>;
  grandPossible: number;
  grandScored: number;
  grandPct: number;
  /** Site photos attached to the submission (base64 data URLs), up to 20. */
  photos: string[];
  observations: ChecklistObservation[];
  correctiveActions: ChecklistCorrectiveAction[];
  designations: ChecklistDesignation[];
  photoItems: ChecklistPhotoItem[];
  signoff: ChecklistSignoff;
  createdBy?: string | null;
  createdAt: string;
}
