/**
 * The Monthly Checklist report, laid out like the company's Excel forms
 * (September 2026 … Checklist - FF.xlsx): Cover Page, Inspection (with the
 * Summary Report and the Final Score chart), Corrective Actions and Photos.
 * `buildChecklistReport` turns a submission into rows the PDF print view
 * (components/checklist/ChecklistPrint.tsx) and the Word export
 * (lib/checklistWord.ts) both draw, so the two always match.
 */

import type { ChecklistTemplate, PointValue } from "@/types/checklist";
import type { ChecklistSubmission } from "@/types/checklistSubmission";

export const OBS_ROWS = 7;
export const ACTION_ROWS = 10;
export const DESIGNATION_ROWS = 5;

/** Colours of the Excel form. */
export const XL = {
  blue: "0070C0",
  possible: "9BC2E6",
  scored: "92D050",
  red: "FF0000",
  amber: "FFC000",
  orange: "F79646",
  black: "000000",
  grey: "D9D9D9",
  lifeCritical: "C00000",
};

export interface ReportItem {
  no: number;
  text: string;
  possible: string;
  scored: string;
  /** Scored below possible → highlighted in the form. */
  short: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  criticality: "" | "Life Critical Item" | "Non-Life Critical Item";
  items: ReportItem[];
  possible: number;
  scored: number;
  /** "96%" / "N/A" */
  pct: string;
}

export interface ReportPhoto {
  image: string;
  /** e.g. "A14" */
  label: string;
  text: string;
}

export interface ChecklistReport {
  title: string;
  project: string;
  inspectedBy: string;
  inspectionDate: string;
  projectDirector: string;
  totalManpower: string;
  activity: string;
  sections: ReportSection[];
  grandPossible: number;
  grandScored: number;
  /** "85.27%" */
  grandPct: string;
  observations: { description: string; dateRequired: string }[];
  actions: { action: string; dateCompleted: string }[];
  designations: { name: string; signature: string; designation: string }[];
  photos: ReportPhoto[];
  signoff: ChecklistSubmission["signoff"];
}

/** "2026-09-30" → "30-Sep-26" (the form's date style). */
export function xlDate(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || "");
  if (!m) return d || "";
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m[2]) - 1];
  return `${Number(m[3])}-${mon}-${m[1].slice(2)}`;
}

const num = (v: PointValue | string | undefined) => (v === undefined || v === "N/A" || v === "" ? 0 : Number(v) || 0);

export function buildChecklistReport(template: ChecklistTemplate, s: ChecklistSubmission): ChecklistReport {
  const sections: ReportSection[] = template.sections.map((sec) => {
    const items = sec.questions.map((q, i) => {
      const possible = (s.possibleMap[q.id] ?? "2") as string;
      const scored = (s.scoredMap[q.id] ?? "0") as string;
      return { no: i + 1, text: q.text, possible, scored, short: possible !== "N/A" && scored !== "N/A" && num(scored) < num(possible) };
    });
    const possible = items.reduce((a, it) => a + num(it.possible), 0);
    const scored = items.reduce((a, it) => a + num(it.scored), 0);
    return {
      id: sec.id,
      title: sec.title,
      criticality: sec.criticality === "life-critical" ? "Life Critical Item" : sec.criticality === "non-life-critical" ? "Non-Life Critical Item" : "",
      items,
      possible,
      scored,
      pct: possible > 0 ? `${Math.round((scored / possible) * 100)}%` : "N/A",
    };
  });
  const grandPossible = sections.reduce((a, x) => a + x.possible, 0);
  const grandScored = sections.reduce((a, x) => a + x.scored, 0);

  const labels = new Map<string, { label: string; text: string }>();
  template.sections.forEach((sec) => sec.questions.forEach((q, i) => labels.set(q.id, { label: `${sec.id}${i + 1}`, text: q.text })));

  const padTo = <T,>(rows: T[], n: number, blank: T) => [...rows, ...Array.from({ length: Math.max(0, n - rows.length) }, () => blank)];

  return {
    title: template.title,
    project: s.projectName,
    inspectedBy: s.inspectedBy.replace(/\s*\([^)]*\)\s*$/, ""),
    inspectionDate: s.inspectionDate,
    projectDirector: s.projectDirector,
    totalManpower: s.totalManpower ? String(s.totalManpower) : "",
    activity: s.activity,
    sections,
    grandPossible,
    grandScored,
    grandPct: grandPossible > 0 ? `${((grandScored / grandPossible) * 100).toFixed(2)}%` : "N/A",
    observations: padTo(s.observations, OBS_ROWS, { description: "", dateRequired: "" }),
    actions: padTo(s.correctiveActions, ACTION_ROWS, { action: "", dateCompleted: "" }),
    designations: padTo(s.designations, DESIGNATION_ROWS, { name: "", signature: "", designation: "" }),
    photos: s.photoItems
      .filter((p) => p.image)
      .map((p) => {
        const l = labels.get(p.item);
        return { image: p.image, label: l?.label ?? "", text: l?.text ?? "" };
      }),
    signoff: s.signoff,
  };
}

/** The "Final Score" chart (dark panel, green bars, % labels, slanted section names) as SVG. */
export function finalScoreSvg(r: ChecklistReport, width = 900, height = 420): string {
  const pad = { l: 56, r: 16, t: 54, b: 150 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const n = Math.max(1, r.sections.length);
  const step = w / n;
  const bw = Math.min(26, step * 0.55);
  const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Calibri, Carlito, Arial, sans-serif">`;
  out += `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#262626"/></linearGradient>`;
  out += `<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fae49"/><stop offset="1" stop-color="#0f5c19"/></linearGradient></defs>`;
  out += `<rect width="${width}" height="${height}" fill="url(#bg)"/>`;
  out += `<text x="${width / 2}" y="32" fill="#e6e6e6" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">Final Score</text>`;
  for (let i = 0; i <= 5; i++) {
    const y = pad.t + h - (h * i) / 5;
    out += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + w}" y2="${y}" stroke="#ffffff" stroke-opacity="0.12"/>`;
    out += `<text x="${pad.l - 8}" y="${y + 4}" fill="#d9d9d9" font-size="11" text-anchor="end">${i * 20}%</text>`;
  }
  r.sections.forEach((s, i) => {
    const cx = pad.l + step * i + step / 2;
    const v = s.possible > 0 ? s.scored / s.possible : null;
    if (v !== null) {
      const bh = h * v;
      out += `<rect x="${cx - bw / 2}" y="${pad.t + h - bh}" width="${bw}" height="${bh}" fill="url(#bar)"/>`;
      out += `<text x="${cx}" y="${pad.t + h - bh - 6}" fill="#e6e6e6" font-size="11" text-anchor="middle">${Math.round(v * 100)}%</text>`;
    }
    const name = `${s.title}${s.criticality ? ` (${s.criticality})` : ""}`;
    out += `<text transform="translate(${cx + 4},${pad.t + h + 12}) rotate(-35)" fill="#e6e6e6" font-size="10" text-anchor="end">${esc(name.length > 48 ? `${name.slice(0, 47)}…` : name)}</text>`;
  });
  return `${out}</svg>`;
}
