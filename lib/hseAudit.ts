/**
 * HSE Audit (First Fix "HSE Audit - Form rev001"): 01 Scoring Form — the
 * HSE Documentation & Compliance Y / N / N/A checklist and the Health &
 * Safety / Environmental assessment scored 0–10 (or N/A) with a rating;
 * 02 Audit Findings / Observations (category → fixed priority, evidence
 * photo, closed out); 03 Corrective Action Plan per finding. Percentages
 * also map to the Scoring Matrix levels used on the HSE Audit dashboard.
 */

export type YesNo = "Y" | "N" | "NA";

/** "HSE Documentation & Compliance Status" (form rev001) — Y / N / N/A. */
export const CHECKLIST_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "HSE Documents",
    items: [
      "HSE Plans and Procedures",
      "HSE Policies",
      "RAMS Agreed",
      "COSHH Assessments Available",
      "Weekly KPI",
      "Emergency Drills / Recorded",
      "Safety Alerts, Lesson Learned, TBT",
      "Emergency Plan",
      "Traffic / Logistics Plan (Specific)",
      "Site HSE Notice Board Acceptable",
    ],
  },
  {
    title: "Training Records",
    items: [
      "LSR Training Records",
      "Equipment Operator's Training",
      "First Aid & Fire Marshall Training",
      "Job Specific Training Records",
      "Site Management",
      "Site Supervisor",
    ],
  },
  {
    title: "First Aid / Emergency",
    items: ["First Aider (Identified & Approved)", "Fire Marshall (Identified & Approved)", "Contact Details Displayed"],
  },
  {
    title: "Project Safety Register",
    items: [
      "Site Inductions",
      "HSE Inspection Reports",
      "Scaffold Inspections / Tagging",
      "Incident Log",
      "Electrical Equipment Reports",
      "Plant & Equipment Inspections",
      "Environmental Aspects",
      "Action Plans Closed",
      "RAMS Register",
      "Labour Camp Inspections",
    ],
  },
];

/** "HSE Project Assessment" — Health and Safety (scored 0–10 or N/A). */
export const HS_ITEMS = [
  "Work at Height",
  "Lifting Operations",
  "Excavations",
  "Confined Space",
  "Electrical (T&C)",
  "Scaffolding & Ladders",
  "Plant & Machinery",
  "Traffic Management & Public Safety",
  "Permit to Work",
  "Fire Prevention & Protection",
  "Personal Protective Equipment (PPE)",
  "Tools & Accessories",
  "Housekeeping & Material Storage",
  "Management Commitment",
  "Security",
  "HSE Notice Board & Signage",
];

/** "HSE Project Assessment" — Environmental (scored 0–10 or N/A). */
export const ENV_ITEMS = [
  "Hazardous Material Storage",
  "Fuel Storage & Secondary Containment (Bunding)",
  "Refuelling Operations & Drip Trays",
  "Environmental Spills & Soil Protection",
  "Sewage Waste Management",
  "Surface Runoff, Drainage & Discharge Control",
  "Spill Kits Availability & Readiness",
  "Waste Segregation, Recycling & Waste Management",
  "Dust Control & Air Emissions",
  "Noise Management & Nuisance Control",
  "Laydown Areas & Worksite Environmental Management",
  "Water Consumption & Conservation",
  "Environmental Consumption Records & Resource Efficiency",
  "Environmental Training & Awareness",
  "Environmental Signage & Notice Boards",
  "Environmental Legal & Regulatory Compliance",
];

/** The form's 32 finding categories in order, each with its fixed priority (Audit Findings sheet). */
export const FINDING_CATEGORIES: { category: string; priority: "High" | "Medium" | "Low" }[] = [
  ...["Work at Height", "Lifting Operations", "Excavations", "Confined Space", "Electrical (T&C)", "Scaffolding & Ladders", "Hazardous Material Storage", "Fuel Storage & Secondary Containment (Bunding)", "Refuelling Operations & Drip Trays", "Environmental Spills & Soil Protection", "Sewage Waste Management", "Surface Runoff, Drainage & Discharge Control"].map((category) => ({ category, priority: "High" as const })),
  ...["Plant & Machinery", "Traffic Management & Public Safety", "Permit to Work", "Fire Prevention & Protection", "Personal Protective Equipment (PPE)", "Spill Kits Availability & Readiness", "Waste Segregation, Recycling & Waste Management", "Dust Control & Air Emissions", "Noise Management & Nuisance Control", "Laydown Areas & Worksite Environmental Management"].map((category) => ({ category, priority: "Medium" as const })),
  ...["Tools & Accessories", "Housekeeping & Material Storage", "Management Commitment", "Security", "HSE Notice Board & Signage", "Water Consumption & Conservation", "Environmental Consumption Records & Resource Efficiency", "Environmental Training & Awareness", "Environmental Signage & Notice Boards", "Environmental Legal & Regulatory Compliance"].map((category) => ({ category, priority: "Low" as const })),
];

