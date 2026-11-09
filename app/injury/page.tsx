"use client";

import { useEffect, useMemo, useState } from "react";
import { Montserrat } from "next/font/google";
import {
  BicepsFlexed,
  BriefcaseMedical,
  ChevronDown,
  Hand,
  HardHat,
  HeartPulse,
  Plus,
  Search,
  X,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectFilter from "@/components/ProjectFilter";
import { ColumnFilter, useColumnFilters, type FilterColumn } from "@/components/table/ColumnFilter";
import BodyFigure from "@/components/injury/BodyFigure";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import { BODY_GROUP_IDS, bodyGroupOf, type BodyGroupId } from "@/lib/bodyParts";
import type { Incident } from "@/types/incident";

// The reference design's geometric sans; Arabic falls back to the app font.
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function InjuryPage() {
  return (
    <ProtectedRoute hideProjectFilter>
      <InjuryOverview />
    </ProtectedRoute>
  );
}

const ORANGE = "#f36f24";
const ORANGE_HI = "#ff8a3d";
const ALL = "all";
const TOP_PROJECTS = 8;

type KpiKey = "lti" | "rwc" | "mtc" | "fac";
const KPIS: { key: KpiKey; label: string; icon: LucideIcon; match: string[] }[] = [
  { key: "lti", label: "LTI", icon: HardHat, match: ["Lost Time Incident", "Lost Time Injury", "LTI"] },
  { key: "rwc", label: "RWC", icon: BriefcaseMedical, match: ["Restricted Work Case", "RWC"] },
  { key: "mtc", label: "MTC", icon: Stethoscope, match: ["Medical Treatment Case", "MTC"] },
  { key: "fac", label: "FAC", icon: UsersRound, match: ["First Aid Case", "FAC"] },
];

// The classification decides the KPI; the category is the fallback when the
// classification is empty (both come from the FICC import).
const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();
const kpiOf = (i: Incident): KpiKey | null => {
  const c = norm(i.classification) || norm(i.incidentCategory);
  return KPIS.find((k) => k.match.some((m) => m.toLowerCase() === c))?.key ?? null;
};
/** Columns the details table can be filtered by (header funnels). */
const INJ_FILTERS: FilterColumn<Incident>[] = [
  { key: "no", get: (i) => (i.incidentNumber == null ? "" : String(i.incidentNumber)) },
  { key: "date", get: (i) => dateOf(i)?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }), sortBy: (i) => dateOf(i)?.getTime() },
  { key: "project", get: (i) => i.projectName },
  { key: "classification", get: (i) => i.classification || i.incidentCategory },
  { key: "body", get: (i) => i.bodyPart },
];

