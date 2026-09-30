"use client";

/**
 * Every figure on the Dashboard page (components/dashboard/HomeDashboard),
 * derived from data the app already loads through the context providers in
 * app/layout.tsx. Read-only: no extra Supabase queries are issued here.
 */

import { useMemo } from "react";
import { useObservations } from "@/context/ObservationsContext";
import { useIncidents } from "@/context/IncidentsContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useHsePassport } from "@/context/HsePassportContext";
import type { Observation } from "@/types/observation";
import type { Incident } from "@/types/incident";
import type { WeeklyKpiRecord } from "@/types/weeklyKpi";
import type { TrainingCourseRecord } from "@/types/hsePassport";

const DAY_MS = 24 * 60 * 60 * 1000;
const GOOD_PRACTICE = "Good Practice";
const LTI_LABELS = ["Lost Time Incident", "Lost Time Injury", "LTI"];
const MTC_RWC_LABELS = ["Medical Treatment Case", "Restricted Work Case"];
const LSR_VIOLATION = "LSR Violation";
/** Projects shown on each "by project" bar chart. */
const TOP_PROJECTS = 8;

/** Months shown on the HSE Performance Trends chart. */
const TREND_MONTHS = 8;
/** Window used for "Trending HSE Alerts". */
const TRENDING_WINDOW_DAYS = 30;

/** Performance targets drawn as dashed lines on the trends chart.
 *  Adjust here if the company sets different targets. */
export const TRIR_TARGET = 0.5;
export const LTIFR_TARGET = 0.1;

export interface HeroStats {
  totalSafeWorkHours: number;
  safeHoursAsOf: string | null;
  totalTrainingHours: number;
  daysSinceLti: number | null;
  daysSinceMtcRwc: number | null;
}

export interface LatestIncident {
  id: string;
  title: string;
  date: string | null;
  place: string;
  category: string;
}

export interface CountRow {
  label: string;
  count: number;
}

export interface TopObservation extends CountRow {
  photo: string | null;
}

export interface ProjectSlide {
  project: string;
  safeHours: number;
  ltiFree: boolean;
  lastUpdate: string | null;
  photo: string | null;
}

export interface GoodPracticeCard {
  id: string;
  details: string;
  project: string;
  createdAt: string;
  photo: string | null;
}

export interface TrendPoint {
  month: string;
  trir: number;
  ltifr: number;
}

export interface HomeDashboardData {
  isLoading: boolean;
  hero: HeroStats;
  latestIncidents: LatestIncident[];
  trendingAlerts: CountRow[];
  topObservations: TopObservation[];
  projects: ProjectSlide[];
  goodPractices: GoodPracticeCard[];
  trends: TrendPoint[];
  observationsByProject: CountRow[];
  lsrByProject: CountRow[];
}

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

function daysSince(time: number | null): number | null {
  if (time === null) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(time);
  day.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - day.getTime()) / DAY_MS));
}

function matches(value: string | null | undefined, labels: string[]) {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return labels.some((l) => v === l.toLowerCase());
}

function latestTime(times: (number | null)[]): number | null {
  let best: number | null = null;
  for (const t of times) if (t !== null && (best === null || t > best)) best = t;
  return best;
}

function isGoodPractice(o: Observation) {
  return o.observationType === GOOD_PRACTICE || o.classification === GOOD_PRACTICE;
}

function typeLabel(o: Observation) {
  if (o.observationType === "Others" && o.observationTypeOther) return o.observationTypeOther;
  return o.observationType;
}

