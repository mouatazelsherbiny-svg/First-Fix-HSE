import { ChecklistTemplate } from "@/types/checklist";
import { environmentalChecklist } from "./environmental";
import { fireAssessmentChecklist } from "./fireAssessment";
import { safetyHealthChecklist } from "./safetyHealth";
import { tcEnergizationChecklist } from "./tcEnergization";

/** Lookup by `ChecklistSubmission.templateKey` — lets any past submission
 *  be matched back to its template (title + full section/question text)
 *  for re-rendering or re-exporting, without re-fetching anything. */
export const CHECKLIST_TEMPLATES: Record<string, ChecklistTemplate> = {
  environmental: environmentalChecklist,
  fireAssessment: fireAssessmentChecklist,
  safetyHealth: safetyHealthChecklist,
  tcEnergization: tcEnergizationChecklist,
};

export const CHECKLIST_KEYS = Object.keys(CHECKLIST_TEMPLATES);
