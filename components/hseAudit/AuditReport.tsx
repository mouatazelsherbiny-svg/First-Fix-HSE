"use client";

/**
 * Printable HSE Audit report (A4), laid out like First Fix "HSE Audit - Form
 * rev001" in our colours (black / orange):
 *  01 Scoring Form — details, HSE Documentation & Compliance Status (Y/N/N/A),
 *     HSE Project Assessment (H&S and Environmental, 0–10), the two score
 *     boxes (%, points, target, rating) and the three signatures;
 *  02 Audit Findings / Observations — category, description, evidence photo,
 *     priority, closed out;
 *  03 Corrective Action Plan — proposed action, priority, responsible
 *     department, target date, status, completion %.
 * Colours are fixed so the printout is the same in light or dark mode.
 */

import {
  CHECKLIST_SECTIONS,
  ENV_ITEMS,
  HS_ITEMS,
  HseAudit,
  PRIORITY_STYLE,
  RATING_STYLE,
  ScoreResult,
  Scores,
  TONE_STYLE,
  YesNo,
  SIGN_ROLES,
  formatDate,
  isOverdue,
  itemsFor,
  ratingOf,
  scoreOf,
  scoreTone,
  type Rating,
} from "@/lib/hseAudit";

const ORANGE = "#F36F24";
const BLACK = "#111111";
const YN: Record<YesNo, { bg: string; fg: string; label: string }> = {
  Y: { bg: "#84CC16", fg: "#111827", label: "Y" },
  N: { bg: "#DC2626", fg: "#FFFFFF", label: "N" },
  NA: { bg: "#E5E7EB", fg: "#111827", label: "N/A" },
};
const CAP_STYLE: Record<string, { bg: string; fg: string }> = {
  Open: { bg: "#FEE2E2", fg: "#B91C1C" },
  "In Progress": { bg: "#FEF3C7", fg: "#92400E" },
  Closed: { bg: "#DCFCE7", fg: "#166534" },
  "On Hold": { bg: "#E5E7EB", fg: "#374151" },
};

