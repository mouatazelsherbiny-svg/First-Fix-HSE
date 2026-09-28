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

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  ArrowUpFromLine,
  BrushCleaning,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Construction,
  Container,
  FileCheck2,
  Flame,
  Forklift,
  GraduationCap,
  HardHat,
  Leaf,
  Lock,
  Package,
  Pause,
  Play,
  Shield,
  ShieldCheck,
  Shovel,
  Sparkles,
  TrafficCone,
  TriangleAlert,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
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

const ACCENT = "rgb(var(--brand-orange-rgb))";
const LTIFR_COLOR = "#1f4e79";
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

const OBSERVATION_ICONS: [RegExp, LucideIcon][] = [
  [/height|fall/i, ArrowUpFromLine],
  [/permit/i, FileCheck2],
  [/lifting/i, Anchor],
  [/mobile|mepi/i, Forklift],
  [/heavy equipment/i, Truck],
  [/loto|isolation/i, Lock],
  [/electrical/i, Zap],
  [/fire/i, Flame],
  [/housekeeping/i, BrushCleaning],
  [/ppe/i, HardHat],
  [/barricade|sign/i, TrafficCone],
  [/excavation|edge/i, Shovel],
  [/scaffold/i, Construction],
  [/tools|machine/i, Wrench],
  [/training|qualification/i, GraduationCap],
  [/environment/i, Leaf],
  [/welfare/i, Users],
  [/dropped|falling object/i, Package],
  [/confined/i, Container],
  [/document/i, ClipboardCheck],
  [/protection/i, Shield],
];

function observationIcon(label: string): LucideIcon {
  return OBSERVATION_ICONS.find(([re]) => re.test(label))?.[1] ?? TriangleAlert;
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
    <section className="relative overflow-hidden rounded-2xl shadow-card" style={{ background: "#120d0a" }}>
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

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 xl:flex-row xl:items-center xl:justify-between">
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
          className="grid grid-cols-2 gap-y-5 rounded-2xl border p-5 sm:grid-cols-4 sm:divide-x sm:divide-white/15 rtl:sm:divide-x-reverse"
          style={{ background: "rgba(10,8,7,0.72)", borderColor: "rgba(255,255,255,0.12)" }}
        >
          <HeroStat
            icon={HardHat}
            value={data.totalSafeWorkHours.toLocaleString("en-US")}
            label="Total Safe Work Hours"
            sub={data.safeHoursAsOf ? `as of ${formatDate(data.safeHoursAsOf)}` : undefined}
          />
          <HeroStat icon={CalendarDays} value={days(data.daysSinceLti)} label="Days Since Last LTI" />
          <HeroStat icon={ShieldCheck} value={days(data.daysSinceMtcRwc)} label="Days Since Last MTC / RWC" />
          <div className="col-span-2 flex flex-col justify-center px-3 sm:col-span-1">
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
                <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-grayLight">
                  {img ? (
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

function TrendingAlerts({ items }: { items: HomeDashboardData["trendingAlerts"] }) {
  return (
    <Panel
      title="Trending HSE Alerts"
      icon={<Flame className="h-5 w-5 text-brand-orange" />}
      href="/observations"
    >
      {items.length === 0 ? (
        <EmptyState text="No recent observations" />
      ) : (
        <ul className="divide-y divide-brand-border">
          {items.map((row) => {
            const Icon = observationIcon(row.label);
            return (
              <li key={row.label}>
                <Link
                  href="/observations"
                  className="group flex items-center gap-3 py-2.5 text-sm transition hover:text-brand-orange"
                >
                  <Icon className="h-5 w-5 shrink-0 text-brand-orange" strokeWidth={1.9} />
                  <span className="min-w-0 flex-1 truncate font-medium text-brand-black group-hover:text-brand-orange">
                    {row.label}
                  </span>
                  <span className="font-semibold tabular-nums text-brand-black">{row.count}</span>
                  <ArrowRight className="h-4 w-4 text-brand-orange rtl:rotate-180" />
                </Link>
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
        src={slide.photo ?? HERO_IMAGE}
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
            Projects
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

function GoodPractices({ items }: { items: HomeDashboardData["goodPractices"] }) {
  return (
    <Panel
      title="Good Practices"
      icon={<span className="h-5 w-1 rounded bg-brand-orange" />}
      href="/observations"
    >
      {items.length === 0 ? (
        <EmptyState text="No good practices recorded yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((g) => (
            <Link
              key={g.id}
              href={`/observations/${g.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-brand-border transition hover:shadow-cardHover"
            >
              <div className="flex h-32 items-center justify-center overflow-hidden bg-brand-grayLight">
                {g.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.photo} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <Sparkles className="h-8 w-8 text-brand-orange" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-3 text-sm font-semibold leading-snug text-brand-black">{g.details || "Good practice"}</p>
                <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-brand-gray">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-orange" />
                  <span className="truncate font-medium text-brand-grayDark">{g.project}</span>
                  <span>|</span>
                  <span className="shrink-0">{timeAgo(g.createdAt)}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Bottom row
// ---------------------------------------------------------------------------

function PerformanceTrends({ points }: { points: HomeDashboardData["trends"] }) {
  return (
    <Panel title="HSE Performance Trends" href="/weekly-kpi" linkLabel="View Details">
      {points.length === 0 ? (
        <EmptyState text="Trends appear once Weekly KPI data is recorded" />
      ) : (
        <>
          <p className="mb-1 text-center text-sm font-semibold text-brand-grayDark">Incident Frequency Rates</p>
          <div className="h-56 w-full">
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
            <table className="w-full min-w-[480px] text-center text-xs tabular-nums">
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

function TopObservations({ items }: { items: HomeDashboardData["topObservations"] }) {
  return (
    <Panel title="Top 3 Observations" href="/observations">
      {items.length === 0 ? (
        <EmptyState text="No observations recorded yet" />
      ) : (
        <div className="grid flex-1 grid-cols-3 gap-4">
          {items.map((o, i) => {
            const Icon = observationIcon(o.label);
            return (
              <div key={o.label} className="flex flex-col">
                <div className="relative mb-6 flex aspect-[4/3] items-center justify-center rounded-xl bg-brand-grayLight">
                  {o.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.photo} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <Icon className="h-10 w-10 text-brand-orange" strokeWidth={1.6} />
                  )}
                  <span className="absolute -bottom-4 start-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-surface bg-brand-orange text-base font-extrabold text-brand-onAccent shadow">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm font-bold leading-tight text-brand-black">{o.label}</p>
                <p className="text-sm font-bold text-brand-grayDark">({o.count.toLocaleString("en-US")})</p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Page layout
// ---------------------------------------------------------------------------

export default function HomeDashboard({ data }: { data: HomeDashboardData }) {
  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-brand-border bg-brand-surface py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Hero data={data.hero} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-5 xl:col-span-4">
          <LatestIncidents items={data.latestIncidents} />
          <TrendingAlerts items={data.trendingAlerts} />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-7 xl:col-span-8">
          <ProjectsSpotlight slides={data.projects} />
          <GoodPractices items={data.goodPractices} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <PerformanceTrends points={data.trends} />
        </div>
        <div className="flex min-w-0 lg:col-span-5 [&>section]:flex-1">
          <TopObservations items={data.topObservations} />
        </div>
      </div>
    </div>
  );
}
