"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Ambulance,
  Bandage,
  BicepsFlexed,
  Bone,
  Brain,
  BriefcaseMedical,
  ClipboardPlus,
  Footprints,
  Hand,
  HeartPulse,
  ShieldX,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useIncidents } from "@/context/IncidentsContext";
import { BODY_REGIONS, normalizeBodyPart } from "@/lib/bodyParts";
import type { Incident } from "@/types/incident";

export default function InjuryPage() {
  return (
    <ProtectedRoute>
      <InjuryOverview />
    </ProtectedRoute>
  );
}

const ACCENT = "rgb(var(--brand-orange-rgb))";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CARDS: { key: string; label: string; title: string; icon: LucideIcon; color: string; match: string[] }[] = [
  { key: "lti", label: "LTI", title: "Lost Time Injury", icon: ShieldX, color: "#dc2626", match: ["Lost Time Incident", "Lost Time Injury", "LTI"] },
  { key: "rwc", label: "RWC", title: "Restricted Work Case", icon: BriefcaseMedical, color: "#ea580c", match: ["Restricted Work Case", "RWC"] },
  { key: "mtc", label: "MTC", title: "Medical Treatment Case", icon: Ambulance, color: "#d97706", match: ["Medical Treatment Case", "MTC"] },
  { key: "fac", label: "FAC", title: "First Aid Case", icon: Bandage, color: "#16a34a", match: ["First Aid Case", "FAC"] },
];

/** The detailed body regions (lib/bodyParts.ts) rolled up into the list beside the diagram. */
const BODY_GROUPS: { label: string; icon: LucideIcon; regions: string[] }[] = [
  { label: "Head", icon: Brain, regions: ["head", "face"] },
  { label: "Neck", icon: UserRound, regions: ["neck"] },
  { label: "Chest / Back", icon: HeartPulse, regions: ["chest", "back", "torso"] },
  { label: "Arm", icon: BicepsFlexed, regions: ["shoulder", "arm", "elbow", "forearm"] },
  { label: "Hand", icon: Hand, regions: ["wrist", "hand", "finger"] },
  { label: "Legs", icon: Bone, regions: ["hip", "leg", "shin"] },
  { label: "Knees", icon: Bone, regions: ["knee"] },
  { label: "Feet", icon: Footprints, regions: ["foot"] },
];

const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();
const matches = (i: Incident, list: string[]) =>
  list.some((m) => [norm(i.incidentCategory), norm(i.classification)].includes(m.toLowerCase()));