export function categoryPriority(category: string): Priority | null {
  return FINDING_CATEGORIES.find((c) => c.category === category.trim())?.priority ?? null;
}

/** Score rating on the form (H&S / Environmental). */
export const RATINGS = ["Compliant", "Non-Compliant", "Needs Improvement"] as const;
export type Rating = (typeof RATINGS)[number] | "";
export const RATING_STYLE: Record<Exclude<Rating, "">, { bg: string; fg: string }> = {
  Compliant: { bg: "#16A34A", fg: "#FFFFFF" },
  "Non-Compliant": { bg: "#DC2626", fg: "#FFFFFF" },
  "Needs Improvement": { bg: "#F59E0B", fg: "#1F2937" },
};
/** The chosen rating, or (none chosen) Compliant at / above target, Needs Improvement below. */
export function ratingOf(chosen: Rating, pct: number | null, target: number): Rating {
  if (chosen) return chosen;
  if (pct == null) return "";
  return pct >= target ? "Compliant" : "Needs Improvement";
}

/** Items to list for a saved audit: the form's items, plus any older items it was scored on. */
export function itemsFor(current: string[], saved: Record<string, unknown>): string[] {
  return [...current, ...Object.keys(saved).filter((k) => !current.includes(k))];
}

/** Scoring Matrix (last page of the form). */
export const MATRIX: {
  score: number;
  label: string;
  tone: "red" | "amber" | "green";
  outcome: string;
  stopWork: string;
  action: string;
}[] = [
  { score: 1, label: "Repeated Failings", tone: "red", outcome: "Repeat failings. Failure to close out previous actions as listed. Management inaction.", stopWork: "YES", action: "As below but with Contracts Director involvement. Contracts Manager and Site Management to discuss failings — possible disciplinary." },
  { score: 2, label: "Unacceptable", tone: "red", outcome: "Reportable incidents / accidents, personal injury claims, enforcement action / prosecution.", stopWork: "YES", action: "Senior management involvement; First Fix internal improvement notice served. Corrective action plan urgently required." },
  { score: 3, label: "Poor", tone: "red", outcome: "High risk of reportable incidents / accidents — claims.", stopWork: "YES", action: "Corrective action plan urgently required." },
  { score: 4, label: "Areas at Risk", tone: "amber", outcome: "Risk of reportable incident / injury or claims.", stopWork: "Action plan for multiple scores of 4 within report", action: "Action plan for improvement. Seek support from HSE Manager. Internal improvement notice for consistent scores of 4; arrange joint visit / inspection." },
  { score: 5, label: "Improvement Required", tone: "amber", outcome: "Risk of incident / injury or claims.", stopWork: "Possible action plan of 5 scores", action: "Seek support and advice from HSE Manager to address areas of weakness. Look at behavioural standards from site team and contractors." },
  { score: 6, label: "Improvements Recommended", tone: "amber", outcome: "Reasonable standards, some hazards identified, some 'at risk' behaviours to be addressed and closed out at site level.", stopWork: "Possible action plan", action: "Seek support and advice from HSE Manager to address areas of weakness. Look at behavioural standards from site team and contractors." },
  { score: 7, label: "Basic Compliance Achieved", tone: "green", outcome: "Basic legal compliance. No major issues.", stopWork: "No corrective action by management. Continual improvement still expected", action: "No further action mandated if benchmark score cannot reasonably be improved. Improvements to be sought where reasonably practicable." },
  { score: 8, label: "Industry Standards Met", tone: "green", outcome: "Industry standard practice and basic legal compliance being achieved.", stopWork: "No corrective action by FF. Continual improvement sought", action: "Encourage search for continual improvement and new ideas; support HSE culture and engagement." },
  { score: 9, label: "Very Good", tone: "green", outcome: "Well managed, fully compliant with both legal and FF standards.", stopWork: "Recognition from First Fix. Continual improvement still encouraged", action: "Worthy of note. Ensure recognition given where due. Share best practice where found." },
  { score: 10, label: "Exemplar Model of Best Practice", tone: "green", outcome: "Strong management and support; legal / client / FF standards exceeded. Best practice areas evident.", stopWork: "Formal recognition by FF senior management. Standards to be shared, maintained & protected", action: "Congratulate site management. Ensure standards reflected in report wording. Encourage further distribution / circulation at Director level." },
];

