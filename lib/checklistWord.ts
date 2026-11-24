/**
 * Monthly Checklist → Word, drawn like the company's Excel form: Cover Page
 * (logo, title band, project, Prepared / Approved sign-off), Inspection
 * (blue title, info rows, black section bars, Possible / Scored columns,
 * shortfalls highlighted, "POSSIBLE POINTS AWARDED"), Summary Report and the
 * Final Score chart, Corrective Actions (Observations, Contractor Corrective
 * Actions, Designation) and Photos (three per row with item number and text).
 * The rows come from lib/checklistReport.ts, the same as the PDF view.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  PageNumber,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextDirection,
  TextRun,
  VerticalAlign,
  WidthType,
  HeightRule,
} from "docx";
import type { ChecklistTemplate } from "@/types/checklist";
import type { ChecklistSubmission } from "@/types/checklistSubmission";
import { buildChecklistReport, finalScoreSvg, xlDate, XL, type ChecklistReport } from "@/lib/checklistReport";

const FONT = "Calibri";
/** A4 portrait, 0.5" margins → 10466 twips of text width. */
const PAGE_W = 10466;

interface Img {
  data: Uint8Array;
  type: "png" | "jpg";
  w: number;
  h: number;
}

/* ---------------- images ---------------- */

async function loadImg(src: string): Promise<Img | null> {
  if (!src) return null;
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
  } catch {
    return null;
  }
  let url = src;
  let type: Img["type"] = /^data:image\/png/.test(src) ? "png" : "jpg";
  if (!/^data:image\/(png|jpe?g)/.test(src)) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d")!.drawImage(img, 0, 0);
    url = c.toDataURL("image/png");
    type = "png";
  }
  const bin = atob(url.slice(url.indexOf(",") + 1));
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  return { data, type, w: img.naturalWidth || 1, h: img.naturalHeight || 1 };
}

async function svgToPng(svg: string, w: number, h: number): Promise<Img | null> {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const c = document.createElement("canvas");
  c.width = w * 2;
  c.height = h * 2;
  const ctx = c.getContext("2d")!;
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0, w, h);
  return loadImg(c.toDataURL("image/png"));
}

/** An image fitted inside maxW × maxH (points ≈ px for docx). */
function imgRun(img: Img, maxW: number, maxH: number) {
  const k = Math.min(maxW / img.w, maxH / img.h);
  return new ImageRun({ type: img.type, data: img.data, transformation: { width: Math.round(img.w * k), height: Math.round(img.h * k) } });
}

/* ---------------- table helpers ---------------- */

const LINE = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE };

interface CellOpts {
  w: number; // twips
  fill?: string;
  span?: number;
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  bold?: boolean;
  italic?: boolean;
  color?: string;
  size?: number; // half-points
  borders?: boolean;
  vertical?: boolean;
  runs?: TextRun[];
  children?: Paragraph[];
}

function run(text: string, o: { bold?: boolean; italic?: boolean; color?: string; size?: number } = {}) {
  return new TextRun({ text, font: FONT, bold: o.bold, italics: o.italic, color: o.color, size: o.size ?? 18 });
}

function cell(text: string, o: CellOpts) {
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    columnSpan: o.span,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    borders: o.borders === false ? NO_BORDERS : BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    textDirection: o.vertical ? TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT : undefined,
    margins: { top: 30, bottom: 30, left: 70, right: 70 },
    children: o.children ?? [
      new Paragraph({
        alignment: o.align ?? AlignmentType.LEFT,
        children: o.runs ?? text.split("\n").map((line, i) => new TextRun({ text: line, font: FONT, bold: o.bold, italics: o.italic, color: o.color, size: o.size ?? 18, break: i ? 1 : undefined })),
      }),
    ],
  });
}

function row(cells: TableCell[], height?: number) {
  return new TableRow({ children: cells, height: height ? { value: height, rule: HeightRule.ATLEAST } : undefined, cantSplit: true });
}

function table(widths: number[], rows: TableRow[]) {
  return new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: widths, rows });
}

