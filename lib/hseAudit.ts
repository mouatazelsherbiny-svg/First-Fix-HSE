/**
 * HSE Audit — Scoring Rate form (First Fix). Mirrors the paper/PDF form:
 * a Y / N / N/A checklist, Health & Safety and Environmental categories
 * each scored 1–10 (or N/A), and findings with photo, priority and a
 * close-out date. Percentages and Action Status follow the Scoring Matrix.
 */

export type YesNo = "Y" | "N" | "NA";

export const CHECKLIST_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "Safe Systems of Work",
    items: [
      "Contractors Method Statements Agreed",
      "Contractors Risk Assessments Agreed",
      "Contractors HSE Plan - Revision Status",
      "COSHH Assessments Available",
    ],
  },
  {
    title: "Site Documentation DAH",
    items: [
      "Dar KPI Workbook Completed",
      "Contractors Weekly Information KPI",
      "Emergency Drills / Recorded",
      "Safety Alerts / Safety Blitz Displayed",
      "Emergency Plans Completed",
      "Traffic / Logistics Plan (Specific)",
      "Site HSE Notice Board Acceptable",
      "Unsafe Acts / Conditions Recorded",
    ],
  },
  {
    title: "First Aid / Emergency",
    items: ["First Aid Provisions (Sufficient)", "First Aider Identified", "Emergency First Aider (Appointed)"],
  },
  {
    title: "Training Records",
    items: [
      "Fire Marshall / Awareness",
      "Crane Lifting Operations",
      "First Aid Training",
      "Plant Operators Records",
      "Scaffold Training Records",
      "HSE Awareness",
      "Site Management",
      "Site Supervisor",
      "Confined Space / Work at Height",
    ],
  },
  {
    title: "Contractors Permits",
    items: [
      "Hot Work Permit",
      "Work at Height Permit",
      "Electrical Permit (live working)",
      "Lone Working Permit",
      "Excavation Permit",
      "Confined Space Permit",
      "Pressure Systems/Mechanical Permit",
    ],
  },
  {
    title: "Project Safety Register",
    items: [
      "Contractors Site Inductions",
      "Contractors ToolBox Talks",
      "Contractors HSE Reports",
      "Scaffold Inspections / Tagging",
      "Accident Investigations",
      "Electrical Equipment Reports",
      "Plant & Equipment Inspections",
      "Action Plans Closed",
      "RAMS Evaluations Completed",
      "Labour Camp Inspections",
      "Crane Lifting Plans Completed",
      "Lifting Equipment Records",
      "DAH Guidance Procedures",
      "Rescue Procedure Considered",
      "Design Risk Assessments",
      "Environmental Aspects",
      "Risk Registers Completed",
    ],
  },
];

export const HS_ITEMS = [
  "Scaffolding",
  "Excavations",
  "Lifting Ops",
  "Plant / Machinery",
  "Traffic, Pedestrian Management",
  "Fire Precautions",
  "Public Protection",
  "Work at Height",
  "Housekeeping / Material Storage",
  "Welfare Facilities",
  "Personal Protective Equipment",
  "Training, Competency",
  "Electrical Safety",
  "Site Security, HSE Signage",
  "Occupational Health",
];

export const ENV_ITEMS = [
  "Waste Managed Correctly",
  "Fuel Stored Correctly / Bunded",
  "Drip Trays",
  "Refuelling",
  "Environment Training",
  "Spill Kits Available",
  "General Run Off / Discharge",
  "Noise Nuisance",
  "Dust Management",
  "Transport Management",
  "Ecology and Wildlife",
  "Energy Efficiency",
  "Environmental Impacts",
  "Water Pollution",
  "Land Pollution",
];

/** Scoring Matrix (last page of the form). */
export const MATRIX: { score: number; label: string; tone: "red" | "amber" | "green"; action: string }[] = [
  { score: 1, label: "Repeated Failings", tone: "red", action: "Contracts Director involvement; possible disciplinary." },
  { score: 2, label: "Unacceptable", tone: "red", action: "Senior management involvement; improvement notice; corrective action plan urgently required." },
  { score: 3, label: "Poor", tone: "red", action: "Corrective action plan urgently required." },
  { score: 4, label: "Areas at Risk", tone: "amber", action: "Action plan for improvement; seek support from HSE Manager." },
  { score: 5, label: "Improvement Required", tone: "amber", action: "Address areas of weakness with site team and contractors." },
  { score: 6, label: "Improvements Recommended", tone: "amber", action: "Address areas of weakness with site team and contractors." },
  { score: 7, label: "Basic Compliance Achieved", tone: "green", action: "Improvements to be sought where reasonably practicable." },
  { score: 8, label: "Industry Standards Met", tone: "green", action: "Encourage continual improvement and engagement." },
  { score: 9, label: "Very Good", tone: "green", action: "Recognise and share best practice." },
  { score: 10, label: "Exemplar Model of Best Practice", tone: "green", action: "Congratulate site management; share at Director level." },
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

/** Sum of the scored categories out of (scored × 10); N/A categories are left out. */
export function scoreOf(scores: Scores, items: string[]): ScoreResult {
  let total = 0;
  let count = 0;
  for (const i of items) {
    const v = scores[i];
    if (typeof v === "number" && v >= 1 && v <= 10) {
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

export type Priority = "High" | "Med" | "Low";
export const PRIORITIES: Priority[] = ["High", "Med", "Low"];
export const PRIORITY_STYLE: Record<Priority, { bg: string; fg: string }> = {
  High: { bg: "#DC2626", fg: "#FFFFFF" },
  Med: { bg: "#FACC15", fg: "#1F2937" },
  Low: { bg: "#84CC16", fg: "#1F2937" },
};

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
    priority: (r.priority as Priority) ?? "Med",
    closeOutDate: r.close_out_date ?? "",
    status: r.status === "Closed" ? "Closed" : "Open",
    closedOn: r.closed_on ?? "",
    closureNote: r.closure_note ?? "",
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
    updated_at: new Date().toISOString(),
  };
}

/** Columns for list views — leaves out the heavy report file. */
export const AUDIT_LIST_COLUMNS =
  "id,project_name,contractor,hse_manager,project_manager,auditor,audit_date,target_pct,checklist,hs_scores,env_scores,summary,report_file_name,created_by";
