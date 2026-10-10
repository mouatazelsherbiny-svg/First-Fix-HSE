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
export default function SummaryCards({ cards }: { cards: SummaryCard[] }) {
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
