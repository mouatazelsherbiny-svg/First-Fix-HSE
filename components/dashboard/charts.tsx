"use client";

/**
 * Small bespoke SVG charts for the dashboard's HSE Pulse section, drawn to
 * match design/reference.png.jpeg: thick rounded-cap rings, a segmented
 * donut with visible gaps, and a soft gradient-filled sparkline.
 *
 * Hand-rolled rather than built on recharts (which the app already uses
 * elsewhere) because these are fixed, decorative readouts — no axes,
 * tooltips, or responsive re-layout — and the reference's exact stroke
 * weights, cap shapes and segment gaps are far easier to hit directly in
 * SVG than by overriding recharts internals.
 */

import { useId } from "react";

const ACCENT = "rgb(var(--brand-orange-rgb))";
const TRACK = "var(--ref-track)";

/** Single-value progress ring. The reference's "72% COMPLETE" dial. */
export function ProgressRing({
  value,
  size = 128,
  stroke = 13,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={TRACK} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ACCENT}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${Math.max(0, circumference - filled)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {children}
      </div>
    </div>
  );
}

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

/**
 * Multi-segment donut with a small gap between slices, as in the
 * reference's "LEARNING SCORE 82" dial. Slice sweep is proportional to
 * each category's share of the combined total.
 */
export function SegmentedDonut({
  slices,
  size = 152,
  stroke = 20,
  gapDeg = 3,
  children,
}: {
  slices: DonutSlice[];
  size?: number;
  stroke?: number;
  gapDeg?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);

  let offsetDeg = -90;
  const arcs = slices.map((slice) => {
    const share = total > 0 ? Math.max(0, slice.value) / total : 0;
    const sweepDeg = Math.max(0, share * 360 - gapDeg);
    const arc = { ...slice, sweepDeg, rotate: offsetDeg };
    offsetDeg += share * 360;
    return arc;
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={TRACK} strokeWidth={stroke} />
        {arcs.map((arc) => {
          const length = (arc.sweepDeg / 360) * circumference;
          if (length <= 0) return null;
          return (
            <circle
              key={arc.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${length} ${Math.max(0, circumference - length)}`}
              transform={`rotate(${arc.rotate} ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {children}
      </div>
    </div>
  );
}

/**
 * Gradient-filled line chart with end dots — the reference's "+18% vs last
 * week" mini chart. Renders a flat mid-line when every value is equal, so
 * a zero/constant series still draws something sensible.
 */
export function Sparkline({
  points,
  width = 260,
  height = 84,
}: {
  points: { label: string; value: number }[];
  width?: number;
  height?: number;
}) {
  const gradientId = useId();
  if (points.length === 0) return null;

  const padX = 6;
  const padY = 12;
  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(1, points.length - 1)) * (width - padX * 2);
    const ratio = max === min ? 0.5 : (p.value - min) / span;
    const y = height - padY - ratio * (height - padY * 2);
    return { x, y, ...p };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height} L${coords[0].x.toFixed(1)},${height} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={ACCENT} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c) => (
        <circle key={c.x} cx={c.x} cy={c.y} r={2.6} fill="#fff" stroke={ACCENT} strokeWidth={1.75} />
      ))}
      <circle cx={last.x} cy={last.y} r={4.2} fill={ACCENT} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

/** Label + value + thin rounded bar — the reference's "Skill Mastery" rows. */
export function MasteryRow({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium ref-text">{label}</span>
        <span className="text-[13px] font-semibold ref-muted tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="ref-bar">
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
