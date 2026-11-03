"use client";

import type { BodyGroupId } from "@/lib/bodyParts";

/**
 * Front-view human figure for the Injury dashboard's body map: a grey
 * silhouette (one half-outline, mirrored) with a glowing orange numbered
 * marker per body group, each tied to its spot on the body by a thin line.
 * Coordinates are in the SVG's own viewBox units.
 */

// Viewer-left half of the outline, from the top of the neck down the outer
// edge, round the hand and foot, and back up the inside to the crotch; the
// right half is the same path mirrored around x = 120.
const HALF =
  "M120,66 L110,66 C110,76 109,83 105,87 C95,92 80,94 70,100 C60,105 56,116 55,128 " +
  "C53,145 50,165 47,185 C45,198 43,210 41,222 C38,240 34,258 30,276 C28,284 26,290 25,296 " +
  "C20,300 17,312 18,324 C19,334 24,340 28,338 C31,336 33,326 34,316 C36,306 38,300 40,296 " +
  "C46,278 52,258 56,240 C60,226 63,212 66,198 C68,182 70,168 72,156 C74,175 76,195 78,215 " +
  "C79,232 76,248 78,262 C80,280 82,300 84,320 C86,345 88,360 89,372 C88,395 86,420 87,445 " +
  "C88,460 88,472 89,480 C84,488 78,496 80,502 C86,507 104,507 110,502 C112,494 110,486 109,478 " +
  "C110,455 111,430 112,405 C113,390 113,378 112,368 C113,345 115,320 117,296 C118,288 119,282 120,280 Z";

// The silhouette is drawn 240 wide and stretched 1.25x horizontally (around
// x = 120) for a fuller, athletic build.
const SX = 1.25;
const mapX = (x: number) => 120 + (x - 120) * SX;

// Where each group's marker points to on the body (silhouette coordinates)
// and where its numbered badge sits (final coordinates, outside the
// silhouette like the reference; the chest badge sits on the chest).
// "other" has no spot.
export const BODY_MARKERS: Record<Exclude<BodyGroupId, "other">, { at: [number, number]; badge: [number, number] }> = {
  head: { at: [131, 30], badge: [190, 22] },
  neck: { at: [127, 80], badge: [186, 82] },
  chest: { at: [120, 142], badge: [120, 142] },
  arm: { at: [190, 214], badge: [256, 198] },
  hands: { at: [214, 316], badge: [280, 300] },
  knee: { at: [140, 366], badge: [200, 368] },
  legs: { at: [99, 422], badge: [36, 414] },
  feet: { at: [96, 494], badge: [30, 484] },
};

export default function BodyFigure({ counts }: { counts: Record<BodyGroupId, number> }) {
  return (
    <svg viewBox="-12 0 312 520" className="h-full w-full" role="img" aria-label="Body map">
      <defs>
        <linearGradient id="bf-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4d6db" />
          <stop offset="55%" stopColor="#a7abb3" />
          <stop offset="100%" stopColor="#7c818a" />
        </linearGradient>
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

      <ellipse cx="120" cy="508" rx="90" ry="10" fill="url(#bf-floor)" />

      <g transform={`translate(${120 - 120 * SX} 0) scale(${SX} 1)`}>
      {/* Silhouette */}
      <g filter="url(#bf-soft)">
        <ellipse cx="120" cy="38" rx="21" ry="27" fill="url(#bf-skin)" stroke="#6b7079" strokeWidth="1" />
        <path d={HALF} fill="url(#bf-skin)" stroke="#6b7079" strokeWidth="1" />
        <path d={HALF} transform="translate(240,0) scale(-1,1)" fill="url(#bf-skin)" stroke="#6b7079" strokeWidth="1" />
        {/* Cover the seam down the middle. */}
        <rect x="117" y="67" width="6" height="212" fill="#b3b7be" />
      </g>

      {/* Muscle / contour lines */}
      <g fill="none" stroke="#6b7079" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round">
        <path d="M120,104 L120,262" />
        <path d="M80,108 C92,128 108,134 120,128 C132,134 148,128 160,108" />
        <path d="M92,160 C104,165 112,165 120,162 C128,165 136,165 148,160" />
        <path d="M100,186 L140,186 M102,208 L138,208 M104,230 L136,230" />
        <path d="M88,252 C100,272 112,282 120,282 C128,282 140,272 152,252" />
        <path d="M60,126 C66,140 70,150 72,156 M180,126 C174,140 170,150 168,156" />
        <path d="M94,360 C100,368 106,368 110,360 M130,360 C134,368 140,368 146,360" />
        <path d="M110,62 C114,72 126,72 130,62" />
      </g>
      </g>

      {/* Markers */}
      {(Object.keys(BODY_MARKERS) as Array<keyof typeof BODY_MARKERS>).map((id) => {
        const { at: raw, badge } = BODY_MARKERS[id];
        const at: [number, number] = [mapX(raw[0]), raw[1]];
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
