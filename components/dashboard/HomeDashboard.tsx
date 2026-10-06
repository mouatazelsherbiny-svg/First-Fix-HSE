"use client";

/**
 * Dashboard page layout — built to the approved "First Fix HSE Department"
 * mockup: hero banner with headline stats, Latest Incidents + Trending HSE
 * Alerts on the left, Projects spotlight + Good Practices on the right, and
 * HSE Performance Trends + Top 3 Observations underneath.
 *
 * Purely presentational: every number arrives through `data`
 * (see lib/useHomeDashboard.ts).
 *
 * Note: avoid `bg-black/NN` / `bg-white/NN` classes in this file — the
 * "solid" morphism mode in globals.css forces those fully opaque. Overlays
 * use inline rgba styles instead.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  CloudMoonRain,
  CloudMoon,
  Moon,
  GraduationCap,
  HardHat,
  Lightbulb,
  MapPin,
  Pause,
  Play,
  ShieldCheck,
  Sun,
  Thermometer,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LTIFR_TARGET,
  TRIR_TARGET,
  type HomeDashboardData,
  type ProjectSlide,
} from "@/lib/useHomeDashboard";
import { getProjectLocation } from "@/lib/projectLocations";
import ProjectFilter from "@/components/ProjectFilter";
import { GOOD_PRACTICE_POSTS, NEWS_PHOTOS } from "@/lib/dashboardContent";

const ACCENT = "rgb(var(--brand-orange-rgb))";
const LTIFR_COLOR = "#1f4e79";
const LSR_COLOR = "#1f4e79";
const HERO_IMAGE = "/brand/dashboard-hero.jpg";
const SLIDE_INTERVAL_MS = 6000;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const hasTime = withTime && /T\d{2}:\d{2}/.test(value) && !/T00:00(:00)?/.test(value);
  if (!hasTime) return date;
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} | ${time} hrs.`;
}

function timeAgo(value: string | null) {
  if (!value) return "";
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return "";
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

const INCIDENT_IMAGES: [RegExp, string][] = [
  [/near miss/i, "/brand/incidents/near-miss.png"],
  [/first aid/i, "/brand/incidents/first-aid.png"],
  [/medical/i, "/brand/incidents/medical.png"],
  [/restricted/i, "/brand/incidents/restricted.png"],
  [/lost time/i, "/brand/incidents/lost-time.png"],
  [/fatal/i, "/brand/incidents/fatality.png"],
  [/environment/i, "/brand/incidents/environmental.png"],
  [/recordable/i, "/brand/incidents/total-recordable.png"],
  [/dangerous|lsr|fire|property|traffic/i, "/brand/incidents/dangerous.png"],
];

function incidentImage(category: string) {
  return INCIDENT_IMAGES.find(([re]) => re.test(category))?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Panel({
  title,
  icon,
  href,
  linkLabel = "View All",
  children,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-card ${className}`}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-brand-black">
          {icon}
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-grayDark transition hover:text-brand-orange"
          >
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5 text-brand-orange rtl:rotate-180" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-brand-border py-8 text-center text-sm font-medium text-brand-gray">
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function HeroStat({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-3 text-center sm:items-start sm:px-4 sm:text-start">
      <Icon className="mb-2 h-7 w-7 text-brand-orange" strokeWidth={1.75} />
      <p className="text-xl font-extrabold leading-none text-white tabular-nums sm:text-2xl">{value}</p>
      <p className="mt-1.5 text-xs font-medium leading-tight text-white/80">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-white/55">{sub}</p>}
    </div>
  );
}

function Hero({ data }: { data: HomeDashboardData["hero"] }) {
  const days = (n: number | null) => (n === null ? "—" : String(n).padStart(2, "0"));
  return (
    // Full-bleed: negative margins cancel ProtectedRoute's content padding
    // (px-4 / sm:px-6 / lg:px-8, py-6) so the banner sits flush against the
    // top bar and the sidebar, as in the mockup.
    <section
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8"
      style={{ background: "#120d0a" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-y-0 end-0 h-full w-full object-cover object-[70%_30%] md:w-[70%]"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #120d0a 0%, #120d0a 30%, rgba(18,13,10,0.75) 50%, rgba(18,13,10,0.25) 75%, rgba(18,13,10,0.55) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(243,111,36,0.18), transparent 60%)" }}
      />

      <div className="relative flex flex-col gap-6 px-6 py-8 sm:px-8 lg:px-10 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-xl shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">Welcome to First Fix</p>
          <h1 className="mt-2 font-display uppercase leading-[0.9] tracking-wide">
            <span className="block text-4xl text-white sm:text-5xl 2xl:text-6xl">HSE</span>
            <span className="block text-4xl text-brand-orange sm:text-5xl 2xl:text-6xl">Department</span>
          </h1>
          <p className="mt-3 text-sm font-medium text-white/90 sm:text-base">
            Safety is not optional. It is how we work.
          </p>
        </div>

        <div
          className="grid grid-cols-2 gap-y-5 rounded-2xl border p-5 sm:grid-cols-5 sm:divide-x sm:divide-white/15 rtl:sm:divide-x-reverse"
          style={{ background: "rgba(10,8,7,0.72)", borderColor: "rgba(255,255,255,0.12)" }}
        >
          <HeroStat
            icon={HardHat}
            value={data.totalSafeWorkHours.toLocaleString("en-US")}
            label="Total Safe Work Hours"
            sub={data.safeHoursAsOf ? `as of ${formatDate(data.safeHoursAsOf)}` : undefined}
          />
          <HeroStat
            icon={GraduationCap}
            value={data.totalTrainingHours.toLocaleString("en-US")}
            label="Total Training Hours"
          />
          <HeroStat icon={CalendarDays} value={days(data.daysSinceLti)} label="Days Since Last LTI" />
          <HeroStat icon={ShieldCheck} value={days(data.daysSinceMtcRwc)} label="Days Since Last MTC / RWC" />
          <div className="flex flex-col justify-center px-3 sm:px-4">
            <p className="text-xl font-extrabold uppercase leading-tight text-white">
              Zero Harm
              <span className="block text-sm font-bold tracking-wide">is possible</span>
            </p>
            <span className="mt-2 block h-0.5 w-10 rounded bg-brand-orange" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Left column
// ---------------------------------------------------------------------------

function LatestIncidents({ items }: { items: HomeDashboardData["latestIncidents"] }) {
  return (
    <Panel title="Latest Incidents" href="/ficc">
      {items.length === 0 ? (
        <EmptyState text="No incidents recorded" />
      ) : (
        <ul className="divide-y divide-brand-border">
          {items.map((i) => {
            const img = incidentImage(i.category);
            return (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-grayLight">
                  {i.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.photo} alt="" className="h-full w-full object-cover" />
                  ) : img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-9 w-9 object-contain" />
                  ) : (
                    <TriangleAlert className="h-6 w-6 text-brand-orange" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-black">{i.title}</p>
                  <p className="text-xs text-brand-grayDark">{formatDate(i.date, true)}</p>
                  {i.place && <p className="truncate text-xs text-brand-gray">{i.place}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Right column
// ---------------------------------------------------------------------------

function ProjectsSpotlight({ slides }: { slides: ProjectSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => setIndex(0), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-surface text-sm font-medium text-brand-gray">
        Project highlights appear once Weekly KPI data is recorded
      </div>
    );
  }

  const slide = slides[Math.min(index, slides.length - 1)];
  const go = (n: number) => setIndex((n + slides.length) % slides.length);
  const roundBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:scale-105";

  return (
    <section className="relative min-h-[16rem] flex-1 overflow-hidden rounded-2xl shadow-card sm:min-h-[18rem]" style={{ background: "#14202e" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={slide.project}
        src={slide.photo ?? NEWS_PHOTOS[Math.min(index, slides.length - 1) % NEWS_PHOTOS.length] ?? HERO_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(16,27,43,0.94) 0%, rgba(16,27,43,0.8) 45%, rgba(16,27,43,0.15) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
            <span className="h-4 w-1 rounded bg-brand-orange" />
            HSE News
          </p>
          {slides.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: "rgba(0,0,0,0.45)" }}>
                {index + 1} of {slides.length}
              </span>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play" : "Pause"}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                style={{ background: "rgba(0,0,0,0.45)" }}
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        <div className="max-w-xl">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{slide.project}</h2>
          <p className="mt-2 text-base font-semibold leading-snug text-white/90 sm:text-xl">
            {slide.safeHours.toLocaleString("en-US")} safe work hours
            {slide.ltiFree ? " achieved without a Lost Time Injury (LTI)" : " recorded on this project"}
          </p>
          {slide.lastUpdate && (
            <p className="mt-3 text-xs text-white/70">Weekly KPI · updated {timeAgo(slide.lastUpdate)}</p>
          )}
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-5 end-5 flex gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous" className={roundBtn} style={{ background: "rgba(0,0,0,0.4)" }}>
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next" className={roundBtn} style={{ background: "rgba(0,0,0,0.4)" }}>
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function GoodPractices() {
  return (
    <Panel title="Good Practices" icon={<span className="h-5 w-1 rounded bg-brand-orange" />}>
      <div className="grid gap-4 sm:grid-cols-3">
        {GOOD_PRACTICE_POSTS.map((g) => (
          <a
            key={g.id}
            href={g.image}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col overflow-hidden rounded-xl border border-brand-border transition hover:shadow-cardHover"
          >
            <div className="h-48 overflow-hidden bg-brand-grayLight">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.title} className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="text-sm font-bold leading-snug text-brand-black">{g.title}</p>
              <p className="mt-1 line-clamp-3 text-xs leading-snug text-brand-grayDark">{g.details}</p>
              <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-brand-gray">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-orange" />
                <span className="truncate font-medium text-brand-grayDark">{g.project}</span>
                {g.date && (
                  <>
                    <span>|</span>
                    <span className="shrink-0">{formatDate(g.date)}</span>
                  </>
                )}
              </p>
            </div>
          </a>
        ))}
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Bottom row
// ---------------------------------------------------------------------------

function PerformanceTrends({ points }: { points: HomeDashboardData["trends"] }) {
  return (
    <Panel title="HSE Incident Frequency Rates" href="/weekly-kpi" linkLabel="View Details">
      {points.length === 0 ? (
        <EmptyState text="Trends appear once Weekly KPI data is recorded" />
      ) : (
        <>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 18, right: 16, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#eceff3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  domain={[0, (max: number) => Math.ceil(Math.max(max, TRIR_TARGET, LTIFR_TARGET) * 1.2 * 10) / 10]}
                />
                <Tooltip
                  formatter={(v, name) => [Number(v).toFixed(3), name === "trir" ? "TRIR" : "LTIFR"]}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <ReferenceLine y={TRIR_TARGET} stroke={ACCENT} strokeDasharray="5 4" strokeOpacity={0.6} />
                <ReferenceLine y={LTIFR_TARGET} stroke={LTIFR_COLOR} strokeDasharray="5 4" strokeOpacity={0.6} />
                <Line type="linear" dataKey="trir" stroke={ACCENT} strokeWidth={2.5} dot={{ r: 3.5, fill: ACCENT }} isAnimationActive={false}>
                  <LabelList dataKey="trir" position="top" fontSize={10} fill="#475569" formatter={(v) => Number(v).toFixed(3)} />
                </Line>
                <Line type="linear" dataKey="ltifr" stroke={LTIFR_COLOR} strokeWidth={2.5} dot={{ r: 3.5, fill: LTIFR_COLOR }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-center text-xs tabular-nums">
              <thead>
                <tr className="text-[11px] text-brand-gray">
                  <th />
                  {points.map((p) => (
                    <th key={p.month} className="py-1 font-medium">
                      {p.month}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "trir" as const, label: "TRIR", color: ACCENT, target: TRIR_TARGET },
                  { key: "ltifr" as const, label: "LTIFR", color: LTIFR_COLOR, target: LTIFR_TARGET },
                ].map((s) => (
                  <tr key={s.key} className="border-t border-brand-border">
                    <th className="whitespace-nowrap py-1.5 pe-2 text-start font-semibold text-brand-grayDark">
                      <span className="me-1.5 inline-block h-0.5 w-4 align-middle" style={{ background: s.color }} />
                      {s.label}
                    </th>
                    {points.map((p) => (
                      <td key={p.month} className="py-1.5 text-brand-black">
                        {p[s.key].toFixed(3)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap py-1.5 ps-2 text-[10px] text-brand-gray">Target {s.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-brand-gray">
            TRIR per 200,000 man-hours · LTIFR per 1,000,000 man-hours · from Weekly KPI records
          </p>
        </>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Weather by region (Open-Meteo, no API key) — one live reading per region,
// fetched in a single request. The region that holds the signed-in user's
// project is highlighted and listed first.
// ---------------------------------------------------------------------------

const WEATHER_REGIONS: { name: string; lat: number; lng: number }[] = [
  { name: "Riyadh", lat: 24.7136, lng: 46.6753 },
  { name: "Jeddah", lat: 21.5433, lng: 39.1728 },
  { name: "Makkah", lat: 21.3891, lng: 39.8579 },
  { name: "Madinah", lat: 24.4672, lng: 39.6111 },
  { name: "KAEC", lat: 22.4847, lng: 39.1534 },
  { name: "AMAALA (Red Sea)", lat: 25.5, lng: 36.9 },
];

function weatherDisplay(code: number, isDay: boolean): { Icon: LucideIcon; label: string } {
  if (code === 0) return isDay ? { Icon: Sun, label: "Sunny" } : { Icon: Moon, label: "Clear night" };
  if (code === 1 || code === 2)
    return { Icon: isDay ? CloudSun : CloudMoon, label: "Partly cloudy" };
  if (code === 3) return { Icon: Cloud, label: "Cloudy" };
  if (code === 45 || code === 48) return { Icon: CloudFog, label: "Fog" };
  if (code >= 51 && code <= 67) return { Icon: CloudRain, label: "Rain" };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: "Snow" };
  if (code >= 80 && code <= 82)
    return { Icon: isDay ? CloudSunRain : CloudMoonRain, label: "Rain showers" };
  if (code >= 95) return { Icon: CloudLightning, label: "Thunderstorm" };
  return { Icon: isDay ? Sun : Moon, label: "—" };
}

interface RegionWeather {
  name: string;
  temperatureC: number;
  feelsLikeC: number;
  code: number;
  isDay: boolean;
}

function nearestRegion(project: string): string | null {
  const loc = getProjectLocation(project);
  if (!loc) return null;
  let best: string | null = null;
  let bestD = Infinity;
  for (const r of WEATHER_REGIONS) {
    const d = (r.lat - loc.lat) ** 2 + (r.lng - loc.lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = r.name;
    }
  }
  return best;
}

function SiteWeather({ project }: { project: string }) {
  const [readings, setReadings] = useState<RegionWeather[] | null>(null);
  const [failed, setFailed] = useState(false);
  const home = useMemo(() => nearestRegion(project), [project]);

  useEffect(() => {
    let cancelled = false;
    const lat = WEATHER_REGIONS.map((r) => r.lat).join(",");
    const lng = WEATHER_REGIONS.map((r) => r.lng).join(",");
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      "&current=temperature_2m,apparent_temperature,weather_code,is_day&timezone=auto";

    const load = () =>
      fetch(url)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("weather request failed"))))
        .then((json) => {
          if (cancelled) return;
          // One location returns an object, several return an array.
          const list = Array.isArray(json) ? json : [json];
          const rows = WEATHER_REGIONS.map((r, i) => {
            const c = list[i]?.current;
            if (!c || typeof c.temperature_2m !== "number") return null;
            return {
              name: r.name,
              temperatureC: c.temperature_2m,
              feelsLikeC: c.apparent_temperature ?? c.temperature_2m,
              code: c.weather_code ?? 0,
              isDay: c.is_day === 1,
            };
          }).filter((r): r is RegionWeather => r !== null);
          if (rows.length === 0) throw new Error("no weather data");
          setReadings(rows);
          setFailed(false);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });

    load();
    // Refresh every 15 minutes so day/night and conditions stay current.
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const ordered = useMemo(
    () =>
      readings
        ? [...readings].sort((a, b) => (a.name === home ? -1 : b.name === home ? 1 : 0))
        : null,
    [readings, home]
  );

  return (
    <Panel title="Weather by Region" icon={<CloudSun className="h-5 w-5 text-brand-orange" />}>
      {ordered ? (
        <ul className="divide-y divide-brand-border">
          {ordered.map((r) => {
            const { Icon, label } = weatherDisplay(r.code, r.isDay);
            const isHome = r.name === home;
            const hot = r.feelsLikeC >= 40;
            return (
              <li
                key={r.name}
                className={`flex items-center gap-3 py-2.5 ${isHome ? "-mx-2 rounded-xl px-2" : ""}`}
                style={isHome ? { background: "rgb(var(--brand-orange-light-rgb))" } : undefined}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ background: r.isDay ? "#fff4e6" : "#1e293b" }}
                >
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={1.8}
                    style={{ color: r.isDay ? "#f59e0b" : "#e2e8f0" }}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-brand-black">
                    {r.name}
                    {isHome && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-orange px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-onAccent">
                        <MapPin className="h-2.5 w-2.5" />
                        {project}
                      </span>
                    )}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-brand-grayDark">
                    {label}
                    {hot && (
                      <span className="inline-flex items-center gap-0.5 font-semibold text-red-600" title="Heat stress risk">
                        · <Thermometer className="h-3 w-3" /> Heat risk
                      </span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-lg font-extrabold leading-none text-brand-black tabular-nums">
                    {Math.round(r.temperatureC)}°C
                  </p>
                  <p className="mt-0.5 text-[10px] text-brand-gray">feels {Math.round(r.feelsLikeC)}°</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : failed ? (
        <EmptyState text="Weather data unavailable right now" />
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Tips of the day (Training) — one tip per calendar day, same for everyone
// ---------------------------------------------------------------------------

const TRAINING_TIPS: { topic: string; tip: string; image: string }[] = [
  { topic: "PPE", tip: "Always wear your PPE correctly — a hard hat only protects when it's actually on your head.", image: "ppe" },
  { topic: "Near Miss Reporting", tip: "Report near misses even when nobody got hurt — they're the earliest warning of a real incident.", image: "near-miss" },
  { topic: "Tools & Equipment", tip: "Inspect your tools and equipment before every shift, not just at the start of the week.", image: "tools" },
  { topic: "Housekeeping", tip: "Keep walkways and exits clear — housekeeping is a safety control, not just tidiness.", image: "housekeeping" },
  { topic: "Permit to Work", tip: "Never bypass a permit-to-work step to save time — that's exactly when incidents happen.", image: "ptw" },
  { topic: "Confined Space", tip: "Test the atmosphere with a calibrated gas detector before entry — never assume the air is safe.", image: "confined-space" },
  { topic: "Heat Stress", tip: "Stay hydrated and take scheduled breaks in high heat — heat stress builds up before you feel it.", image: "heat-stress" },
  { topic: "LOTO", tip: "Lock out and tag out energy sources before maintenance — every time, no exceptions.", image: "loto" },
  { topic: "Lifting Operations", tip: "Keep clear of suspended loads and check rigging before every lift — never stand under the load.", image: "lifting" },
  { topic: "Working at Height", tip: "Use guarded platforms and clip your harness to an approved anchor point — a loose strap defeats the whole system.", image: "work-at-height" },
];

function TipsOfTheDay() {
  const [offset, setOffset] = useState(0);
  const dayOfYear = useMemo(
    () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000),
    []
  );
  const n = TRAINING_TIPS.length;
  const idx = (((dayOfYear + offset) % n) + n) % n;
  const tip = TRAINING_TIPS[idx];

  return (
    <Panel
      title="Tips of the day (Training)"
      icon={<Lightbulb className="h-5 w-5 text-brand-orange" />}
      href="/hse-passport/training"
      linkLabel="Training"
      className="h-full"
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl" style={{ background: "rgb(var(--brand-orange-light-rgb))" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/brand/tips/${tip.image}.svg`} alt={tip.topic} className="aspect-[16/10] w-full object-cover" />
        <div className="flex flex-1 flex-col p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-orange">
            <GraduationCap className="h-4 w-4" />
            {tip.topic}
          </p>
          <p className="mt-2 flex-1 text-base font-semibold leading-snug text-brand-black">&ldquo;{tip.tip}&rdquo;</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOffset((o) => o - 1)}
              aria-label="Previous tip"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface text-brand-grayDark shadow-sm transition hover:text-brand-orange"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-1.5">
              {TRAINING_TIPS.map((t, k) => (
                <button
                  key={t.image}
                  type="button"
                  onClick={() => setOffset((o) => o + (k - idx))}
                  aria-label={`Tip ${k + 1}`}
                  className={`h-2 rounded-full transition-all ${k === idx ? "w-5 bg-brand-orange" : "w-2 bg-brand-orange/30"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOffset((o) => o + 1)}
              aria-label="Next tip"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface text-brand-grayDark shadow-sm transition hover:text-brand-orange"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// "Most ... by project" bar charts
// ---------------------------------------------------------------------------

function ByProjectBarChart({
  title,
  rows,
  unit,
  href,
  color,
  emptyText,
}: {
  title: string;
  rows: { label: string; count: number }[];
  unit: string;
  href: string;
  color: string;
  emptyText: string;
}) {
  return (
    <Panel title={title} href={href}>
      <p className="-mt-2 mb-3 text-xs text-brand-gray">By Project</p>
      {rows.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 18, right: 4, bottom: 0, left: -18 }} barCategoryGap="22%">
              <CartesianGrid stroke="#eceff3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={(v: string) => (v.length > 9 ? `${v.slice(0, 8)}…` : v)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                formatter={(v) => [`${Number(v).toLocaleString("en-US")} ${unit}`, "Total"]}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
                <LabelList dataKey="count" position="top" fontSize={10} fill="#475569" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Page layout
// ---------------------------------------------------------------------------

export default function HomeDashboard({ data, project }: { data: HomeDashboardData; project: string }) {
  // The banner renders straight away (its figures fill in as data arrives);
  // only the sections below wait behind the spinner.
  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <Hero data={data.hero} />
        <div className="flex justify-end">
          <ProjectFilter />
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-brand-border bg-brand-surface py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Hero data={data.hero} />

      <div className="flex justify-end">
        <ProjectFilter />
      </div>

      {/* Left: HSE News + Good Practices, then the two by-project charts.
          Right: Site Weather + Latest Incidents, then Tips of the day level
          with the charts. */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <ProjectsSpotlight slides={data.projects} />
          <GoodPractices />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
          <SiteWeather project={project} />
          <LatestIncidents items={data.latestIncidents} />
        </div>

        <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:col-span-8">
          <ByProjectBarChart
            title="Most HSE Observation"
            rows={data.observationsByProject}
            unit="observations"
            href="/observations"
            color={ACCENT}
            emptyText="No observations recorded yet"
          />
          <ByProjectBarChart
            title="Most LSR Violations"
            rows={data.lsrByProject}
            unit="LSR violations"
            href="/ficc"
            color={LSR_COLOR}
            emptyText="No LSR violations recorded"
          />
        </div>
        <div className="flex min-w-0 lg:col-span-4 [&>section]:flex-1">
          <TipsOfTheDay />
        </div>
      </div>

      <PerformanceTrends points={data.trends} />
    </div>
  );
}