const gap = (after = 200) => new Paragraph({ spacing: { after }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

/* ---------------- pages ---------------- */

async function coverPage(r: ChecklistReport, logo: Img | null) {
  const sigs = { prep: await loadImg(r.signoff.preparedSignature), appr: await loadImg(r.signoff.approvedSignature) };
  const half = PAGE_W / 2;
  const label = half * 0.38;
  const value = half - label;
  const sigCell = (img: Img | null) =>
    new TableCell({
      width: { size: half, type: WidthType.DXA },
      columnSpan: 2,
      borders: BORDERS,
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: img ? [imgRun(img, 200, 70)] : [] })],
    });
  return [
    gap(1800),
    new Paragraph({ alignment: AlignmentType.CENTER, children: logo ? [imgRun(logo, 300, 80)] : [run("First Fix", { bold: true, size: 56 })] }),
    gap(500),
    table([PAGE_W], [row([cell(r.title, { w: PAGE_W, fill: XL.black, color: "FFFFFF", bold: true, size: 48, align: AlignmentType.CENTER })], 1300)]),
    gap(3000),
    table(
      [PAGE_W * 0.3, PAGE_W * 0.4, PAGE_W * 0.3],
      [row([cell("", { w: PAGE_W * 0.3, borders: false }), cell(r.project, { w: PAGE_W * 0.4, fill: XL.orange, bold: true, size: 28, align: AlignmentType.CENTER }), cell("", { w: PAGE_W * 0.3, borders: false })])]
    ),
    gap(300),
    table(
      [label, value, label, value],
      [
        row([cell("Signature", { w: half, span: 2, align: AlignmentType.CENTER }), cell("Signature", { w: half, span: 2, align: AlignmentType.CENTER })]),
        row([sigCell(sigs.prep), sigCell(sigs.appr)], 1300),
        row([
          cell("Date :", { w: label, align: AlignmentType.CENTER }),
          cell(xlDate(r.signoff.preparedDate || r.inspectionDate), { w: value, align: AlignmentType.CENTER }),
          cell("Date :", { w: label, align: AlignmentType.CENTER }),
          cell(xlDate(r.signoff.approvedDate), { w: value, align: AlignmentType.CENTER }),
        ]),
        row([
          cell("Prepared  By:", { w: label, align: AlignmentType.CENTER }),
          cell(r.signoff.preparedName || r.inspectedBy, { w: value, align: AlignmentType.CENTER }),
          cell("Approved By:", { w: label, align: AlignmentType.CENTER }),
          cell(r.signoff.approvedName, { w: value, align: AlignmentType.CENTER }),
        ]),
        row([cell("Project HSE Manager", { w: half, span: 2, align: AlignmentType.CENTER }), cell("HSE Director", { w: half, span: 2, align: AlignmentType.CENTER })]),
      ]
    ),
    pageBreak(),
  ];
}

