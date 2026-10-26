"use client";

import { ScoreResult, TONE_STYLE } from "@/lib/hseAudit";

/** Totals box from the form: score / max, percentage, target and Action Status. */
export default function ScorePanel({ title, result, target }: { title: string; result: ScoreResult; target: number }) {
  const tone = result.level ? TONE_STYLE[result.level.tone] : null;
  const met = result.pct != null && result.pct >= target;
  return (
    <div className="overflow-hidden rounded-xl border border-brand-border">
      <p className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white" style={{ background: "#0F5F5C" }}>
        {title}
      </p>
      <div className="px-4 py-3 text-center">
        <p className="text-3xl font-extrabold text-brand-black tabular-nums">
          {result.max ? `${result.total} / ${result.max}` : "—"}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: result.pct == null ? undefined : met ? "#16A34A" : "#DC2626" }}>
          {result.pct == null ? "N/A" : `${result.pct.toFixed(1)}%`}
        </p>
        <p className="mt-1 text-xs text-brand-gray">Target {target}%</p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-brand-border px-3 py-2">
        <span className="text-xs font-semibold text-brand-grayDark">Action Status</span>
        <span
          className="rounded-md px-2.5 py-1 text-xs font-bold"
          style={tone ? { background: tone.bg, color: tone.fg } : { color: "#9CA3AF" }}
          title={result.level?.action}
        >
          {result.level?.label ?? "—"}
        </span>
      </div>
    </div>
  );
}

/** Small coloured pill: "48.0% · Areas at Risk". */
export function ScorePill({ result }: { result: ScoreResult }) {
  if (result.pct == null || !result.level) return <span className="text-brand-gray">—</span>;
  const tone = TONE_STYLE[result.level.tone];
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className="font-bold tabular-nums text-brand-black">
        {result.pct.toFixed(1)}% <span className="text-xs font-normal text-brand-gray">({result.total}/{result.max})</span>
      </span>
      <span className="w-fit rounded px-1.5 py-0.5 text-[11px] font-bold" style={{ background: tone.bg, color: tone.fg }}>
        {result.level.label}
      </span>
    </span>
  );
}