export const TONE_STYLE: Record<"red" | "amber" | "green", { bg: string; fg: string }> = {
  red: { bg: "#DC2626", fg: "#FFFFFF" },
  amber: { bg: "#FACC15", fg: "#1F2937" },
  green: { bg: "#84CC16", fg: "#1F2937" },
};

export function scoreTone(score: number): "red" | "amber" | "green" {
  return score <= 3 ? "red" : score <= 6 ? "amber" : "green";
}

export type Scores = Record<string, number | null>;

export interface ScoreResult {
  total: number;
  max: number;
  pct: number | null;
  level: (typeof MATRIX)[number] | null;
}

/** Sum of the scored categories out of (scored × 10), 0–10 each; N/A categories are left out.
 *  Audits saved on the earlier form are scored on their own items. */
export function scoreOf(scores: Scores, items: string[]): ScoreResult {
  let total = 0;
  let count = 0;
  for (const i of itemsFor(items, scores)) {
    const v = scores[i];
    if (typeof v === "number" && v >= 0 && v <= 10) {
      total += v;
      count++;
    }
  }
  const max = count * 10;
  if (!max) return { total: 0, max: 0, pct: null, level: null };
  const pct = Math.round((total / max) * 1000) / 10;
  return { total, max, pct, level: levelOf(pct) };
}

/** 48% → 4 "Areas at Risk", 56% → 5 "Improvement Required", 70% → 7 … */
export function levelOf(pct: number) {
  const s = Math.min(10, Math.max(1, Math.floor(pct / 10)));
  return MATRIX[s - 1];
}

export type Priority = "High" | "Medium" | "Low";
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
export const PRIORITY_STYLE: Record<Priority, { bg: string; fg: string }> = {
  High: { bg: "#DC2626", fg: "#FFFFFF" },
  Medium: { bg: "#FACC15", fg: "#1F2937" },
  Low: { bg: "#84CC16", fg: "#1F2937" },
};

/** Corrective Action Plan status (sheet 03). */
export const CAP_STATUSES = ["Open", "In Progress", "Closed", "On Hold"] as const;
export type CapStatus = (typeof CAP_STATUSES)[number];

export type SignRole = "auditor" | "regional" | "director";
export const SIGN_ROLES: { key: SignRole; label: string }[] = [
  { key: "auditor", label: "HSE Auditor" },
  { key: "regional", label: "Regional HSE Manager" },
  { key: "director", label: "HSE Director" },
];
export type AuditSignatures = Record<SignRole, { name: string; signature: string }>;
export const emptySignatures = (): AuditSignatures => ({
  auditor: { name: "", signature: "" },
  regional: { name: "", signature: "" },
  director: { name: "Rabih ElChaar", signature: "" },
});

export interface AuditFinding {
  id?: string;
  itemNo: number;
  category: string;
  observation: string;
  photo: string;
  priority: Priority;
  closeOutDate: string;
  status: "Open" | "Closed";
  closedOn: string;
  closureNote: string;
  /** Corrective Action Plan (sheet 03); Target Date is closeOutDate. */
  correctiveAction: string;
  responsibleDept: string;
  capStatus: CapStatus;
  completionPct: number;
}

export interface HseAudit {
  id?: string;
  projectName: string;
  contractor: string;
  hseManager: string;
  projectManager: string;
  auditor: string;
  auditDate: string;
  targetPct: number;
  checklist: Record<string, YesNo>;
  hsScores: Scores;
  envScores: Scores;
  hsRating: Rating;
  envRating: Rating;
  signatures: AuditSignatures;
  summary: string;
  reportFile: string;
  reportFileName: string;
  createdBy?: string | null;
  findings: AuditFinding[];
}

