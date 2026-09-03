import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelSheet {
  /** Sheet tab name — Excel caps this at 31 characters, trimmed automatically. */
  name: string;
  columns: ExcelColumn[];
  rows: Record<string, string | number>[];
}

/** Builds a .xlsx workbook (one worksheet per entry in `sheets`) entirely
 *  client-side and triggers a browser download — no server round-trip. */
export async function exportToExcel(filename: string, sheets: ExcelSheet[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "First Fix HSE";
  workbook.created = new Date();

  sheets.forEach((sheet) => {
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

    sheet.rows.forEach((row) => worksheet.addRow(row));

    if (sheet.columns.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columns.length },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