const dateOf = (i: Incident) => {
  const d = i.incidentDate ? new Date(i.incidentDate) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

function InjuryOverview() {
  const { t, locale } = useLanguage();
  const b = t.injury.board;
  const { incidents, isLoading } = useIncidents();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string | null>(null);
  const [group, setGroup] = useState<BodyGroupId | null>(null);
  const toggleGroup = (g: BodyGroupId) => setGroup((cur) => (cur === g ? null : g));

  // The whole page is dark: paint the app's content area black while here.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.background;
    main.style.background = "#0a0a0c";
    return () => {
      main.style.background = prev;
    };
  }, []);

  const injuries = useMemo(() => incidents.filter((i) => i.recordType === "Injury"), [incidents]);

  // Years with injuries, newest first; the page opens on the latest one.
  const years = useMemo(() => {
    const set = new Set<number>();
    injuries.forEach((i) => {
      const d = dateOf(i);
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, c) => c - a);
  }, [injuries]);

  useEffect(() => {
    // Wait for the data, otherwise the page would settle on "All years".
    if (isLoading || years.length === 0) return;
    if (year === null || (year !== ALL && !years.includes(Number(year)))) setYear(String(years[0]));
  }, [years, year, isLoading]);

  // Year + search filter the whole page; the body map's counts come from this.
  const base = useMemo(() => {
    const q = query.trim().toLowerCase();
    return injuries.filter((i) => {
      if (year && year !== ALL && dateOf(i)?.getFullYear() !== Number(year)) return false;
      if (!q) return true;
      return (
        i.projectName.toLowerCase().includes(q) ||
        String(i.incidentNumber ?? "").includes(q) ||
        (i.bodyPart ?? "").toLowerCase().includes(q)
      );
    });
  }, [injuries, year, query]);

  // A clicked body part filters everything else on the page too.
  const filtered = useMemo(
    () => (group ? base.filter((i) => bodyGroupOf(i.bodyPart) === group) : base),
    [base, group]
  );
  const groupCounts = useMemo(() => {
    const counts = Object.fromEntries(BODY_GROUP_IDS.map((g) => [g, 0])) as Record<BodyGroupId, number>;
    base.forEach((i) => {
      const g = bodyGroupOf(i.bodyPart);
      if (g) counts[g] += 1;
    });
    return counts;
  }, [base]);

  // Months shown: the whole year for past years / all years; for the current
  // year, up to the latest month with an injury (later months aren't over or
  // haven't been imported yet).
  const monthCount = useMemo(() => {
    if (!year || year === ALL || Number(year) !== new Date().getFullYear()) return 12;
    const last = Math.max(-1, ...injuries.map((i) => dateOf(i)).filter((d): d is Date => d?.getFullYear() === Number(year)).map((d) => d.getMonth()));
    return Math.max(1, last + 1);
  }, [year, injuries]);

  const stats = useMemo(() => {
    const months = Array.from({ length: monthCount }, () => 0);
    const kpiMonths: Record<KpiKey, number[]> = {
      lti: Array(monthCount).fill(0),
      rwc: Array(monthCount).fill(0),
      mtc: Array(monthCount).fill(0),
      fac: Array(monthCount).fill(0),
    };
    const kpis: Record<KpiKey, number> = { lti: 0, rwc: 0, mtc: 0, fac: 0 };
    const groups = Object.fromEntries(BODY_GROUP_IDS.map((g) => [g, 0])) as Record<BodyGroupId, number>;
    const projects = new Map<string, number>();
    let noBodyPart = 0;

    filtered.forEach((i) => {
      const m = dateOf(i)?.getMonth();
      const k = kpiOf(i);
      if (k) kpis[k] += 1;
      if (m !== undefined && m < monthCount) {
        months[m] += 1;
        if (k) kpiMonths[k][m] += 1;
      }
      const g = bodyGroupOf(i.bodyPart);
      if (g) groups[g] += 1;
      else noBodyPart += 1;
      const p = i.projectName?.trim() || "—";
      projects.set(p, (projects.get(p) ?? 0) + 1);
    });

    const byProject = Array.from(projects, ([name, value]) => ({ name, value })).sort((a, c) => c.value - a.value);
    return { months, kpiMonths, kpis, groups, byProject, noBodyPart };
  }, [filtered, monthCount]);

  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { month: "short" });
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2024, m, 1)));
  }, [locale]);
  const monthData = stats.months.map((value, m) => ({ name: monthLabels[m], value }));

  const total = filtered.length;
  // Header funnels narrow only the details table.
  const columnFilters = useColumnFilters(filtered, INJ_FILTERS);
  const tableRows = columnFilters.filtered;
  const dateFmt = (d: Date | null) =>
    d ? d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 min-h-[calc(100vh-4rem)] overflow-hidden p-4 text-white sm:-mx-6 sm:p-6 lg:-mx-8`}
      style={{
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(243,111,36,0.10), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(243,111,36,0.08), transparent 60%), #0a0a0c",
      }}
    >
      {/* ---- Header ---- */}
      <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4">
        <span className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]" style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}>
          {b.pageName}
        </span>
        <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
        <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">{b.title}</h1>
        <div className="ms-auto flex flex-wrap items-center gap-3">
          {group && (
            <button
              type="button"
              onClick={() => setGroup(null)}
              className="inline-flex items-center gap-2 rounded-full border border-[#f36f24]/60 bg-[#f36f24]/15 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#f36f24]/30"
            >
              {b.groups[group]}
              <X className="h-4 w-4" />
              <span className="sr-only">{b.clearFilter}</span>
            </button>
          )}
          {/* App-wide project filter, moved into this header (hidden above the page). */}
          <ProjectFilter className="!text-white/75" />
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#f36f24] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ---- KPI row ---- */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            {KPIS.map((k) => (
              <KpiCard
                key={k.key}
                icon={k.icon}
                label={k.label}
                title={b[k.key]}
                value={stats.kpis[k.key]}
                series={stats.kpiMonths[k.key]}
                share={total ? stats.kpis[k.key] / total : 0}
              />
            ))}
            <div className="flex items-center justify-center sm:col-span-2 xl:col-span-1 xl:ps-2">
              <div
                className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-[3px] border-[#f36f24] text-center"
                style={{ boxShadow: "0 0 26px rgba(243,111,36,0.55), inset 0 0 22px rgba(243,111,36,0.25)" }}
              >
                <span className="px-3 text-[10px] font-medium uppercase leading-tight tracking-[0.18em] text-white/85">
                  {b.totalInjuries}
                </span>
                <span className="mt-1 text-3xl font-bold tabular-nums">{total.toLocaleString("en-US")}</span>
              </div>
            </div>
          </div>

          {/* ---- Body map | charts + table ---- */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,5.4fr)_minmax(0,6.6fr)]">
            <Panel className="flex flex-col xl:row-span-2">
              <div className="grid flex-1 grid-cols-1 items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,160px)]">
                <div className="mx-auto aspect-[352/504] w-full self-center">
                  <BodyFigure counts={groupCounts} selected={group} onSelect={toggleGroup} />
                </div>
                <ul className="flex flex-col rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-1">
                  {BODY_GROUP_IDS.map((g) => (
                    <li
                      key={g}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleGroup(g)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleGroup(g)}
                      className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg border-b border-white/[0.07] px-1 py-2.5 transition last:border-0 hover:bg-white/[0.05] ${
                        group === g ? "bg-[#f36f24]/15 ring-1 ring-[#f36f24]/60" : group ? "opacity-45" : ""
                      }`}
                    >
                      <BodyGroupIcon id={g} />
                      <span className="min-w-0 flex-1 text-xs font-medium uppercase leading-tight tracking-wide text-white/90">
                        {b.groups[g]}
                      </span>
                      <span
                        className="text-2xl font-bold tabular-nums leading-none text-[#ff7a2f] sm:text-[28px]"
                        style={{ textShadow: "0 0 12px rgba(243,111,36,0.55)" }}
                      >
                        {groupCounts[g]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {stats.noBodyPart > 0 && (
                <p className="mt-2 text-center text-[11px] text-white/45">
                  {b.bodyNote.replace("{count}", String(stats.noBodyPart))}
                </p>
              )}
            </Panel>

            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
              {/* Month chart */}
              <Panel>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold leading-tight sm:text-[17px]">{b.byMonth}</h2>
                  <div className="relative">
                    <select
                      value={year ?? ALL}
                      onChange={(e) => setYear(e.target.value)}
                      className="appearance-none rounded-full border border-white/25 bg-black/40 py-1 pe-8 ps-3.5 text-sm font-medium text-white outline-none focus:border-[#f36f24]"
                      aria-label={b.byMonth}
                    >
                      {years.map((y) => (
                        <option key={y} value={y} className="bg-neutral-900">
                          {y}
                        </option>
                      ))}
                      <option value={ALL} className="bg-neutral-900">
                        {b.allYears}
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
                  </div>
                </div>
                <div className="h-56" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthData} margin={{ top: 22, right: 14, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id="inj-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={ORANGE} stopOpacity={0.55} />
                          <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
                        </linearGradient>
                        <filter id="inj-glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="b" />
                          <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#d4d4d8" }} axisLine={{ stroke: "rgba(255,255,255,0.15)" }} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ stroke: "rgba(255,255,255,0.2)" }}
                        formatter={(v) => [v, b.injuries]}
                        contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12, color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={ORANGE_HI}
                        strokeWidth={2.5}
                        fill="url(#inj-area)"
                        isAnimationActive={false}
                        style={{ filter: "drop-shadow(0 0 6px rgba(243,111,36,0.8))" }}
                        dot={{ r: 4, fill: "#fff", stroke: ORANGE, strokeWidth: 2, filter: "url(#inj-glow)" }}
                        activeDot={{ r: 5, fill: "#fff", stroke: ORANGE, strokeWidth: 2 }}
                      >
                        <LabelList dataKey="value" position="top" offset={10} fontSize={12} fontWeight={600} fill="#fff" />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              {/* Projects */}
              <Panel>
                <h2 className="mb-3 text-base font-semibold leading-tight sm:text-[17px]">{b.byProjects}</h2>
                {stats.byProject.length === 0 ? (
                  <p className="py-10 text-center text-sm text-white/50">{t.injury.empty}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {stats.byProject.slice(0, TOP_PROJECTS).map((p) => (
                      <li key={p.name} className="grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] items-center gap-3">
                        <span className="line-clamp-2 text-end text-sm leading-tight text-white/90" title={p.name}>
                          {p.name}
                        </span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3.5 rounded-[3px]"
                            style={{
                              width: `max(10px, calc(${(p.value / stats.byProject[0].value) * 100}% - 2.5rem))`,
                              background: `linear-gradient(90deg, #e2551a, ${ORANGE_HI})`,
                              boxShadow: "0 0 10px rgba(243,111,36,0.55)",
                            }}
                          />
                          <span className="text-sm tabular-nums text-white/90">{p.value}</span>
                        </span>
                      </li>
                    ))}
                    {stats.byProject.length > TOP_PROJECTS && (
                      <li className="pt-1 text-end text-xs text-white/45">
                        +{stats.byProject.length - TOP_PROJECTS}
                      </li>
                    )}
                  </ul>
                )}
              </Panel>
            </div>

            {/* Injury details */}
            <Panel className="min-w-0">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold sm:text-xl">{b.details}</h2>
                <label className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={b.search}
                    className="w-full rounded-full border border-white/15 bg-black/40 py-1.5 pe-3 ps-9 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#f36f24]"
                  />
                </label>
              </div>
              {tableRows.length === 0 && columnFilters.activeCount === 0 ? (
                <p className="py-10 text-center text-sm text-white/50">{t.injury.empty}</p>
              ) : (
                <div className="max-h-[370px] overflow-auto rounded-lg">
                  <table className="w-full min-w-[680px] table-fixed text-start text-sm">
                    <colgroup>
                      <col className="w-16" />
                      <col className="w-[6.75rem]" />
                      <col className="w-[7.25rem]" />
                      <col className="w-[7.5rem]" />
                      <col className="w-[7.75rem]" />
                      <col />
                    </colgroup>
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#1d1d21] text-[13px] font-semibold text-white">
                        <th className="rounded-s-lg whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={"#"} {...columnFilters.header("no")} /></th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.injury.colDate} {...columnFilters.header("date")} /></th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.injury.colProject} {...columnFilters.header("project")} /></th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.injury.colClassification} {...columnFilters.header("classification")} /></th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-start"><ColumnFilter label={t.injury.colBodyPart} {...columnFilters.header("body")} /></th>
                        <th className="rounded-e-lg px-3 py-2.5 text-start">{t.injury.colDescription}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((i) => (
                        <tr key={i.id} className="border-b border-white/[0.07] last:border-0 hover:bg-white/[0.03]">
                          <td className="whitespace-nowrap px-3 py-2.5 font-bold">{i.incidentNumber ?? "—"}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-white/80">{dateFmt(dateOf(i))}</td>
                          <td className="px-3 py-2.5 font-medium">{i.projectName}</td>
                          <td className="px-3 py-2.5 text-white/80">{i.classification || i.incidentCategory}</td>
                          <td className="px-3 py-2.5 text-white/80">
                            <span dir="auto" className="block">{i.bodyPart || t.injury.unspecifiedBodyPart}</span>
                          </td>
                          <td className="px-3 py-2.5 text-white/80">
                            <span dir="auto" className="line-clamp-2" title={i.incidentDescription ?? undefined}>
                              {i.incidentDescription || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:p-5 ${className}`}
      style={{ background: "linear-gradient(160deg, #18181b 0%, #111113 100%)" }}
    >
      {children}
    </section>
  );
}

function KpiCard({
  icon: Icon,
  label,
  title,
  value,
  series,
  share,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  value: number;
  series: number[];
  share: number;
}) {
  return (
    <div
      title={title}
      className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.08] px-5 pb-4 pt-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
      style={{ background: "linear-gradient(160deg, #1a1a1d 0%, #121214 100%)" }}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-9 w-9 shrink-0 text-white/75" strokeWidth={1.4} />
        <div className="min-w-0">
          <p className="text-[30px] font-bold leading-none tabular-nums">{value}</p>
          <p className="mt-1.5 text-sm font-medium tracking-wide text-white/70">{label}</p>
        </div>
        <Sparkline values={series} className="ms-auto h-8 w-20 shrink-0" />
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value ? 4 : 0, share * 100)}%`,
            background: `linear-gradient(90deg, #e2551a, ${ORANGE_HI})`,
            boxShadow: "0 0 8px rgba(243,111,36,0.8)",
          }}
        />
      </div>
    </div>
  );
}

/** Small glowing trend line of the monthly counts. */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const W = 80;
  const H = 30;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [values.length > 1 ? (i / (values.length - 1)) * W : W / 2, H - 4 - (v / max) * (H - 8)]);
  // Smooth curve through the points (Catmull-Rom → cubic Bézier).
  let d = pts.length ? `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}` : "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={ORANGE_HI} strokeWidth="2.2" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(243,111,36,0.9))" }} />
    </svg>
  );
}