function InjuryOverview() {
  const { t, locale } = useLanguage();
  const { incidents, isLoading } = useIncidents();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<number | null>(null);

  const injuries = useMemo(() => incidents.filter((i) => i.recordType === "Injury"), [incidents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return injuries;
    return injuries.filter(
      (i) =>
        i.projectName.toLowerCase().includes(q) ||
        String(i.incidentNumber ?? "").includes(q) ||
        (i.bodyPart ?? "").toLowerCase().includes(q)
    );
  }, [injuries, query]);

  // Years that have injuries, newest first; the month chart defaults to the latest.
  const years = useMemo(() => {
    const set = new Set<number>();
    filtered.forEach((i) => {
      const d = i.incidentDate ? new Date(i.incidentDate) : null;
      if (d && !Number.isNaN(d.getTime())) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [filtered]);

  useEffect(() => {
    if (year === null || !years.includes(year)) setYear(years[0] ?? new Date().getFullYear());
  }, [years, year]);

  const stats = useMemo(() => {
    const cards = CARDS.map((c) => ({ ...c, value: filtered.filter((i) => matches(i, c.match)).length }));

    const byMonth = MONTHS.map((m) => ({ name: m, value: 0 }));
    filtered.forEach((i) => {
      const d = i.incidentDate ? new Date(i.incidentDate) : null;
      if (d && !Number.isNaN(d.getTime()) && d.getFullYear() === year) byMonth[d.getMonth()].value += 1;
    });

    const projectMap = new Map<string, number>();
    filtered.forEach((i) => {
      const p = i.projectName?.trim() || "Not specified";
      projectMap.set(p, (projectMap.get(p) ?? 0) + 1);
    });
    const byProject = Array.from(projectMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const regionCounts = new Map<string, number>();
    filtered.forEach((i) => {
      const r = normalizeBodyPart(i.bodyPart);
      if (r) regionCounts.set(r, (regionCounts.get(r) ?? 0) + 1);
    });
    const groups = BODY_GROUPS.map((g) => ({
      ...g,
      value: g.regions.reduce((s, r) => s + (regionCounts.get(r) ?? 0), 0),
    }));

    return { cards, byMonth, byProject, regionCounts, groups, other: regionCounts.get("other") ?? 0 };
  }, [filtered, year]);

  const maxRegion = Math.max(1, ...Array.from(stats.regionCounts.values()));
  const dateFmt = (v: string | null) =>
    v
      ? new Date(v).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">{t.injury.title}</h1>
          <p className="mt-1 text-sm text-brand-gray">{t.injury.subtitle}</p>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.list.search}
          className="input-field max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-brand-border bg-brand-surface py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-5 lg:grid-cols-12">
            {/* ---- Left: KPIs + charts ---- */}
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.cards.map((c) => (
                  <div
                    key={c.key}
                    title={c.title}
                    className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-surface px-3 py-3 shadow-card"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${c.color}1a`, color: c.color }}
                    >
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-2xl font-extrabold leading-none text-brand-black tabular-nums">{c.value}</p>
                      <p className="mt-1 text-xs font-semibold text-brand-grayDark">{c.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-border bg-brand-surface p-4 text-center shadow-card">
                  <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <ClipboardPlus className="h-6 w-6" />
                  </span>
                  <p className="text-4xl font-extrabold leading-none text-brand-black tabular-nums">
                    {filtered.length.toLocaleString("en-US")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-grayDark">Total Injuries</p>
                </div>

                <section className="min-w-0 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-card sm:col-span-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-brand-black">Total Injury By Month</h2>
                    {years.length > 0 && (
                      <select
                        value={year ?? ""}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-xs font-semibold text-brand-grayDark"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.byMonth} margin={{ top: 16, right: 4, bottom: 0, left: -24 }}>
                        <CartesianGrid stroke="#eceff3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: "rgba(148,163,184,0.12)" }}
                          formatter={(v) => [v, "Injuries"]}
                          contentStyle={{ borderRadius: 12, fontSize: 12 }}
                        />
                        <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}>
                          <LabelList dataKey="value" position="top" fontSize={10} fill="#334155" formatter={(v) => (Number(v) ? v : "")} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              <section className="min-w-0 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-card">
                <h2 className="mb-2 text-sm font-bold text-brand-black">Injuries by Projects</h2>
                {stats.byProject.length === 0 ? (
                  <p className="py-6 text-center text-sm text-brand-gray">{t.injury.empty}</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto pe-1">
                    <div style={{ height: Math.max(160, stats.byProject.length * 24) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byProject} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={4}>
                          <XAxis type="number" hide allowDecimals={false} />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} interval={0} />
                          <Tooltip
                            cursor={{ fill: "rgba(148,163,184,0.12)" }}
                            formatter={(v) => [v, "Injuries"]}
                            contentStyle={{ borderRadius: 12, fontSize: 12 }}
                          />
                          <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false}>
                            <LabelList dataKey="value" position="right" fontSize={11} fill="#334155" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ---- Right: body diagram + body-part list ---- */}
            <section
              className="relative flex min-w-0 overflow-hidden rounded-2xl p-4 shadow-card lg:col-span-5"
              style={{ background: "linear-gradient(135deg, #0b1f3a 0%, #13294b 55%, #3a1020 100%)" }}
            >
              <div className="relative mx-auto h-[400px] w-[207px] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/body-diagram-v2.png" alt="" className="h-full w-full object-contain" />
                {BODY_REGIONS.filter((r) => r.id !== "other").map((r) => {
                  const count = stats.regionCounts.get(r.id) ?? 0;
                  if (!count) return null;
                  const size = 14 + (count / maxRegion) * 18;
                  return (
                    <span
                      key={r.id}
                      title={`${r.label.en}: ${count}`}
                      className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white font-bold text-white shadow"
                      style={{
                        left: `${r.x * 100}%`,
                        top: `${r.y * 100}%`,
                        width: size,
                        height: size,
                        fontSize: 9,
                        background: "rgba(56,189,248,0.85)",
                      }}
                    >
                      {count}
                    </span>
                  );
                })}
              </div>
              <ul className="flex flex-1 flex-col justify-between py-1 ps-3">
                {stats.groups.map((g) => (
                  <li key={g.label} className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-white">
                      <g.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-white">{g.label}</span>
                        <span className="text-lg font-extrabold tabular-nums text-white">{g.value}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sky-300/70">
                        <span className="h-px flex-1 bg-sky-300/40" />
                        <Activity className="h-3 w-3" />
                        <span className="h-px w-6 bg-sky-300/40" />
                      </div>
                    </div>
                  </li>
                ))}
                {stats.other > 0 && (
                  <li className="text-end text-xs text-white/60">Other / Multiple: {stats.other}</li>
                )}
              </ul>
            </section>
          </div>

          {/* ---- Injury details: own scroll area so it is in view straight away ---- */}
          <section className="rounded-2xl border border-brand-border bg-brand-surface shadow-card">
            <h2 className="px-4 pt-4 text-base font-bold text-brand-black">Injury Details</h2>
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-brand-gray">{t.injury.empty}</p>
            ) : (
              <div className="mt-3 max-h-[420px] overflow-auto">
                <table className="w-full min-w-[760px] text-start text-sm">
                  <thead className="sticky top-0 z-10 bg-brand-grayLight">
                    <tr className="text-xs font-semibold tracking-wide text-brand-grayDark">
                      <th className="px-3 py-2.5 text-start">#</th>
                      <th className="px-3 py-2.5 text-start">{t.injury.colDate}</th>
                      <th className="px-3 py-2.5 text-start">{t.injury.colProject}</th>
                      <th className="px-3 py-2.5 text-start">{t.injury.colClassification}</th>
                      <th className="px-3 py-2.5 text-start">{t.injury.colBodyPart}</th>
                      <th className="px-3 py-2.5 text-start">{t.injury.colDescription}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr key={i.id} className="border-b border-brand-border last:border-0 hover:bg-brand-grayLight/40">
                        <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-brand-black">{i.incidentNumber ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-brand-grayDark">{dateFmt(i.incidentDate)}</td>
                        <td className="px-3 py-2.5 font-semibold text-brand-black">{i.projectName}</td>
                        <td className="px-3 py-2.5 text-brand-grayDark">{i.classification || i.incidentCategory}</td>
                        <td className="px-3 py-2.5 text-brand-grayDark">{i.bodyPart || t.injury.unspecifiedBodyPart}</td>
                        <td className="max-w-md px-3 py-2.5 text-brand-grayDark">
                          <span className="line-clamp-2">{i.incidentDescription || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
