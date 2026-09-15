"use client";

import { useMemo } from "react";
import { CalendarDays, Flame, HardHat, MapPin, Newspaper, ShieldAlert, Trophy } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
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
  const { records: kpiRecords, isLoading: kpiLoading } = useWeeklyKpi();
  const { incidents, isLoading: incidentsLoading } = useIncidents();

  const isLoading = obsLoading || kpiLoading || incidentsLoading;

  // ---- Company-wide totals (all projects combined) ----
  const totalSafeManhours = useMemo(
    () => kpiRecords.reduce((sum, r) => sum + (r.totalSafeWorkHours || 0), 0),
    [kpiRecords]
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
            <h2 className="mb-4 text-sm font-bold tracking-wide text-brand-grayDark">
              {t.dashboard.companyOverview}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <TotalCard
                icon={<HardHat className="h-8 w-8" />}
                tone="orange"
                label={t.dashboard.totalSafeManhours}
                value={totalSafeManhours}
                unit={t.dashboard.manhoursUnit}
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
            <h2 className="mb-4 mt-8 text-sm font-bold tracking-wide text-brand-grayDark">
              {t.dashboard.topProjectsTitle}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
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
            </div>

            {/* Advertisement / Events / Recent News — same layout spot as
                the reference (a Yahoo-style homepage): a full-width ad
                banner, then an Events list and a Recent News feed side by
                side. This is a placeholder layout with sample rows —
                replace SAMPLE_EVENTS / SAMPLE_NEWS below with real content
                (or wire them to a data source) whenever it's ready. */}
            <div className="mt-8">
              <AdvertisementBanner label={t.dashboard.advertisementLabel} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
              <EventsWidget title={t.dashboard.eventsTitle} viewAllLabel={t.dashboard.viewAll} />
              <RecentNewsWidget title={t.dashboard.recentNewsTitle} viewAllLabel={t.dashboard.viewAll} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Sample placeholder content for the Events / Recent News widgets ----
// Swap these arrays for real data (or fetch from a table) once it's ready;
// the widgets below only care about this shape.
const SAMPLE_EVENTS: { en: string; ar: string; dateEn: string; dateAr: string; locationEn: string; locationAr: string }[] = [
  { en: "Monthly Safety Walk", ar: "جولة السلامة الشهرية", dateEn: "Sep 20, 2026", dateAr: "20 سبتمبر 2026", locationEn: "Zone B — Building 1", locationAr: "المنطقة B — مبنى 1" },
  { en: "Fire Drill", ar: "تدريب إخلاء حريق", dateEn: "Sep 24, 2026", dateAr: "24 سبتمبر 2026", locationEn: "Site Office", locationAr: "مكتب الموقع" },
  { en: "HSE Toolbox Briefing", ar: "إحاطة سلامة قصيرة", dateEn: "Sep 27, 2026", dateAr: "27 سبتمبر 2026", locationEn: "All Zones", locationAr: "كل المناطق" },
  { en: "Quarterly Audit", ar: "التدقيق الربع سنوي", dateEn: "Oct 3, 2026", dateAr: "3 أكتوبر 2026", locationEn: "Zone A — Level 5", locationAr: "المنطقة A — الدور 5" },
];

const SAMPLE_NEWS: { categoryEn: string; categoryAr: string; titleEn: string; titleAr: string; sourceEn: string; sourceAr: string }[] = [
  { categoryEn: "Safety", categoryAr: "السلامة", titleEn: "New PPE policy takes effect next month", titleAr: "سياسة معدات الوقاية الجديدة تسري الشهر القادم", sourceEn: "HSE Team", sourceAr: "فريق السلامة" },
  { categoryEn: "Training", categoryAr: "التدريب", titleEn: "Toolbox talk attendance up 12% this quarter", titleAr: "حضور جلسات التوعية ارتفع 12% هذا الربع", sourceEn: "HSE Team", sourceAr: "فريق السلامة" },
  { categoryEn: "Equipment", categoryAr: "المعدات", titleEn: "Two generators due for periodic maintenance", titleAr: "مولدان مستحقان للصيانة الدورية", sourceEn: "PMV Log", sourceAr: "سجل المركبات والمعدات" },
  { categoryEn: "Announcement", categoryAr: "إعلان", titleEn: "Updated permit-to-work form now live", titleAr: "نموذج تصريح العمل المحدث أصبح متاحًا", sourceEn: "Admin", sourceAr: "الإدارة" },
];

function AdvertisementBanner({ label }: { label: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-grayLight/40 text-sm font-semibold tracking-wide text-brand-gray">
      {label}
    </div>
  );
}

function EventsWidget({ title, viewAllLabel }: { title: string; viewAllLabel: string }) {
  const { locale } = useLanguage();
  return (
    <div className="card !p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-brand-black">
          <CalendarDays className="h-5 w-5 text-brand-orange" />
          {title}
        </h2>
      </div>
      <ul className="space-y-4">
        {SAMPLE_EVENTS.map((ev, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-xs font-bold text-brand-orange">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand-black">
                {locale === "ar" ? ev.ar : ev.en}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-gray">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {locale === "ar" ? ev.dateAr : ev.dateEn}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {locale === "ar" ? ev.locationAr : ev.locationEn}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-4 text-sm font-semibold text-brand-orange hover:underline">
        {viewAllLabel}
      </button>
    </div>
  );
}

function RecentNewsWidget({ title, viewAllLabel }: { title: string; viewAllLabel: string }) {
  const { locale } = useLanguage();
  return (
    <div className="card !p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-brand-black">
          <Newspaper className="h-5 w-5 text-brand-orange" />
          {title}
        </h2>
      </div>
      <ul className="divide-y divide-brand-border">
        {SAMPLE_NEWS.map((item, i) => (
          <li key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-grayLight/60 text-brand-gray">
              <Newspaper className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-orange">
                {locale === "ar" ? item.categoryAr : item.categoryEn}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-brand-black">
                {locale === "ar" ? item.titleAr : item.titleEn}
              </p>
              <p className="mt-0.5 text-xs text-brand-gray">
                {locale === "ar" ? item.sourceAr : item.sourceEn}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-4 text-sm font-semibold text-brand-orange hover:underline">
        {viewAllLabel}
      </button>
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
        <p className="truncate text-sm font-semibold tracking-wide text-brand-gray">
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
        <p className="truncate text-sm font-semibold tracking-wide text-brand-gray">
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