function inspectionPage(r: ChecklistReport) {
  const W = [PAGE_W * 0.06, PAGE_W * 0.7, PAGE_W * 0.12, PAGE_W * 0.12];
  const info = [PAGE_W * 0.16, PAGE_W * 0.4, PAGE_W * 0.2, PAGE_W * 0.24];
  const rows: TableRow[] = [];
  for (const s of r.sections) {
    rows.push(
      row([
        cell(s.id, { w: W[0], fill: XL.black, color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
        cell("", {
          w: W[1] + W[2] + W[3],
          span: 3,
          fill: XL.black,
          runs: [
            run(s.title, { bold: true, color: "FFFFFF" }),
            ...(s.criticality ? [run(` (${s.criticality})`, { bold: true, italic: true, color: s.criticality === "Life Critical Item" ? "FF4D4D" : "FFFFFF" })] : []),
          ],
        }),
      ])
    );
    for (const it of s.items) {
      rows.push(
        row([
          cell(String(it.no), { w: W[0], align: AlignmentType.CENTER }),
          cell(it.text, { w: W[1] }),
          cell(it.possible, { w: W[2], bold: true, align: AlignmentType.CENTER }),
          cell(it.scored, { w: W[3], bold: true, align: AlignmentType.CENTER, fill: it.short ? XL.amber : undefined }),
        ])
      );
    }
    rows.push(
      row([
        cell("POSSIBLE POINTS AWARDED", { w: W[0] + W[1], span: 2, color: XL.red, size: 15, align: AlignmentType.RIGHT }),
        cell(String(s.possible), { w: W[2], fill: XL.blue, color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
        cell(String(s.scored), { w: W[3], fill: XL.blue, color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
      ])
    );
  }
  return [
    table(
      info,
      [
        row([cell(r.title, { w: PAGE_W, span: 4, fill: XL.blue, color: "FFFFFF", bold: true, size: 24, align: AlignmentType.CENTER })], 420),
        row([cell("Inspected by:", { w: info[0], bold: true }), cell(r.inspectedBy, { w: info[1] }), cell("Inspection Date:", { w: info[2], bold: true }), cell(xlDate(r.inspectionDate), { w: info[3], align: AlignmentType.CENTER })]),
        row([cell("Project Director:", { w: info[0], bold: true }), cell(r.projectDirector, { w: info[1] }), cell("Total Manpower:", { w: info[2], bold: true }), cell(r.totalManpower, { w: info[3], align: AlignmentType.CENTER })]),
      ]
    ),
    table(W, [
      row([
        cell(`Activity: ${r.activity}`, { w: W[0] + W[1], span: 2 }),
        cell("Total Points Possible", { w: W[2], fill: XL.possible, bold: true, size: 15, align: AlignmentType.CENTER }),
        cell("Total Points Scored", { w: W[3], fill: XL.scored, bold: true, size: 15, align: AlignmentType.CENTER }),
      ]),
      ...rows,
    ]),
  ];
}

async function summaryPage(r: ChecklistReport) {
  const W = [PAGE_W * 0.05, PAGE_W * 0.59, PAGE_W * 0.12, PAGE_W * 0.12, PAGE_W * 0.12];
  const chart = await svgToPng(finalScoreSvg(r, 900, 420), 900, 420);
  return [
    pageBreak(),
    table(W, [
      row([
        cell("Summary Report", { w: W[0] + W[1], span: 2, fill: XL.black, color: "FFFFFF", bold: true, size: 32, align: AlignmentType.CENTER }),
        cell("Total Points Possible", { w: W[2], fill: XL.possible, bold: true, size: 15, align: AlignmentType.CENTER }),
        cell("Total Points Scored", { w: W[3], fill: XL.scored, bold: true, size: 15, align: AlignmentType.CENTER }),
        cell("Final Score", { w: W[4], fill: XL.red, color: "FFFFFF", bold: true, size: 15, align: AlignmentType.CENTER }),
      ]),
      ...r.sections.map((s) =>
        row([
          cell(s.id, { w: W[0], align: AlignmentType.CENTER }),
          cell("", {
            w: W[1],
            runs: [run(s.title, { size: 16 }), ...(s.criticality ? [run(` (${s.criticality})`, { size: 16, color: s.criticality === "Life Critical Item" ? XL.lifeCritical : undefined })] : [])],
          }),
          cell(String(s.possible), { w: W[2], align: AlignmentType.CENTER, size: 16 }),
          cell(String(s.scored), { w: W[3], align: AlignmentType.CENTER, size: 16 }),
          cell(s.pct, { w: W[4], align: AlignmentType.CENTER, italic: true, color: XL.red, size: 16 }),
        ])
      ),
      row([
        cell("FINAL AVERAGE SCORE", { w: W[0] + W[1], span: 2, fill: XL.amber, bold: true, color: XL.red, size: 16 }),
        cell(String(r.grandPossible), { w: W[2], fill: XL.amber, bold: true, color: XL.red, align: AlignmentType.CENTER, size: 16 }),
        cell(String(r.grandScored), { w: W[3], fill: XL.amber, bold: true, color: XL.red, align: AlignmentType.CENTER, size: 16 }),
        cell(r.grandPct, { w: W[4], fill: XL.amber, bold: true, italic: true, color: XL.red, align: AlignmentType.CENTER, size: 16 }),
      ]),
    ]),
    gap(160),
    new Paragraph({ alignment: AlignmentType.CENTER, children: chart ? [imgRun(chart, 640, 300)] : [] }),
    pageBreak(),
  ];
}

async function correctiveActionsPage(r: ChecklistReport) {
  const W = [PAGE_W * 0.08, PAGE_W * 0.72, PAGE_W * 0.2];
  const D = [PAGE_W * 0.08, PAGE_W * 0.24, PAGE_W * 0.48, PAGE_W * 0.2];
  const grey = (a: string, b: string, c: string) =>
    row([cell(a, { w: W[0], fill: XL.grey, bold: true, size: 16, align: AlignmentType.CENTER }), cell(b, { w: W[1], fill: XL.grey, bold: true, size: 16, align: AlignmentType.CENTER }), cell(c, { w: W[2], fill: XL.grey, bold: true, size: 16, align: AlignmentType.CENTER })]);
  const sigImgs = await Promise.all(r.designations.map((d) => loadImg(d.signature)));
  return [
    table(W, [
      row([cell(r.title, { w: PAGE_W, span: 3, fill: XL.black, color: "FFFFFF", bold: true, size: 22, align: AlignmentType.CENTER })], 560),
      row([cell("Observations", { w: PAGE_W, span: 3, bold: true, size: 24, align: AlignmentType.CENTER })]),
      grey("Item", "Description", "Date Required"),
      ...r.observations.map((o, i) =>
        row([cell(String(i + 1), { w: W[0], align: AlignmentType.CENTER }), cell(o.description, { w: W[1] }), cell(xlDate(o.dateRequired), { w: W[2], align: AlignmentType.CENTER })], 300)
      ),
      row([cell(" CONTRACTOR CORRECTIVE ACTIONS ", { w: PAGE_W, span: 3, fill: XL.black, color: "FFFFFF", bold: true, size: 16, align: AlignmentType.CENTER })]),
      grey("Item", "Corrective Action", "Date Completed"),
      ...r.actions.map((a, i) =>
        row([cell(String(i + 1), { w: W[0], align: AlignmentType.CENTER }), cell(a.action, { w: W[1] }), cell(xlDate(a.dateCompleted), { w: W[2], align: AlignmentType.CENTER })], 300)
      ),
    ]),
    table(D, [
      row([cell("", { w: D[0] + D[1] + D[2], span: 3, fill: XL.black }), cell("Designation", { w: D[3], fill: XL.possible, bold: true, size: 16, align: AlignmentType.CENTER })]),
      ...r.designations.map((d, i) =>
        row(
          [
            cell(d.name || d.designation || d.signature ? String(i + 1) : "", { w: D[0], align: AlignmentType.CENTER }),
            new TableCell({
              width: { size: D[1], type: WidthType.DXA },
              borders: BORDERS,
              verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: sigImgs[i] ? [imgRun(sigImgs[i]!, 110, 34)] : [] })],
            }),
            cell(d.name, { w: D[2] }),
            cell(d.designation, { w: D[3], align: AlignmentType.CENTER }),
          ],
          420
        )
      ),
    ]),
    pageBreak(),
  ];
}

async function photosPage(r: ChecklistReport) {
  const narrow = PAGE_W * 0.04;
  const wide = PAGE_W / 3 - narrow;
  const W = [narrow, wide, narrow, wide, narrow, wide];
  const imgs = await Promise.all(r.photos.map((p) => loadImg(p.image)));
  const slots = r.photos.length ? r.photos.map((p, i) => ({ ...p, img: imgs[i] })) : [];
  const nRows = Math.max(2, Math.ceil(slots.length / 3));
  const rows: TableRow[] = [row([cell(r.title, { w: PAGE_W, span: 6, fill: XL.black, color: "FFFFFF", bold: true, size: 20, align: AlignmentType.CENTER })], 420)];
  for (let k = 0; k < nRows; k++) {
    const trio = [0, 1, 2].map((j) => slots[k * 3 + j]);
    rows.push(
      row(
        trio.flatMap((p) => [
          cell("Number", { w: narrow, vertical: true, size: 13, align: AlignmentType.CENTER }),
          new TableCell({
            width: { size: wide, type: WidthType.DXA },
            borders: BORDERS,
            verticalAlign: VerticalAlign.BOTTOM,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: p?.img ? [imgRun(p.img, 200, 150)] : [] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [run(p?.label ?? "", { bold: true, size: 14 })] }),
            ],
          }),
        ]),
        2400
      )
    );
    rows.push(row(trio.flatMap((p) => [cell("", { w: narrow }), cell(p?.text ?? "", { w: wide, bold: true, size: 13, align: AlignmentType.CENTER })])));
  }
  return [table(W, rows)];
}

