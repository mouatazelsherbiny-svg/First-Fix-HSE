export type PermitStatus =
  | "Pending Approval"
  | "Approved"
  | "Active"
  | "Closed"
  | "Rejected"
  | "Expired";

export interface PermitToWork {
  id: string;
  permitNumber: number;
  projectName: string;
  permitType: string;
  permitTypeOther?: string;
  workLocation: string;
  workDescription: string;
  contractor: string;
  numberOfWorkers: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  hazardsIdentified: string[];
  ppeRequired: string[];
  isolationRequired: boolean;
  precautions: string;
  permitPhotos: string[];
  attachments: UploadedPermitFile[];
  status: PermitStatus;
  requestedBy: string;
  approvedBy?: string;
  closeOutDetails: string;
  closeOutPhotos: string[];
  createdAt: string;
  updatedAt: string;
}

// Re-exported under a local name so this file has no import from
// types/toolboxTalk — same shape as UploadedFile there (name/type/dataUrl).
export interface UploadedPermitFile {
  name: string;
  type: string;
  dataUrl: string;
}
