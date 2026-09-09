/**
 * Normalizes the free-text "Body Part" values coming from the FICC/Incidents
 * import (e.g. "right-hand middle finger", "Left forearm", "forehead") into
 * a small fixed set of body regions, each with a representative spot on the
 * body diagram (public/brand/body-diagram-v2.png) used on the Injury page.
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
  { id: "head", label: { en: "Head", ar: "الرأس" }, x: 0.5, y: 0.02 },
  { id: "face", label: { en: "Face / Eye", ar: "الوجه / العين" }, x: 0.5, y: 0.065 },
  { id: "neck", label: { en: "Neck", ar: "الرقبة" }, x: 0.5, y: 0.105 },
  { id: "shoulder", label: { en: "Shoulder", ar: "الكتف" }, x: 0.655, y: 0.175 },
  { id: "chest", label: { en: "Chest", ar: "الصدر" }, x: 0.5, y: 0.21 },
  { id: "back", label: { en: "Back", ar: "الظهر" }, x: 0.8, y: 0.19 },
  { id: "arm", label: { en: "Arm", ar: "الذراع" }, x: 0.7, y: 0.29 },
  { id: "elbow", label: { en: "Elbow", ar: "الكوع" }, x: 0.73, y: 0.365 },
  { id: "forearm", label: { en: "Forearm", ar: "الساعد" }, x: 0.785, y: 0.415 },
  { id: "wrist", label: { en: "Wrist", ar: "الرسغ" }, x: 0.83, y: 0.465 },
  { id: "hand", label: { en: "Hand", ar: "اليد" }, x: 0.865, y: 0.5 },
  { id: "finger", label: { en: "Finger", ar: "الإصبع" }, x: 0.885, y: 0.525 },
  { id: "torso", label: { en: "Torso / Abdomen", ar: "الجذع / البطن" }, x: 0.5, y: 0.325 },
  { id: "hip", label: { en: "Hip", ar: "الورك" }, x: 0.5, y: 0.415 },
  { id: "leg", label: { en: "Leg / Thigh", ar: "الرجل / الفخذ" }, x: 0.565, y: 0.58 },
  { id: "knee", label: { en: "Knee", ar: "الركبة" }, x: 0.565, y: 0.655 },
  { id: "shin", label: { en: "Shin", ar: "الساق" }, x: 0.56, y: 0.775 },
  { id: "foot", label: { en: "Foot", ar: "القدم" }, x: 0.565, y: 0.93 },
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
