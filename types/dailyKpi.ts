import type { WeeklyKpiNumericField } from "@/types/weeklyKpi";

/**
 * Daily KPI — the weekly KPI report filled in day by day (Reports → Daily).
 * Each row in `daily_kpi_records` holds one project's figures for one day;
 * the KPI page totals them per week (see WeeklyKpiContext).
 */
export interface DailyKpiRecord {
  id: string;
  projectName: string;
  /** YYYY-MM-DD */
  date: string;
  /** Numeric figures keyed by DailyKpiKey. */
  values: Partial<Record<DailyKpiKey, number>>;
  shift: string | null;
  meetingMinutesUrl: string | null;
  meetingMinutesName: string | null;
}

/** Extra daily-only figures that the weekly report doesn't have. */
export type DailyExtraField = "hseStaff" | "zones";
export type DailyKpiKey = WeeklyKpiNumericField | DailyExtraField;

export const SHIFT_OPTIONS = ["AM", "AM/PM"] as const;

export interface DailyKpiRow {
  no: string;
  key: DailyKpiKey | "shift";
  label: string;
  hint?: string;
  /** How the month "Total" column is worked out. */
  total: "sum" | "avg" | "none";
}

export interface DailyKpiSection {
  key: "general" | "leading" | "lagging";
  title: string;
  rows: DailyKpiRow[];
}

export const DAILY_KPI_SECTIONS: DailyKpiSection[] = [
  {
    key: "general",
    title: "General",
    rows: [
      { no: "1.1", key: "averageManpower", label: "Average Manpower", total: "avg" },
      { no: "1.2", key: "totalManhours", label: "Total Manhours", total: "sum" },
      { no: "1.3", key: "totalSafeWorkHours", label: "Total Safe Work Hours", total: "sum" },
      { no: "1.4", key: "hseStaff", label: "HSE Staff Number", total: "avg" },
      { no: "1.5", key: "zones", label: "No. of Zones", total: "avg" },
      { no: "1.6", key: "shift", label: "Shifts", hint: "AM, AM/PM", total: "none" },
    ],
  },
  {
    key: "leading",
    title: "Leading Indicators",
    rows: [
      { no: "2.1", key: "hseTrainingSession", label: "HSE Training", hint: "No. of Session", total: "sum" },
      { no: "2.2", key: "hseMeetings", label: "HSE Meetings", hint: "attach PD/PM minutes", total: "sum" },
      { no: "2.3", key: "hseToolBoxTalk", label: "HSE Tool Box Talk", hint: "No. of Session", total: "sum" },
      { no: "2.4", key: "hseInspection", label: "HSE Inspection / Site Walkthrough", total: "sum" },
      { no: "2.5", key: "seniorLeaderTeam", label: "Senior Leadership Team (SLT) Walkthrough", total: "sum" },
      { no: "2.6", key: "hseAuditsInternal", label: "HSE Audits (Internal / External)", total: "sum" },
      { no: "2.7", key: "hseAwardsRecognition", label: "HSE Awards and Recognitions", total: "sum" },
      { no: "2.8", key: "hseInitiatives", label: "HSE Initiatives / Campaigns", total: "sum" },
      { no: "2.9", key: "emergencyDrill", label: "Emergency Drill", total: "sum" },
      { no: "2.10", key: "nearMisses", label: "Near Misses (NMs)", total: "sum" },
      { no: "2.11", key: "lifeSavingRules", label: "Life Saving Rule - LSR Violations", total: "sum" },
    ],
  },
  {
    key: "lagging",
    title: "Lagging Indicators",
    rows: [
      { no: "3.1", key: "fatality", label: "Fatality (FAT)", total: "sum" },
      { no: "3.2", key: "lostTimeIncidentRate", label: "Lost Time Incidents (LTI)", total: "sum" },
      { no: "3.3", key: "restrictedWorkCases", label: "Restricted Work Cases (RWC)", total: "sum" },
      { no: "3.4", key: "medicalTreatmentCases", label: "Medical Treatment Cases (MTC) / Recordable", total: "sum" },
      { no: "3.5", key: "firstAidCases", label: "First Aid Cases (FAC)", total: "sum" },
      { no: "3.6", key: "deathInService", label: "Death in Service (Natural Causes)", total: "sum" },
      { no: "3.7", key: "dangerousOccurrence", label: "Dangerous Occurrence", total: "sum" },
      { no: "3.8", key: "fireIncident", label: "Fire Incident", total: "sum" },
      { no: "3.9", key: "environmentalIncident", label: "Environmental Incidents", total: "sum" },
      { no: "3.10", key: "propertyDamage", label: "Property Damage", total: "sum" },
      { no: "3.11", key: "utilityHit", label: "Utility Hit", total: "sum" },
      { no: "3.12", key: "nonOccupationalIllness", label: "Non-Occupational Illness", total: "sum" },
    ],
  },
];

export const LEADING_KEYS = DAILY_KPI_SECTIONS[1].rows.map((r) => r.key as WeeklyKpiNumericField);
export const LAGGING_KEYS = DAILY_KPI_SECTIONS[2].rows.map((r) => r.key as WeeklyKpiNumericField);
