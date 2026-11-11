"use client";

import type { LucideIcon } from "lucide-react";

export interface SummaryCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Accent colour (hex). */
  color: string;
  hint?: string;
}

/** Row of headline total cards (same look as the PTW / Injury pages). */
export default function SummaryCards({ cards, dark = true }: { cards: SummaryCard[]; dark?: boolean }) {
  if (dark) return <DarkSummaryCards cards={cards} />;
  return (
    <div
      className={`mb-6 grid gap-4 sm:grid-cols-2 ${
        cards.length >= 5 ? "lg:grid-cols-5" : cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {cards.map((c) => (
        <div key={c.label} className="card flex items-center gap-4 !p-5" title={c.hint}>
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${c.color}1f`, color: c.color }}
          >
            <c.icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-gray">{c.label}</p>
            <p className="text-3xl font-extrabold leading-tight text-brand-black tabular-nums">
              {typeof c.value === "number" ? c.value.toLocaleString("en-US") : c.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** PMV-style KPI cards for the dark dashboards: white line icon, divider, big number, label, glowing bar. */
function DarkSummaryCards({ cards }: { cards: SummaryCard[] }) {
  const max = Math.max(1, ...cards.map((c) => (typeof c.value === "number" ? c.value : 0)));
  return (
    <div
      className={`mb-5 grid grid-cols-2 gap-3 sm:gap-4 ${
        cards.length >= 5 ? "lg:grid-cols-5" : cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {cards.map((c) => {
        const n = typeof c.value === "number" ? c.value : 0;
        return (
          <div
            key={c.label}
            title={c.hint}
            className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-white/[0.08] px-5 pb-4 pt-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] text-white"
            style={{ background: "linear-gradient(160deg, #1a1a1d 0%, #121214 100%)" }}
          >
            <div className="flex items-center gap-4">
              <c.icon className="h-9 w-9 shrink-0 text-white/75" strokeWidth={1.4} />
              <div className="min-w-0">
                <p className="text-[30px] font-bold leading-none tabular-nums">
                  {typeof c.value === "number" ? c.value.toLocaleString("en-US") : c.value}
                </p>
                <p className="mt-1.5 text-sm font-medium tracking-wide text-white/70">{c.label}</p>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(n ? 4 : 0, (n / max) * 100)}%`,
                  background: "linear-gradient(90deg, #ffb03a, #f36f24 55%, #e2551a)",
                  boxShadow: "0 0 8px rgba(243,111,36,0.8)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
