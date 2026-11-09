"use client";

/**
 * Chart and table pieces in the Injury page's style, shared by the other dark
 * dashboards (Observations, Incidents, PMV, FICC) so they all look the same.
 */

import { Area, AreaChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const ORANGE = "#f36f24";
const ORANGE_HI = "#ff8a3d";

/** Chart / section title, as on Injury. */
export const CHART_TITLE = "text-base font-semibold leading-tight sm:text-[17px]";
/** Table-panel title, as on Injury ("Injury details"). */
export const TABLE_TITLE = "text-lg font-semibold sm:text-xl";
/** Rounded search box used above tables. */
export const SEARCH_INPUT =
  "w-full rounded-full border border-white/15 bg-black/40 py-1.5 pe-3 ps-9 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#f36f24]";
/** Small rounded select (year pickers etc.). */
export const PILL_SELECT =
  "appearance-none rounded-full border border-white/25 bg-black/40 py-1 pe-8 ps-3.5 text-sm font-medium text-white outline-none focus:border-[#f36f24]";
/** Table header row and cells. */
export const TH_ROW = "bg-[#1d1d21] text-[13px] font-semibold text-white";
export const TH = "whitespace-nowrap px-3 py-2.5 text-start";
export const TR = "border-b border-white/[0.07] last:border-0 hover:bg-white/[0.03]";
export const TD = "px-3 py-2.5";

/** Dark panel, same as Injury's. */
export function DarkPanel({ className = "", children, id }: { className?: string; children: React.ReactNode; id?: string }) {
  return (
    <section
      id={id}
      className={`min-w-0 rounded-2xl border border-white/[0.08] p-4 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:p-5 ${className}`}
      style={{ background: "linear-gradient(160deg, #18181b 0%, #111113 100%)" }}
    >
      {children}
    </section>
  );
}

/** Glowing orange area chart with a white dot and value over every point (Injury "by month"). */
export function MonthAreaChart({ data, valueLabel, id }: { data: { name: string; value: number }[]; valueLabel: string; id: string }) {
  return (
    <div className="h-56" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 22, right: 14, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ORANGE} stopOpacity={0.55} />
              <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
            </linearGradient>
            <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
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
            formatter={(v) => [Number(v).toLocaleString("en-US"), valueLabel]}
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12, color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={ORANGE_HI}
            strokeWidth={2.5}
            fill={`url(#${id}-area)`}
            isAnimationActive={false}
            style={{ filter: "drop-shadow(0 0 6px rgba(243,111,36,0.8))" }}
            dot={{ r: 4, fill: "#fff", stroke: ORANGE, strokeWidth: 2, filter: `url(#${id}-glow)` }}
            activeDot={{ r: 5, fill: "#fff", stroke: ORANGE, strokeWidth: 2 }}
          >
            <LabelList
              dataKey="value"
              position="top"
              offset={10}
              fontSize={12}
              fontWeight={600}
              fill="#fff"
              formatter={(v: unknown) => Number(v).toLocaleString("en-US")}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Thin glowing bars, one row per name (Injury "by project"). Names are shown in
 * full; after `visibleRows` rows the list scrolls.
 */
export function BarList({
  rows,
  visibleRows = 8,
  empty = "No data yet",
}: {
  rows: { name: string; value: number }[];
  visibleRows?: number;
  empty?: string;
}) {
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-white/50">{empty}</p>;
  const max = rows[0].value || 1;
  const ROW = 30;
  return (
    <div className="overflow-y-auto pe-1" style={{ maxHeight: ROW * visibleRows }}>
      <ul className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-3">
        {rows.map((r) => (
          <li key={r.name} className="contents">
            <span className="whitespace-nowrap text-end text-sm leading-tight text-white/90" style={{ lineHeight: `${ROW}px` }}>
              {r.name}
            </span>
            <span className="flex min-w-0 items-center gap-2" style={{ height: ROW }}>
              <span
                className="h-3.5 rounded-[3px]"
                style={{
                  width: `max(10px, calc(${(r.value / max) * 100}% - 3rem))`,
                  background: `linear-gradient(90deg, #e2551a, ${ORANGE_HI})`,
                  boxShadow: "0 0 10px rgba(243,111,36,0.55)",
                }}
              />
              <span className="text-sm tabular-nums text-white/90">{r.value.toLocaleString("en-US")}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
