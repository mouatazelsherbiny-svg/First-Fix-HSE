"use client";

/**
 * Printable "Weekly Performance Report" (A4), laid out like the First Fix
 * form: logo + title, Project / Contractor / HSE Manager / Project Director /
 * Auditor / Date, Health and Safety | Environmental scores side by side
 * (0–3 red, 4–6 amber, 7–10 green, N/A), the H&S, Environmental and Overall
 * Performance Score boxes, then the three signatures (HSE Auditor, Regional
 * HSE Manager, HSE Director). Our colours (black / orange), fixed for printing.
 */

import { ENV_ITEMS, HS_ITEMS, RATING_STYLE, TONE_STYLE, formatDate, itemsFor, scoreTone, type Rating, type ScoreResult, type Scores } from "@/lib/hseAudit";
import { PERF_SIGN_ROLES, REPORT_TITLE, performanceScores, type HsePerformance } from "@/lib/hsePerformance";

const ORANGE = "#F36F24";
const BLACK = "#111111";

const CSS = `
.pr { color:#111827; background:#fff; font-family: Calibri, Carlito, Arial, Helvetica, sans-serif; font-size:11px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.pr * { box-sizing:border-box; }
.pr-page { width:210mm; min-height:297mm; margin:0 auto; padding:9mm; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.12); }
.pr-head { display:flex; align-items:stretch; border:1px solid #d1d5db; }
.pr-logo { width:27%; background:${BLACK}; display:flex; align-items:center; justify-content:center; padding:6px; border-right:3px solid ${ORANGE}; }
.pr-logo span { background:#fff; border-radius:4px; padding:3px 8px; display:flex; }
.pr-logo img { height:32px; width:auto; }
.pr-title { flex:1; background:${BLACK}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:800; letter-spacing:.3px; border-bottom:3px solid ${ORANGE}; }
.pr-info { width:100%; border-collapse:collapse; }
.pr-info td { border:1px solid #d1d5db; padding:5px 7px; height:24px; }
.pr-info td.k { background:#FFF1E8; font-weight:700; width:19%; }
.pr-info td.v { width:31%; background:#fff; }
.pr-grid { display:grid; grid-template-columns:1fr 1fr; border:1px solid #d1d5db; border-top:0; }
.pr-col + .pr-col { border-left:1px solid #d1d5db; }
.pr-hd { background:${BLACK}; color:#fff; font-weight:800; text-align:center; padding:6px; font-size:11px; text-transform:uppercase; letter-spacing:.4px; border-bottom:2px solid ${ORANGE}; }
.pr-row { display:flex; align-items:stretch; border-top:1px solid #e5e7eb; min-height:25px; }
.pr-row .l { flex:1; padding:3px 7px; font-size:10.5px; display:flex; align-items:center; }
.pr-row .v { width:62px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11.5px; border-left:1px solid #e5e7eb; }
.pr-scores { display:grid; grid-template-columns:1fr 1fr 1fr; border:1px solid #d1d5db; border-top:0; }
.pr-box { display:flex; flex-direction:column; }
.pr-box + .pr-box { border-left:1px solid #d1d5db; }
.pr-box .t { background:${ORANGE}; color:#fff; font-weight:800; text-align:center; padding:6px; font-size:13px; }
.pr-box .p { background:${BLACK}; color:#fff; text-align:center; font-size:34px; font-weight:800; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px 0 4px; min-height:96px; }
.pr-box .p small { font-size:10px; font-weight:700; color:#d4d4d8; margin-top:2px; }
.pr-box .tg { background:#FFE3D1; color:#9A3412; text-align:center; font-weight:800; padding:5px; }
.pr-box .rt { text-align:center; font-weight:800; padding:5px; }
.pr-ring { position:relative; width:96px; height:96px; }
.pr-ring svg { width:100%; height:100%; transform:rotate(-90deg); }
.pr-ring div { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:19px; font-weight:800; }
.pr-ring div small { font-size:9.5px; color:#d4d4d8; font-weight:700; }
.pr-sign { display:grid; grid-template-columns:1fr 1fr 1fr; border:1px solid #d1d5db; border-top:0; }
.pr-sign > div + div { border-left:1px solid #d1d5db; }
.pr-sign .s { height:66px; display:flex; align-items:center; justify-content:center; }
.pr-sign .s img { max-height:60px; max-width:90%; object-fit:contain; }
.pr-sign .s i { color:#d1d5db; font-size:10px; }
.pr-sign .n { text-align:center; padding:2px 4px; height:20px; overflow:hidden; font-size:10.5px; border-top:1px solid #f3f4f6; }
.pr-sign .r { background:${BLACK}; color:#fff; text-align:center; font-weight:800; padding:6px; border-top:2px solid ${ORANGE}; }
.pr-h2 { font-size:12px; font-weight:800; margin-top:10px; text-transform:uppercase; border-left:4px solid ${ORANGE}; padding-left:6px; }
.pr-cm { border:1px solid #d1d5db; padding:7px; min-height:50px; white-space:pre-wrap; margin-top:4px; }
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
            <span className="v" style={t ? { background: t.bg, color: t.fg } : { background: "#fff", color: "#111827" }}>
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
    <div className="pr-box">
      <div className="t">{title}</div>
      <div className="p">
        {r.pct == null ? "N/A" : `${Math.round(r.pct)}%`}
        {r.max > 0 && <small>{`${r.total} / ${r.max} points`}</small>}
      </div>
      <div className="tg">Target Score: {target}%</div>
      <div className="rt" style={rs ? { background: rs.bg, color: rs.fg } : { background: "#F3F4F6" }}>
        {rating || "—"}
      </div>
    </div>
  );
}

function Ring({ value }: { value: number | null }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, value ?? 0)) / 100;
  return (
    <div className="pr-ring">
      <svg viewBox="0 0 96 96">
        <defs>
          <linearGradient id="prRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor={ORANGE} />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#3f3f46" strokeWidth="9" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="url(#prRing)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} />
      </svg>
      <div>
        {value == null ? "N/A" : `${value.toFixed(1)}%`}
        <small>Overall</small>
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
            <span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-print.png" alt="First Fix" />
            </span>
          </div>
          <div className="pr-title">{REPORT_TITLE}</div>
        </div>
        <table className="pr-info">
          <tbody>
            <tr>
              <td className="k">Project</td>
              <td className="v">{p.projectName}</td>
              <td className="k">Contractor</td>
              <td className="v">{p.contractor}</td>
            </tr>
            <tr>
              <td className="k">HSE Manager</td>
              <td className="v">{p.hseManager}</td>
              <td className="k">Project Director</td>
              <td className="v">{p.projectDirector}</td>
            </tr>
            <tr>
              <td className="k">Auditor / Position</td>
              <td className="v">{p.assessedBy}</td>
              <td className="k">Date</td>
              <td className="v">{formatDate(p.assessmentDate)}</td>
            </tr>
          </tbody>
        </table>

        <div className="pr-grid">
          <div className="pr-col">
            <div className="pr-hd">Health and Safety</div>
            <Rows items={itemsFor(HS_ITEMS, p.hsScores)} scores={p.hsScores} />
          </div>
          <div className="pr-col">
            <div className="pr-hd">Environmental</div>
            <Rows items={itemsFor(ENV_ITEMS, p.envScores)} scores={p.envScores} />
          </div>
        </div>

        <div className="pr-scores">
          <Box title="Health & Safety Score" r={s.hs} target={p.targetPct} rating={s.hsRating} />
          <Box title="Environmental Score" r={s.env} target={p.targetPct} rating={s.envRating} />
          <div className="pr-box">
            <div className="t" style={{ background: BLACK, borderBottom: `2px solid ${ORANGE}` }}>
              Overall Performance Score
            </div>
            <div className="p">
              <Ring value={s.overall} />
            </div>
          </div>
        </div>

        <div className="pr-sign">
          {PERF_SIGN_ROLES.map(({ key, label }) => {
            const sg = p.signatures[key];
            return (
              <div key={key}>
                <div className="s">
                  {sg.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sg.image} alt={label} />
                  ) : (
                    <i>Signature</i>
                  )}
                </div>
                <div className="n">{sg.name || (key === "auditor" ? p.assessedBy : "")}</div>
                <div className="r">{label}</div>
              </div>
            );
          })}
        </div>

        {p.comments.trim() && (
          <>
            <div className="pr-h2">Comments</div>
            <div className="pr-cm">{p.comments}</div>
          </>
        )}
      </div>
    </div>
  );
}
