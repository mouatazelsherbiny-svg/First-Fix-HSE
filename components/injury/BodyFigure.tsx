"use client";

import type { BodyGroupId } from "@/lib/bodyParts";

/**
 * Front-view human figure for the Injury dashboard's body map: the body
 * image (public/injury-body.png, transparent background) with a glowing
 * orange numbered marker per body group, each tied to its spot on the body
 * by a thin line. Coordinates are in the SVG's own viewBox units.
 */

// The image (840x1428) is drawn at 288x490, top-left at (-4, 15).
const IMG = { x: -4, y: 15, w: 288, h: 490 };

// Where each group's marker points to on the body and where its numbered
// badge sits. The chest badge sits on the chest. "other" has no spot.
export const BODY_MARKERS: Record<Exclude<BodyGroupId, "other">, { at: [number, number]; badge: [number, number] }> = {
  head: { at: [143, 49], badge: [212, 40] },
  neck: { at: [140, 94], badge: [214, 98] },
  chest: { at: [123, 128], badge: [123, 128] },
  arm: { at: [232, 193], badge: [298, 176] },
  hands: { at: [270, 255], badge: [318, 268] },
  knee: { at: [174, 361], badge: [236, 366] },
  legs: { at: [99, 410], badge: [32, 400] },
  feet: { at: [92, 485], badge: [26, 480] },
};

export default function BodyFigure({ counts }: { counts: Record<BodyGroupId, number> }) {
  return (
    <svg viewBox="-30 0 380 520" className="h-full w-full" role="img" aria-label="Body map">
      <defs>
        <radialGradient id="bf-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f36f24" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f36f24" stopOpacity="0" />
        </radialGradient>
        <filter id="bf-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="bf-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f36f24" floodOpacity="0.18" />
        </filter>
      </defs>

      <ellipse cx="140" cy="508" rx="95" ry="10" fill="url(#bf-floor)" />

      <image
        href="/injury-body.png"
        x={IMG.x}
        y={IMG.y}
        width={IMG.w}
        height={IMG.h}
        preserveAspectRatio="xMidYMid meet"
        filter="url(#bf-soft)"
        opacity={0.92}
      />

      {(Object.keys(BODY_MARKERS) as Array<keyof typeof BODY_MARKERS>).map((id) => {
        const { at, badge } = BODY_MARKERS[id];
        const n = counts[id] ?? 0;
        const active = n > 0;
        const r = n >= 100 ? 17 : 15;
        return (
          <g key={id} opacity={active ? 1 : 0.35}>
            {(at[0] !== badge[0] || at[1] !== badge[1]) && (
              <line x1={at[0]} y1={at[1]} x2={badge[0]} y2={badge[1]} stroke="#f36f24" strokeWidth="1.2" />
            )}
            <circle cx={at[0]} cy={at[1]} r="2.6" fill="#ff8a3d" filter={active ? "url(#bf-glow)" : undefined} />
            <circle
              cx={badge[0]}
              cy={badge[1]}
              r={r}
              fill="#f36f24"
              stroke="#ffb27a"
              strokeWidth="1.2"
              filter={active ? "url(#bf-glow)" : undefined}
            />
            <text
              x={badge[0]}
              y={badge[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={n >= 100 ? 12.5 : 14}
              fontWeight={800}
              fill="#fff"
            >
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