/* ---------------- export ---------------- */

export async function buildChecklistDocx(template: ChecklistTemplate, s: ChecklistSubmission): Promise<Blob> {
  const r = buildChecklistReport(template, s);
  const logo = await loadImg(await fetch("/templates/iir-logo.png").then((x) => x.blob()).then((b) => new Promise<string>((res) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.readAsDataURL(b);
  })).catch(() => ""));
  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, bottom: 720, left: 720, right: 720, footer: 300 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Page ", font: FONT, size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 }),
                  new TextRun({ text: " of ", font: FONT, size: 16 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16 }),
                ],
              }),
            ],
          }),
        },
        children: [...(await coverPage(r, logo)), ...inspectionPage(r), ...(await summaryPage(r)), ...(await correctiveActionsPage(r)), ...(await photosPage(r))],
      },
    ],
  });
  return Packer.toBlob(doc);
}

export function checklistFileName(template: ChecklistTemplate, s: ChecklistSubmission, ext: string) {
  const d = /^(\d{4})-(\d{2})/.exec(s.inspectionDate || "");
  const month = d ? `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(d[2]) - 1]}_${d[1]}_` : "";
  return `${month}${template.title.replace(/[^\w&]+/g, "_")}_-_${(s.projectName || "FF").replace(/[^\w]+/g, "_")}.${ext}`;
}

export async function exportChecklistWord(template: ChecklistTemplate, s: ChecklistSubmission) {
  const blob = await buildChecklistDocx(template, s);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = checklistFileName(template, s, "docx");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
