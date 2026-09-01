export type ObservationStatus = "Open" | "In Progress" | "Closed" | "Overdue";

export interface Observation {
  id: string;
  reportNumber: number;
  projectName: string;
  observationType: string;
  observationTypeOther?: string;
  observationDetails: string;
  classification: string;
  riskRating: string;
  observationPhotos: string[];
  closeOutPhotos: string[];
  closeOutDetails: string;
  status: ObservationStatus;
  inspectedBy: string;
  createdAt: string;
  updatedAt: string;
}
