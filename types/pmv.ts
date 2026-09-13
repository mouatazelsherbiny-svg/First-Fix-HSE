/**
 * PMV = Plant, Machinery & Vehicles: the fleet the company tracks for
 * inspection/certification compliance (vehicles, heavy machinery, and
 * misc. site equipment), plus the operators authorized to run it.
 *
 * The shapes below back the /pmv dashboard. Placeholder sample data lives
 * in `lib/pmvData.ts` until the real fleet/operator data is wired up
 * (e.g. from Supabase) — swap that file's contents, not this one.
 */

/** One equipment category shown in the "PMV by Type" breakdown. */
export interface PmvTypeBreakdown {
  /** Stable key used to look up the translated label + icon. */
  key:
    | "vehicles"
    | "excavators"
    | "loaders"
    | "forklifts"
    | "dumpTrucks"
    | "generators"
    | "otherEquipment";
  /** Total units of this type. */
  total: number;
  /** Units currently available (not in use / not down for maintenance). */
  available: number;
}

/** Operator headcount by certification/employment status. */
export interface OperatorStatusCounts {
  active: number;
  inactive: number;
  suspended: number;
  onLeave: number;
}

export type InspectionStatus = "Due Soon" | "On Time" | "Overdue";

export interface UpcomingInspection {
  /** Asset tag, e.g. "V-0142". */
  pmvId: string;
  /** Equipment type, e.g. "Truck", "Excavator". */
  type: string;
  /** Model/description, e.g. "Mercedes Actros". */
  description: string;
  /** ISO date (yyyy-mm-dd). */
  dueDate: string;
  status: InspectionStatus;
}

export interface ExpiringDocumentRow {
  documentType: string;
  count: number;
}

/** Top-level KPI numbers shown in the four summary cards. */
export interface PmvSummary {
  totalPmv: number;
  vehiclesCount: number;
  machineryCount: number;
  equipmentCount: number;
  dueForInspection: number;
  authorizedOperators: number;
  totalOperators: number;
  expiringDocuments: number;
  totalDocuments: number;
}
