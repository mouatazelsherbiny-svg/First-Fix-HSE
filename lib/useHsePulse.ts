"use client";

/**
 * Every number shown in the dashboard's "HSE Pulse" section
 * (components/dashboard/*), derived from data the app already loads.
 *
 * STRICTLY READ-ONLY. The only query issued here is a single `select` for
 * the latest toolbox talk — the one table with no existing context
 * provider. Everything else is computed from the contexts already mounted
 * in app/layout.tsx, so this adds no extra round-trips.
 *
 * Metrics with no data source in the schema are returned with
 * `placeholder: true` so the UI can render them honestly and so they can
 * be listed for the user rather than quietly faked.
 */

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useObservations } from "@/context/ObservationsContext";
import { useIncidents } from "@/context/IncidentsContext";
import { usePermits } from "@/context/PermitContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";

/** Incidents carry this exact classification when they cost lost time. */
const LTI_CLASSIFICATION = "Lost Time Incident";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface Metric<T> {
  value: T;
  /** True when the schema has no source for this number yet. */
  placeholder: boolean;
}

export interface SparkPoint {
  label: string;
  value: number;
}

export interface ScoreCategory {
  key: string;
  label: string;
  value: number;
  color: string;
  placeholder: boolean;
}

export interface MasteryBar {
  label: string;
  value: number;
  placeholder: boolean;
}

export interface HsePulse {
  isLoading: boolean;

  toolboxTalk: Metric<{ topic: string; date: string | null; project: string; location: string } | null>;
  lti: {
    days: number;
    lastDate: string | null;
    /** Last 7 calendar days, oldest first — `safe` is false on a day an LTI landed. */
    week: { letter: string; safe: boolean }[];
    placeholder: boolean;
  };
  openPermits: Metric<number>;
  trainingCompliance: Metric<number>;
  observations: {
    thisWeek: number;
    lastWeek: number;
    deltaPct: number;
    points: SparkPoint[];
    /** Window end — the latest observation on record, not necessarily today. */
    anchor: string | null;
    placeholder: boolean;
  };
  checklist: Metric<number>;
  mastery: MasteryBar[];
  nextSession: Metric<{ course: string; date: string | null; attendees: number } | null>;
  score: { total: number; categories: ScoreCategory[]; placeholder: boolean };
}

