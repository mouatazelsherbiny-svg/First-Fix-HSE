import { UploadedFile } from "./toolboxTalk";

export type DisciplinaryType =
  | "Verbal Warning"
  | "Written Warning"
  | "Violation"
  | "LSR";

export interface DisciplinaryRecord {
  id: string;
  employeeId: string;
  type: DisciplinaryType;
  violationCategory?: string;
  date: string;
  details: string;
  attachments: UploadedFile[];
  createdAt: string;
}

export type PPECondition = "Good" | "Damaged" | "Lost" | "N/A";

export interface PPERecord {
  id: string;
  employeeId: string;
  ppeType: string;
  received: boolean;
  dateReceived: string;
  replacementDueDate: string;
  conditionAtReturn: PPECondition;
  remarks: string;
  attachments: UploadedFile[];
  createdAt: string;
}

export type TrainingStatus = "Valid" | "Expired";

export interface TrainingCourseRecord {
  id: string;
  employeeId: string;
  courseName: string;
  date: string;
  status: TrainingStatus;
  hours: number;
  attachments: UploadedFile[];
  createdAt: string;
}
