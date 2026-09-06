export type PointValue = "N/A" | "0" | "1" | "2";

export const POINT_VALUES: PointValue[] = ["N/A", "0", "1", "2"];

// Options allowed for the "Total Points Possible" selector — always N/A, 0, or 2.
export const POSSIBLE_POINT_VALUES: PointValue[] = ["N/A", "0", "2"];

export interface ChecklistQuestion {
  id: string;
  text: string;
  defaultPossible: PointValue;
}

export type SectionCriticality = "life-critical" | "non-life-critical";

export interface ChecklistSection {
  id: string;
  title: string;
  criticality?: SectionCriticality;
  questions: ChecklistQuestion[];
}

export interface ChecklistTemplate {
  key: string;
  title: string;
  sections: ChecklistSection[];
}