const CSS = `
.ar { color:#111827; background:#fff; font-family: Calibri, Carlito, Arial, Helvetica, sans-serif; font-size:10px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.ar * { box-sizing:border-box; }
.ar-page { width:210mm; min-height:297mm; margin:0 auto 12px; padding:9mm; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.12); position:relative; }
.ar-head { display:flex; align-items:center; gap:10px; background:${BLACK}; padding:6px 10px; color:#fff; border-bottom:3px solid ${ORANGE}; }
.ar-logo { background:#fff; padding:3px 8px; height:40px; display:flex; align-items:center; border-radius:3px; }
.ar-logo img { height:32px; width:auto; }
.ar-title { flex:1; text-align:center; font-size:18px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; }
.ar-info { width:100%; border-collapse:collapse; margin-top:5px; }
.ar-info td { border:1px solid #d1d5db; padding:3px 6px; }
.ar-info td.k { background:#FFF1E8; color:${BLACK}; font-weight:700; width:17%; }
.ar-band { background:${ORANGE}; color:#fff; font-weight:800; text-align:center; padding:4px; margin-top:7px; text-transform:uppercase; letter-spacing:.3px; font-size:10.5px; }
.ar-legend { text-align:center; font-weight:700; background:#F3F4F6; padding:3px; font-size:9px; border:1px solid #e5e7eb; border-top:0; }
.ar-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; margin-top:5px; }
.ar-box { border:1px solid #d1d5db; }
.ar-sec { background:${BLACK}; color:#fff; font-weight:700; text-align:center; padding:3px; text-transform:uppercase; font-size:9px; }
.ar-sub { background:#FFF1E8; color:${BLACK}; font-weight:700; text-align:center; padding:2px; text-transform:uppercase; font-size:8.5px; border-top:1px solid #e5e7eb; }
.ar-row { display:flex; align-items:center; justify-content:space-between; gap:4px; border-top:1px solid #eceff3; padding:2px 4px; min-height:17px; }
.ar-row span.l { font-size:9px; }
.ar-cell { min-width:30px; text-align:center; font-weight:700; font-size:9px; padding:1px 4px; border:1px solid #cbd5e1; }
.ar-note { text-align:center; font-size:9px; color:#374151; padding:3px; border:1px solid #e5e7eb; border-top:0; }
.ar-total { border:1px solid #d1d5db; margin-bottom:5px; }
.ar-total .pct { text-align:center; font-size:24px; font-weight:800; padding:6px 0 0; }
.ar-total .pts { text-align:center; font-size:11px; font-weight:700; color:#4b5563; padding-bottom:4px; }
.ar-total .line { display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e5e7eb; padding:3px 6px; font-weight:700; }
.ar-pill { padding:2px 8px; font-weight:800; border-radius:3px; }
.ar-table { width:100%; border-collapse:collapse; margin-top:6px; }
.ar-table th { background:${BLACK}; color:#fff; font-weight:700; padding:4px; border:1px solid ${BLACK}; text-align:left; font-size:9.5px; }
.ar-table td { border:1px solid #d1d5db; padding:4px; vertical-align:top; font-size:9.5px; }
.ar-table tr { break-inside:avoid; page-break-inside:avoid; }
.ar-ev { width:118px; height:86px; object-fit:cover; display:block; }
.ar-sign { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-top:8px; }
.ar-sign > div { border:1px solid #d1d5db; }
.ar-sign .s { height:58px; display:flex; align-items:center; justify-content:center; }
.ar-sign .s img { max-height:52px; max-width:90%; object-fit:contain; }
.ar-sign .n { border-top:1px solid #e5e7eb; padding:2px 6px; text-align:center; font-size:9px; min-height:15px; }
.ar-sign .r { background:${BLACK}; color:#fff; text-align:center; font-weight:700; padding:3px; font-size:9px; }
.ar-h2 { font-size:12px; font-weight:800; color:${BLACK}; margin-top:8px; text-transform:uppercase; border-left:4px solid ${ORANGE}; padding-left:6px; }
.ar-bar { height:7px; background:#e5e7eb; border-radius:4px; overflow:hidden; }
.ar-bar > div { height:100%; background:${ORANGE}; }
.ar-break { break-before:page; page-break-before:always; }
@media print {
  @page { size:A4; margin:0; }
  html, body { background:#fff !important; }
  .ar-page { box-shadow:none; margin:0; min-height:0; }
  .ar-noprint { display:none !important; }
}
`;

function ScoreRows({ items, scores }: { items: string[]; scores: Scores }) {
  return (
    <>
      {items.map((i) => {
        const v = scores[i];
        const t = typeof v === "number" ? TONE_STYLE[scoreTone(v)] : null;
        return (
          <div key={i} className="ar-row">
            <span className="l">{i}</span>
            <span className="ar-cell" style={t ? { background: t.bg, color: t.fg, borderColor: t.bg } : undefined}>
              {typeof v === "number" ? v : "N/A"}
            </span>
          </div>
        );
      })}
    </>
  );
}

function Total({ title, r, target, rating }: { title: string; r: ScoreResult; target: number; rating: Rating }) {
  const rs = rating ? RATING_STYLE[rating] : null;
  return (
    <div className="ar-total">
      <div className="ar-sec">{title}</div>
      <div className="pct" style={{ color: r.pct == null ? undefined : r.pct >= target ? "#15803d" : "#b91c1c" }}>
        {r.pct == null ? "N/A" : `${r.pct.toFixed(1)}%`}
      </div>
      <div className="pts">{r.max ? `${r.total} / ${r.max} Points` : "—"}</div>
      <div className="line">
        <span>Target Score</span>
        <span className="ar-pill" style={{ background: ORANGE, color: "#fff" }}>
          {target}%
        </span>
      </div>
      <div className="line">
        <span>Rating</span>
        <span className="ar-pill" style={rs ? { background: rs.bg, color: rs.fg } : undefined}>
          {rating || "—"}
        </span>
      </div>
    </div>
  );
}

