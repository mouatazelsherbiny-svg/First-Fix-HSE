"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { Award, Flame, GraduationCap, HardHat, ShieldAlert, Trophy } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useIncidents } from "@/context/IncidentsContext";
import { usePermits } from "@/context/PermitContext";
import { useAuth } from "@/context/AuthContext";
import { getStatusColorClasses, getChartColor } from "@/lib/statusColors";
import { getPermitProgress } from "@/lib/permitProgress";
import { CLASSIFICATIONS, RISK_RATINGS } from "@/lib/mockData";

const WEEKS_COUNT = 6;
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
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const project = user?.project ?? "KSP";

  const { observations } = useObservations();
  const { records: toolboxRecords } = useToolboxTalk();
  const { records: kpiRecords } = useWeeklyKpi();
  const { incidents } = useIncidents();
  const { permits } = usePermits();

  const projectObservations = useMemo(
    () => observations.filter((o) => o.projectName === project),
    [observations, project]
  );

  const projectPermits = useMemo(
    () => permits.filter((p) => p.projectName === project),
    [permits, project]
  );

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

  const trendData = useMemo(() => {
    const today = new Date();
    const buckets = Array.from({ length: WEEKS_COUNT }, (_, i) => {
      const weekIndex = WEEKS_COUNT - 1 - i;
      const labelDate = new Date(today);
      labelDate.setDate(today.getDate() - weekIndex * 7);
      return {
        weekIndex,
        label: labelDate.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
          month: "short",
          day: "numeric",
        }),
        open: 0,
        closed: 0,
      };
    });

    projectObservations.forEach((o) => {
      const created = new Date(o.createdAt);
      const daysAgo = Math.floor(
        (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      const weekIndex = Math.floor(daysAgo / 7);
      const bucket = buckets.find((b) => b.weekIndex === weekIndex);
      if (!bucket) return;
      if (o.status === "Closed") bucket.closed += 1;
      else bucket.open += 1;
    });

    return buckets;
  }, [projectObservations, locale]);

  const recentObservations = useMemo(
    () =>
      projectObservations
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [projectObservations]
  );

  const recentPermits = useMemo(
    () =>
      projectPermits
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [projectPermits]
  );

  // Fixed category order (from the same lists used everywhere else in the
  // app) so a slice's color never shifts when other slices appear/disappear.
  const classificationData = useMemo(
    () =>
      CLASSIFICATIONS.map((name) => ({
        name,
        value: projectObservations.filter((o) => o.classification === name).length,
        color: getChartColor(name),
      })).filter((d) => d.value > 0),
    [projectObservations]
  );

  const riskRatingData = useMemo(
    () =>
      RISK_RATINGS.map((name) => ({
        name,
        value: projectObservations.filter((o) => o.riskRating === name).length,
        color: getChartColor(name),
      })).filter((d) => d.value > 0),
    [projectObservations]
  );

  const permitStatusData = useMemo(() => {
    const labels: Record<string, string> = {
      "New Permit": t.ptw.statusNewPermit,
      "In Progress": t.ptw.statusInProgress,
      Closed: t.ptw.statusClosed,
    };
    return (["New Permit", "In Progress", "Closed"] as const)
      .map((status) => ({
        name: labels[status],
        value: projectPermits.filter((p) => getPermitProgress(p) === status).length,
        color: getChartColor(status),
      }))
      .filter((d) => d.value > 0);
  }, [projectPermits, t]);

  const kpiTrendData = useMemo(
    () =>
      kpiRecords
        .filter((r) => r.projectName === project)
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-8)
        .map((r) => ({
          label: new Date(r.date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
            month: "short",
            day: "numeric",
          }),
          value: r.totalManhours,
        })),
    [kpiRecords, project, locale]
  );

  return (
    <div className="relative isolate">
      <DashboardBackground />
      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-black">
            {t.dashboard.titlePrefix} - {project}
          </h1>
        </div>

        {/* Company-wide totals */}
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
          {t.dashboard.companyOverview}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TotalCard
            icon={<HardHat className="h-5 w-5" />}
            tone="orange"
            label={t.dashboard.totalSafeManhours}
            value={totalSafeManhours}
            unit={t.dashboard.manhoursUnit}
          />
          <TotalCard
            icon={<GraduationCap className="h-5 w-5" />}
            tone="blue"
            label={t.dashboard.totalTrainingHours}
            value={totalTrainingHours}
            unit={t.dashboard.hoursUnit}
          />
          <TotalCard
            icon={<ShieldAlert className="h-5 w-5" />}
            tone="red"
            label={t.dashboard.totalLsrViolations}
            value={totalLsr}
            unit={t.dashboard.recordsUnit}
          />
        </div>

        {/* Top projects */}
        <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
          {t.dashboard.topProjectsTitle}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TopProjectCard
            icon={<Trophy className="h-5 w-5" />}
            tone="amber"
            label={t.dashboard.mostObservationsByProject}
            top={topObservationsProject}
            unit={t.dashboard.observationsCount}
            noDataText={t.dashboard.noDataYet}
          />
          <TopProjectCard
            icon={<Flame className="h-5 w-5" />}
            tone="redStrong"
            label={t.dashboard.mostLsrByProject}
            top={topLsrProject}
            unit={t.dashboard.lsrCount}
            noDataText={t.dashboard.noDataYet}
          />
          <TopProjectCard
            icon={<Award className="h-5 w-5" />}
            tone="green"
            label={t.dashboard.mostTrainingByProject}
            top={topTrainingProject}
            unit={t.dashboard.trainingHoursCount}
            noDataText={t.dashboard.noDataYet}
          />
        </div>

      {/* Recent activity */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.dashboard.recentObservations}
            </h2>
            <Link
              href="/observations"
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              {t.dashboard.viewAll}
            </Link>
          </div>
          {recentObservations.length > 0 ? (
            <ul className="divide-y divide-brand-grayLight">
              {recentObservations.map((o) => (
                <li key={o.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/observations/${o.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-black">
                        #{o.reportNumber} · {o.observationType}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-brand-gray">
                        {o.classification} ·{" "}
                        {new Date(o.createdAt).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote text={t.dashboard.noDataYet} />
          )}
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-grayDark">
              {t.dashboard.recentPermits}
            </h2>
            <Link
              href="/permit-to-work"
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              {t.dashboard.viewAll}
            </Link>
          </div>
          {recentPermits.length > 0 ? (
            <ul className="divide-y divide-brand-grayLight">
              {recentPermits.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/permit-to-work/${p.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-black">
                        #{p.permitNumber} · {p.permitType}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-brand-gray">
                        {p.workLocation} ·{" "}
                        {new Date(p.createdAt).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote text={t.dashboard.noDataYet} />
          )}
        </div>
      </div>

      {/* Analytics */}
      <div className="mt-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
          {t.dashboard.analyticsTitle}
        </h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-brand-black">
              {t.dashboard.byClassification}
            </h3>
            {classificationData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classificationData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {classificationData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="#292D32" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #3E434B", backgroundColor: "#292D32", fontSize: 12 }}
                      labelStyle={{ color: "#F3F4F6" }}
                      itemStyle={{ color: "#C7CBD1" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyNote text={t.dashboard.noDataYet} />
            )}
          </div>
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-brand-black">
              {t.dashboard.byRiskRating}
            </h3>
            {riskRatingData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskRatingData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {riskRatingData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="#292D32" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #3E434B", backgroundColor: "#292D32", fontSize: 12 }}
                      labelStyle={{ color: "#F3F4F6" }}
                      itemStyle={{ color: "#C7CBD1" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyNote text={t.dashboard.noDataYet} />
            )}
          </div>
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-brand-black">
              {t.dashboard.permitStatusBreakdown}
            </h3>
            {permitStatusData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={permitStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {permitStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="#292D32" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #3E434B", backgroundColor: "#292D32", fontSize: 12 }}
                      labelStyle={{ color: "#F3F4F6" }}
                      itemStyle={{ color: "#C7CBD1" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyNote text={t.dashboard.noDataYet} />
            )}
          </div>
        </div>

        <div className="card mt-5">
          <h3 className="mb-3 text-sm font-semibold text-brand-black">
            {t.dashboard.kpiTrendTitle}
          </h3>
          {kpiTrendData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3E434B" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#8B92A0" }}
                    axisLine={{ stroke: "#3E434B" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#8B92A0" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #3E434B", backgroundColor: "#292D32", fontSize: 12 }}
                    labelStyle={{ color: "#F3F4F6" }}
                    itemStyle={{ color: "#C7CBD1" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={t.dashboard.kpiTrendTitle}
                    stroke="#E8590C"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#E8590C" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyNote text={t.dashboard.noDataYet} />
          )}
        </div>
      </div>

      {/* Trend chart */}
      <div className="card mt-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
          {t.dashboard.trendTitle}
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3E434B" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#8B92A0" }}
                axisLine={{ stroke: "#3E434B" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#8B92A0" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #3E434B",
                  backgroundColor: "#292D32",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#F3F4F6" }}
                itemStyle={{ color: "#C7CBD1" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="open"
                name={t.dashboard.trendOpen}
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="closed"
                name={t.dashboard.trendClosed}
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
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
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}
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
    <div className="card flex items-center gap-4">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand-gray">
          {label}
        </p>
        <p className="mt-1 text-2xl font-extrabold text-brand-black">
          {value.toLocaleString()}{" "}
          <span className="text-xs font-medium text-brand-gray">{unit}</span>
        </p>
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
    <div className="card flex items-center gap-4">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand-gray">
          {label}
        </p>
        {top ? (
          <>
            <p className="mt-1 truncate text-xl font-extrabold text-brand-black">
              {top.key}
            </p>
            <p className="text-xs font-medium text-brand-gray">
              {top.value.toLocaleString()} {unit}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm font-medium text-brand-gray">{noDataText}</p>
        )}
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm font-medium text-brand-gray">{text}</p>;
}
