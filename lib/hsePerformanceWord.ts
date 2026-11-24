/**
 * HSE Performance → Word: the same layout as the PDF (components/
 * hsePerformance/PerformanceReport.tsx) — title bar, details, "HSE Project
 * Assessment", Health and Safety | Environmental scores side by side with the
 * two score boxes on the right, comments and the signature.
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
import { performanceFileName, performanceScores, type HsePerformance } from "@/lib/hsePerformance";

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

/** The score box (title, %, points, target, rating) as paragraphs in one merged cell. */
function boxParas(title: string, r: ScoreResult, target: number, rating: Rating) {
  const rs = rating ? RATING_STYLE[rating] : null;
  const shade = (fill: string) => ({ type: ShadingType.CLEAR, color: "auto", fill });
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(ORANGE), spacing: { before: 0, after: 0 }, children: [t(" ", { size: 12 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(ORANGE), children: [t(title, { bold: true, color: "FFFFFF", size: 26 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(ORANGE), children: [t(" ", { size: 12 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade(BLACK), spacing: { before: 0 }, children: [t(r.pct == null ? "N/A" : `${Math.round(r.pct)}%`, { bold: true, color: "FFFFFF", size: 56 })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, shading: shade(BLACK), children: [t(r.max ? `${r.total} / ${r.max} Points  ` : " ", { bold: true, color: "FFFFFF", size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, shading: shade("FFE3D1"), children: [t(`Target Score: ${target}%`, { bold: true, color: "9A3412", size: 20 })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: shade(rs ? hex(rs.bg) : "F3F4F6"),
      children: [t(rating || "—", { bold: true, color: rs ? hex(rs.fg) : "111827", size: 20 })],
    }),
  ];
}

export async function buildPerformanceDocx(p: HsePerformance): Promise<Blob> {
  const s = performanceScores(p);
  const logoBlob = await fetch("/brand/logo-print.png").then((r) => (r.ok ? r.blob() : null)).catch(() => null);
  const logoUrl = logoBlob ? await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.readAsDataURL(logoBlob); }) : "";
  const logo = await loadImg(logoUrl);
  const sig = await loadImg(p.signature.image);

  const hsItems = itemsFor(HS_ITEMS, p.hsScores);
  const envItems = itemsFor(ENV_ITEMS, p.envScores);
  const n = Math.max(hsItems.length, envItems.length);
  const half = Math.ceil(n / 2);
  const cw = [W * 0.28, W * 0.06, W * 0.3, W * 0.06, W * 0.3];

  const rows: TableRow[] = [
    new TableRow({
      children: [
        c("HEALTH AND SAFETY", cw[0], { fill: BLACK, color: "FFFFFF", bold: true }),
        c("M", cw[1], { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
        c("ENVIRONMENTAL", cw[2], { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
        c("M", cw[3], { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
        c("", cw[4], { fill: "FFFFFF" }),
      ],
    }),
  ];
  for (let i = 0; i < n; i++) {
    const h = hsItems[i];
    const e = envItems[i];
    const box =
      i === 0
        ? c("", cw[4], { merge: "restart", children: boxParas("Health & Safety Score", s.hs, p.targetPct, s.hsRating) })
        : i === half
        ? c("", cw[4], { merge: "restart", children: boxParas("Environmental Score", s.env, p.targetPct, s.envRating) })
        : c("", cw[4], { merge: "continue" });
    rows.push(
      new TableRow({
        children: [
          c(h ?? "", cw[0], { fill: "FAFAFA", size: 17 }),
          h ? scoreCell((p.hsScores as Scores)[h], cw[1]) : c("", cw[1]),
          c(e ?? "", cw[2], { fill: "FAFAFA", size: 17 }),
          e ? scoreCell((p.envScores as Scores)[e], cw[3]) : c("", cw[3]),
          box,
        ],
      })
    );
  }

  const info = [W * 0.18, W * 0.32, W * 0.18, W * 0.32];
  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children: [
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [W * 0.25, W * 0.75],
            rows: [
              new TableRow({
                children: [
                  c("", W * 0.25, {
                    fill: "FFFFFF",
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: logo ? [new ImageRun({ type: "png", data: logo.data, transformation: { width: 130, height: Math.round((130 * logo.h) / logo.w) } })] : [t("First Fix", { bold: true })] })],
                  }),
                  c("HSE PERFORMANCE ASSESSMENT", W * 0.75, { fill: BLACK, color: "FFFFFF", bold: true, size: 32, align: AlignmentType.CENTER }),
                ],
              }),
            ],
          }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: info,
            rows: [
              new TableRow({ children: [c("Project", info[0], { fill: "FFF1E8", bold: true }), c(p.projectName, info[1]), c("Date", info[2], { fill: "FFF1E8", bold: true }), c(formatDate(p.assessmentDate), info[3])] }),
              new TableRow({ children: [c("Assessed by", info[0], { fill: "FFF1E8", bold: true }), c(p.assessedBy, info[1]), c("HSE Manager", info[2], { fill: "FFF1E8", bold: true }), c(p.hseManager, info[3])] }),
              new TableRow({
                children: [
                  c("Overall Score", info[0], { fill: "FFF1E8", bold: true }),
                  c(s.overall == null ? "N/A" : `${s.overall.toFixed(1)}%`, info[1], { bold: true }),
                  c("Target", info[2], { fill: "FFF1E8", bold: true }),
                  c(`${p.targetPct}%`, info[3]),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 120 }, children: [] }),
          new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [W],
            rows: [
              new TableRow({ children: [c("HSE Project Assessment", W, { fill: ORANGE, color: "FFFFFF", bold: true, size: 26, align: AlignmentType.CENTER })] }),
              new TableRow({
                children: [
                  c("", W, {
                    fill: "F3F4F6",
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [t("All scores are rated on a scale of 0 to 10, where 0 is the lowest and 10 is the highest.", { bold: true, size: 17 })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [t("Mark items as N/A where they are not applicable to the project at this time.", { bold: true, size: 17 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, rows }),
          ...(p.comments.trim()
            ? [
                new Paragraph({ spacing: { before: 200, after: 60 }, children: [t("COMMENTS", { bold: true, size: 22 })] }),
                new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ children: [c(p.comments, W)] })] }),
              ]
            : []),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Table({
            width: { size: W * 0.4, type: WidthType.DXA },
            columnWidths: [W * 0.4],
            alignment: AlignmentType.RIGHT,
            rows: [
              new TableRow({ children: [c("Signature", W * 0.4, { fill: BLACK, color: "FFFFFF", bold: true, align: AlignmentType.CENTER })] }),
              new TableRow({
                children: [
                  c("", W * 0.4, {
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: sig ? [new ImageRun({ type: "png", data: sig.data, transformation: { width: Math.round(Math.min(180, (60 * sig.w) / sig.h)), height: Math.round(Math.min(60, (180 * sig.h) / sig.w)) } })] : [t(" ")] })],
                  }),
                ],
              }),
              new TableRow({ children: [c(p.signature.name || p.assessedBy, W * 0.4, { align: AlignmentType.CENTER })] }),
              new TableRow({ children: [c("Assessed by", W * 0.4, { fill: ORANGE, color: "FFFFFF", bold: true, align: AlignmentType.CENTER })] }),
            ],
          }),
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
