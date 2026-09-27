"use client";

/**
 * "HSE Pulse" — the dashboard section rebuilt to design/reference.png.jpeg.
 *
 * Card-for-card mapping from the reference's learning content onto HSE
 * content: Next Lesson -> Next Toolbox Talk, Streak -> Days Without LTI,
 * Code Practice -> Open Permits, Language Practice -> Training Compliance,
 * Weekly Progress -> Observations week-on-week, Course Progress ->
 * Monthly H&S Checklist, Live Mentor Session -> Next Induction, Learning
 * Score -> HSE Performance Score, and the three footer actions.
 *
 * Every figure comes from useHsePulse(), which reads existing Supabase
 * data only. Metrics the schema cannot source are flagged `placeholder`
 * and rendered with a visible "sample" chip rather than passed off as
 * real.
 */

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Flame,
  GraduationCap,
  MapPin,
  Play,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useHsePulse } from "@/lib/useHsePulse";
import { MasteryRow, ProgressRing, SegmentedDonut, Sparkline } from "./charts";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/** Marks a figure the schema has no source for, so nothing reads as real when it isn't. */
function SampleChip() {
  return (
    <span
      title="No data source in the schema yet — shown as a sample value"
      className="ms-2 inline-flex items-center rounded-full border border-[color:var(--ref-hairline)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ref-muted"
    >
      Sample
    </span>
  );
}

function SampleChipDark() {
  return (
    <span
      title="No data source in the schema yet — shown as a sample value"
      className="ms-2 inline-flex items-center rounded-full border border-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/50"
    >
      Sample
    </span>
  );
}

