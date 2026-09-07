import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  /** "image" columns take an array of base64 data-URL strings per row (see
   *  ExcelRow) and get the actual photos embedded in the cell instead of
   *  text. Omit (or "text") for a normal text/number column. */
  type?: "text" | "image";
}

/** A text/number cell value, or — for an "image" column — the row's array
 *  of base64 data-URL photos (e.g. `observation.observationPhotos`). */
export type ExcelCellValue = string | number | string[];

export interface ExcelSheet {
  /** Sheet tab name — Excel caps this at 31 characters, trimmed automatically. */
  name: string;
  columns: ExcelColumn[];
  rows: Record<string, ExcelCellValue>[];
}

// Thumbnail box every embedded photo is scaled to fit inside (px), and the
// gap left between photos placed side by side in the same cell.
const IMAGE_MAX_DIM = 80;
const IMAGE_GAP = 6;
// Rough px-per-unit conversions Excel uses for column width (character
// units, Calibri 11) and row height (points) — good enough for sizing
// cells around embedded thumbnails without needing pixel-perfect math.
const PX_PER_COLUMN_WIDTH_UNIT = 7;
const PX_PER_ROW_HEIGHT_POINT = 96 / 72;

function parseImageDataUrl(
  dataUrl: string
): { base64: string; extension: "jpeg" | "png" | "gif" } | null {
  const match = /^data:image\/(png|jpe?g|gif);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const rawExt = match[1].toLowerCase();
  const extension = rawExt === "jpg" ? "jpeg" : (rawExt as "png" | "jpeg" | "gif");
  return { base64: match[2], extension };
}

/** Resolves an image's natural pixel size by loading it in the browser.
 *  Falls back to a 1x1 square (so one bad photo can't abort the whole
 *  export) rather than rejecting. */
function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = dataUrl;
  });
}

/** Builds a .xlsx workbook (one worksheet per entry in `sheets`) entirely
 *  client-side and triggers a browser download — no server round-trip.
 *  "image" columns get the actual photos embedded in the sheet, scaled to
 *  a uniform thumbnail and laid out side by side when a row has more than
 *  one. Everything else is written as plain cell text/numbers. */
export async function exportToExcel(filename: string, sheets: ExcelSheet[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "First Fix HSE";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name.slice(0, 31));
    worksheet.columns = sheet.columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width ?? 22,
    }));

    // Fixed, print-safe header colors — an .xlsx is always opened on a
    // light sheet background regardless of the web app's own (dark) theme,
    // so this deliberately does NOT follow the brand.* tokens.
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FF1F2933" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEDEEF0" },
    };

    const imageColumns = sheet.columns
      .map((column, index) => ({ column, index }))
      .filter((entry) => entry.column.type === "image");

    // Add every row's plain text/number cells first — image columns get a
    // blank cell for now, filled in below once each photo's real size is
    // known.
    sheet.rows.forEach((row) => {
      const textRow: Record<string, string | number> = {};
      sheet.columns.forEach((column) => {
        const value = row[column.key];
        textRow[column.key] = Array.isArray(value) ? "" : value;
      });
      worksheet.addRow(textRow);
    });

    if (sheet.columns.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columns.length },
      };
    }

    if (imageColumns.length === 0) continue;

    // Widest photo count seen per image column, so that column can be
    // sized to fit every row's photos side by side.
    const maxPhotoCountByColumn = new Map<number, number>();

    for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex += 1) {
      const row = sheet.rows[rowIndex];
      let tallestPhotoHeightPx = 0;

      for (const { column, index: colIndex } of imageColumns) {
        const photos = row[column.key];
        const urls = Array.isArray(photos) ? photos : [];
        if (urls.length === 0) continue;

        maxPhotoCountByColumn.set(
          colIndex,
          Math.max(maxPhotoCountByColumn.get(colIndex) ?? 1, urls.length)
        );

        for (let photoIndex = 0; photoIndex < urls.length; photoIndex += 1) {
          const parsed = parseImageDataUrl(urls[photoIndex]);
          if (!parsed) continue;

          const naturalSize = await getImageSize(urls[photoIndex]);
          const scale = Math.min(
            IMAGE_MAX_DIM / naturalSize.width,
            IMAGE_MAX_DIM / naturalSize.height
          );
          const width = Math.max(4, Math.round(naturalSize.width * scale));
          const height = Math.max(4, Math.round(naturalSize.height * scale));
          tallestPhotoHeightPx = Math.max(tallestPhotoHeightPx, height);

          let imageId: number;
          try {
            imageId = workbook.addImage({
              base64: parsed.base64,
              extension: parsed.extension,
            });
          } catch {
            continue;
          }

          // Photos in the same cell sit side by side, each offset by a
          // fraction of the column so they don't stack on top of one
          // another; the column width below is sized to match.
          worksheet.addImage(imageId, {
            tl: { col: colIndex + photoIndex * 0.55 + 0.03, row: rowIndex + 1.05 },
            ext: { width, height },
          });
        }
      }

      if (tallestPhotoHeightPx > 0) {
        const neededHeightPoints = (tallestPhotoHeightPx + 10) / PX_PER_ROW_HEIGHT_POINT;
        const excelRow = worksheet.getRow(rowIndex + 2);
        excelRow.height = Math.max(excelRow.height ?? 15, neededHeightPoints);
      }
    }

    maxPhotoCountByColumn.forEach((count, colIndex) => {
      const neededPx = count * (IMAGE_MAX_DIM * 0.55) + IMAGE_MAX_DIM * 0.45 + IMAGE_GAP;
      const neededWidthUnits = neededPx / PX_PER_COLUMN_WIDTH_UNIT;
      const excelColumn = worksheet.getColumn(colIndex + 1);
      excelColumn.width = Math.max(excelColumn.width ?? 22, neededWidthUnits);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
