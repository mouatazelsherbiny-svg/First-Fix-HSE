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
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { usePermits } from "@/context/PermitContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { useAuth } from "@/context/AuthContext";
import { getStatusColorClasses, getChartColor } from "@/lib/statusColors";
import { getPermitProgress } from "@/lib/permitProgress";
import { CLASSIFICATIONS, RISK_RATINGS } from "@/lib/mockData";

const CHECKLIST_PAGES = [
  { key: "environmental", href: "/checklists/environmental" },
  { key: "fireAssessment", href: "/checklists/fire-assessment" },
  { key: "safetyHealth", href: "/checklists/safety-health" },
  { key: "tcEnergization", href: "/checklists/tc-energization" },
];

const WEEKS_COUNT = 6;

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
  const { disciplinaryRecords, employees, ppeRecords, trainingRecords } = useHsePassport();
  const { permits } = usePermits();
  const { submissions: checklistSubmissions } = useChecklistSubmissions();

  const projectObservations = useMemo(
    () => observations.filter((o) => o.projectName === project),
    [observations, project]
  );

  const latestChecklistSubmissions = useMemo(() => {
    const map: Record<string, string> = {};
    checklistSubmissions
      .filter((s) => s.projectName === project)
      .forEach((s) => {
        if (!map[s.templateKey]) map[s.templateKey] = s.inspectionDate || s.createdAt;
      });
    return map;
  }, [checklistSubmissions, project]);
  const openCount = projectObservations.filter((o) => o.status === "Open").length;
  const closedCount = projectObservations.filter((o) => o.status === "Closed").length;

  const projectToolbox = useMemo(
    () => toolboxRecords.filter((r) => r.projectName === project),
    [toolboxRecords, project]
  );
  const totalSessions = projectToolbox.reduce((a, r) => a + r.sessions, 0);
  const totalAttendees = projectToolbox.reduce((a, r) => a + r.attendees, 0);
  const totalTrainingManHours = projectToolbox.reduce(
    (a, r) => a + r.trainingManHours,
    0
  );

  const latestKpi = useMemo(() => {
    const projectKpi = kpiRecords
      .filter((r) => r.projectName === project)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
    return projectKpi[0];
  }, [kpiRecords, project]);

  const projectEmployees = useMemo(
    () => employees.filter((e) => e.project === project),
    [employees, project]
  );
  const projectEmployeeIds = useMemo(
    () => new Set(projectEmployees.map((e) => e.id)),
    [projectEmployees]
  );
  const totalViolations = disciplinaryRecords.filter((r) =>
    projectEmployeeIds.has(r.employeeId)
  ).length;
  const totalPpeRecords = ppeRecords.filter((r) =>
    projectEmployeeIds.has(r.employeeId)
  ).length;
  const totalTrainingRecords = trainingRecords.filter((r) =>
    projectEmployeeIds.has(r.employeeId)
  ).length;

  const projectPermits = useMemo(
    () => permits.filter((p) => p.projectName === project),
    [permits, project]
  );
  const activePermitsCount = projectPermits.filter((p) => p.status === "Active").length;
  const pendingPermitsCount = projectPermits.filter(
    (p) => p.status === "Pending Approval"
  ).length;

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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Observations */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.observations}
          </h2>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-brand-black">
                {projectObservations.length}
              </p>
              <p className="text-xs font-medium text-brand-gray">
                {t.dashboard.totalObservations}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                  "Open"
                )}`}
              >
                {t.dashboard.openLabel}: {openCount}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                  "Closed"
                )}`}
              >
                {t.dashboard.closedLabel}: {closedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbox Talk & Training */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.toolboxTalk}
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-extrabold text-brand-black">{totalSessions}</p>
              <p className="text-xs font-medium text-brand-gray">{t.dashboard.sessions}</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-black">{totalAttendees}</p>
              <p className="text-xs font-medium text-brand-gray">{t.dashboard.attendees}</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-black">
                {totalTrainingManHours}
              </p>
              <p className="text-xs font-medium text-brand-gray">{t.dashboard.manHours}</p>
            </div>
          </div>
        </div>

        {/* Weekly KPI */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.weeklyKpi}
          </h2>
          {latestKpi ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-extrabold text-brand-black">
                    {latestKpi.totalManhours}
                  </p>
                  <p className="text-[11px] font-medium text-brand-gray">
                    {t.dashboard.totalManhours}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-brand-black">
                    {latestKpi.totalSafeWorkHours}
                  </p>
                  <p className="text-[11px] font-medium text-brand-gray">
                    {t.dashboard.totalSafeWorkHours}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-brand-black">
                    {latestKpi.nearMisses}
                  </p>
                  <p className="text-[11px] font-medium text-brand-gray">
                    {t.dashboard.nearMisses}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-brand-gray">
                {t.dashboard.latestRecordFrom}{" "}
                {new Date(latestKpi.date).toLocaleDateString(
                  locale === "ar" ? "ar-EG" : "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                )}
              </p>
            </>
          ) : (
            <EmptyNote text={t.dashboard.noDataYet} />
          )}
        </div>

        {/* Permit to Work */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.permitToWork}
          </h2>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-brand-black">
                {projectPermits.length}
              </p>
              <p className="text-xs font-medium text-brand-gray">
                {t.dashboard.totalPermits}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                  "Active"
                )}`}
              >
                {t.dashboard.activePermits}: {activePermitsCount}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
                  "Pending Approval"
                )}`}
              >
                {t.dashboard.pendingApproval}: {pendingPermitsCount}
              </span>
            </div>
          </div>
        </div>

        {/* FICC — not yet built as a feature in the app */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.ficc}
          </h2>
          <EmptyNote text={t.dashboard.noDataYet} />
        </div>

        {/* Monthly Checklists */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.monthlyChecklists}
          </h2>
          <ul className="space-y-2">
            {CHECKLIST_PAGES.map((c) => {
              const submittedOn = latestChecklistSubmissions[c.key];
              return (
                <li key={c.key}>
                  <Link
                    href={c.href}
                    className="flex items-center justify-between text-sm transition hover:text-brand-orange"
                  >
                    <span className="font-medium text-brand-grayDark">
                      {t.checklistNames[c.key as keyof typeof t.checklistNames]}
                    </span>
                    {submittedOn ? (
                      <span className="text-xs font-semibold text-green-600">
                        {t.dashboard.submittedOn} {submittedOn}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-brand-gray">
                        {t.dashboard.notSubmittedYet}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* HSE Passport */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.hsePassport}
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-extrabold text-brand-black">
                {totalViolations}
              </p>
              <p className="text-[11px] font-medium text-brand-gray">
                {t.dashboard.totalViolations}
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-black">
                {totalPpeRecords}
              </p>
              <p className="text-[11px] font-medium text-brand-gray">
                {t.nav.ppe}
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-black">
                {totalTrainingRecords}
              </p>
              <p className="text-[11px] font-medium text-brand-gray">
                {t.nav.training}
              </p>
            </div>
          </div>
        </div>
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
                        <Cell key={entry.name} fill={entry.color} stroke="#202327" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #34383E", backgroundColor: "#202327", fontSize: 12 }}
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
                        <Cell key={entry.name} fill={entry.color} stroke="#202327" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #34383E", backgroundColor: "#202327", fontSize: 12 }}
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
                        <Cell key={entry.name} fill={entry.color} stroke="#202327" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #34383E", backgroundColor: "#202327", fontSize: 12 }}
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#34383E" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#8B92A0" }}
                    axisLine={{ stroke: "#34383E" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#8B92A0" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #34383E", backgroundColor: "#202327", fontSize: 12 }}
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#34383E" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#8B92A0" }}
                axisLine={{ stroke: "#34383E" }}
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
                  border: "1px solid #34383E",
                  backgroundColor: "#202327",
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

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm font-medium text-brand-gray">{text}</p>;
}
