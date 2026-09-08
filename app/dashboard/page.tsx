"use client";

import { useMemo } from "react";
import { Award, Flame, GraduationCap, HardHat, ShieldAlert, Trophy } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useIncidents } from "@/context/IncidentsContext";
import { useAuth } from "@/context/AuthContext";

const LSR_VIOLATION_CATEGORY = "LSR Violation";

// Groups `items` by a string key and sums `valueFn` (defaults to a plain
// count) per group, returning the single highest group — used by the "Most
// X by project" cards below. Rows with no project name are ignored.
function topGroup<T>(
  items: T[],
  keyFn: (item: T) => string | null | undefined,
  valueFn: (item: T) => number = () => 1
): { key: string; value: number } | null {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + valueFn(item));
  }
  let best: { key: string; value: number } | null = null;
  for (const [key, value] of totals) {
    if (!best || value > best.value) best = { key, value };
  }
  return best;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const project = user?.project ?? "KSP";

  const { observations, isLoading: obsLoading } = useObservations();
  const { records: toolboxRecords, isLoading: toolboxLoading } = useToolboxTalk();
  const { records: kpiRecords, isLoading: kpiLoading } = useWeeklyKpi();
  const { incidents, isLoading: incidentsLoading } = useIncidents();

  const isLoading = obsLoading || toolboxLoading || kpiLoading || incidentsLoading;

  // ---- Company-wide totals (all projects combined) ----
  const totalSafeManhours = useMemo(
    () => kpiRecords.reduce((sum, r) => sum + (r.totalSafeWorkHours || 0), 0),
    [kpiRecords]
  );
  const totalTrainingHours = useMemo(
    () => toolboxRecords.reduce((sum, r) => sum + (r.trainingManHours || 0), 0),
    [toolboxRecords]
  );
  const lsrIncidents = useMemo(
    () => incidents.filter((i) => i.incidentCategory === LSR_VIOLATION_CATEGORY),
    [incidents]
  );
  const totalLsr = lsrIncidents.length;

  // ---- Top project per metric (all projects combined) ----
  const topObservationsProject = useMemo(
    () => topGroup(observations, (o) => o.projectName),
    [observations]
  );
  const topLsrProject = useMemo(
    () => topGroup(lsrIncidents, (i) => i.projectName),
    [lsrIncidents]
  );
  const topTrainingProject = useMemo(
    () => topGroup(toolboxRecords, (r) => r.projectName, (r) => r.trainingManHours || 0),
    [toolboxRecords]
  );

  return (
    <div className="relative isolate">
      <DashboardBackground />
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-black">
            {t.dashboard.titlePrefix} - {project}
          </h1>
        </div>

        {isLoading ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
          </div>
        ) : (
          <>
            {/* Company-wide totals */}
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.dashboard.companyOverview}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <TotalCard
                icon={<HardHat className="h-8 w-8" />}
                tone="orange"
                label={t.dashboard.totalSafeManhours}
                value={totalSafeManhours}
                unit={t.dashboard.manhoursUnit}
              />
              <TotalCard
                icon={<GraduationCap className="h-8 w-8" />}
                tone="blue"
                label={t.dashboard.totalTrainingHours}
                value={totalTrainingHours}
                unit={t.dashboard.hoursUnit}
              />
              <TotalCard
                icon={<ShieldAlert className="h-8 w-8" />}
                tone="red"
                label={t.dashboard.totalLsrViolations}
                value={totalLsr}
                unit={t.dashboard.recordsUnit}
              />
            </div>

            {/* Top projects */}
            <h2 className="mb-4 mt-8 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.dashboard.topProjectsTitle}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <TopProjectCard
                icon={<Trophy className="h-8 w-8" />}
                tone="amber"
                label={t.dashboard.mostObservationsByProject}
                top={topObservationsProject}
                unit={t.dashboard.observationsCount}
                noDataText={t.dashboard.noDataYet}
              />
              <TopProjectCard
                icon={<Flame className="h-8 w-8" />}
                tone="redStrong"
                label={t.dashboard.mostLsrByProject}
                top={topLsrProject}
                unit={t.dashboard.lsrCount}
                noDataText={t.dashboard.noDataYet}
              />
              <TopProjectCard
                icon={<Award className="h-8 w-8" />}
                tone="green"
                label={t.dashboard.mostTrainingByProject}
                top={topTrainingProject}
                unit={t.dashboard.trainingHoursCount}
                noDataText={t.dashboard.noDataYet}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type CardTone = "orange" | "blue" | "red" | "amber" | "redStrong" | "green";

const TONE_CLASSES: Record<CardTone, string> = {
  orange: "bg-brand-orange/20 text-brand-orange",
  blue: "bg-blue-500/20 text-blue-400",
  red: "bg-red-500/20 text-red-400",
  amber: "bg-amber-500/20 text-amber-400",
  redStrong: "bg-red-500/40 text-red-300",
  green: "bg-green-500/20 text-green-400",
};

function IconBadge({ icon, tone }: { icon: React.ReactNode; tone: CardTone }) {
  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${TONE_CLASSES[tone]}`}
    >
      {icon}
    </div>
  );
}

function TotalCard({
  icon,
  tone,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  tone: CardTone;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="card flex items-center gap-5 !p-7">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold uppercase tracking-wide text-brand-gray">
          {label}
        </p>
        <p className="mt-2 text-4xl font-extrabold leading-none text-brand-black">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-sm font-medium text-brand-gray">{unit}</p>
      </div>
    </div>
  );
}

function TopProjectCard({
  icon,
  tone,
  label,
  top,
  unit,
  noDataText,
}: {
  icon: React.ReactNode;
  tone: CardTone;
  label: string;
  top: { key: string; value: number } | null;
  unit: string;
  noDataText: string;
}) {
  return (
    <div className="card flex items-center gap-5 !p-7">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold uppercase tracking-wide text-brand-gray">
          {label}
        </p>
        {top ? (
          <>
            <p className="mt-2 truncate text-3xl font-extrabold leading-tight text-brand-black">
              {top.key}
            </p>
            <p className="mt-1 text-sm font-medium text-brand-gray">
              {top.value.toLocaleString()} {unit}
            </p>
          </>
        ) : (
          <p className="mt-2 text-base font-medium text-brand-gray">{noDataText}</p>
        )}
      </div>
    </div>
  );
}
