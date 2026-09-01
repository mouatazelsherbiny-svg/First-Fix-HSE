export interface WeeklyKpiRecord {
  id: string;
  projectName: string;
  date: string;
  averageManpower: number;
  totalManhours: number;
  totalSafeWorkHours: number;
  hseTrainingSession: number;
  hseMeetings: number;
  hseToolBoxTalk: number;
  hseInspection: number;
  seniorLeaderTeam: number;
  hseAuditsInternal: number;
  hseAwardsRecognition: number;
  hseInitiatives: number;
  emergencyDrill: number;
  nearMisses: number;
  lifeSavingRules: number;
  fatality: number;
  lostTimeIncidentRate: number;
  restrictedWorkCases: number;
  medicalTreatmentCases: number;
  firstAidCases: number;
  deathInService: number;
  dangerousOccurrence: number;
  fireIncident: number;
  environmentalIncident: number;
  propertyDamage: number;
  utilityHit: number;
  nonOccupationalIllness: number;
  leading: number;
  lagging: number;
  createdAt: string;
  updatedAt: string;
}

export type WeeklyKpiNumericField = Exclude<
  keyof WeeklyKpiRecord,
  "id" | "projectName" | "date" | "createdAt" | "updatedAt"
>;

export interface KpiFieldDef {
  key: WeeklyKpiNumericField;
  label: string;
}

// Drives both the add/edit form and the table columns — one definition, no
// duplication between the two.
export const WEEKLY_KPI_NUMERIC_FIELDS: KpiFieldDef[] = [
  { key: "averageManpower", label: "Average Manpower" },
  { key: "totalManhours", label: "Total Manhours" },
  { key: "totalSafeWorkHours", label: "Total Safe Work Hours" },
  { key: "hseTrainingSession", label: "HSE Training Session" },
  { key: "hseMeetings", label: "HSE Meetings" },
  { key: "hseToolBoxTalk", label: "HSE Tool Box Talk" },
  { key: "hseInspection", label: "HSE Inspection" },
  { key: "seniorLeaderTeam", label: "Senior Leader Team (SLT)" },
  { key: "hseAuditsInternal", label: "HSE Audits (Internal)" },
  { key: "hseAwardsRecognition", label: "HSE Awards and Recognition" },
  { key: "hseInitiatives", label: "HSE Initiatives" },
  { key: "emergencyDrill", label: "Emergency Drill" },
  { key: "nearMisses", label: "Near Misses" },
  { key: "lifeSavingRules", label: "Life Saving Rules" },
  { key: "fatality", label: "Fatality (FAT)" },
  { key: "lostTimeIncidentRate", label: "Lost Time Incident Rate (LTIR)" },
  { key: "restrictedWorkCases", label: "Restricted Work Cases (RWC)" },
  { key: "medicalTreatmentCases", label: "Medical Treatment Cases (MTC)" },
  { key: "firstAidCases", label: "First Aid Cases (FAC)" },
  { key: "deathInService", label: "Death in Service" },
  { key: "dangerousOccurrence", label: "Dangerous Occurrence (D.Os)" },
  { key: "fireIncident", label: "Fire Incident" },
  { key: "environmentalIncident", label: "Environmental Incident" },
  { key: "propertyDamage", label: "Property Damage" },
  { key: "utilityHit", label: "Utility Hit" },
  { key: "nonOccupationalIllness", label: "Non-Occupational illness" },
  { key: "leading", label: "Leading" },
  { key: "lagging", label: "Lagging" },
];
