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
}
