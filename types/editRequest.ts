export type EditRequestStatus = "Pending" | "Approved" | "Rejected";

export interface EditRequest {
  id: string;
  tableName: string;
  recordId: string;
  recordLabel: string;
  requestedBy: string | null;
  requesterName: string;
  requesterProject: string;
  notes: string;
  status: EditRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
}
