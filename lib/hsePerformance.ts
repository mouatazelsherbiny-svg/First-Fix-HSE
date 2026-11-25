/**
 * HSE Performance (admin only): the First Fix "Weekly Performance Report" per
 * project — Project / Contractor / HSE Manager / Project Director / Auditor /
 * Date, the Health & Safety and Environmental items scored 0–10 (or N/A),
 * the two scores against the 70% target with their rating, the Overall
 * Performance Score, and three signatures (HSE Auditor, Regional HSE Manager,
 * HSE Director). Table `hse_performance`.
 */

export const REPORT_TITLE = "Weekly Performance Report";

export const PERF_SIGN_ROLES = [
  { key: "auditor", label: "HSE Auditor" },
  { key: "regional", label: "Regional HSE Manager" },
  { key: "director", label: "HSE Director" },
] as const;
export type PerfSignKey = (typeof PERF_SIGN_ROLES)[number]["key"];
export type PerfSignature = { name: string; image: string };

import {
  ENV_ITEMS,
  HS_ITEMS,
  ratingOf,
  scoreOf,
  type Rating,
  type ScoreResult,
  type Scores,
} from "@/lib/hseAudit";

export interface HsePerformance {
  id?: string;
  projectName: string;
  assessmentDate: string;
  contractor: string;
  /** "Auditor / Position" on the form. */
  assessedBy: string;
  hseManager: string;
  projectDirector: string;
  targetPct: number;
  hsScores: Scores;
  envScores: Scores;
  hsRating: Rating;
  envRating: Rating;
  comments: string;
  signatures: Record<PerfSignKey, PerfSignature>;
  createdAt?: string;
}

export function emptyPerformance(): HsePerformance {
  return {
    projectName: "",
    assessmentDate: new Date().toISOString().slice(0, 10),
    contractor: "",
    assessedBy: "",
    hseManager: "",
    projectDirector: "",
    targetPct: 70,
    hsScores: {},
    envScores: {},
    hsRating: "",
    envRating: "",
    comments: "",
    signatures: emptySignatures(),
  };
}

export function emptySignatures(): Record<PerfSignKey, PerfSignature> {
  return { auditor: { name: "", image: "" }, regional: { name: "", image: "" }, director: { name: "", image: "" } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPerformance(r: any): HsePerformance {
  return {
    id: r.id,
    projectName: r.project_name ?? "",
    assessmentDate: r.assessment_date ?? "",
    contractor: r.contractor ?? "",
    assessedBy: r.assessed_by ?? "",
    hseManager: r.hse_manager ?? "",
    projectDirector: r.project_director ?? "",
    targetPct: Number(r.target_pct ?? 70) || 70,
    hsScores: r.hs_scores ?? {},
    envScores: r.env_scores ?? {},
    hsRating: (r.hs_rating ?? "") as Rating,
    envRating: (r.env_rating ?? "") as Rating,
    comments: r.comments ?? "",
    signatures: Object.fromEntries(
      PERF_SIGN_ROLES.map(({ key }) => {
        const v = r.signatures?.[key] ?? (key === "auditor" ? r.signature : null);
        return [key, { name: v?.name ?? "", image: v?.image ?? "" }];
      })
    ) as Record<PerfSignKey, PerfSignature>,
    createdAt: r.created_at,
  };
}

export function toPerformanceRow(p: HsePerformance) {
  return {
    project_name: p.projectName.trim(),
    assessment_date: p.assessmentDate || null,
    contractor: p.contractor.trim(),
    assessed_by: p.assessedBy.trim(),
    hse_manager: p.hseManager.trim(),
    project_director: p.projectDirector.trim(),
    target_pct: p.targetPct,
    hs_scores: p.hsScores,
    env_scores: p.envScores,
    hs_rating: p.hsRating || null,
    env_rating: p.envRating || null,
    comments: p.comments,
    signatures: p.signatures,
    updated_at: new Date().toISOString(),
  };
}

/** Columns for lists (no signature picture). */
export const PERFORMANCE_LIST_COLUMNS = "id,project_name,assessment_date,contractor,assessed_by,hse_manager,project_director,target_pct,hs_scores,env_scores,hs_rating,env_rating,comments,created_at";

export interface PerformanceScores {
  hs: ScoreResult;
  env: ScoreResult;
  overall: number | null;
  hsRating: Rating;
  envRating: Rating;
}

/** Overall = average of the H&S and Environmental percentages that exist. */
export function overallOf(hs: number | null | undefined, env: number | null | undefined): number | null {
  const v = [hs, env].filter((n): n is number => n != null);
  return v.length ? v.reduce((s, n) => s + n, 0) / v.length : null;
}

export function performanceScores(p: HsePerformance): PerformanceScores {
  const hs = scoreOf(p.hsScores, HS_ITEMS);
  const env = scoreOf(p.envScores, ENV_ITEMS);
  return {
    hs,
    env,
    overall: overallOf(hs.pct, env.pct),
    hsRating: ratingOf(p.hsRating, hs.pct, p.targetPct),
    envRating: ratingOf(p.envRating, env.pct, p.targetPct),
  };
}

export function performanceFileName(p: HsePerformance, ext: string) {
  const safe = (s: string) => s.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");
  return `Weekly_Performance_Report_${safe(p.projectName) || "Project"}_${p.assessmentDate || "date"}.${ext}`;
}

/** ISO week of a yyyy-mm-dd date, e.g. "Wk 48 · 2026". */
export function weekLabel(date: string): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00Z`);
  if (isNaN(d.getTime())) return "";
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const year = d.getUTCFullYear();
  const first = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((d.getTime() - first.getTime()) / 864e5 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `Wk ${week} · ${year}`;
}
