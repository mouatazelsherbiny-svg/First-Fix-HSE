import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { ChecklistSection, PointValue } from "@/types/checklist";

interface ChecklistExportLabels {
  generalInfo: string;
  inspectedBy: string;
  inspectionDate: string;
  projectDirector: string;
  totalManpower: string;
  activity: string;
  projectName: string;
  possible: string;
  scored: string;
  possiblePointsAwarded: string;
  summaryReport: string;
  section: string;
  totalPossible: string;
  totalScored: string;
  finalScore: string;
  grandTotal: string;
}

interface ChecklistExportData {
  templateTitle: string;
  inspectedBy: string;
  general: {
    inspectionDate: string;
    projectDirector: string;
    totalManpower: string;
    activity: string;
    projectName: string;
  };
  sectionStats: {
    section: ChecklistSection;
    possible: number;
    scored: number;
    pct: number;
  }[];
  possibleMap: Record<string, PointValue>;
  scoredMap: Record<string, PointValue>;
  grandPossible: number;
  grandScored: number;
  grandPct: number;
  labels: ChecklistExportLabels;
}

const HEADER_SHADING = { type: ShadingType.SOLID, color: "E4EAF2", fill: "E4EAF2" };
const TOTAL_SHADING = { type: ShadingType.SOLID, color: "1E4B79", fill: "1E4B79" };

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: HEADER_SHADING,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function cell(text: string, opts?: { bold?: boolean; color?: string }): TableCell {
  return new TableCell({
    children: [
      new Paragraph({ children: [new TextRun({ text, bold: opts?.bold, color: opts?.color })] }),
    ],
  });
}

function keyValueRow(key: string, value: string): TableRow {
  return new TableRow({
    children: [headerCell(key, 35), cell(value || "—")],
  });
}

/** Builds a .docx snapshot of the checklist's current on-screen state
 *  (general info + every section's scores + the summary report) entirely
 *  client-side, and triggers a browser download. */
export async function exportChecklistToWord(data: ChecklistExportData): Promise<void> {
  const { labels } = data;

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: data.templateTitle, bold: true })],
    }),
    new Paragraph({ text: "", spacing: { after: 200 } }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, text: labels.generalInfo }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        keyValueRow(labels.inspectedBy, data.inspectedBy),
        keyValueRow(labels.inspectionDate, data.general.inspectionDate),
        keyValueRow(labels.projectDirector, data.general.projectDirector),
        keyValueRow(labels.totalManpower, data.general.totalManpower),
        keyValueRow(labels.activity, data.general.activity),
        keyValueRow(labels.projectName, data.general.projectName),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 200 } }),
  ];

  data.sectionStats.forEach(({ section, possible, scored }) => {
    const criticalityNote = section.criticality
      ? ` (${section.criticality === "life-critical" ? "Life Critical Item" : "Non-Life Critical Item"})`
      : "";

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        text: `${section.id}. ${section.title}${criticalityNote}`,
      })
    );

    const questionRows = section.questions.map(
      (q, idx) =>
        new TableRow({
          children: [
            cell(String(idx + 1)),
            cell(q.text),
            cell(data.possibleMap[q.id] ?? "N/A"),
            cell(data.scoredMap[q.id] ?? "N/A"),
          ],
        })
    );

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              headerCell("#", 6),
              headerCell(labels.section, 58),
              headerCell(labels.possible, 18),
              headerCell(labels.scored, 18),
            ],
          }),
          ...questionRows,
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: labels.possiblePointsAwarded, bold: true })],
                  }),
                ],
              }),
              cell(String(possible), { bold: true }),
              cell(String(scored), { bold: true }),
            ],
          }),
        ],
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
  });

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: labels.summaryReport }));

  const summaryRows = data.sectionStats.map(
    ({ section, possible, scored, pct }) =>
      new TableRow({
        children: [
          cell(`${section.id}. ${section.title}`),
          cell(String(possible)),
          cell(String(scored)),
          cell(`${pct}%`),
        ],
      })
  );

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            headerCell(labels.section, 46),
            headerCell(labels.totalPossible, 18),
            headerCell(labels.totalScored, 18),
            headerCell(labels.finalScore, 18),
          ],
        }),
        ...summaryRows,
        new TableRow({
          children: [
            new TableCell({
              shading: TOTAL_SHADING,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: labels.grandTotal, bold: true, color: "FFFFFF" })],
                }),
              ],
            }),
            new TableCell({
              shading: TOTAL_SHADING,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(data.grandPossible), bold: true, color: "FFFFFF" })],
                }),
              ],
            }),
            new TableCell({
              shading: TOTAL_SHADING,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(data.grandScored), bold: true, color: "FFFFFF" })],
                }),
              ],
            }),
            new TableCell({
              shading: TOTAL_SHADING,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `${data.grandPct}%`, bold: true, color: "FFFFFF" })],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = data.templateTitle.replace(/[^\w\-]+/g, "_");
  saveAs(blob, `${safeName}.docx`);
}
