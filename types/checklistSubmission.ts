export interface ChecklistSectionStat {
  id: string;
  title: string;
  possible: number;
  scored: number;
  pct: number;
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
  createdAt: string;
}
