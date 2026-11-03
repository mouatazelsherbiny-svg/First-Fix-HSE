/**
 * Normalizes the free-text "Body Part" values coming from the FICC/Incidents
 * import (e.g. "right-hand middle finger", "Left forearm", "forehead") into
 * a small fixed set of body regions, each with a representative spot on the
 * body diagram (public/brand/body-diagram-v3.png) used on the Injury page.
 *
 * Coordinates are fractions (0-1) of the diagram image's width/height, so
 * they can be used directly as CSS `left`/`top` percentages regardless of
 * how large the image is rendered. This is intentionally coarse (not
 * anatomically precise) — the goal is a useful at-a-glance heat map, not a
 * medical illustration. Order matters in the keyword rules below: more
 * specific keywords are checked before broader ones (e.g. "forearm" before
 * "arm").
 */
export interface BodyRegion {
  id: string;
  label: { en: string; ar: string };
  x: number;
  y: number;
}

export const BODY_REGIONS: BodyRegion[] = [
  { id: "head", label: { en: "Head", ar: "الرأس" }, x: 0.515, y: 0.035 },
  { id: "face", label: { en: "Face / Eye", ar: "الوجه / العين" }, x: 0.515, y: 0.08 },
  { id: "neck", label: { en: "Neck", ar: "الرقبة" }, x: 0.515, y: 0.13 },
  { id: "shoulder", label: { en: "Shoulder", ar: "الكتف" }, x: 0.75, y: 0.19 },
  { id: "chest", label: { en: "Chest", ar: "الصدر" }, x: 0.515, y: 0.23 },
  { id: "back", label: { en: "Back", ar: "الظهر" }, x: 0.66, y: 0.27 },
  { id: "arm", label: { en: "Arm", ar: "الذراع" }, x: 0.79, y: 0.3 },
  { id: "elbow", label: { en: "Elbow", ar: "الكوع" }, x: 0.84, y: 0.37 },
  { id: "forearm", label: { en: "Forearm", ar: "الساعد" }, x: 0.88, y: 0.42 },
  { id: "wrist", label: { en: "Wrist", ar: "الرسغ" }, x: 0.93, y: 0.465 },
  { id: "hand", label: { en: "Hand", ar: "اليد" }, x: 0.955, y: 0.49 },
  { id: "finger", label: { en: "Finger", ar: "الإصبع" }, x: 0.94, y: 0.525 },
  { id: "torso", label: { en: "Torso / Abdomen", ar: "الجذع / البطن" }, x: 0.515, y: 0.34 },
  { id: "hip", label: { en: "Hip", ar: "الورك" }, x: 0.515, y: 0.45 },
  { id: "leg", label: { en: "Leg / Thigh", ar: "الرجل / الفخذ" }, x: 0.6, y: 0.6 },
  { id: "knee", label: { en: "Knee", ar: "الركبة" }, x: 0.6, y: 0.68 },
  { id: "shin", label: { en: "Shin", ar: "الساق" }, x: 0.59, y: 0.78 },
  { id: "foot", label: { en: "Foot", ar: "القدم" }, x: 0.62, y: 0.955 },
  { id: "other", label: { en: "Other / Multiple", ar: "أخرى / متعددة" }, x: 0, y: 0 },
];

const REGION_BY_ID = new Map(BODY_REGIONS.map((r) => [r.id, r]));

export function getBodyRegion(id: string): BodyRegion | undefined {
  return REGION_BY_ID.get(id);
}

const KEYWORD_RULES: Array<{ id: string; keywords: string[] }> = [
  { id: "finger", keywords: ["finger", "thumb"] },
  { id: "wrist", keywords: ["wrist"] },
  { id: "forearm", keywords: ["forearm"] },
  { id: "elbow", keywords: ["elbow"] },
  { id: "hand", keywords: ["hand", "palm"] },
  { id: "shin", keywords: ["shin"] },
  { id: "knee", keywords: ["knee"] },
  { id: "foot", keywords: ["foot", "feet", "toe"] },
  { id: "hip", keywords: ["hip"] },
  { id: "leg", keywords: ["leg", "thigh"] },
  { id: "shoulder", keywords: ["shoulder"] },
  { id: "back", keywords: ["back"] },
  { id: "chest", keywords: ["chest"] },
  { id: "neck", keywords: ["neck"] },
  { id: "eye", keywords: ["eye"] },
  { id: "face", keywords: ["face", "forehead", "chin", "eye"] },
  { id: "head", keywords: ["head"] },
  { id: "arm", keywords: ["arm"] },
  { id: "torso", keywords: ["torso", "body", "abdomen"] },
  { id: "other", keywords: ["multiple", "n/a", "na"] },
];

export function normalizeBodyPart(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s === "n/a" || s === "na") return null;
  for (const rule of KEYWORD_RULES) {
    if (rule.id === "other") continue;
    if (rule.keywords.some((k) => s.includes(k))) {
      // "eye" is folded into "face" for the diagram (see BODY_REGIONS).
      return rule.id === "eye" ? "face" : rule.id;
    }
  }
  return "other";
}

/**
 * Coarse body groups used by the Injury dashboard's body map. A body-part
 * text maps to a group when every keyword it contains belongs to that one
 * group (so "left hand index and middle finger" -> hands); text naming parts
 * from several groups ("right foot, right arm", "shoulders and back"), or
 * nothing recognisable ("body injury"), is "other". Empty / "n/a" -> null
 * (no body-part data, left off the map).
 */
export type BodyGroupId = "head" | "neck" | "chest" | "arm" | "hands" | "legs" | "knee" | "feet" | "other";

export const BODY_GROUP_IDS: BodyGroupId[] = ["head", "neck", "chest", "arm", "hands", "legs", "knee", "feet", "other"];

// Whole-word patterns (so "palmar" is not "arm", "forearm" is not "arm" twice).
const GROUP_PATTERNS: Array<{ id: Exclude<BodyGroupId, "other">; re: RegExp }> = [
  { id: "hands", re: /\b(hands?|palms?|palmar|fingers?|thumbs?|wrists?|knuckles?|index)\b/ },
  { id: "arm", re: /\b(arms?|forearms?|elbows?|shoulders?|biceps?|triceps?)\b/ },
  { id: "head", re: /\b(head|face|forehead|chin|eyes?|ears?|nose|mouth|lips?|teeth|tooth|cheeks?|scalp|jaw)\b/ },
  { id: "neck", re: /\bneck\b/ },
  { id: "chest", re: /\b(chest|back|torso|abdomen|stomach|ribs?|waist|trunk)\b/ },
  { id: "knee", re: /\bknees?\b/ },
  { id: "legs", re: /\b(legs?|thighs?|shins?|calf|calves|hips?|lower limbs?)\b/ },
  { id: "feet", re: /\b(foot|feet|toes?|ankles?|heels?)\b/ },
];

export function bodyGroupOf(raw: string | null | undefined): BodyGroupId | null {
  const s = (raw ?? "").trim().toLowerCase().replace(/-/g, " ");
  if (!s || s === "n/a" || s === "na" || s === "nil" || s === "none") return null;
  const hits = new Set(GROUP_PATTERNS.filter((g) => g.re.test(s)).map((g) => g.id));
  return hits.size === 1 ? Array.from(hits)[0] : "other";
}
