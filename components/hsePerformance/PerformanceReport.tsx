"use client";

/**
 * Printable HSE Performance assessment (A4): details, then "HSE Project
 * Assessment" laid out like the HSE Audit form — Health and Safety and
 * Environmental scores side by side (0–3 red, 4–6 amber, 7–10 green, N/A),
 * and the two score boxes (%, points, target, rating) — comments and the
 * assessor's signature. Our colours (black / orange), fixed for printing.
 */

import { ENV_ITEMS, HS_ITEMS, RATING_STYLE, TONE_STYLE, formatDate, itemsFor, scoreTone, type Rating, type ScoreResult, type Scores } from "@/lib/hseAudit";
import { performanceScores, type HsePerformance } from "@/lib/hsePerformance";

const ORANGE = "#F36F24";
const BLACK = "#111111";

const CSS = `
.pr { color:#111827; background:#fff; font-family: Calibri, Carlito, Arial, Helvetica, sans-serif; font-size:11px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.pr * { box-sizing:border-box; }
.pr-page { width:210mm; min-height:297mm; margin:0 auto; padding:10mm; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.12); }
.pr-head { display:flex; align-items:center; gap:10px; background:${BLACK}; padding:7px 10px; color:#fff; border-bottom:3px solid ${ORANGE}; }
.pr-logo { background:#fff; padding:3px 8px; height:42px; display:flex; align-items:center; border-radius:3px; }
.pr-logo img { height:34px; width:auto; }
.pr-title { flex:1; text-align:center; font-size:19px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; }
.pr-info { width:100%; border-collapse:collapse; margin-top:6px; }
.pr-info td { border:1px solid #d1d5db; padding:4px 7px; }
.pr-info td.k { background:#FFF1E8; font-weight:700; width:18%; }
.pr-band { background:${ORANGE}; color:#fff; font-weight:800; text-align:center; padding:6px; margin-top:10px; font-size:14px; }
.pr-note { text-align:center; font-weight:700; font-size:10px; padding:5px; background:#F3F4F6; border:1px solid #e5e7eb; border-top:0; }
.pr-grid { display:grid; grid-template-columns: 1fr 1fr 0.9fr; gap:0; margin-top:6px; border:1px solid #d1d5db; }
.pr-col { border-right:1px solid #d1d5db; }
.pr-hd { display:flex; justify-content:space-between; background:${BLACK}; color:#fff; font-weight:700; padding:5px 7px; font-size:10.5px; text-transform:uppercase; }
.pr-row { display:flex; align-items:stretch; border-top:1px solid #e5e7eb; min-height:27px; }
.pr-row .l { flex:1; padding:3px 7px; font-size:10px; display:flex; align-items:center; background:#FAFAFA; }
.pr-row .v { width:58px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; border-left:1px solid #e5e7eb; }
.pr-box { display:flex; flex-direction:column; }
.pr-box .t { background:${ORANGE}; color:#fff; font-weight:800; text-align:center; padding:14px 6px; font-size:15px; }
.pr-box .p { background:${BLACK}; color:#fff; text-align:center; font-size:30px; font-weight:800; padding:14px 0 2px; }
.pr-box .pts { background:${BLACK}; color:#fff; text-align:right; padding:0 10px 10px; font-weight:700; font-size:11px; }
.pr-box .tg { background:#FFE3D1; color:#9A3412; text-align:center; font-weight:800; padding:7px; border-top:1px solid #fff; }
.pr-box .rt { text-align:center; font-weight:800; padding:7px; border-top:1px solid #fff; }
.pr-cm { border:1px solid #d1d5db; padding:7px; min-height:60px; white-space:pre-wrap; margin-top:4px; }
.pr-h2 { font-size:12px; font-weight:800; margin-top:10px; text-transform:uppercase; border-left:4px solid ${ORANGE}; padding-left:6px; }
.pr-sign { display:flex; justify-content:flex-end; margin-top:12px; }
.pr-sign > div { width:240px; border:1px solid #d1d5db; }
.pr-sign .s { height:64px; display:flex; align-items:center; justify-content:center; }
.pr-sign .s img { max-height:58px; max-width:90%; object-fit:contain; }
.pr-sign .n { border-top:1px solid #e5e7eb; text-align:center; padding:3px; min-height:18px; }
.pr-sign .r { background:${BLACK}; color:#fff; text-align:center; font-weight:700; padding:4px; }
@media print { @page { size:A4; margin:0; } html, body { background:#fff !important; } .ar-noprint { display:none !important; } .pr-page { box-shadow:none; min-height:0; } }
`;

