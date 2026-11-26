"use client";

/** Pieces of the HSE Audit / HSE Performance summary pages: score ring, mini score cards, chips, bullets. */

import type { LucideIcon } from "lucide-react";

export const HS_COLOR = "#f36f24";
export const ENV_COLOR = "#4ade80";

/** Overall audit score = average of the H&S and Environmental scores that exist. */
export function overallOf(hs: number | null | undefined, env: number | null | undefined) {
  const v = [hs, env].filter((n): n is number => n != null);
  return v.length ? v.reduce((s, n) => s + n, 0) / v.length : null;
}
export const pct = (v: number | null) => (v == null ? "—" : `${v.toFixed(1)}%`);

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#f36f24] shadow-[0_0_8px_rgba(243,111,36,0.8)]" />
      <span>{children}</span>
    </li>
  );
}

export function ScoreChip({ value, tint }: { value: number | null; tint: string }) {
  return (
    <span className="inline-flex min-w-[76px] justify-center rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums text-white" style={{ background: tint }}>
      {pct(value)}
    </span>
  );
}

/** Ring for the overall score: green → orange arc on a dark track. */
export function ScoreRing({ value, color, label = "Overall" }: { value: number | null; color?: string; label?: string }) {
  const r = 62;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, value ?? 0)) / 100;
  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="auditRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f36f24" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color ?? "url(#auditRing)"}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`}
          style={{ filter: `drop-shadow(0 0 8px ${color ? `${color}99` : "rgba(243,111,36,0.55)"})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tabular-nums">{pct(value)}</span>
        <span className="text-sm font-semibold text-white/70">{label}</span>
      </div>
    </div>
  );
}

export function MiniScore({ icon: Icon, value, label, color }: { icon: LucideIcon; value: number | null; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: `${color}55`, background: `${color}10` }}>
      <Icon className="h-8 w-8 shrink-0" style={{ color }} strokeWidth={1.6} />
      <div>
        <p className="text-2xl font-extrabold leading-none tabular-nums">{pct(value)}</p>
        <p className="mt-1 text-xs font-medium text-white/70">{label}</p>
      </div>
    </div>
  );
}

/** Download the report file attached to an audit (fetched only when clicked). */
