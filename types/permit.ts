export type PermitStatus =
  | "Pending Approval"
  | "Approved"
  | "Active"
  | "Closed"
  | "Rejected"
  | "Expired";

// The simplified, self-managed lifecycle status shown as "Permit Status" in
// the UI (separate from the approval-workflow `status` above). The app only
// ever writes "New Permit" (on create) or "Closed" (when someone closes the
// permit) — "In Progress" is never persisted, it's derived at render time by
// getPermitProgress() (lib/permitProgress.ts) from the current time vs. the
// permit's scheduled window.
export type PermitProgressStatus = "New Permit" | "In Progress" | "Closed";

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
  receiver: string;
  hseValidator: string;
  supervisorForeman: string;
  emergencyContactNumber: string;
  issuerSignature: string;
  receiverSignature: string;
  permitStatus: PermitProgressStatus;
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
