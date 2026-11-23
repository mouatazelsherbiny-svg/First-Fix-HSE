/**
 * IIR — Incident Investigation Report (form FF-HSE-FOR-001 rev. 01).
 * The fields, check boxes and drop-down lists below follow the Word form
 * one to one (sections 1-17, the photo sheet and the witness statement), so
 * the page, the PDF and the Word export (lib/iirWord.ts) all say the same.
 * Stored in Supabase table `iir_reports`: the form in `data` (jsonb), the
 * cover photo, the photo sheet and the two signatures as data URLs.
 */

export const IIR_FORM_NO = "FF-HSE-FOR-001 - rev. 01";

/* ---------------- drop-down lists (exactly as in the Word form) ---------------- */

export const RELEASED_TO = ["Air", "Contained Area", "Other", "Soil", "Water", "Hydrocarbon solvent"];
export const ENV_SEVERITY = ["Level 1", "Level 2", "Level 3"];
export const YES_NO = ["YES", "NO"];
export const VALUE_CATEGORY = ["< $500,000", ">= $500,000"];
export const PROCESS_CAUSE = [
  "Distractions from Work",
  "Distractions Inside the vehicle/equipment",
  "Employee fails to recognize potential hazards/situations",
  "Equipment/Vehicle Tools (Improper use)",
  "Equipment/Vehicle Tools (Defective)",
  "Equipment/Vehicle Tools (Unsafe use)",
  "Eyes on path (eyes improperly focused indirection)",
  "Eyes on Work (eyes improperly focused on word)",
  "Failure to conduct workplace surveys",
  "Failure to follow Supervisor Instructions",
  "Faulty Plant Facilities",
  "Fitness for Duty",
  "Horseplay/Altercation",
  "Housekeeping (Poor)",
  "Illumination (Inadequate)",
  "Inadequate Barricades/Signs/guard/Devices",
  "Inadequate Policy/Procedure",
  "Inclement Weather/Nature",
  "Indigenous pest and vermin species",
  "Inspection/Maintenance (inadequate –Lack of)",
  "Job Factors (poor pre –job planning)",
  "Lack of Lockout /Tagout",
  "Lack of support from mangers/coworkers",
  "Ladders (improper selection, use)",
  "Link of Fire (incorrect body position)",
  "Not Wearing PPE",
  "Not applicable",
  "Operate Without Authority",
  "People Interaction (poor communication, asking for assistance)",
  "Personal protective Equipment (Improper -PPE)",
  "Poor relationships with others",
  "Repetitive work Activity /Ergonomic Hazards",
  "Shortcut /Haste /Inattention",
  "Storage (Unsafe)",
  "Surface (Defective)",
  "Training Deficiency",
  "Unknown",
];
export const ACTION_CAUSE = [
  "Caught In /Between",
  "Contact With (chemicals, hazardous substance, insect, animals, heat, cold)",
  "Electrical Shock",
  "Explosion /Fire",
  "Exposure (noise, dust, radiation)",
  "Exposure to Heat/cold /Environment",
  "Fall Form Elevation",
  "Fall Form Same Level",
  "Grinding, Sanding, scraping, Cleaning, Blowing",
  "Inhaled/Absorbed/Ingested",
  "Not applicable",
  "Other",
  "Repetitive Motion/Body Position /Ergonomic Hazards",
  "Slip/Trip",
  "Strain/overexertion (lifting, climbing, pulling, pushing)",
  "Struck By/Against (includes foreign bodies to eye, cutting, falling object)",
  "Unknown",
  "Vehicular Accident (driver, passenger, pedestrian)",
  "Welding",
];
export const OBJECT_CAUSE = [
  "Animal/Insects",
  "Building Structure",
  "Chemical/Caustic/Acid Substance",
  "Cluttered Workplace",
  "Construction material",
  "Equipment (Construction)",
  "Equipment (Plant)",
  "Excavation/Trenches",
  "Falling /Flying Objects",
  "Hand Tools (Not Powered)",
  "Hand Tools (Pneumatic)",
  "Hand Tools (Power)",
  "Kitchenette Appliances",
  "Ladder (Construction)",
  "Ladders (Permanent)",
  "Motor Vehicle",
  "Not applicable",
  "Office (Equipment)",
  "Office (Misc.)",
  "Other",
  "Rigging",
  "Scaffold",
  "Shrubs/Grass/Plants",
  "Spills",
  "Surface (Walking/Working)",
  "Unknown",
  "Weather/Nature",
];
export const IMPACT_ENERGY = ["biological", "catastrophic", "Chemical", "Electrical", "Gravitational", "Human", "Machine", "Noise", "Object", "Radiation", "Thermal", "Vehicle"];
export const SEVERITY_LEVEL = ["1- Slight", "2- Minor", "3- Moderate", "4- Major", "5- Catastrophic"];
export const IMPACT_TYPE = ["SAFETY AND HUMAN HEALTH", "ENVIRONMENTAL", "COMPANY REPUTATION", "LIABILITY/PROPERTY LOSS"];
export const RISK_PROBABILITY = ["1. Practically Never Occurs", "2. Not Likely to Occur", "3. Could Occur", "4. Known to Occur", "5. Occurs Frequently"];
export const TOTAL_LOSS_POTENTIAL = [
  "(1) LOW",
  "(2) LOW",
  "(3) LOW",
  "(4) LOW",
  "(5) MEDIUM",
  "(6) MEDIUM",
  "(8) MEDIUM",
  "(9) MEDIUM",
  "(10) HIGH",
  "(12) HIGH",
  "(15) HIGH",
  "(16) HIGH",
  "(20) HIGH",
  "(25) HIGH",
];
export const LIFE_SAVING_RULES = [
  "Work at Height",
  "Dropped Objects",
  "Confined Space",
  "Energy Isolation",
  "Barricades and Signs",
  "Excavation",
  "Lifting Operations",
  "Safety Controls",
  "Permit to Work",
  "Mobile Equipment & Personnel Interface (MEPI)",
];
export const HIERARCHY = ["Elimination", "Substitution", "Engineering", "Adminstration", "PPE"];

