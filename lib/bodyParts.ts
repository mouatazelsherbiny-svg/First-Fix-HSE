/**
 * Normalizes the free-text "Body Part" values coming from the FICC/Incidents
 * import (e.g. "right-hand middle finger", "Left forearm", "forehead") into
 * a small fixed set of body regions, each with a representative spot on the
 * simple front-view body diagram used on the Injury page.
 *
 * This is intentionally coarse (not anatomically precise) — the goal is a
 * useful at-a-glance heat map, not a medical illustration. Order matters:
 * more specific keywords are checked before broader ones (e.g. "forearm"
 * before "arm", "finger"/"hand" before nothing else conflicts).
 */
export interface BodyRegion {
  id: string;
  label: { en: string; ar: string };
  x: number;
  y: number;
}

export const BODY_REGIONS: BodyRegion[] = [
  { id: "head", label: { en: "Head", ar: "الرأس" }, x: 100, y: 28 },
  { id: "face", label: { en: "Face / Eye", ar: "الوجه / العين" }, x: 100, y: 46 },
  { id: "neck", label: { en: "Neck", ar: "الرقبة" }, x: 100, y: 62 },
  { id: "shoulder", label: { en: "Shoulder", ar: "الكتف" }, x: 100, y: 82 },
  { id: "chest", label: { en: "Chest", ar: "الصدر" }, x: 100, y: 108 },
  { id: "back", label: { en: "Back", ar: "الظهر" }, x: 168, y: 108 },
  { id: "arm", label: { en: "Arm", ar: "الذراع" }, x: 52, y: 128 },
  { id: "elbow", label: { en: "Elbow", ar: "الكوع" }, x: 46, y: 162 },
  { id: "forearm", label: { en: "Forearm", ar: "الساعد" }, x: 42, y: 188 },
  { id: "wrist", label: { en: "Wrist", ar: "الرسغ" }, x: 40, y: 210 },
  { id: "hand", label: { en: "Hand", ar: "اليد" }, x: 38, y: 228 },
  { id: "finger", label: { en: "Finger", ar: "الإصبع" }, x: 36, y: 244 },
  { id: "torso", label: { en: "Torso / Abdomen", ar: "الجذع / البطن" }, x: 100, y: 138 },
  { id: "hip", label: { en: "Hip", ar: "الورك" }, x: 100, y: 205 },
  { id: "leg", label: { en: "Leg / Thigh", ar: "الرجل / الفخذ" }, x: 100, y: 255 },
  { id: "knee", label: { en: "Knee", ar: "الركبة" }, x: 100, y: 295 },
  { id: "shin", label: { en: "Shin", ar: "الساق" }, x: 100, y: 330 },
  { id: "foot", label: { en: "Foot", ar: "القدم" }, x: 100, y: 385 },
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
