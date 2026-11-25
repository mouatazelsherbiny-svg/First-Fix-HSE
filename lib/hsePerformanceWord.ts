/**
 * Weekly Performance Report → Word: the same layout as the PDF (components/
 * hsePerformance/PerformanceReport.tsx) — logo + title, details, Health and
 * Safety | Environmental scores side by side, the three score boxes (Overall
 * as a ring picture) and the three signatures.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  VerticalMergeType,
  WidthType,
} from "docx";
import { ENV_ITEMS, HS_ITEMS, RATING_STYLE, TONE_STYLE, formatDate, itemsFor, scoreTone, type Rating, type ScoreResult, type Scores } from "@/lib/hseAudit";
import { PERF_SIGN_ROLES, REPORT_TITLE, performanceFileName, performanceScores, type HsePerformance } from "@/lib/hsePerformance";

const FONT = "Calibri";
const ORANGE = "F36F24";
const BLACK = "111111";
const W = 10466; // A4, 0.5" margins
const hex = (c: string) => c.replace("#", "").toUpperCase();

const LINE = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE };

function t(text: string, o: { bold?: boolean; color?: string; size?: number } = {}) {
  return new TextRun({ text, font: FONT, bold: o.bold, color: o.color, size: o.size ?? 18 });
}

function c(
  text: string,
  w: number,
  o: { fill?: string; bold?: boolean; color?: string; size?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; span?: number; merge?: "restart" | "continue"; children?: Paragraph[] } = {}
) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    columnSpan: o.span,
    verticalMerge: o.merge === "restart" ? VerticalMergeType.RESTART : o.merge === "continue" ? VerticalMergeType.CONTINUE : undefined,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    borders: BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: o.children ?? [new Paragraph({ alignment: o.align, children: [t(text, o)] })],
  });
}

async function loadImg(src: string) {
  if (!src) return null;
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const c2 = document.createElement("canvas");
  c2.width = img.naturalWidth;
  c2.height = img.naturalHeight;
  c2.getContext("2d")!.drawImage(img, 0, 0);
  const url = c2.toDataURL("image/png");
  const bin = atob(url.slice(url.indexOf(",") + 1));
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  return { data, w: img.naturalWidth || 1, h: img.naturalHeight || 1 };
}

function scoreCell(v: unknown, w: number) {
  const tone = typeof v === "number" ? TONE_STYLE[scoreTone(v)] : null;
  return c(typeof v === "number" ? String(v) : "N/A", w, { fill: tone ? hex(tone.bg) : "F3F4F6", color: tone ? hex(tone.fg) : "111827", bold: true, align: AlignmentType.CENTER });
}

/** The score box (title, %, points, target, rating) as paragraphs in one cell. */
function boxParas(title: string, r: ScoreResult, target: number, rating: Rating) {
  const rs = rating ? RATING_STYLE[rating] : null;
  const shade = (fill: string) => ({ type: ShadingType.CLEAR, color: "auto", fill });
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(ORANGE), spacing: { before: 40, after: 40 }, children: [t(title, { bold: true, color: "FFFFFF", size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(BLACK), spacing: { before: 120 }, children: [t(r.pct == null ? "N/A" : `${Math.round(r.pct)}%`, { bold: true, color: "FFFFFF", size: 64 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(BLACK), spacing: { after: 120 }, children: [t(r.max ? `${r.total} / ${r.max} points` : " ", { bold: true, color: "D4D4D8", size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade("FFE3D1"), spacing: { before: 40, after: 40 }, children: [t(`Target Score: ${target}%`, { bold: true, color: "9A3412", size: 20 })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: shade(rs ? hex(rs.bg) : "F3F4F6"),
      spacing: { before: 40, after: 40 },
      children: [t(rating || "—", { bold: true, color: rs ? hex(rs.fg) : "111827", size: 20 })],
    }),
  ];
}

/** The Overall Performance Score ring, drawn on a canvas so Word shows it as a picture. */
function ringPng(value: number | null) {
  const size = 240;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#111111";
  g.fillRect(0, 0, size, size);
  const cx = size / 2, r = 92;
  g.lineWidth = 22;
  g.lineCap = "round";
  g.strokeStyle = "#3f3f46";
  g.beginPath(); g.arc(cx, cx, r, 0, Math.PI * 2); g.stroke();
  const p = Math.max(0, Math.min(100, value ?? 0)) / 100;
  if (p > 0) {
    const gr = g.createLinearGradient(0, 0, size, size);
    gr.addColorStop(0, "#FBBF24"); gr.addColorStop(1, "#F36F24");
    g.strokeStyle = gr;
    g.beginPath(); g.arc(cx, cx, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); g.stroke();
  }
  g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "bold 44px Calibri, Arial, sans-serif";
  g.fillText(value == null ? "N/A" : `${value.toFixed(1)}%`, cx, cx - 6);
  g.fillStyle = "#d4d4d8"; g.font = "bold 22px Calibri, Arial, sans-serif";
  g.fillText("Overall", cx, cx + 34);
  const url = cv.toDataURL("image/png");
  const bin = atob(url.slice(url.indexOf(",") + 1));
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  return data;
}

export async function buildPerformanceDocx(p: HsePerformance): Promise<Blob> {
  const s = performanceScores(p);
  const logoBlob = await fetch("/brand/logo-print.png").then((r) => (r.ok ? r.blob() : null)).catch(() => null);
  const logoUrl = logoBlob ? await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.readAsDataURL(logoBlob); }) : "";
  const logo = await loadImg(logoUrl);
  const sigs = await Promise.all(PERF_SIGN_ROLES.map(({ key }) => loadImg(p.signatures[key].image)));

  const hsItems = itemsFor(HS_ITEMS, p.hsScores);
  const envItems = itemsFor(ENV_ITEMS, p.envScores);
  const n = Math.max(hsItems.length, envItems.length);
  const cw = [W * 0.39, W * 0.11, W * 0.39, W * 0.11];
  const head = (x: string, w: number) => c(x, w, { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER, size: 20 });

  const rows: TableRow[] = [
    new TableRow({ children: [c("HEALTH AND SAFETY", cw[0] + cw[1], { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER, span: 2, size: 20 }), c("ENVIRONMENTAL", cw[2] + cw[3], { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER, span: 2, size: 20 })] }),
  ];
  for (let i = 0; i < n; i++) {
    const h = hsItems[i];
    const e = envItems[i];
    rows.push(
      new TableRow({
        children: [
          c(h ?? "", cw[0], { size: 17 }),
          h ? scoreCell((p.hsScores as Scores)[h], cw[1]) : c("", cw[1]),
          c(e ?? "", cw[2], { size: 17 }),
          e ? scoreCell((p.envScores as Scores)[e], cw[3]) : c("", cw[3]),
        ],
      })
    );
  }

  const third = W / 3;
  const info = [W * 0.19, W * 0.31, W * 0.19, W * 0.31];
  const k = (x: string, w: number) => c(x, w, { fill: "FFF1E8", bold: true });
  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 600, bottom: 600, left: 720, right: 720 } } },
        children: [
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [W * 0.27, W * 0.73],
            rows: [
              new TableRow({
                children: [
                  c("", W * 0.27, {
                    fill: "FFFFFF",
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: logo ? [new ImageRun({ type: "png", data: logo.data, transformation: { width: 130, height: Math.round((130 * logo.h) / logo.w) } })] : [t("First Fix", { bold: true })] })],
                  }),
                  c(REPORT_TITLE, W * 0.73, { fill: BLACK, color: "FFFFFF", bold: true, size: 36, align: AlignmentType.CENTER }),
                ],
              }),
            ],
          }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: info,
            rows: [
              new TableRow({ children: [k("Project", info[0]), c(p.projectName, info[1]), k("Contractor", info[2]), c(p.contractor, info[3])] }),
              new TableRow({ children: [k("HSE Manager", info[0]), c(p.hseManager, info[1]), k("Project Director", info[2]), c(p.projectDirector, info[3])] }),
              new TableRow({ children: [k("Auditor / Position", info[0]), c(p.assessedBy, info[1]), k("Date", info[2]), c(formatDate(p.assessmentDate), info[3])] }),
            ],
          }),
          new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [third, third, third],
            rows: [
              new TableRow({
                children: [
                  c("", third, { children: boxParas("Health & Safety Score", s.hs, p.targetPct, s.hsRating) }),
                  c("", third, { children: boxParas("Environmental Score", s.env, p.targetPct, s.envRating) }),
                  c("", third, {
                    fill: BLACK,
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 60 }, children: [t("Overall Performance Score", { bold: true, color: "FFFFFF", size: 22 })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: ringPng(s.overall), transformation: { width: 120, height: 120 } })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [third, third, third],
            rows: [
              new TableRow({
                children: sigs.map((sig) =>
                  c("", third, {
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 }, children: sig ? [new ImageRun({ type: "png", data: sig.data, transformation: { width: Math.round(Math.min(150, (55 * sig.w) / sig.h)), height: Math.round(Math.min(55, (150 * sig.h) / sig.w)) } })] : [t("Signature", { color: "C0C0C0", size: 16 })] })],
                  })
                ),
              }),
              new TableRow({ children: PERF_SIGN_ROLES.map(({ key }) => c(p.signatures[key].name || (key === "auditor" ? p.assessedBy : ""), third, { align: AlignmentType.CENTER })) }),
              new TableRow({ children: PERF_SIGN_ROLES.map(({ label }) => head(label, third)) }),
            ],
          }),
          ...(p.comments.trim()
            ? [
                new Paragraph({ spacing: { before: 200, after: 60 }, children: [t("COMMENTS", { bold: true, size: 22 })] }),
                new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ children: [c(p.comments, W)] })] }),
              ]
            : []),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}

export async function exportPerformanceWord(p: HsePerformance) {
  const blob = await buildPerformanceDocx(p);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = performanceFileName(p, "docx");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