/** Incident categories for the cover page (same list as Add FICC). */
export const INCIDENT_CATEGORIES = [
  "LSR Violation",
  "Near Miss",
  "Significant Near Miss",
  "First Aid Case",
  "Medical Treatment Case",
  "Restricted Work Case",
  "Recordable Injury",
  "Property Damage",
  "Dangerous Occurrence",
  "Road Traffic Accident",
  "Fire",
  "Environmental",
  "Non-Occupational Illness",
  "Altercation",
  "Other",
];

/** Total Loss Potential = Severity Level × Risk Probability (1-4 LOW, 5-9 MEDIUM, 10+ HIGH). */
export function totalLossPotential(severity: string, probability: string): string {
  const s = parseInt(severity, 10);
  const p = parseInt(probability, 10);
  if (!s || !p) return "";
  const v = s * p;
  return `(${v}) ${v <= 4 ? "LOW" : v <= 9 ? "MEDIUM" : "HIGH"}`;
}

export function tlpTone(tlp: string): "low" | "medium" | "high" | "" {
  return /HIGH/.test(tlp) ? "high" : /MEDIUM/.test(tlp) ? "medium" : /LOW/.test(tlp) ? "low" : "";
}

/* ---------------- the form ---------------- */

export interface IirAction {
  action: string;
  hierarchy: string;
  responsible: string;
  due: string;
  completed: string;
}

export interface IirPhoto {
  image: string;
  no: string;
  date: string;
  time: string;
  location: string;
  description: string;
  notes: string;
  photographer: string;
}