export default function HsePulseSection() {
  const pulse = useHsePulse();
  const {
    toolboxTalk,
    lti,
    openPermits,
    trainingCompliance,
    observations,
    checklist,
    mastery,
    nextSession,
    score,
  } = pulse;

  const trendUp = observations.deltaPct >= 0;

  return (
    <section className="ref-canvas mt-8 p-5 sm:p-7 lg:p-9">
      <div className="grid grid-cols-12 gap-5">
        {/* ---------------- Headline ---------------- */}
        <div className="col-span-12 lg:col-span-7">
          <p className="ref-eyebrow">
            <span className="h-1 w-1 rounded-full bg-brand-orange" />
            Dashboard
          </p>

          <h2 className="ref-display mt-4 text-[clamp(2.6rem,6vw,4.4rem)] ref-text">
            Safer sites,
            <br />
            <span className="text-brand-orange">every day.</span>
          </h2>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] ref-muted">
            Keep looking. Keep reporting.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <span className="text-sm font-bold text-brand-orange">+</span>
            <span className="h-[3px] w-24 rounded-full bg-brand-orange" />
          </div>
        </div>

        {/* ------- Observations this week vs last week ------- */}
        <div className="ref-card col-span-12 flex flex-col p-5 sm:col-span-6 lg:col-span-5">
          <p className="ref-eyebrow">
            <span className="h-1 w-1 rounded-full bg-brand-orange" />
            Observations this week
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[2rem] font-extrabold leading-none ref-text">
                {trendUp ? "+" : ""}
                {observations.deltaPct}%
                {trendUp ? (
                  <TrendingUp className="h-5 w-5 text-brand-orange" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-brand-orange" />
                )}
              </p>
              <p className="mt-1.5 text-xs ref-muted">
                {observations.thisWeek} this week vs {observations.lastWeek} last week
              </p>
            </div>
          </div>
          <div className="mt-2 flex-1">
            <Sparkline points={observations.points} />
          </div>
        </div>

        {/* ---------------- Next Toolbox Talk (dark) ---------------- */}
        <div className="ref-card-dark relative col-span-12 overflow-hidden lg:col-span-7">
          {/* Warm glow, echoing the reference's glowing 3D art. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full opacity-45 blur-3xl"
            style={{ background: "radial-gradient(circle, rgb(var(--brand-orange-rgb)), transparent 62%)" }}
          />
          <div className="relative p-6 sm:p-7">
            <p className="ref-eyebrow">
              <span className="h-2.5 w-[3px] rounded-full bg-brand-orange" />
              Next Toolbox Talk
              {toolboxTalk.placeholder && <SampleChipDark />}
            </p>

            <h3 className="mt-3 max-w-md text-2xl font-semibold leading-snug text-white">
              {toolboxTalk.value?.topic ?? "No toolbox talk on record"}
            </h3>

            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/50">
              {toolboxTalk.value?.project && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {toolboxTalk.value.project}
                  {toolboxTalk.value.location ? ` · ${toolboxTalk.value.location}` : ""}
                </span>
              )}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/reports"
                className="inline-flex items-center gap-3 rounded-full bg-white/8 py-1.5 pe-5 ps-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-white/14"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange">
                  <Play className="h-4 w-4 fill-current text-brand-onAccent" />
                </span>
                Continue
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(toolboxTalk.value?.date)}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- Days Without LTI ---------------- */}
        <div className="ref-card col-span-12 p-6 sm:col-span-6 lg:col-span-5">
          <p className="ref-eyebrow">
            Days Without LTI
            {lti.placeholder && <SampleChip />}
          </p>

          <p className="mt-3 text-[3.25rem] font-extrabold leading-none ref-text">{lti.days}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] ref-muted">Days</p>

          <div className="mt-5 flex items-end justify-between gap-1">
            {lti.week.map((day, i) => (
              <div key={`${day.letter}-${i}`} className="flex flex-col items-center gap-1.5">
                <Flame
                  className={`h-[22px] w-[22px] ${
                    day.safe ? "fill-brand-orange/25 text-brand-orange" : "fill-transparent text-[color:var(--ref-track)]"
                  }`}
                />
                <span className="text-[10px] font-bold ref-muted">{day.letter}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] ref-muted">
            Last lost-time incident: {formatDate(lti.lastDate)}
          </p>
        </div>

        {/* ---------------- Open Permits (dark) ----------------
             Paired half-and-half with Training Compliance so the two
             stretch to a matched height, the way the reference pairs its
             Streak and Code Practice cards. */}
        <div className="ref-card-dark col-span-12 flex flex-col p-6 sm:col-span-6 lg:col-span-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-brand-orange">
            <ClipboardCheck className="h-5 w-5" />
          </span>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Open Permits to Work
          </p>

          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/50">
            <span className="text-3xl font-extrabold text-white">{openPermits.value}</span>
            <br />
            permit{openPermits.value === 1 ? "" : "s"} still open and awaiting close-out.
          </p>

          <Link href="/permit-to-work" className="ref-pill-dark mt-5 self-start">
            Review now
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* ---------------- Training Compliance ---------------- */}
        <div className="ref-card col-span-12 flex flex-col p-6 sm:col-span-6 lg:col-span-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-3xl font-extrabold leading-none ref-text">
              {trainingCompliance.value}
              <span className="text-lg text-brand-orange">%</span>
            </span>
          </div>

          <p className="ref-eyebrow mt-4">
            Training Compliance
            {trainingCompliance.placeholder && <SampleChip />}
          </p>
          <p className="mt-1.5 text-lg font-semibold ref-text">Courses still valid</p>
          <p className="mt-0.5 text-xs ref-muted">Across all recorded training</p>

          {/* mt-auto anchors the bar to the card's baseline so it lines up
              with the paired card's button instead of floating mid-card. */}
          <div className="mt-auto pt-6">
            <div className="ref-bar">
              <span style={{ width: `${trainingCompliance.value}%` }} />
            </div>
          </div>
        </div>

        {/* ---------------- Monthly H&S Checklist ---------------- */}
        <div className="ref-card col-span-12 flex flex-col p-6 lg:col-span-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="ref-eyebrow">
                Monthly H&amp;S Checklist
                {checklist.placeholder && <SampleChip />}
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug ref-text">Site inspection score</p>
              <p className="mt-0.5 text-xs ref-muted">Across submitted checklists</p>
            </div>

            <ProgressRing value={checklist.placeholder ? 68 : checklist.value} size={90} stroke={10}>
              <span className="text-xl font-extrabold ref-text">
                {checklist.placeholder ? 68 : checklist.value}
                <span className="text-[11px] text-brand-orange">%</span>
              </span>
              <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] ref-muted">
                Complete
              </span>
            </ProgressRing>
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] ref-text">
            Programme breakdown
          </p>

          <div className="mt-3 flex-1 space-y-3">
            {mastery.map((bar) => (
              <MasteryRow key={bar.label} label={bar.label} value={bar.value} />
            ))}
          </div>

          <Link href="/reports" className="ref-pill mt-5 w-full">
            Open checklists
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* ---------------- Next Induction / Training Session ---------------- */}
        <div className="relative col-span-12 overflow-hidden lg:col-span-4" style={{ borderRadius: "var(--ref-radius)" }}>
          <Image
            src="/brand/landing-hero-v3.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover grayscale-[0.9] brightness-[1.1] contrast-[1.05]"
            priority={false}
          />
          {/* Two layers: a broad bottom-weighted wash that keeps the upper
              photo readable, plus a denser scrim over the text block —
              needed because a white hard hat sits directly behind the
              orange eyebrow and washed it out on its own. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(10,9,8,.97) 0%, rgba(10,9,8,.94) 34%, rgba(10,9,8,.80) 52%, rgba(10,9,8,.34) 72%, rgba(10,9,8,.04) 90%, rgba(10,9,8,0) 100%)",
            }}
          />
          {/* The photo's bright centre can sit directly behind the eyebrow,
              so the text block carries its own shadow rather than relying
              on the gradient alone. */}
          <div
            className="relative flex min-h-[320px] flex-col justify-end p-6 sm:p-7"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.8)" }}
          >
            <p className="ref-eyebrow">
              Next Induction / Training
              {nextSession.placeholder && <SampleChipDark />}
            </p>

            <h3 className="mt-2.5 max-w-sm text-2xl font-semibold leading-snug text-white">
              {nextSession.value?.course ?? "No session scheduled"}
            </h3>
            <p className="mt-1.5 text-[13px] text-white/70">{formatDate(nextSession.value?.date)}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 rtl:space-x-reverse">
                  {["A", "M", "K"].map((initial) => (
                    <span
                      key={initial}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-brand-onAccent ring-2 ring-black/30"
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-white/60">
                  {nextSession.value?.attendees ?? 0} booked
                </span>
              </div>

              <Link href="/hse-passport/training" className="ref-pill">
                Join session
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* ---------------- HSE Performance Score ---------------- */}
        <div className="ref-card col-span-12 flex flex-col items-center p-6 lg:col-span-4">
          <p className="ref-eyebrow self-start">
            <span className="h-1 w-1 rounded-full bg-brand-orange" />
            HSE Performance Score
          </p>

          <SegmentedDonut
            slices={score.categories.map((c) => ({
              key: c.key,
              label: c.label,
              value: c.value,
              color: c.color,
            }))}
            size={168}
            stroke={22}
          >
            <span className="text-[2.4rem] font-extrabold leading-none ref-text">{score.total}</span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] ref-muted">
              Out of 100
            </span>
          </SegmentedDonut>

          <ul className="mt-6 w-full space-y-2.5">
            {score.categories.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="inline-flex items-center gap-2.5 ref-text">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                  {c.placeholder && <SampleChip />}
                </span>
                <span className="font-semibold ref-muted tabular-nums">{c.value}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------- Three footer actions ---------------- */}
        <div className="col-span-12 mt-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-[color:var(--ref-hairline)]" />
          <span className="ref-eyebrow-muted">Your site. Your call.</span>
          <span className="h-px flex-1 bg-[color:var(--ref-hairline)]" />
        </div>

        {(
          [
            {
              href: "/observations/new",
              icon: ClipboardList,
              title: "Report Observation",
              body: "Log a hazard, unsafe act or good practice from anywhere on site.",
            },
            {
              href: "/weekly-kpi",
              icon: ShieldCheck,
              title: "Review Weekly KPI",
              body: "Track leading and lagging indicators across every active project.",
            },
            {
              href: "/reports",
              icon: ClipboardCheck,
              title: "Start Inspection",
              body: "Run a monthly H&S, environmental or fire checklist and submit it.",
            },
          ] as const
        ).map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="ref-card group col-span-12 flex flex-col p-5 transition-shadow hover:shadow-[var(--ref-shadow-lift)] sm:col-span-6 lg:col-span-4"
          >
            <span className="ref-tile">
              <action.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] ref-text">{action.title}</p>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed ref-muted">{action.body}</p>
            <ArrowUpRight className="mt-4 h-4 w-4 text-brand-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
