/**
 * HSE Performance (admin only): an "HSE Project Assessment" per project —
 * the Health & Safety and Environmental categories of the HSE Audit form,
 * each scored 0–10 (or N/A), with a score, the 70% target and a rating
 * (Compliant / Non-Compliant / Needs Improvement). Table `hse_performance`.
 */

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
  assessedBy: string;
  hseManager: string;
  targetPct: number;
  hsScores: Scores;
  envScores: Scores;
  hsRating: Rating;
  envRating: Rating;
  comments: string;
  /** Assessor's signature (data URL). */
  signature: { name: string; image: string };
  createdAt?: string;
}

export function emptyPerformance(): HsePerformance {
  return {
    projectName: "",
    assessmentDate: new Date().toISOString().slice(0, 10),
    assessedBy: "",
    hseManager: "",
    targetPct: 70,
    hsScores: {},
    envScores: {},
    hsRating: "",
    envRating: "",
    comments: "",
    signature: { name: "", image: "" },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPerformance(r: any): HsePerformance {
  return {
    id: r.id,
    projectName: r.project_name ?? "",
    assessmentDate: r.assessment_date ?? "",
    assessedBy: r.assessed_by ?? "",
    hseManager: r.hse_manager ?? "",
    targetPct: Number(r.target_pct ?? 70) || 70,
    hsScores: r.hs_scores ?? {},
    envScores: r.env_scores ?? {},
    hsRating: (r.hs_rating ?? "") as Rating,
    envRating: (r.env_rating ?? "") as Rating,
    comments: r.comments ?? "",
    signature: { name: r.signature?.name ?? "", image: r.signature?.image ?? "" },
    createdAt: r.created_at,
  };
}

export function toPerformanceRow(p: HsePerformance) {
  return {
    project_name: p.projectName.trim(),
    assessment_date: p.assessmentDate || null,
    assessed_by: p.assessedBy.trim(),
    hse_manager: p.hseManager.trim(),
    target_pct: p.targetPct,
    hs_scores: p.hsScores,
    env_scores: p.envScores,
    hs_rating: p.hsRating || null,
    env_rating: p.envRating || null,
    comments: p.comments,
    signature: p.signature,
    updated_at: new Date().toISOString(),
  };
}

/** Columns for lists (no signature picture). */
export const PERFORMANCE_LIST_COLUMNS = "id,project_name,assessment_date,assessed_by,hse_manager,target_pct,hs_scores,env_scores,hs_rating,env_rating,comments,created_at";

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
  return `HSE_Performance_${safe(p.projectName) || "Project"}_${p.assessmentDate || "date"}.${ext}`;
}
