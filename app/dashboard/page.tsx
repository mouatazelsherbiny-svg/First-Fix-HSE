"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import SafetyTipCard from "@/components/SafetyTipCard";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { usePermits } from "@/context/PermitContext";
import { useAuth } from "@/context/AuthContext";
import { getStatusColorClasses } from "@/lib/statusColors";

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

  const projectObservations = useMemo(
    () => observations.filter((o) => o.projectName === project),
    [observations, project]
  );
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
  const departmentBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    projectEmployees.forEach((e) => {
      counts.set(e.department, (counts.get(e.department) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  }, [projectEmployees]);
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

  return (
    <div className="xl:grid xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start xl:gap-6">
      {/* Left sidebar — hidden below xl to avoid crowding the main content */}
      <aside className="hidden xl:sticky xl:top-20 xl:flex xl:flex-col xl:gap-6">
        <SafetyTipCard />
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.team}
          </h2>
          <p className="text-3xl font-extrabold text-brand-black">
            {projectEmployees.length}
          </p>
          <p className="text-xs font-medium text-brand-gray">
            {t.dashboard.totalEmployees}
          </p>
          {departmentBreakdown.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-brand-grayLight pt-3">
              {departmentBreakdown.map((d) => (
                <li
                  key={d.department}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-brand-grayDark">
                    {d.department}
                  </span>
                  <span className="text-xs font-semibold text-brand-gray">
                    {d.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div>
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

        {/* Monthly Checklists — checklists don't persist a submitted score yet */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
            {t.dashboard.monthlyChecklists}
          </h2>
          <ul className="space-y-2">
            {CHECKLIST_PAGES.map((c) => (
              <li key={c.key} className="flex items-center justify-between text-sm">
                <span className="font-medium text-brand-grayDark">{c.key}</span>
                <span className="text-xs font-semibold text-brand-gray">
                  {t.dashboard.notSubmittedYet}
                </span>
              </li>
            ))}
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

      {/* Trend chart */}
      <div className="card mt-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
          {t.dashboard.trendTitle}
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F2" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6B6E70" }}
                axisLine={{ stroke: "#F2F2F2" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#6B6E70" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #F2F2F2",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="open"
                name={t.dashboard.trendOpen}
                fill="#DC2626"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="closed"
                name={t.dashboard.trendClosed}
                fill="#16A34A"
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
