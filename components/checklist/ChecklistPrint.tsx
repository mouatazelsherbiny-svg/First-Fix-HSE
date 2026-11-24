"use client";

/**
 * Monthly Checklist laid out like the company's Excel form, for printing /
 * "Save as PDF": Cover Page, Inspection + Summary Report + Final Score chart,
 * Corrective Actions, Photos. Same rows as the Word export
 * (lib/checklistReport.ts).
 */

import { finalScoreSvg, xlDate, XL, type ChecklistReport } from "@/lib/checklistReport";

const c = (hex: string) => `#${hex}`;

const CSS = `
.ckp{font-family:Calibri,Carlito,"Segoe UI",Arial,sans-serif;color:#000;background:#fff;font-size:11px;line-height:1.3}
.ckp *{box-sizing:border-box}
.ckp table{width:100%;border-collapse:collapse;table-layout:fixed}
.ckp td{border:1px solid #000;padding:3px 5px;vertical-align:middle;word-wrap:break-word}
.ckp .nb td{border:0}
.ckp .c{text-align:center}
.ckp .b{font-weight:700}
.ckp .pb{break-before:page;page-break-before:always}
.ckp tr{break-inside:avoid;page-break-inside:avoid}
.ckp .avoid{break-inside:avoid;page-break-inside:avoid}
`;

