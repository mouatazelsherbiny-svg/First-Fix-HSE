/**
 * PPE Passport — who received which PPE item, and when.
 *
 * Source: the PPE Passport sheet (one row per employee, one column per item,
 * each cell holding one or more issue dates in whatever format was typed:
 * "05/05/2025", "17/04/2025,02/08/25.28/01/26", "9/20/2025 ,10/02/26",
 * "Voltex 45", …). parsePpeCsv() turns that into clean rows, merging an
 * employee who appears on more than one line.
 */

export const PPE_ITEMS = ["Shoes", "Vest", "Helmet", "Gloves", "Glasses"] as const;
export type PpeItem = (typeof PPE_ITEMS)[number];

export interface PpeItemIssue {
  /** ISO dates (YYYY-MM-DD), oldest first. */
  dates: string[];
  /** Size / brand / free text found in the cell (e.g. "Voltex 45"). */
  note?: string;
}

export interface PpePassportRow {
  id?: string;
  employeeCode: string;
  name: string;
  project: string;
  designation: string;
  sponsor: string;
  items: Partial<Record<PpeItem, PpeItemIssue>>;
}

/** Re-issue sooner than this counts as early (row shown in red). */
export const REISSUE_ALERT_DAYS = 182; // ~6 months

const COLUMN_TO_ITEM: Record<string, PpeItem> = {
  SHOES: "Shoes",
  VEST: "Vest",
  HELMET: "Helmet",
  GLOVES: "Gloves",
  GLASESS: "Glasses",
  GLASSES: "Glasses",
};

// The sheet's project names → the names used everywhere else in the app.
const PROJECT_ALIASES: Record<string, string> = {
  rosewood: "ROSEWOOD",
  "al madina": "Al-Madinah",
  nursert: "NURSERY",
  nursery: "NURSERY",
  misk: "MISK",
  wellness: "WELLNESS",
};

export function normalizeProject(p: string) {
  const v = p.trim();
  return PROJECT_ALIASES[v.toLowerCase()] ?? v;
}

/** Minimal CSV parser (quoted fields, commas and newlines inside quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const DATE_RE = /(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4}|\d{2})(?!\d)/g;

/** Pulls every date out of a messy cell; the rest becomes a short note. */
export function parseCell(raw: string): PpeItemIssue | null {
  const text = raw.replace(/<br\s*\/?>/gi, " ").trim();
  if (!text) return null;
  const dates: string[] = [];
  const rest = text.replace(DATE_RE, (_m, a: string, b: string, y: string) => {
    let day = Number(a);
    let month = Number(b);
    if (month > 12 && day <= 12) [day, month] = [month, day]; // m/d/yyyy typed by mistake
    const year = y.length === 2 ? 2000 + Number(y) : Number(y);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (
      month >= 1 && month <= 12 && day >= 1 && day <= 31 &&
      year >= 2015 && year <= 2035 && d.getUTCDate() === day
    ) {
      dates.push(d.toISOString().slice(0, 10));
    }
    return " ";
  });
  const note = rest.replace(/[(),.;:&/\\-]+/g, " ").replace(/\s+/g, " ").trim();
  return { dates: Array.from(new Set(dates)).sort(), ...(note ? { note } : {}) };
}

function mergeIssue(a: PpeItemIssue | undefined, b: PpeItemIssue): PpeItemIssue {
  if (!a) return b;
  const notes = [a.note, b.note].filter(Boolean);
  return {
    dates: Array.from(new Set([...a.dates, ...b.dates])).sort(),
    ...(notes.length ? { note: Array.from(new Set(notes)).join(", ") } : {}),
  };
}

/** Parses the PPE Passport CSV; employees listed more than once are merged. */
export function parsePpeCsv(text: string): PpePassportRow[] {
  const [header, ...lines] = parseCsv(text);
  if (!header) return [];
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  const iProject = col("Project");
  const iId = col("ID no");
  const iName = col("Name");
  const iDesig = col("Designation");
  const iSponsor = header.findIndex((h) => /^spons[eo]r$/i.test(h.trim()));
  const itemCols = header
    .map((h, i) => ({ i, item: COLUMN_TO_ITEM[h.trim().toUpperCase()] }))
    .filter((c): c is { i: number; item: PpeItem } => !!c.item);

  const byCode = new Map<string, PpePassportRow>();
  for (const r of lines) {
    const name = (r[iName] ?? "").replace(/\s+/g, " ").trim();
    const code = (r[iId] ?? "").trim() || `name:${name.toLowerCase()}`;
    if (!name && !r[iId]?.trim()) continue;
    const project = normalizeProject(r[iProject] ?? "");
    const existing = byCode.get(code);
    const row: PpePassportRow = existing ?? {
      employeeCode: code,
      name,
      project,
      designation: (r[iDesig] ?? "").trim(),
      sponsor: (r[iSponsor] ?? "").trim(),
      items: {},
    };
    if (existing) {
      if (project && !existing.project.split(" / ").includes(project)) {
        existing.project = [existing.project, project].filter(Boolean).join(" / ");
      }
      if (!existing.designation) existing.designation = (r[iDesig] ?? "").trim();
      if (!existing.sponsor) existing.sponsor = (r[iSponsor] ?? "").trim();
    }
    for (const { i, item } of itemCols) {
      const issue = parseCell(r[i] ?? "");
      if (issue) row.items[item] = mergeIssue(row.items[item], issue);
    }
    byCode.set(code, row);
  }
  return Array.from(byCode.values());
}

const DAY_MS = 86_400_000;

export interface PpeRowAnalysis {
  /** Items received more than once, with their dates. */
  repeats: { item: PpeItem; dates: string[] }[];
  /** Items re-issued within REISSUE_ALERT_DAYS of the previous issue. */
  earlyItems: PpeItem[];
  itemsReceived: number;
  totalIssues: number;
}

export function analyzeRow(row: PpePassportRow): PpeRowAnalysis {
  const repeats: PpeRowAnalysis["repeats"] = [];
  const earlyItems: PpeItem[] = [];
  let itemsReceived = 0;
  let totalIssues = 0;
  for (const item of PPE_ITEMS) {
    const issue = row.items[item];
    if (!issue) continue;
    itemsReceived += 1;
    totalIssues += Math.max(1, issue.dates.length);
    if (issue.dates.length > 1) {
      repeats.push({ item, dates: issue.dates });
      for (let k = 1; k < issue.dates.length; k++) {
        const gap = (Date.parse(issue.dates[k]) - Date.parse(issue.dates[k - 1])) / DAY_MS;
        if (gap < REISSUE_ALERT_DAYS) {
          earlyItems.push(item);
          break;
        }
      }
    }
  }
  return { repeats, earlyItems, itemsReceived, totalIssues };
}

export function formatPpeDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