function Head({ a, title, pm = "Project Director" }: { a: HseAudit; title: string; pm?: string }) {
  return (
    <>
      <div className="ar-head">
        <div className="ar-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-print.png" alt="First Fix" />
        </div>
        <div className="ar-title">{title}</div>
      </div>
      <table className="ar-info">
        <tbody>
          <tr>
            <td className="k">Project</td>
            <td>{a.projectName}</td>
            <td className="k">Contractor</td>
            <td>{a.contractor}</td>
          </tr>
          <tr>
            <td className="k">HSE Manager</td>
            <td>{a.hseManager}</td>
            <td className="k">{pm}</td>
            <td>{a.projectManager}</td>
          </tr>
          <tr>
            <td className="k">Auditor / Position</td>
            <td>{a.auditor}</td>
            <td className="k">Date</td>
            <td>{formatDate(a.auditDate)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default function AuditReport({ audit: a }: { audit: HseAudit }) {
  const hs = scoreOf(a.hsScores, HS_ITEMS);
  const env = scoreOf(a.envScores, ENV_ITEMS);
  const [docs, training, firstAid, register] = CHECKLIST_SECTIONS;
  const known = CHECKLIST_SECTIONS.flatMap((s) => s.items);
  const earlier = Object.keys(a.checklist).filter((k) => !known.includes(k));
  const findings = a.findings.filter((f) => f.observation.trim());

  const ynRows = (items: string[]) =>
    items.map((item) => {
      const v = a.checklist[item];
      const s = v ? YN[v] : null;
      return (
        <div key={item} className="ar-row">
          <span className="l">{item}</span>
          <span className="ar-cell" style={s ? { background: s.bg, color: s.fg, borderColor: s.bg } : undefined}>
            {s?.label ?? ""}
          </span>
        </div>
      );
    });

  return (
    <div className="ar">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ===== 01 Scoring Form ===== */}
      <div className="ar-page">
        <Head a={a} title="HSE Audit Form" />

        <div className="ar-band">HSE Documentation &amp; Compliance Status</div>
        <div className="ar-legend">
          <b style={{ color: "#65a30d" }}>Y</b> = FULL COMPLIANCE &nbsp;&nbsp;&nbsp;&nbsp; <b style={{ color: "#dc2626" }}>N</b> = NON COMPLIANT &nbsp;&nbsp;&nbsp;&nbsp; N/A = NOT APPLICABLE
        </div>
        <div className="ar-grid3">
          <div className="ar-box">
            <div className="ar-sec">{docs.title}</div>
            {ynRows(docs.items)}
          </div>
          <div className="ar-box">
            <div className="ar-sec">{training.title}</div>
            {ynRows(training.items)}
            <div className="ar-sub">{firstAid.title}</div>
            {ynRows(firstAid.items)}
          </div>
          <div className="ar-box">
            <div className="ar-sec">{register.title}</div>
            {ynRows(register.items)}
            {earlier.length > 0 && (
              <>
                <div className="ar-sub">Earlier form items</div>
                {ynRows(earlier)}
              </>
            )}
          </div>
        </div>

        <div className="ar-band">HSE Project Assessment</div>
        <div className="ar-note">
          All scores are rated on a scale of 0 to 10, where 0 is the lowest and 10 is the highest. Mark items as N/A where they are not applicable to the
          project at this time.
        </div>
        <div className="ar-grid3">
          <div className="ar-box">
            <div className="ar-sec" style={{ display: "flex", justifyContent: "space-between", padding: "3px 6px" }}>
              <span>Health and Safety</span>
              <span>M</span>
            </div>
            <ScoreRows items={itemsFor(HS_ITEMS, a.hsScores)} scores={a.hsScores} />
          </div>
          <div className="ar-box">
            <div className="ar-sec" style={{ display: "flex", justifyContent: "space-between", padding: "3px 6px" }}>
              <span>Environmental</span>
              <span>M</span>
            </div>
            <ScoreRows items={itemsFor(ENV_ITEMS, a.envScores)} scores={a.envScores} />
          </div>
          <div>
            <Total title="Health & Safety Score" r={hs} target={a.targetPct} rating={ratingOf(a.hsRating, hs.pct, a.targetPct)} />
            <Total title="Environmental Score" r={env} target={a.targetPct} rating={ratingOf(a.envRating, env.pct, a.targetPct)} />
          </div>
        </div>

        <div className="ar-sign">
          {SIGN_ROLES.map((role) => {
            const s = a.signatures[role.key];
            return (
              <div key={role.key}>
                <div className="r">Signature</div>
                <div className="s">
                  {s.signature && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.signature} alt="Signature" />
                  )}
                </div>
                <div className="n">{s.name}</div>
                <div className="r" style={{ background: ORANGE }}>
                  {role.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 02 Audit Findings / Observations ===== */}
      <div className="ar-page ar-break">
        <Head a={a} title="Audit Findings / Observations" pm="Project Manager" />
        <table className="ar-table">
          <thead>
            <tr>
              <th style={{ width: 22 }}>#</th>
              <th style={{ width: 100 }}>Category</th>
              <th>Description</th>
              <th style={{ width: 126 }}>Evidence</th>
              <th style={{ width: 50 }}>Priority</th>
              <th style={{ width: 62 }}>Closed Out</th>
            </tr>
          </thead>
          <tbody>
            {findings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 12 }}>
                  No findings recorded.
                </td>
              </tr>
            ) : (
              findings.map((f, i) => (
                <tr key={f.id ?? i}>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ fontWeight: 700 }}>{f.category}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{f.observation}</td>
                  <td>
                    {f.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.photo} alt="" className="ar-ev" />
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className="ar-pill" style={{ display: "inline-block", background: PRIORITY_STYLE[f.priority].bg, color: PRIORITY_STYLE[f.priority].fg }}>
                      {f.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: f.status === "Closed" ? "#15803d" : "#b91c1c" }}>
                    {f.status}
                    {f.status === "Closed" && f.closedOn && <div style={{ fontWeight: 400, color: "#374151" }}>{formatDate(f.closedOn)}</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {a.summary.trim() && (
          <>
            <div className="ar-h2">Summary</div>
            <div style={{ border: "1px solid #d1d5db", padding: 6, whiteSpace: "pre-wrap", marginTop: 4 }}>{a.summary}</div>
          </>
        )}
      </div>

      {/* ===== 03 Corrective Action Plan ===== */}
      <div className="ar-page ar-break">
        <Head a={a} title="Corrective Action Plan" pm="Project Manager" />
        <table className="ar-table">
          <thead>
            <tr>
              <th style={{ width: 22 }}>No</th>
              <th>Audit Findings / Observations</th>
              <th>Proposed Corrective Action</th>
              <th style={{ width: 50 }}>Priority</th>
              <th style={{ width: 78 }}>Responsible Department</th>
              <th style={{ width: 58 }}>Target Date</th>
              <th style={{ width: 56 }}>Status</th>
              <th style={{ width: 62 }}>Action Completion (%)</th>
            </tr>
          </thead>
          <tbody>
            {findings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 12 }}>
                  No corrective actions recorded.
                </td>
              </tr>
            ) : (
              findings.map((f, i) => (
                <tr key={f.id ?? i}>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>
                    {f.category && <b>{f.category}: </b>}
                    {f.observation}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{f.correctiveAction}</td>
                  <td>
                    <span className="ar-pill" style={{ display: "inline-block", background: PRIORITY_STYLE[f.priority].bg, color: PRIORITY_STYLE[f.priority].fg }}>
                      {f.priority}
                    </span>
                  </td>
                  <td>{f.responsibleDept}</td>
                  <td style={{ fontWeight: 700, color: isOverdue(f) ? "#b91c1c" : undefined }}>{formatDate(f.closeOutDate)}</td>
                  <td>
                    <span className="ar-pill" style={{ display: "inline-block", ...CAP_STYLE[f.capStatus] }}>
                      {f.capStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{f.completionPct}%</div>
                    <div className="ar-bar">
                      <div style={{ width: `${f.completionPct}%` }} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