/** Outline icons for the body-part list (lucide where it has a good match). */
function BodyGroupIcon({ id }: { id: BodyGroupId }) {
  const cls = "h-7 w-7 shrink-0 text-white/80";
  const lucide: Partial<Record<BodyGroupId, LucideIcon>> = { chest: HeartPulse, arm: BicepsFlexed, hands: Hand, other: Plus };
  const L = lucide[id];
  if (L) return <L className={cls} strokeWidth={1.4} />;
  const paths: Record<string, string> = {
    // Head in profile.
    head: "M9 21v-3.5c-2.4-1.2-4-3.7-4-6.5a7 7 0 0 1 14 0c0 .8.6 1.6 1.4 2.4l-1.4 1.1V17a2 2 0 0 1-2 2h-1.5V21",
    // Neck between head and shoulders.
    neck: "M8 3c0 3 1 5 1 8 0 2-3 3-6 4M16 3c0 3-1 5-1 8 0 2 3 3 6 4M9 11h6",
    // Leg.
    legs: "M10 2c-.5 4 .5 7 0 10s-2 6-1.5 9.5H13c-.6-1 .3-2.5 1-4 1-2.5 1.5-6 1.5-9S15 4 15 2",
    // Knee with kneecap.
    knee: "M9 2v7c0 1.5-1 3-1 5 0 2.2 1 3.4 1 5v3M15 2v7c0 1.5 1 3 1 5 0 2.2-1 3.4-1 5v3M12 11.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
    // Foot.
    feet: "M9 2v11c0 2-3 3.5-3 6.5 0 1.5 1 2.5 2.5 2.5H17c1 0 1.5-.8 1-1.6-.8-1.3-3.4-2.1-4.5-3.4-.8-1-.5-3.5-.5-5V2",
  };
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[id]} />
    </svg>
  );
}