export default function ChecklistPrint({ r }: { r: ChecklistReport }) {
  const sigImg = (src: string, h: number) =>
    // eslint-disable-next-line @next/next/no-img-element
    src ? <img src={src} alt="Signature" style={{ height: h, maxWidth: "100%", objectFit: "contain" }} /> : null;
  const rows3 = Math.max(2, Math.ceil(r.photos.length / 3));

  return (
    <div className="ckp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ============ Cover Page ============ */}
      <section style={{ minHeight: "260mm", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "52mm" }} />
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/templates/iir-logo.png" alt="First Fix" style={{ height: 64 }} />
        </div>
        <div style={{ marginTop: 26, background: "#000", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 26, padding: "26px 10px" }}>{r.title}</div>
        <div style={{ flex: 1, minHeight: "70mm" }} />
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "inline-block", minWidth: "40%", background: c(XL.orange), fontWeight: 700, fontSize: 16, padding: "4px 20px" }}>{r.project}</span>
        </div>
        <table style={{ marginTop: 10 }}>
          <colgroup>
            <col style={{ width: "19%" }} />
            <col style={{ width: "31%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "31%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={2} className="c">
                Signature
              </td>
              <td colSpan={2} className="c">
                Signature
              </td>
            </tr>
            <tr style={{ height: 80 }}>
              <td colSpan={2} className="c">
                {sigImg(r.signoff.preparedSignature, 64)}
              </td>
              <td colSpan={2} className="c">
                {sigImg(r.signoff.approvedSignature, 64)}
              </td>
            </tr>
            <tr>
              <td className="c">Date :</td>
              <td className="c">{xlDate(r.signoff.preparedDate || r.inspectionDate)}</td>
              <td className="c">Date :</td>
              <td className="c">{xlDate(r.signoff.approvedDate)}</td>
            </tr>
            <tr>
              <td className="c">Prepared By:</td>
              <td className="c">{r.signoff.preparedName || r.inspectedBy}</td>
              <td className="c">Approved By:</td>
              <td className="c">{r.signoff.approvedName}</td>
            </tr>
            <tr>
              <td colSpan={2} className="c">
                Project HSE Manager
              </td>
              <td colSpan={2} className="c">
                HSE Director
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ============ Inspection ============ */}
      <section className="pb">
        <table>
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "36%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={6} className="c b" style={{ background: c(XL.blue), color: "#fff", fontSize: 14, padding: 6 }}>
                {r.title}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="b">
                Inspected by:
              </td>
              <td>{r.inspectedBy}</td>
              <td className="b">Inspection Date:</td>
              <td colSpan={2} className="c">
                {xlDate(r.inspectionDate)}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="b">
                Project Director:
              </td>
              <td>{r.projectDirector}</td>
              <td className="b">Total Manpower:</td>
              <td colSpan={2} className="c">
                {r.totalManpower}
              </td>
            </tr>
            <tr>
              <td colSpan={4}>Activity: {r.activity}</td>
              <td className="c b" style={{ background: c(XL.possible), fontSize: 9.5 }}>
                Total Points Possible
              </td>
              <td className="c b" style={{ background: c(XL.scored), fontSize: 9.5 }}>
                Total Points Scored
              </td>
            </tr>
            {r.sections.map((s) => [
              <tr key={`${s.id}-h`} style={{ background: "#000", color: "#fff" }}>
                <td className="c b">{s.id}</td>
                <td colSpan={5} className="b">
                  {s.title}
                  {s.criticality && <i style={{ color: s.criticality === "Life Critical Item" ? "#ff4d4d" : "#fff" }}> ({s.criticality})</i>}
                </td>
              </tr>,
              ...s.items.map((it) => (
                <tr key={`${s.id}-${it.no}`}>
                  <td className="c">{it.no}</td>
                  <td colSpan={3}>{it.text}</td>
                  <td className="c b">{it.possible}</td>
                  <td className="c b" style={it.short ? { background: c(XL.amber) } : undefined}>
                    {it.scored}
                  </td>
                </tr>
              )),
              <tr key={`${s.id}-t`}>
                <td colSpan={4} style={{ textAlign: "right", color: c(XL.red), fontSize: 9 }}>
                  POSSIBLE POINTS AWARDED
                </td>
                <td className="c b" style={{ background: c(XL.blue), color: "#fff" }}>
                  {s.possible}
                </td>
                <td className="c b" style={{ background: c(XL.blue), color: "#fff" }}>
                  {s.scored}
                </td>
              </tr>,
            ])}
          </tbody>
        </table>

        {/* Summary Report + chart */}
        <div className="avoid" style={{ marginTop: 16 }}>
          <table>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "59%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td colSpan={2} className="c b" style={{ background: "#000", color: "#fff", fontSize: 17 }}>
                  Summary Report
                </td>
                <td className="c b" style={{ background: c(XL.possible), fontSize: 9.5 }}>
                  Total Points Possible
                </td>
                <td className="c b" style={{ background: c(XL.scored), fontSize: 9.5 }}>
                  Total Points Scored
                </td>
                <td className="c b" style={{ background: c(XL.red), color: "#fff", fontSize: 9.5 }}>
                  Final Score
                </td>
              </tr>
              {r.sections.map((s) => (
                <tr key={s.id}>
                  <td className="c">{s.id}</td>
                  <td>
                    {s.title}
                    {s.criticality && <span style={{ color: s.criticality === "Life Critical Item" ? c(XL.lifeCritical) : undefined }}> ({s.criticality})</span>}
                  </td>
                  <td className="c">{s.possible}</td>
                  <td className="c">{s.scored}</td>
                  <td className="c" style={{ color: c(XL.red), fontStyle: "italic" }}>
                    {s.pct}
                  </td>
                </tr>
              ))}
              <tr style={{ background: c(XL.amber), color: c(XL.red), fontWeight: 700 }}>
                <td colSpan={2}>FINAL AVERAGE SCORE</td>
                <td className="c">{r.grandPossible}</td>
                <td className="c">{r.grandScored}</td>
                <td className="c" style={{ fontStyle: "italic" }}>
                  {r.grandPct}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 10, textAlign: "center" }} dangerouslySetInnerHTML={{ __html: finalScoreSvg(r, 900, 420).replace("<svg ", '<svg style="width:100%;height:auto" ') }} />
        </div>
      </section>

      {/* ============ Corrective Actions ============ */}
      <section className="pb">
        <table>
          <colgroup>
            <col style={{ width: "8%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "48%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={4} className="c b" style={{ background: "#000", color: "#fff", fontSize: 13, padding: 10 }}>
                {r.title}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="c b" style={{ fontSize: 14 }}>
                Observations
              </td>
            </tr>
            <tr style={{ background: c(XL.grey) }} className="b">
              <td className="c">Item</td>
              <td colSpan={2} className="c">
                Description
              </td>
              <td className="c">Date Required</td>
            </tr>
            {r.observations.map((o, i) => (
              <tr key={`o${i}`} style={{ height: 22 }}>
                <td className="c">{i + 1}</td>
                <td colSpan={2}>{o.description}</td>
                <td className="c">{xlDate(o.dateRequired)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} className="c b" style={{ background: "#000", color: "#fff" }}>
                CONTRACTOR CORRECTIVE ACTIONS
              </td>
            </tr>
            <tr style={{ background: c(XL.grey) }} className="b">
              <td className="c">Item</td>
              <td colSpan={2} className="c">
                Corrective Action
              </td>
              <td className="c">Date Completed</td>
            </tr>
            {r.actions.map((a, i) => (
              <tr key={`a${i}`} style={{ height: 22 }}>
                <td className="c">{i + 1}</td>
                <td colSpan={2}>{a.action}</td>
                <td className="c">{xlDate(a.dateCompleted)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ background: "#000" }} />
              <td className="c b" style={{ background: c(XL.possible) }}>
                Designation
              </td>
            </tr>
            {r.designations.map((d, i) => (
              <tr key={`d${i}`} style={{ height: 32 }}>
                <td className="c">{d.name || d.designation || d.signature ? i + 1 : ""}</td>
                <td className="c">{sigImg(d.signature, 26)}</td>
                <td>{d.name}</td>
                <td className="c">{d.designation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ============ Photos ============ */}
      <section className="pb">
        <table>
          <colgroup>
            {[0, 1, 2].map((i) => [<col key={`n${i}`} style={{ width: "4%" }} />, <col key={`w${i}`} style={{ width: "29.33%" }} />])}
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={6} className="c b" style={{ background: "#000", color: "#fff", fontSize: 12, padding: 6 }}>
                {r.title}
              </td>
            </tr>
            {Array.from({ length: rows3 }).map((_, k) => {
              const trio = [0, 1, 2].map((j) => r.photos[k * 3 + j]);
              return [
                <tr key={`p${k}`} style={{ height: 190 }}>
                  {trio.map((p, j) => [
                    <td key={`n${j}`} className="c" style={{ fontSize: 8, padding: 0 }}>
                      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", display: "inline-block" }}>Number</span>
                    </td>,
                    <td key={`i${j}`} className="c" style={{ verticalAlign: "bottom", padding: 4 }}>
                      {p?.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.label} style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain", display: "block", margin: "0 auto 3px" }} />
                      )}
                      <div className="b" style={{ fontSize: 9.5 }}>
                        {p?.label}
                      </div>
                    </td>,
                  ])}
                </tr>,
                <tr key={`t${k}`}>
                  {trio.map((p, j) => [
                    <td key={`e${j}`} />,
                    <td key={`d${j}`} className="c b" style={{ fontSize: 9 }}>
                      {p?.text}
                    </td>,
                  ])}
                </tr>,
              ];
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
