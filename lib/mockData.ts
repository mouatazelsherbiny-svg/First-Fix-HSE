import { Observation } from "@/types/observation";
import { PermitToWork } from "@/types/permit";

export const PROJECTS = [
  "KSP",
  "CEER",
  "ADF",
  "MISK",
  "RCRC",
  "KSKD",
  "CARGO",
  "SEVEN",
  "P05",
  "P06",
  "P09",
  "NURSERY",
  "WELLNESS",
  "ROSEWOOD",
  "Al-Arab Hospital",
  "Al-Madinah",
  "Oceanarium",
  "Al-Qiddya Hotels",
  "Airfield",
  "Resort Core Evn Hotels",
  "Dariyah Square",
  "Exhibition Centre",
  "Six Sense",
];

export const OBSERVATION_TYPES = [
  "Barricades and Signs",
  "Confined Space",
  "Documentation",
  "Dropped Object",
  "Electrical",
  "Environmental",
  "Excavation / Edge Protection",
  "Fall Protection",
  "Falling Object",
  "Fire Protection",
  "Good Practice",
  "Heavy Equipment",
  "Housekeeping",
  "Lifting Operations",
  "LOTO",
  "Mobile equipment personnel Interference MEPI",
  "Permit to Work",
  "PPE",
  "Scaffolds",
  "Tools and Machines",
  "Training / Qualifications",
  "Welfare",
  "Work at Height",
  "Others",
];

export const CLASSIFICATIONS = [
  "Good Practice",
  "Unsafe Act",
  "Unsafe Act&Unsafe Condition",
  "Unsafe Condition",
];

export const RISK_RATINGS = ["Good Practice", "High", "Low", "Medium"];

export const PERMIT_TYPES = [
  "Hot Work",
  "Cold Work",
  "Working at Height",
  "Confined Space Entry",
  "Excavation",
  "Electrical Isolation (LOTO)",
  "Lifting Operation",
  "Energization",
  "Hydro Test",
  "Other",
];

export const HAZARD_CATEGORIES = [
  "Fire / Explosion",
  "Fall from Height",
  "Confined Space",
  "Electrical",
  "Moving Machinery",
  "Excavation Collapse",
  "Chemical Exposure",
  "Manual Handling",
  "Noise",
  "Dropped Objects",
];

export const PPE_FOR_PERMIT = [
  "Helmet",
  "Safety Glasses",
  "Hi-Visibility Vest",
  "Gloves",
  "Safety Shoes",
  "Fall Arrest Harness",
  "Respirator",
  "Face Shield",
  "Ear Protection",
];

export const PERMIT_STATUSES: PermitToWork["status"][] = [
  "Pending Approval",
  "Approved",
  "Active",
  "Closed",
  "Rejected",
  "Expired",
];

// The simplified, self-managed "Permit Status" pill (separate from the
// approval-workflow status above) — see PermitProgressStatus in
// types/permit.ts and lib/permitProgress.ts.
export const PERMIT_PROGRESS_STATUSES: PermitToWork["permitStatus"][] = [
  "New Permit",
  "In Progress",
  "Closed",
];

export const TRAINING_TOPICS = [
  "Work at Height",
  "Fire Safety",
  "PPE Awareness",
  "Manual Handling",
  "Excavation Safety",
];

export const LECTURE_DURATIONS = [15, 30, 60, 90, 120];

export const STATUSES: Observation["status"][] = [
  "Open",
  "In Progress",
  "Closed",
  "Overdue",
];

// The employee directory itself now lives in the `employees` table (fetched
// via HsePassportContext) — this interface is the shared shape components
// pass around; DEPARTMENTS is derived at runtime from whatever employees
// come back, since the directory is no longer a fixed mock list.
export interface EmployeeRecord {
  id: string;
  name: string;
  employeeId: string;
  project: string;
  department: string;
}

export const LIFE_SAVING_RULES = [
  "Work at Height",
  "Dropped Objects",
  "Confined Space",
  "Energy Isolation",
  "Barricades & Signs",
  "Lifting Operations",
  "Safety Controls",
  "Permit to Work",
  "Mobile Equipment / Personnel Interface",
  "Energy Isolation",
];

export const VIOLATION_CATEGORIES = [
  "PPE",
  "WAH",
  "Fire",
  "LOTO",
  "Confined Space",
  "Excavation",
  "Lifting",
];

export const DISCIPLINARY_TYPES = [
  "Verbal Warning",
  "Written Warning",
  "Violation",
  "LSR",
] as const;

export const PPE_TYPES = [
  "Helmet",
  "Safety Glasses (Dark)",
  "Safety Glasses (Clear)",
  "Hi-Visibility Vest",
  "Gloves",
  "Safety Shoes",
];

export const PPE_CONDITIONS = ["Good", "Damaged", "Lost", "N/A"] as const;
