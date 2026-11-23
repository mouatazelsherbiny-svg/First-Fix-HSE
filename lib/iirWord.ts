/**
 * IIR → Word. Fills the company's own form (public/templates/iir-template.docx,
 * made from "Incident Investigation Report - Form 001" with a {{token}} in
 * every field, check box, drop-down and photo / signature place) so the
 * export is the original form, filled in: same header, footer, colours and
 * layout. More than two photos repeat the photo sheet page.
 *
 * `fillIirDocx` is pure (works in Node too, for tests); `exportIirWord`
 * is the browser wrapper that loads the template and downloads the file.
 */

import JSZip from "jszip";
import { fmtDate, iirFileName, type IirData, type IirPhoto, type IirReport } from "@/lib/iir";

export const IIR_TEMPLATE_URL = "/templates/iir-template.docx";

/** Largest size (EMU) each picture may take — the size of its place in the form. */
const BOX: Record<string, [number, number]> = {
  cover: [4359275, 4911969],
  photoA: [3110593, 3110593],
  photoB: [3113315, 3113315],
  sig: [1417320, 502920],
};

const DATE_FIELDS = new Set(["incidentDate", "reportDate", "dob", "hireDate", "tradeDate", "hseDate", "pmDate", "wDate", "wPrepDate"]);

export interface ImageInfo {
  bytes: Uint8Array;
  ext: "png" | "jpeg";
  width: number;
  height: number;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Text for inside a <w:t>: escaped, line breaks as Word breaks. */
const wText = (s: string) => esc(s).replace(/\r?\n/g, '</w:t><w:br/><w:t xml:space="preserve">');

function drawingRun(rId: string, id: number, cx: number, cy: number) {
  return (
    `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>` +
    `<wp:docPr id="${id}" name="IIR Picture ${id}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="iir${id}"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>` +
    `</a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`
  );
}

/** Fill the template. `images` maps cover / p1..pN / sigHse / sigPm to decoded pictures. */
export async function fillIirDocx(template: ArrayBuffer | Uint8Array, report: IirReport, images: Record<string, ImageInfo | undefined>): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(template);
  let xml = await zip.file("word/document.xml")!.async("string");
  const d = report.data;

