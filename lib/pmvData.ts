/**
 * PLACEHOLDER data for the /pmv dashboard.
 *
 * Mouataz will send the real fleet/operator/inspection data separately —
 * when that arrives, replace the values below (keep the shapes from
 * `types/pmv.ts` unchanged) rather than editing app/pmv/page.tsx, which
 * just renders whatever this file exports.
 */
import {
  ExpiringDocumentRow,
  OperatorStatusCounts,
  PmvSummary,
  PmvTypeBreakdown,
  UpcomingInspection,
} from "@/types/pmv";

export const PMV_SUMMARY: PmvSummary = {
  totalPmv: 124,
  vehiclesCount: 78,
  machineryCount: 32,
  equipmentCount: 14,
  dueForInspection: 18,
  authorizedOperators: 86,
  totalOperators: 113,
  expiringDocuments: 27,
  totalDocuments: 225,
};

export const PMV_BY_TYPE: PmvTypeBreakdown[] = [
  { key: "vehicles", total: 78, available: 68 },
  { key: "excavators", total: 7, available: 6 },
  { key: "loaders", total: 5, available: 4 },
  { key: "forklifts", total: 6, available: 5 },
  { key: "dumpTrucks", total: 4, available: 3 },
  { key: "generators", total: 9, available: 8 },
  { key: "otherEquipment", total: 15, available: 12 },
];

export const OPERATOR_STATUS: OperatorStatusCounts = {
  active: 86,
  inactive: 14,
  suspended: 8,
  onLeave: 5,
};

export const UPCOMING_INSPECTIONS: UpcomingInspection[] = [
  { pmvId: "V-0142", type: "Truck", description: "Mercedes Actros", dueDate: "2025-09-15", status: "Due Soon" },
  { pmvId: "E-0038", type: "Excavator", description: "CAT 320D", dueDate: "2025-09-17", status: "Due Soon" },
  { pmvId: "L-0211", type: "Loader", description: "Volvo L120H", dueDate: "2025-09-20", status: "Due Soon" },
  { pmvId: "G-0076", type: "Generator", description: "Atlas Copco", dueDate: "2025-09-22", status: "Due Soon" },
  { pmvId: "V-0045", type: "Truck", description: "Mercedes Actros", dueDate: "2025-09-25", status: "On Time" },
];

export const EXPIRING_DOCUMENTS: ExpiringDocumentRow[] = [
  { documentType: "Operator License", count: 12 },
  { documentType: "Vehicle Registration", count: 7 },
  { documentType: "Insurance", count: 4 },
  { documentType: "Third-Party Inspection", count: 2 },
  { documentType: "Equipment Certificate", count: 2 },
];