function Rows({ items, scores }: { items: string[]; scores: Scores }) {
  return (
    <>
      {items.map((i) => {
        const v = scores[i];
        const t = typeof v === "number" ? TONE_STYLE[scoreTone(v)] : null;
        return (
          <div key={i} className="pr-row">
            <span className="l">{i}</span>
            <span className="v" style={t ? { background: t.bg, color: t.fg } : { background: "#F3F4F6" }}>
              {typeof v === "number" ? v : "N/A"}
            </span>
          </div>
        );
      })}
    </>
  );
}

function Box({ title, r, target, rating }: { title: string; r: ScoreResult; target: number; rating: Rating }) {
  const rs = rating ? RATING_STYLE[rating] : null;
  return (
    <div className="pr-box" style={{ flex: 1 }}>
      <div className="t">{title}</div>
      <div className="p">{r.pct == null ? "N/A" : `${Math.round(r.pct)}%`}</div>
      <div className="pts">{r.max ? `${r.total} / ${r.max} Points` : ""}</div>
      <div className="tg">Target Score: {target}%</div>
      <div className="rt" style={rs ? { background: rs.bg, color: rs.fg } : { background: "#F3F4F6" }}>
        {rating || "—"}
      </div>
    </div>
  );
}

export default function PerformanceReport({ p }: { p: HsePerformance }) {
  const s = performanceScores(p);
  return (
    <div className="pr">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pr-page">
        <div className="pr-head">
          <div className="pr-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-print.png" alt="First Fix" />
          </div>
          <div className="pr-title">HSE Performance Assessment</div>
        </div>
        <table className="pr-info">
          <tbody>
            <tr>
              <td className="k">Project</td>
              <td>{p.projectName}</td>
              <td className="k">Date</td>
              <td>{formatDate(p.assessmentDate)}</td>
            </tr>
            <tr>
              <td className="k">Assessed by</td>
              <td>{p.assessedBy}</td>
              <td className="k">HSE Manager</td>
              <td>{p.hseManager}</td>
            </tr>
            <tr>
              <td className="k">Overall Score</td>
              <td style={{ fontWeight: 800 }}>{s.overall == null ? "N/A" : `${s.overall.toFixed(1)}%`}</td>
              <td className="k">Target</td>
              <td>{p.targetPct}%</td>
            </tr>
          </tbody>
        </table>

        <div className="pr-band">HSE Project Assessment</div>
        <div className="pr-note">
          All scores are rated on a scale of 0 to 10, where 0 is the lowest and 10 is the highest.
          <br />
          Mark items as N/A where they are not applicable to the project at this time.
        </div>
        <div className="pr-grid">
          <div className="pr-col">
            <div className="pr-hd">
              <span>Health and Safety</span>
              <span>M</span>
            </div>
            <Rows items={itemsFor(HS_ITEMS, p.hsScores)} scores={p.hsScores} />
          </div>
          <div className="pr-col">
            <div className="pr-hd">
              <span>Environmental</span>
              <span>M</span>
            </div>
            <Rows items={itemsFor(ENV_ITEMS, p.envScores)} scores={p.envScores} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Box title="Health & Safety Score" r={s.hs} target={p.targetPct} rating={s.hsRating} />
            <Box title="Environmental Score" r={s.env} target={p.targetPct} rating={s.envRating} />
          </div>
        </div>

        {p.comments.trim() && (
          <>
            <div className="pr-h2">Comments</div>
            <div className="pr-cm">{p.comments}</div>
          </>
        )}

        <div className="pr-sign">
          <div>
            <div className="r">Signature</div>
            <div className="s">
              {p.signature.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.signature.image} alt="Signature" />
              )}
            </div>
            <div className="n">{p.signature.name || p.assessedBy}</div>
            <div className="r" style={{ background: ORANGE }}>
              Assessed by
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