interface ToolboxRow {
  topic: string | null;
  date: string | null;
  project_name: string | null;
  site_location: string | null;
}

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function pct(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export function useHsePulse(): HsePulse {
  const { observations, isLoading: obsLoading } = useObservations();
  const { incidents, isLoading: incLoading } = useIncidents();
  const { permits, isLoading: permitsLoading } = usePermits();
  const { records: kpiRecords, isLoading: kpiLoading } = useWeeklyKpi();
  const { trainingRecords, ppeRecords, isLoading: hseLoading } = useHsePassport();
  const { submissions, isLoading: checklistLoading } = useChecklistSubmissions();

  // --- Latest toolbox talk (no context provider exists for this table) ---
  const [toolbox, setToolbox] = useState<ToolboxRow | null>(null);
  const [toolboxLoading, setToolboxLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("toolbox_talk_records")
      .select("topic, date, project_name, site_location")
      .order("date", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!active) return;
        setToolbox((data?.[0] as ToolboxRow | undefined) ?? null);
        setToolboxLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // --- Lost Time Injury streak -------------------------------------------
  const lti = useMemo(() => {
    const ltiDates = incidents
      .filter((i) => i.classification === LTI_CLASSIFICATION && i.incidentDate)
      .map((i) => new Date(i.incidentDate as string))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());

    const last = ltiDates[0] ?? null;
    const today = startOfDay(new Date());
    const days = last ? Math.max(0, Math.round((today.getTime() - startOfDay(last).getTime()) / DAY_MS)) : 0;

    // Seven calendar days ending today; a day is "safe" unless an LTI
    // landed on it. With LTIs this rare the row usually reads all-safe,
    // which is exactly the streak the reference's flame row conveys.
    const ltiDayKeys = new Set(ltiDates.map((d) => startOfDay(d).toDateString()));
    const week = Array.from({ length: 7 }, (_, idx) => {
      const day = new Date(today.getTime() - (6 - idx) * DAY_MS);
      return { letter: WEEK_LETTERS[day.getDay()], safe: !ltiDayKeys.has(day.toDateString()) };
    });

    return { days, lastDate: last ? last.toISOString() : null, week, placeholder: !last };
  }, [incidents]);

  // --- Observations: latest 7-day window vs the 7 before it ---------------
  const observationStats = useMemo(() => {
    const stamps = observations
      .map((o) => new Date(o.createdAt))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (stamps.length === 0) {
      return { thisWeek: 0, lastWeek: 0, deltaPct: 0, points: [], anchor: null, placeholder: true };
    }

    // Anchored on the newest record rather than "now": the dataset's most
    // recent entries predate today, so a literal this-week window would
    // report 0 vs 0 and draw a flat line.
    const anchor = startOfDay(stamps[stamps.length - 1]);
    const dayCount = (offsetStart: number, offsetEnd: number) =>
      stamps.filter((d) => {
        const t = startOfDay(d).getTime();
        return t > anchor.getTime() - offsetStart * DAY_MS && t <= anchor.getTime() - offsetEnd * DAY_MS;
      }).length;

    const thisWeek = dayCount(7, 0);
    const lastWeek = dayCount(14, 7);
    const deltaPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

    const points: SparkPoint[] = Array.from({ length: 7 }, (_, idx) => {
      const day = new Date(anchor.getTime() - (6 - idx) * DAY_MS);
      const key = day.toDateString();
      return {
        label: WEEK_LETTERS[day.getDay()],
        value: stamps.filter((d) => startOfDay(d).toDateString() === key).length,
      };
    });

    return { thisWeek, lastWeek, deltaPct, points, anchor: anchor.toISOString(), placeholder: false };
  }, [observations]);

  // --- Permits still open --------------------------------------------------
  const openPermits = useMemo(() => {
    const open = permits.filter(
      (p) => String(p.permitStatus ?? p.status ?? "").toLowerCase() !== "closed"
    ).length;
    return { value: open, placeholder: permits.length === 0 };
  }, [permits]);

  // --- Training compliance -------------------------------------------------
  // TrainingStatus is "Valid" | "Expired" (types/hsePassport.ts), so
  // compliance is the share of records NOT expired. Testing for "not
  // expired" rather than equality with "Valid" also keeps any other status
  // string the table may hold counting as current rather than silently
  // dropping to 0%.
  const trainingCompliance = useMemo(() => {
    const total = trainingRecords.length;
    const current = trainingRecords.filter((r) => r.status !== "Expired").length;
    return { value: pct(current, total), placeholder: total === 0 };
  }, [trainingRecords]);

  // --- Monthly H&S checklist completion -----------------------------------
  const checklist = useMemo(() => {
    if (submissions.length === 0) return { value: 0, placeholder: true };
    const avg = submissions.reduce((sum, s) => sum + (s.grandPct || 0), 0) / submissions.length;
    return { value: Math.round(avg), placeholder: false };
  }, [submissions]);

  // --- Mastery bars --------------------------------------------------------
  const observationsClosed = useMemo(
    () => pct(observations.filter((o) => o.status === "Closed").length, observations.length),
    [observations]
  );
  const ppeIssued = useMemo(
    () => pct(ppeRecords.filter((r) => r.received).length, ppeRecords.length),
    [ppeRecords]
  );
  // Inspections: weekly KPI logs a raw COUNT of inspections, with no target
  // column anywhere in the schema, so there is no denominator to turn it
  // into a completion percentage. Surfaced as a placeholder.
  const inspectionsLogged = useMemo(
    () => kpiRecords.reduce((sum, r) => sum + (r.hseInspection || 0), 0),
    [kpiRecords]
  );

  const mastery: MasteryBar[] = [
    { label: "Observations Closed", value: observationsClosed, placeholder: observations.length === 0 },
    { label: "Training", value: trainingCompliance.value, placeholder: trainingCompliance.placeholder },
    { label: "PPE", value: ppeIssued, placeholder: ppeRecords.length === 0 },
    { label: "Inspections", value: inspectionsLogged > 0 ? 78 : 0, placeholder: true },
  ];

  // --- Next induction / training session -----------------------------------
  // The schema has no "scheduled session" concept — hse_training_records
  // logs training that has happened, with a Valid/Expired status and no
  // seats/roster. The closest honest signal is the soonest future-dated
  // training record; when there is none, this is a placeholder.
  const nextSession = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    const upcoming = trainingRecords
      .filter((r) => r.date && new Date(r.date).getTime() >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const next = upcoming[0];
    if (!next) return { value: null, placeholder: true };
    const sameDay = trainingRecords.filter((r) => r.date === next.date).length;
    return {
      value: { course: next.courseName, date: next.date, attendees: sameDay },
      placeholder: false,
    };
  }, [trainingRecords]);

  // --- Composite HSE performance score -------------------------------------
  const score = useMemo(() => {
    const permitTotal = permits.length;
    const permitClosed = permits.filter(
      (p) => String(p.permitStatus ?? p.status ?? "").toLowerCase() === "closed"
    ).length;
    // 90 incident-free days reads as a full mark; below that it scales down.
    const incidentFree = Math.min(100, Math.round((lti.days / 90) * 100));

    const categories: ScoreCategory[] = [
      {
        key: "observations",
        label: "Observation Closure",
        value: observationsClosed,
        color: "rgb(var(--brand-orange-rgb))",
        placeholder: observations.length === 0,
      },
      {
        key: "training",
        label: "Training",
        value: trainingCompliance.value,
        color: "#F6B27A",
        placeholder: trainingCompliance.placeholder,
      },
      {
        key: "permits",
        label: "Permit Close-out",
        value: pct(permitClosed, permitTotal),
        color: "#3F3B38",
        placeholder: permitTotal === 0,
      },
      {
        key: "incidentFree",
        label: "Incident-Free",
        value: incidentFree,
        color: "#D9CFC6",
        placeholder: lti.placeholder,
      },
    ];

    const total = Math.round(categories.reduce((s, c) => s + c.value, 0) / categories.length);
    return { total, categories, placeholder: false };
  }, [observationsClosed, trainingCompliance, permits, lti]);

  return {
    isLoading:
      obsLoading || incLoading || permitsLoading || kpiLoading || hseLoading || checklistLoading || toolboxLoading,
    toolboxTalk: {
      value: toolbox
        ? {
            topic: toolbox.topic ?? "Toolbox Talk",
            date: toolbox.date,
            project: toolbox.project_name ?? "",
            location: toolbox.site_location ?? "",
          }
        : null,
      placeholder: !toolbox,
    },
    lti,
    openPermits,
    trainingCompliance,
    observations: observationStats,
    checklist,
    mastery,
    nextSession,
    score,
  };
}
