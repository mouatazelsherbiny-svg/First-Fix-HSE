export interface UploadedFile {
  name: string;
  type: string;
  dataUrl: string;
}

export interface TrainingRecord {
  id: string;
  projectName: string;
  siteLocation: string;
  date: string;
  inductedBy: string;
  topic: string;
  sessions: number;
  attendees: number;
  lectureDuration: number;
  trainingManHours: number;
  details: string;
  attachments: UploadedFile[];
  createdAt: string;
}
