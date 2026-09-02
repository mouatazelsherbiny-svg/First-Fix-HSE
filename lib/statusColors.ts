/**
 * Single source of truth for status/severity badge colors across the app.
 * Any place displaying one of these words as a value (table cell, dropdown
 * summary, detail field) should render it through <Badge value="..."/>
 * (components/Badge.tsx) instead of choosing its own color.
 *
 * Each word maps to a semantic tone, not directly to CSS classes, so the
 * same word renders consistently on both light cards (the norm) and dark
 * cards (e.g. the Training History panel) via one lookup.
 */
type Tone = "red" | "redStrong" | "green" | "amber" | "blue" | "gray";

const WORD_TONE: Record<string, Tone> = {
  // Red — open risk / negative / unresolved
  Open: "red",
  High: "red",
  "Unsafe Act": "red",
  "Unsafe Condition": "red",
  "Unsafe Act&Unsafe Condition": "red",
  Lost: "red",
  Expired: "red",

  // Escalated red — more severe than the plain-red entries above
  Critical: "redStrong",
  Overdue: "redStrong",
  Rejected: "redStrong",

  // Green — resolved / good / low risk
  Closed: "green",
  Low: "green",
  Valid: "green",
  Good: "green",
  Active: "green",

  // Amber — caution / in-between
  Medium: "amber",
  "In Progress": "amber",
  "Near Miss": "amber",
  Damaged: "amber",
  "Pending Approval": "amber",

  // Blue — informational / positive callout
  "Good Practice": "blue",
  Approved: "blue",
  "New Permit": "blue",

  // Neutral gray — no strong signal
  Pending: "gray",
  Other: "gray",
  "N/A": "gray",
};

const LIGHT_TONE_CLASSES: Record<Tone, string> = {
  red: "bg-red-50 text-red-700",
  redStrong: "bg-red-600 text-white",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-brand-grayLight text-brand-grayDark",
};

// For badges placed on a dark card (e.g. Training History) — same tones,
// translucent so they read cleanly against black instead of glowing white.
const DARK_TONE_CLASSES: Record<Tone, string> = {
  red: "bg-red-500/20 text-red-400",
  redStrong: "bg-red-500/40 text-red-300",
  green: "bg-green-500/20 text-green-400",
  amber: "bg-amber-500/20 text-amber-400",
  blue: "bg-blue-500/20 text-blue-400",
  gray: "bg-white/10 text-white/70",
};

export function getStatusColorClasses(value: string, dark = false): string {
  const tone = WORD_TONE[value] ?? "gray";
  return (dark ? DARK_TONE_CLASSES : LIGHT_TONE_CLASSES)[tone];
}

/** Full pill classes (shape + color) — pairs with <Badge/>. */
export function getBadgeClasses(value: string, dark = false): string {
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColorClasses(
    value,
    dark
  )}`;
}
