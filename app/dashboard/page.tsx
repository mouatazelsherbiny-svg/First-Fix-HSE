"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Flame,
  HardHat,
  Lightbulb,
  MapPin,
  Newspaper,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  Sun,
  TrendingUp,
  Trophy,
  Wind,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBackground from "@/components/DashboardBackground";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { useIncidents } from "@/context/IncidentsContext";
import { useAuth } from "@/context/AuthContext";
import { getProjectLocation } from "@/lib/projectLocations";

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
            {/* Days without a recorded incident — a real, computed milestone
                (not sample data), same "hero" spot Yahoo gives its featured
                story. Hidden entirely once there's no incident on record to
                count from. */}
            <div className="mb-8">
              <IncidentFreeDaysBanner
                title={t.dashboard.incidentFreeDaysTitle}
                daysUnit={t.dashboard.daysUnit}
              />
            </div>

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

            {/* Yahoo-style layout: a "Trending" list beside the featured
                carousel (mirrors Yahoo's top section), then an Events list
                and a "For You"-style feed side by side below. Events/News
                use sample rows — replace SAMPLE_EVENTS / SAMPLE_NEWS with
                real content (or wire them to a data source) when ready. */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
              <TrendingTopicsWidget title={t.dashboard.trendingTitle} />
              <GoodPracticeCarousel label={t.dashboard.advertisementLabel} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
              <EventsWidget title={t.dashboard.eventsTitle} viewAllLabel={t.dashboard.viewAll} />
              <RecentNewsWidget title={t.dashboard.recentNewsTitle} viewAllLabel={t.dashboard.viewAll} />
            </div>

            {/* Three more Yahoo-inspired spots, reworked for HSE: a rotating
                safety tip, live weather for the current project's site, and
                a spotlighted training video. */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <SafetyTipWidget title={t.dashboard.safetyTipTitle} />
              <SiteWeatherWidget title={t.dashboard.siteWeatherTitle} project={project} />
              <VideoSpotlightWidget
                title={t.dashboard.videoSpotlightTitle}
                watchLabel={t.dashboard.watchVideoLabel}
              />
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

// Max photos pulled into the rotation — an example cap, not a hard limit
// on how many Good Practice observations can exist. Kept modest because
// these photos are inline base64 (see the note below), so every extra one
// added here is more data this page has to hold in memory.
const MAX_CAROUSEL_PHOTOS = 8;
const CAROUSEL_INTERVAL_MS = 4000;

/** Same layout spot as a Yahoo-style "Advertisement" banner, but instead of
 *  a static placeholder it auto-rotates through photos from "Good
 *  Practice" observations — a slideshow of the team's own good-practice
 *  moments instead of a real ad. Falls back to the plain placeholder once
 *  there are no Good Practice photos yet. */
function GoodPracticeCarousel({ label }: { label: string }) {
  const { observations } = useObservations();

  const photos = useMemo(
    () =>
      observations
        .filter((o) => o.observationType === "Good Practice")
        .flatMap((o) => o.observationPhotos)
        .filter((src): src is string => Boolean(src))
        .slice(0, MAX_CAROUSEL_PHOTOS),
    [observations]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) {
    return <AdvertisementBanner label={label} />;
  }

  const goTo = (next: number) => setIndex((next + photos.length) % photos.length);

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-brand-border bg-brand-black sm:h-72">
      {/* Only the active photo is ever mounted — these come from
          observation_photos, which this app stores as inline base64
          (not Storage URLs), so each one is already a large string held
          in memory. Mounting all of them at once (as an earlier version
          of this component did) forces the browser to decode and paint
          every photo simultaneously just to show one — a real weight
          this page doesn't need to carry. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={index}
        src={photos[index]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
        <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">{label}</p>
      </div>

      <div className="absolute end-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
        {index + 1} / {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous"
            className="absolute start-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next"
            className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}
    </div>
  );
}

// ---- Trending (real data) ----
// Mirrors the numbered "Trending" list on Yahoo's homepage, but instead of
// trending news topics it ranks observation classifications by how often
// they've actually been logged — computed live from ObservationsContext,
// not sample data.
function TrendingTopicsWidget({ title }: { title: string }) {
  const { t } = useLanguage();
  const { observations } = useObservations();

  const topClassifications = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of observations) {
      if (!o.classification) continue;
      counts.set(o.classification, (counts.get(o.classification) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [observations]);

  return (
    <div className="card flex flex-col !p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-black">
        <TrendingUp className="h-5 w-5 text-brand-orange" />
        {title}
      </h2>
      {topClassifications.length === 0 ? (
        <p className="text-sm font-medium text-brand-gray">{t.dashboard.noDataYet}</p>
      ) : (
        <ol className="space-y-3">
          {topClassifications.map(([classification, count], i) => (
            <li key={classification} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-xs font-bold text-brand-orange">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-black">
                {classification}
              </span>
              <span className="shrink-0 text-xs font-medium text-brand-gray">{count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

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

// Styled as a "For You"-style feed grid (Yahoo's homepage card feed) —
// each item is its own thumbnail card rather than a plain list row.
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
      <div className="grid gap-4 sm:grid-cols-2">
        {SAMPLE_NEWS.map((item, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-brand-border transition hover:shadow-cardHover"
          >
            <div className="flex h-24 items-center justify-center bg-brand-grayLight/60 text-brand-gray">
              <Newspaper className="h-8 w-8" />
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-orange">
                {locale === "ar" ? item.categoryAr : item.categoryEn}
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-brand-black">
                {locale === "ar" ? item.titleAr : item.titleEn}
              </p>
              <p className="mt-auto pt-2 text-xs text-brand-gray">
                {locale === "ar" ? item.sourceAr : item.sourceEn}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 text-sm font-semibold text-brand-orange hover:underline">
        {viewAllLabel}
      </button>
    </div>
  );
}

// ---- Days-without-incident banner ----
// Unlike the placeholder widgets above, this one is computed from the
// real incidents already loaded for the dashboard (no sample data): it
// finds the most recent incident date on record and counts the days
// since. Renders nothing if there is no incident on record to count from
// yet, rather than showing a misleading "0 days".
function IncidentFreeDaysBanner({ title, daysUnit }: { title: string; daysUnit: string }) {
  const { incidents } = useIncidents();

  const days = useMemo(() => {
    let latest = 0;
    for (const incident of incidents) {
      if (!incident.incidentDate) continue;
      const time = new Date(incident.incidentDate).getTime();
      if (Number.isFinite(time) && time > latest) latest = time;
    }
    if (latest === 0) return null;
    return Math.max(0, Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24)));
  }, [incidents]);

  if (days === null) return null;

  return (
    <div className="card flex items-center gap-5 !p-7">
      <IconBadge icon={<ShieldCheck className="h-8 w-8" />} tone="green" />
      <div className="min-w-0">
        <p className="text-4xl font-extrabold leading-none text-brand-black">
          {days.toLocaleString()}{" "}
          <span className="text-lg font-semibold text-brand-gray">{daysUnit}</span>
        </p>
        <p className="mt-1 text-sm font-semibold tracking-wide text-brand-gray">{title}</p>
      </div>
    </div>
  );
}

// ---- Safety Tip of the Day ----
// A curated list that rotates one tip per calendar day (same tip for
// everyone on a given day, deterministic — no randomness/state needed).
const SAMPLE_SAFETY_TIPS: { en: string; ar: string }[] = [
  { en: "Always wear your PPE correctly — a hard hat only protects when it's actually on your head.", ar: "احرص دائمًا على ارتداء معدات الوقاية الشخصية بشكل صحيح — الخوذة لا تحميك إلا إذا كانت على رأسك فعلًا." },
  { en: "Report near misses even when nobody got hurt — they're the earliest warning of a real incident.", ar: "أبلغ عن حالات \u201cالكاد يحدث\u201d حتى لو لم يتأذَ أحد — فهي أبكر إشارة إنذار لحادث حقيقي." },
  { en: "Inspect your tools and equipment before every shift, not just at the start of the week.", ar: "افحص أدواتك ومعداتك قبل كل وردية، وليس فقط في بداية الأسبوع." },
  { en: "Keep walkways and exits clear — housekeeping is a safety control, not just tidiness.", ar: "حافظ على ممرات المرور والمخارج خالية من العوائق — النظافة والترتيب وسيلة سلامة وليست مجرد شكل." },
  { en: "Never bypass a permit-to-work step to save time — that's exactly when incidents happen.", ar: "لا تتجاوز أي خطوة في تصريح العمل لتوفير الوقت — هذه بالضبط اللحظة التي تحدث فيها الحوادث." },
  { en: "Test gas detectors and confined-space equipment before, not during, entry.", ar: "اختبر أجهزة كشف الغاز ومعدات الأماكن المغلقة قبل الدخول، وليس أثناءه." },
  { en: "Stay hydrated and take scheduled breaks in high heat — heat stress builds up before you feel it.", ar: "حافظ على شرب الماء وخذ فترات الراحة المقررة في الحر الشديد — الإجهاد الحراري يتراكم قبل أن تشعر به." },
  { en: "Barricade and sign every excavation and floor opening — an unmarked hazard is an incident waiting to happen.", ar: "ضع حواجز ولافتات حول كل حفر أو فتحة أرضية — الخطر غير الموضح عليه علامات هو حادث ينتظر أن يقع." },
  { en: "Lock out and tag out energy sources before maintenance — every time, no exceptions.", ar: "افصل مصادر الطاقة وضع عليها بطاقة تنبيه قبل الصيانة — في كل مرة، بلا استثناء." },
  { en: "Double-check load ratings and rigging before every lift — don't assume yesterday's setup is still safe today.", ar: "تأكد من معدلات الحمولة والتجهيزات قبل كل عملية رفع — لا تفترض أن إعداد الأمس لا يزال آمنًا اليوم." },
  { en: "Speak up if you see an unsafe act — a five-second word can prevent a lifelong injury.", ar: "تحدث فورًا إذا رأيت تصرفًا غير آمن — كلمة تستغرق خمس ثوانٍ قد تمنع إصابة تدوم العمر." },
  { en: "Fit-check your fall protection harness every time — a loose strap defeats the whole system.", ar: "تأكد من ملاءمة حزام الحماية من السقوط في كل مرة — الحزام غير المشدود يفقد النظام كله فائدته." },
];

function SafetyTipWidget({ title }: { title: string }) {
  const { locale } = useLanguage();

  const tip = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return SAMPLE_SAFETY_TIPS[dayOfYear % SAMPLE_SAFETY_TIPS.length];
  }, []);

  return (
    <div className="card flex flex-col !p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-black">
        <Lightbulb className="h-5 w-5 text-brand-orange" />
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-brand-grayDark">
        {locale === "ar" ? tip.ar : tip.en}
      </p>
    </div>
  );
}

// ---- Site Weather ----
// Live current-conditions for the signed-in user's project site, from
// Open-Meteo (open, no API key). Uses the real project coordinates
// already collected in lib/projectLocations.ts. Fails quietly to a
// simple "unavailable" state — this is a nice-to-have, never something
// that should block or clutter the rest of the dashboard.
function weatherCodeToDisplay(code: number): { Icon: typeof Sun; en: string; ar: string } {
  if (code === 0) return { Icon: Sun, en: "Clear sky", ar: "سماء صافية" };
  if (code === 1 || code === 2) return { Icon: CloudSun, en: "Partly cloudy", ar: "غائم جزئيًا" };
  if (code === 3) return { Icon: Cloud, en: "Overcast", ar: "غائم" };
  if (code === 45 || code === 48) return { Icon: CloudFog, en: "Fog", ar: "ضباب" };
  if (code >= 51 && code <= 67) return { Icon: CloudRain, en: "Rain", ar: "أمطار" };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, en: "Snow", ar: "ثلوج" };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, en: "Rain showers", ar: "زخات مطر" };
  if (code >= 95) return { Icon: CloudLightning, en: "Thunderstorm", ar: "عاصفة رعدية" };
  return { Icon: CloudSun, en: "—", ar: "—" };
}

interface SiteWeatherReading {
  temperatureC: number;
  windKmh: number;
  code: number;
}

function SiteWeatherWidget({ title, project }: { title: string; project: string }) {
  const { locale } = useLanguage();
  const location = useMemo(() => getProjectLocation(project), [project]);
  const [reading, setReading] = useState<SiteWeatherReading | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!location) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    setFailed(false);
    setReading(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("weather request failed"))))
      .then((data) => {
        if (cancelled) return;
        const current = data?.current;
        if (
          !current ||
          typeof current.temperature_2m !== "number" ||
          typeof current.wind_speed_10m !== "number"
        ) {
          throw new Error("unexpected weather response shape");
        }
        setReading({
          temperatureC: current.temperature_2m,
          windKmh: current.wind_speed_10m,
          code: current.weather_code ?? 0,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  const display = reading ? weatherCodeToDisplay(reading.code) : null;

  return (
    <div className="card flex flex-col !p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-black">
        <CloudSun className="h-5 w-5 text-brand-orange" />
        {title}
      </h2>
      {reading && display ? (
        <div className="flex items-center gap-4">
          <display.Icon className="h-10 w-10 shrink-0 text-brand-orange" />
          <div className="min-w-0">
            <p className="text-3xl font-extrabold leading-none text-brand-black">
              {Math.round(reading.temperatureC)}°C
            </p>
            <p className="mt-1 text-sm font-medium text-brand-gray">
              {locale === "ar" ? display.ar : display.en}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-brand-gray">
              <Wind className="h-3.5 w-3.5" />
              {Math.round(reading.windKmh)} km/h
            </p>
          </div>
        </div>
      ) : failed ? (
        <p className="text-sm font-medium text-brand-gray">
          {locale === "ar" ? "تعذر تحميل بيانات الطقس حاليًا" : "Weather data unavailable right now"}
        </p>
      ) : (
        <p className="text-sm font-medium text-brand-gray">
          {locale === "ar" ? "جارِ التحميل..." : "Loading..."}
        </p>
      )}
      <p className="mt-3 truncate text-xs font-semibold uppercase tracking-wide text-brand-gray">
        {project}
      </p>
    </div>
  );
}

// ---- Video Spotlight ----
// Sample placeholder — swap SAMPLE_SPOTLIGHT_VIDEO for a real featured
// video once one is chosen. The "Watch" button links into the app's
// Training section rather than nowhere, so it's useful even as-is.
const SAMPLE_SPOTLIGHT_VIDEO = {
  titleEn: "Working at Height: Fall Protection Essentials",
  titleAr: "العمل في الأماكن المرتفعة: أساسيات الحماية من السقوط",
  durationEn: "6 min",
  durationAr: "6 دقائق",
};

function VideoSpotlightWidget({ title, watchLabel }: { title: string; watchLabel: string }) {
  const { locale } = useLanguage();
  return (
    <div className="card flex flex-col !p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-black">
        <PlayCircle className="h-5 w-5 text-brand-orange" />
        {title}
      </h2>
      <div className="relative mb-4 flex h-28 items-center justify-center rounded-xl bg-brand-black/90">
        <PlayCircle className="h-10 w-10 text-white/90" />
        <span className="absolute bottom-2 end-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
          {locale === "ar" ? SAMPLE_SPOTLIGHT_VIDEO.durationAr : SAMPLE_SPOTLIGHT_VIDEO.durationEn}
        </span>
      </div>
      <p className="text-sm font-semibold text-brand-black">
        {locale === "ar" ? SAMPLE_SPOTLIGHT_VIDEO.titleAr : SAMPLE_SPOTLIGHT_VIDEO.titleEn}
      </p>
      <Link
        href="/hse-passport/training"
        className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
      >
        <PlayCircle className="h-4 w-4" />
        {watchLabel}
      </Link>
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