/** Text fields and drop-downs (string) + check boxes (boolean), keyed like the Word template. */
export interface IirData {
  // cover
  coverCategory: string;
  // classification
  cls_injury: boolean;
  cls_env: boolean;
  cls_nearMiss: boolean;
  cls_lsr: boolean;
  cls_property: boolean;
  // 1. project details
  project: string;
  pmTeam: string;
  location: string;
  otherLocation: string;
  incidentTime: string;
  reportTime: string;
  incidentDate: string;
  reportDate: string;
  spic: string;
  projectDirector: string;
  hsePm: string;
  workRelated: boolean;
  nonWorkRelated: boolean;
  onSite: boolean;
  offSite: boolean;
  rta: boolean;
  firstFix: boolean;
  subContractor: boolean;
  // 2. incident summary
  summary: string;
  // 3. employee information
  surname: string;
  firstName: string;
  dob: string;
  company: string;
  employeeId: string;
  hireDate: string;
  tradeDate: string;
  position: string;
  // 4. injury / illness
  inj_na: boolean;
  lwc: boolean;
  rwc: boolean;
  mtc: boolean;
  fac: boolean;
  bodyPart: string;
  injuryDescription: string;
  ems: string;
  treatment: string;
  // 5. near miss
  nm_na: boolean;
  nm_fatality: boolean;
  nm_env: boolean;
  nm_property: boolean;
  nm_utility: boolean;
  // 6. environmental
  env_na: boolean;
  envCategory: string;
  substance: string;
  equipmentSource: string;
  releasedTo: string;
  severity: string;
  quantity: string;
  unit: string;
  spillCleanup: string;
  envProcessCause: string;
  // 7. property damage
  pd_na: boolean;
  own_firstFix: boolean;
  own_client: boolean;
  own_public: boolean;
  own_utility: boolean;
  equipmentType: string;
  makeModel: string;
  vandalism: string;
  plantRegNo: string;
  fire: string;
  valueCategory: string;
  // 8. utility hit
  ut_na: boolean;
  utilityType: string;
  // 9. incident detail
  processCause: string;
  activity: string;
  actionCause: string;
  objectCause: string;
  impactEnergy: string;
  behaviour: boolean;
  condition: boolean;
  environment: boolean;
  // 10. total loss potential
  severityLevel: string;
  impactType: string;
  riskProbability: string;
  tlp: string;
  // 11. causal analysis
  causalFactors: string;
  causalDiscussion: string;
  rootCause: string;
  noLsr: boolean;
  lsrViolation: boolean;
  lsrRule: string;
  // 12. corrective actions (5 rows, one per hierarchy level)
  actions: IirAction[];
  // 13. sign off (signatures are stored apart)
  hseName: string;
  hseDate: string;
  pmName: string;
  pmDate: string;
  // 14. attachments
  att_starrt: boolean;
  att_witness: boolean;
  att_permit: boolean;
  att_equipment: boolean;
  att_training: boolean;
  attOther: string;
  // witness statement — 16. employee interview, 17. description
  wProject: string;
  wProjectNumber: string;
  wDate: string;
  wTime: string;
  wEmployee: string;
  wPosition: string;
  wId: string;
  wSupervisor: string;
  wSupervisorPosition: string;
  wInterviewer: string;
  wPrepDate: string;
  involvement: string;
}

export const emptyPhoto = (): IirPhoto => ({ image: "", no: "", date: "", time: "", location: "", description: "", notes: "", photographer: "" });