export function emptyAudit(): HseAudit {
  return {
    projectName: "",
    contractor: "First Fix Co",
    hseManager: "",
    projectManager: "",
    auditor: "",
    auditDate: new Date().toISOString().slice(0, 10),
    targetPct: 70,
    checklist: {},
    hsScores: {},
    envScores: {},
    hsRating: "",
    envRating: "",
    signatures: emptySignatures(),
    summary: "",
    reportFile: "",
    reportFileName: "",
    findings: [],
  };
}

export function isOverdue(f: Pick<AuditFinding, "status" | "closeOutDate">, today = new Date().toISOString().slice(0, 10)) {
  return f.status === "Open" && !!f.closeOutDate && f.closeOutDate < today;
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFinding(r: any): AuditFinding {
  return {
    id: r.id,
    itemNo: r.item_no ?? 1,
    category: r.category ?? "",
    observation: r.observation ?? "",
    photo: r.photo ?? "",
    priority: r.priority === "Med" ? "Medium" : ((r.priority as Priority) ?? "Medium"),
    closeOutDate: r.close_out_date ?? "",
    status: r.status === "Closed" ? "Closed" : "Open",
    closedOn: r.closed_on ?? "",
    closureNote: r.closure_note ?? "",
    correctiveAction: r.corrective_action ?? "",
    responsibleDept: r.responsible_dept ?? "",
    capStatus: (CAP_STATUSES as readonly string[]).includes(r.cap_status) ? r.cap_status : r.status === "Closed" ? "Closed" : "Open",
    completionPct: Number(r.completion_pct ?? (r.status === "Closed" ? 100 : 0)) || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAudit(r: any, findings: AuditFinding[] = []): HseAudit {
  return {
    id: r.id,
    projectName: r.project_name ?? "",
    contractor: r.contractor ?? "",
    hseManager: r.hse_manager ?? "",
    projectManager: r.project_manager ?? "",
    auditor: r.auditor ?? "",
    auditDate: r.audit_date ?? "",
    targetPct: Number(r.target_pct ?? 70),
    checklist: r.checklist ?? {},
    hsScores: r.hs_scores ?? {},
    envScores: r.env_scores ?? {},
    hsRating: (r.hs_rating ?? "") as Rating,
    envRating: (r.env_rating ?? "") as Rating,
    signatures: { ...emptySignatures(), ...(r.signatures ?? {}) },
    summary: r.summary ?? "",
    reportFile: r.report_file ?? "",
    reportFileName: r.report_file_name ?? "",
    createdBy: r.created_by ?? null,
    findings,
  };
}

export function auditToDb(a: HseAudit) {
  return {
    project_name: a.projectName.trim(),
    contractor: a.contractor.trim() || null,
    hse_manager: a.hseManager.trim() || null,
    project_manager: a.projectManager.trim() || null,
    auditor: a.auditor.trim() || null,
    audit_date: a.auditDate,
    target_pct: a.targetPct || 70,
    checklist: a.checklist,
    hs_scores: a.hsScores,
    env_scores: a.envScores,
    hs_rating: a.hsRating || null,
    env_rating: a.envRating || null,
    signatures: a.signatures,
    summary: a.summary.trim() || null,
    report_file: a.reportFile || null,
    report_file_name: a.reportFileName || null,
    updated_at: new Date().toISOString(),
  };
}

export function findingToDb(f: AuditFinding, auditId: string) {
  return {
    audit_id: auditId,
    item_no: f.itemNo,
    category: f.category.trim() || null,
    observation: f.observation.trim(),
    photo: f.photo || null,
    priority: f.priority,
    close_out_date: f.closeOutDate || null,
    status: f.status,
    closed_on: f.status === "Closed" ? f.closedOn || new Date().toISOString().slice(0, 10) : null,
    closure_note: f.closureNote.trim() || null,
    corrective_action: f.correctiveAction.trim() || null,
    responsible_dept: f.responsibleDept.trim() || null,
    target_date: f.closeOutDate || null,
    cap_status: f.capStatus,
    completion_pct: Math.max(0, Math.min(100, Math.round(f.completionPct || 0))),
    updated_at: new Date().toISOString(),
  };
}

/** Columns for list views — leaves out the heavy report file. */
export const AUDIT_LIST_COLUMNS =
  "id,project_name,contractor,hse_manager,project_manager,auditor,audit_date,target_pct,checklist,hs_scores,env_scores,hs_rating,env_rating,summary,report_file_name,created_by";