function countBy<T>(items: T[], key: (item: T) => string | null | undefined): CountRow[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export function computeHomeDashboard(
  observations: Observation[],
  incidents: Incident[],
  kpi: WeeklyKpiRecord[],
  training: TrainingCourseRecord[] = []
): Omit<HomeDashboardData, "isLoading"> {
  // ---- Hero stats ----------------------------------------------------------
  const totalSafeWorkHours = kpi.reduce((s, r) => s + (r.totalSafeWorkHours || 0), 0);
  const safeHoursAsOf = kpi.reduce<string | null>(
    (latest, r) => (!latest || (r.date && r.date > latest) ? r.date || latest : latest),
    null
  );

  const lastLti = latestTime([
    ...incidents
      .filter((i) => matches(i.classification, LTI_LABELS) || matches(i.incidentCategory, LTI_LABELS))
      .map((i) => toTime(i.incidentDate)),
    ...kpi.filter((r) => (r.lostTimeIncidentRate || 0) > 0).map((r) => toTime(r.date)),
  ]);
  const lastMtcRwc = latestTime([
    ...incidents
      .filter((i) => matches(i.classification, MTC_RWC_LABELS) || matches(i.incidentCategory, MTC_RWC_LABELS))
      .map((i) => toTime(i.incidentDate)),
    ...kpi
      .filter((r) => (r.medicalTreatmentCases || 0) + (r.restrictedWorkCases || 0) > 0)
      .map((r) => toTime(r.date)),
  ]);

  // ---- Latest incidents ----------------------------------------------------
  const latestIncidents: LatestIncident[] = [...incidents]
    .sort(
      (a, b) =>
        (toTime(b.incidentDate) ?? toTime(b.createdAt) ?? 0) -
        (toTime(a.incidentDate) ?? toTime(a.createdAt) ?? 0)
    )
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      title:
        i.classification && i.classification !== i.incidentCategory
          ? `${i.incidentCategory} – ${i.classification}`
          : i.incidentCategory || "Incident",
      date: i.incidentDate ?? i.createdAt,
      place: [i.projectName, i.incidentLocation].filter(Boolean).join(" – "),
      category: i.incidentCategory,
    }));

  // ---- Observation rankings -----------------------------------------------
  const hazards = observations.filter((o) => !isGoodPractice(o));

  // Anchored on the newest observation rather than "today", so the list
  // still shows something meaningful when the latest data is a few weeks old.
  const newest = latestTime(hazards.map((o) => toTime(o.createdAt)));
  const recent =
    newest === null
      ? []
      : hazards.filter((o) => {
          const t = toTime(o.createdAt);
          return t !== null && t > newest - TRENDING_WINDOW_DAYS * DAY_MS;
        });
  const trendingAlerts = countBy(recent, typeLabel).slice(0, 5);

  const topObservations: TopObservation[] = countBy(hazards, typeLabel)
    .slice(0, 3)
    .map((row) => {
      const withPhoto = hazards
        .filter((o) => typeLabel(o) === row.label && o.observationPhotos.length > 0)
        .sort((a, b) => (toTime(b.createdAt) ?? 0) - (toTime(a.createdAt) ?? 0))[0];
      return { ...row, photo: withPhoto?.observationPhotos[0] ?? null };
    });

  // ---- Good practices --------------------------------------------------------
  const goodSorted = observations
    .filter(isGoodPractice)
    .sort((a, b) => (toTime(b.createdAt) ?? 0) - (toTime(a.createdAt) ?? 0));
  const goodWithPhotos = goodSorted.filter((o) => o.observationPhotos.length > 0);
  const goodPractices: GoodPracticeCard[] = (goodWithPhotos.length >= 3 ? goodWithPhotos : goodSorted)
    .slice(0, 3)
    .map((o) => ({
      id: o.id,
      details: o.observationDetails,
      project: o.projectName,
      createdAt: o.createdAt,
      photo: o.observationPhotos[0] ?? null,
    }));

  // ---- Project spotlight -----------------------------------------------------
  const byProject = new Map<string, { hours: number; lti: number; last: string | null }>();
  for (const r of kpi) {
    if (!r.projectName) continue;
    const p = byProject.get(r.projectName) ?? { hours: 0, lti: 0, last: null };
    p.hours += r.totalSafeWorkHours || 0;
    p.lti += r.lostTimeIncidentRate || 0;
    if (r.date && (!p.last || r.date > p.last)) p.last = r.date;
    byProject.set(r.projectName, p);
  }
  const ltiProjects = new Set(
    incidents
      .filter((i) => matches(i.classification, LTI_LABELS) || matches(i.incidentCategory, LTI_LABELS))
      .map((i) => i.projectName)
  );
  const projects: ProjectSlide[] = Array.from(byProject, ([project, p]) => ({
    project,
    safeHours: p.hours,
    ltiFree: p.lti === 0 && !ltiProjects.has(project),
    lastUpdate: p.last,
    photo: goodWithPhotos.find((o) => o.projectName === project)?.observationPhotos[0] ?? null,
  }))
    .filter((p) => p.safeHours > 0)
    .sort((a, b) => b.safeHours - a.safeHours)
    .slice(0, 3);

  // ---- Monthly TRIR / LTIFR --------------------------------------------------
  const months = new Map<string, { hours: number; recordable: number; lti: number }>();
  for (const r of kpi) {
    if (!r.date) continue;
    const key = r.date.slice(0, 7); // YYYY-MM
    const m = months.get(key) ?? { hours: 0, recordable: 0, lti: 0 };
    const lti = r.lostTimeIncidentRate || 0;
    m.hours += r.totalManhours || 0;
    m.lti += lti;
    m.recordable += (r.medicalTreatmentCases || 0) + (r.restrictedWorkCases || 0) + lti + (r.fatality || 0);
    months.set(key, m);
  }
  const lastKey = Array.from(months.keys()).sort().pop();
  const trends: TrendPoint[] = [];
  if (lastKey) {
    const [y, mo] = lastKey.split("-").map(Number);
    for (let i = TREND_MONTHS - 1; i >= 0; i--) {
      const d = new Date(y, mo - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = months.get(key);
      const rate = (n: number, base: number) =>
        m && m.hours > 0 ? Math.round(((n * base) / m.hours) * 1000) / 1000 : 0;
      trends.push({
        month: d.toLocaleString("en-US", { month: "short" }) + "-" + String(d.getFullYear()).slice(2),
        trir: rate(m?.recordable ?? 0, 200_000),
        ltifr: rate(m?.lti ?? 0, 1_000_000),
      });
    }
  }

  // ---- "Most ... by project" bar charts -------------------------------------
  const observationsByProject = countBy(observations, (o) => o.projectName).slice(0, TOP_PROJECTS);
  const lsrByProject = countBy(
    incidents.filter((i) => i.incidentCategory === LSR_VIOLATION),
    (i) => i.projectName
  ).slice(0, TOP_PROJECTS);

  return {
    hero: {
      totalSafeWorkHours,
      safeHoursAsOf,
      totalTrainingHours: Math.round(training.reduce((s, r) => s + (r.hours || 0), 0)),
      daysSinceLti: daysSince(lastLti),
      daysSinceMtcRwc: daysSince(lastMtcRwc),
    },
    latestIncidents,
    trendingAlerts,
    topObservations,
    projects,
    goodPractices,
    trends,
    observationsByProject,
    lsrByProject,
  };
}

export function useHomeDashboard(): HomeDashboardData {
  const { observations, isLoading: obsLoading } = useObservations();
  const { incidents, isLoading: incLoading } = useIncidents();
  const { records, isLoading: kpiLoading } = useWeeklyKpi();
  const { trainingRecords, isLoading: passportLoading } = useHsePassport();

  const data = useMemo(
    () => computeHomeDashboard(observations, incidents, records, trainingRecords),
    [observations, incidents, records, trainingRecords]
  );

  return { isLoading: obsLoading || incLoading || kpiLoading || passportLoading, ...data };
}