export function emptyIir(): IirData {
  return {
    coverCategory: "",
    cls_injury: false,
    cls_env: false,
    cls_nearMiss: false,
    cls_lsr: false,
    cls_property: false,
    project: "",
    pmTeam: "",
    location: "",
    otherLocation: "",
    incidentTime: "",
    reportTime: "",
    incidentDate: "",
    reportDate: "",
    spic: "",
    projectDirector: "",
    hsePm: "",
    workRelated: false,
    nonWorkRelated: false,
    onSite: false,
    offSite: false,
    rta: false,
    firstFix: false,
    subContractor: false,
    summary: "",
    surname: "",
    firstName: "",
    dob: "",
    company: "",
    employeeId: "",
    hireDate: "",
    tradeDate: "",
    position: "",
    // "Check if Not Applicable" is ticked on the blank form.
    inj_na: true,
    lwc: false,
    rwc: false,
    mtc: false,
    fac: false,
    bodyPart: "",
    injuryDescription: "",
    ems: "",
    treatment: "",
    nm_na: true,
    nm_fatality: false,
    nm_env: false,
    nm_property: false,
    nm_utility: false,
    env_na: true,
    envCategory: "",
    substance: "",
    equipmentSource: "",
    releasedTo: "",
    severity: "",
    quantity: "",
    unit: "",
    spillCleanup: "",
    envProcessCause: "",
    pd_na: true,
    own_firstFix: false,
    own_client: false,
    own_public: false,
    own_utility: false,
    equipmentType: "",
    makeModel: "",
    vandalism: "",
    plantRegNo: "",
    fire: "",
    valueCategory: "",
    ut_na: true,
    utilityType: "",
    processCause: "",
    activity: "",
    actionCause: "",
    objectCause: "",
    impactEnergy: "",
    behaviour: false,
    condition: false,
    environment: false,
    severityLevel: "",
    impactType: "",
    riskProbability: "",
    tlp: "",
    causalFactors: "",
    causalDiscussion: "",
    rootCause: "",
    noLsr: false,
    lsrViolation: false,
    lsrRule: "",
    actions: HIERARCHY.map((h) => ({ action: "", hierarchy: h, responsible: "", due: "", completed: "" })),
    hseName: "",
    hseDate: "",
    pmName: "",
    pmDate: "",
    att_starrt: false,
    att_witness: false,
    att_permit: false,
    att_equipment: false,
    att_training: false,
    attOther: "",
    wProject: "",
    wProjectNumber: "",
    wDate: "",
    wTime: "",
    wEmployee: "",
    wPosition: "",
    wId: "",
    wSupervisor: "",
    wSupervisorPosition: "",
    wInterviewer: "",
    wPrepDate: "",
    involvement: "",
  };
}

export interface IirSignatures {
  hse: string;
  pm: string;
}

export interface IirReport {
  id?: string;
  createdAt?: string;
  createdBy?: string | null;
  createdByName: string;
  status: string;
  data: IirData;
  coverPhoto: string;
  photos: IirPhoto[];
  signatures: IirSignatures;
}

/** Columns for lists (no photos / signatures, which are large). */
export const IIR_LIST_COLUMNS = "id,created_at,created_by,created_by_name,project_name,incident_category,incident_date,status,data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapIir(row: any): IirReport {
  const base = emptyIir();
  const data = { ...base, ...(row.data ?? {}) } as IirData;
  if (!Array.isArray(data.actions) || data.actions.length !== HIERARCHY.length) {
    data.actions = HIERARCHY.map((h, i) => ({ ...base.actions[i], ...(row.data?.actions?.[i] ?? {}), hierarchy: row.data?.actions?.[i]?.hierarchy || h }));
  }
  return {
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    createdByName: row.created_by_name ?? "",
    status: row.status ?? "Submitted",
    data,
    coverPhoto: row.cover_photo ?? "",
    photos: Array.isArray(row.photos) && row.photos.length ? row.photos.map((p: Partial<IirPhoto>) => ({ ...emptyPhoto(), ...p })) : [emptyPhoto(), emptyPhoto()],
    signatures: { hse: row.signatures?.hse ?? "", pm: row.signatures?.pm ?? "" },
  };
}

export function toIirRow(r: IirReport) {
  return {
    created_by_name: r.createdByName,
    project_name: r.data.project,
    incident_category: r.data.coverCategory,
    incident_date: r.data.incidentDate || null,
    status: r.status,
    data: r.data,
    cover_photo: r.coverPhoto,
    photos: r.photos,
    signatures: r.signatures,
    updated_at: new Date().toISOString(),
  };
}

/** "2026-11-23" → "23/11/2026" (the form's date style). */
export function fmtDate(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d || "";
}

export function iirFileName(r: IirReport, ext: string): string {
  const safe = (s: string) => s.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_");
  return `IIR_${safe(r.data.project || "Project") || "Project"}_${r.data.incidentDate || new Date().toISOString().slice(0, 10)}.${ext}`;
}