  // ---- photo sheet: one page per two photos
  const photos: IirPhoto[] = report.photos.length ? report.photos : [];
  const pages = Math.max(1, Math.ceil(photos.length / 2));
  const at = xml.indexOf("{{p1.no}}");
  if (at > 0 && pages > 1) {
    const start = xml.lastIndexOf("<w:tbl>", at);
    const end = xml.indexOf("</w:tbl>", at) + "</w:tbl>".length;
    const table = xml.slice(start, end);
    const copies = [table];
    // Copies keep the "16." of the first sheet (no list numbering) and drop its bookmarks.
    const copy = table
      .replace(/<w:numPr>(?:(?!<\/w:numPr>)[\s\S])*<\/w:numPr>/, "")
      .replace("PHOTO INFORMATION SHEET", "16.  PHOTO INFORMATION SHEET")
      .replace(/<w:bookmark(?:Start|End) [^>]*\/>/g, "")
      .replace(/ w14:(?:paraId|textId)="[^"]*"/g, "");
    for (let k = 1; k < pages; k++) {
      copies.push(
        copy.replace(/\{\{p1\./g, `{{p${2 * k + 1}.`).replace(/\{\{img:p1\}\}/g, `{{img:p${2 * k + 1}}}`).replace(/\{\{p2\./g, `{{p${2 * k + 2}.`).replace(/\{\{img:p2\}\}/g, `{{img:p${2 * k + 2}}}`)
      );
    }
    xml = xml.slice(0, start) + copies.join('<w:p><w:r><w:br w:type="page"/></w:r></w:p>') + xml.slice(end);
  }

  // ---- pictures (before text, so the tokens are still whole)
  const relsPath = "word/_rels/document.xml.rels";
  let rels = await zip.file(relsPath)!.async("string");
  let next = 1;
  let docPr = 5000;
  const exts = new Set<string>();
  xml = xml.replace(/<w:r>(?:(?!<w:r[ >])[\s\S])*?\{\{img:([^}]+)\}\}<\/w:t><\/w:r>/g, (_m, key: string) => {
    const img = images[key];
    if (!img) return "";
    const box = key === "cover" ? BOX.cover : key.startsWith("sig") ? BOX.sig : Number(key.slice(1)) % 2 === 1 ? BOX.photoA : BOX.photoB;
    const scale = Math.min(box[0] / img.width, box[1] / img.height);
    const cx = Math.round(img.width * scale);
    const cy = Math.round(img.height * scale);
    const rId = `rIdIir${next}`;
    const file = `iir_${next}.${img.ext}`;
    next += 1;
    zip.file(`word/media/${file}`, img.bytes);
    exts.add(img.ext);
    rels = rels.replace(
      "</Relationships>",
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${file}"/></Relationships>`
    );
    return drawingRun(rId, docPr++, cx, cy);
  });
  zip.file(relsPath, rels);
  if (exts.has("jpeg")) {
    const ctPath = "[Content_Types].xml";
    let ct = await zip.file(ctPath)!.async("string");
    if (!/Extension="jpeg"/i.test(ct)) ct = ct.replace("<Types ", "<Types ").replace(/(<Default )/, '<Default Extension="jpeg" ContentType="image/jpeg"/>$1');
    zip.file(ctPath, ct);
  }

  // ---- text, drop-downs, check boxes
  const value = (key: string): string => {
    if (key === "coverCategory") return d.coverCategory || "Incident Category";
    if (key === "coverProject") return d.project || "Project Name";
    if (key === "coverDate") return fmtDate(d.incidentDate) || "Date";
    let m = /^a(\d)\.(\w+)$/.exec(key);
    if (m) {
      const a = d.actions[Number(m[1])];
      const v = a ? String(a[m[2] as keyof typeof a] ?? "") : "";
      return m[2] === "due" || m[2] === "completed" ? fmtDate(v) : v;
    }
    m = /^p(\d+)\.(\w+)$/.exec(key);
    if (m) {
      const p = photos[Number(m[1]) - 1];
      const v = p ? String(p[m[2] as keyof IirPhoto] ?? "") : "";
      return m[2] === "date" ? fmtDate(v) : v;
    }
    const v = d[key as keyof IirData];
    if (typeof v !== "string") return "";
    // Sign-off dates go under "Date:" (the cell is narrow).
    if (key === "hseDate" || key === "pmDate") return v ? `\n${fmtDate(v)}` : "";
    return DATE_FIELDS.has(key) ? fmtDate(v) : v;
  };
  // Values that follow a label ("Position:") get a space after it; big text boxes do not.
  const BLOCK = /^(summary|causalFactors|causalDiscussion|involvement|cover\w+|hseDate|pmDate|a\d\.\w+|p\d+\.description)$/;
  const spaced = (key: string) => {
    const v = value(key);
    return v && !BLOCK.test(key) && !/^\s/.test(v) ? ` ${v}` : v;
  };
  xml = xml.replace(/\{\{cbv:(\w+)\}\}/g, (_m, k: string) => (d[k as keyof IirData] === true ? "1" : "0"));
  xml = xml.replace(/\{\{cb:(\w+)\}\}/g, (_m, k: string) => (d[k as keyof IirData] === true ? "☒" : "☐"));
  xml = xml.replace(/\{\{([\w.]+)\}\}/g, (_m, k: string) => wText(spaced(k)));
  // Anything left over (e.g. a picture place with no picture).
  xml = xml.replace(/\{\{[^}]*\}\}/g, "");

  zip.file("word/document.xml", xml);
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/* ---------------- browser ---------------- */

async function loadImage(dataUrl: string): Promise<ImageInfo | undefined> {
  if (!dataUrl) return undefined;
  const img = new Image();
  img.src = dataUrl;
  try {
    await img.decode();
  } catch {
    return undefined;
  }
  const mime = /^data:(image\/[\w+.-]+);base64,/.exec(dataUrl)?.[1] ?? "";
  let url = dataUrl;
  let ext: "png" | "jpeg" = mime === "image/png" ? "png" : "jpeg";
  if (mime !== "image/png" && mime !== "image/jpeg" && mime !== "image/jpg") {
    // Word reads PNG / JPEG: redraw anything else (webp, heic…) as PNG.
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d")!.drawImage(img, 0, 0);
    url = c.toDataURL("image/png");
    ext = "png";
  }
  const b64 = url.slice(url.indexOf(",") + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, ext, width: img.naturalWidth || 1, height: img.naturalHeight || 1 };
}

export async function exportIirWord(report: IirReport) {
  const res = await fetch(IIR_TEMPLATE_URL);
  if (!res.ok) throw new Error("Could not load the IIR Word template.");
  const template = await res.arrayBuffer();
  const images: Record<string, ImageInfo | undefined> = {
    cover: await loadImage(report.coverPhoto),
    sigHse: await loadImage(report.signatures.hse),
    sigPm: await loadImage(report.signatures.pm),
  };
  for (let i = 0; i < report.photos.length; i++) images[`p${i + 1}`] = await loadImage(report.photos[i].image);
  const bytes = await fillIirDocx(template, report, images);
  const blob = new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = iirFileName(report, "docx");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
