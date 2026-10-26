"use client";

/**
 * Printable HSE Audit report (A4) — same layout as the First Fix
 * "HSE Audit Form – Scoring Rate": details, Y/N/N/A checklist, scores
 * with Action Status, findings with evidence photos and close-out dates,
 * signatures and the scoring matrix. Colours are fixed (not theme tokens)
 * so the printout looks the same in light or dark mode.
 */

import {
  CHECKLIST_SECTIONS,
  ENV_ITEMS,
  HS_ITEMS,
  HseAudit,
  MATRIX,
  PRIORITY_STYLE,
  ScoreResult,
  Scores,
  TONE_STYLE,
  YesNo,
  formatDate,
  isOverdue,
  scoreOf,
  scoreTone,
} from "@/lib/hseAudit";

const TEAL = "#0F5F5C";
const YN: Record<YesNo, { bg: string; fg: string; label: string }> = {
  Y: { bg: "#84CC16", fg: "#111827", label: "Y" },
  N: { bg: "#DC2626", fg: "#FFFFFF", label: "N" },
  NA: { bg: "#FFFFFF", fg: "#111827", label: "N/A" },
};

const CSS = `
.ar { color:#111827; background:#fff; font-family: Arial, Helvetica, sans-serif; font-size:10px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.ar * { box-sizing:border-box; }
.ar-page { width:210mm; min-height:297mm; margin:0 auto 12px; padding:9mm; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.12); }
.ar-head { display:flex; align-items:center; gap:10px; background:${TEAL}; padding:6px 10px; color:#fff; }
.ar-logo { background:#fff; padding:3px 8px; height:42px; display:flex; align-items:center; }
.ar-logo img { height:36px; width:auto; }
.ar-title { flex:1; text-align:center; font-size:19px; font-weight:800; letter-spacing:.3px; }
.ar-info { width:100%; border-collapse:collapse; margin-top:4px; }
.ar-info td { border:1px solid #cbd5e1; padding:3px 6px; }
.ar-info td.k { background:${TEAL}; color:#fff; font-weight:700; width:16%; }
.ar-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; margin-top:6px; }
.ar-box { border:1px solid #cbd5e1; }
.ar-sec { background:${TEAL}; color:#fff; font-weight:700; text-align:center; padding:3px; text-transform:uppercase; font-size:9.5px; }
.ar-row { display:flex; align-items:center; justify-content:space-between; gap:4px; border-top:1px solid #e2e8f0; padding:2px 4px; min-height:17px; }
.ar-row span.l { font-size:9px; }
.ar-cell { min-width:30px; text-align:center; font-weight:700; font-size:9px; padding:1px 4px; border:1px solid #94a3b8; }
.ar-legend { display:grid; grid-template-columns:repeat(3,1fr); margin-top:4px; text-align:center; font-weight:700; background:#d1d5db; padding:3px; font-size:9.5px; }
.ar-total { border:1px solid #cbd5e1; margin-bottom:5px; }
.ar-total .big { text-align:center; font-size:22px; font-weight:800; padding:4px 0 0; }
.ar-total .pct { text-align:center; font-size:18px; font-weight:800; padding-bottom:4px; }
.ar-total .line { display:flex; justify-content:space-between; align-items:center; border-top:1px solid #cbd5e1; padding:3px 6px; font-weight:700; }
.ar-pill { padding:2px 8px; font-weight:800; }
.ar-note { color:#b45309; font-size:8.5px; margin-top:4px; }
.ar-table { width:100%; border-collapse:collapse; margin-top:6px; }
.ar-table th { background:${TEAL}; color:#fff; font-weight:700; padding:4px; border:1px solid ${TEAL}; text-align:left; font-size:9.5px; }
.ar-table td { border:1px solid #cbd5e1; padding:4px; vertical-align:top; font-size:9.5px; }
.ar-table tr { break-inside:avoid; page-break-inside:avoid; }
.ar-ev { width:120px; height:90px; object-fit:cover; display:block; }
.ar-sign { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-top:10px; }
.ar-sign div { border:1px solid #cbd5e1; height:62px; display:flex; align-items:flex-end; padding:4px 6px; background:#f8fafc; font-style:italic; color:${TEAL}; font-weight:700; }
.ar-h2 { font-size:12px; font-weight:800; color:${TEAL}; margin-top:8px; text-transform:uppercase; }
.ar-break { break-before:page; page-break-before:always; }
.ar-keep { break-inside:avoid; page-break-inside:avoid; }
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

function Total({ title, r, target }: { title: string; r: ScoreResult; target: number }) {
  const tone = r.level ? TONE_STYLE[r.level.tone] : null;
  return (
    <div className="ar-total">
      <div className="ar-sec">{title}</div>
      <div className="big">{r.max ? `${r.total} / ${r.max}` : "N/A"}</div>
      <div className="pct" style={{ color: r.pct == null ? undefined : r.pct >= target ? "#15803d" : "#b91c1c" }}>
        {r.pct == null ? "—" : `${r.pct.toFixed(1)}%`}
      </div>
      <div className="line">
        <span>Target %</span>
        <span className="ar-pill" style={{ background: TEAL, color: "#fff" }}>
          {target}%
        </span>
      </div>
      <div className="line">
        <span>Action Status</span>
        <span className="ar-pill" style={tone ? { background: tone.bg, color: tone.fg } : undefined}>
          {r.level?.label ?? "—"}
        </span>
      </div>
    </div>
  );
}

function Head({ a }: { a: HseAudit }) {
  return (
    <>
      <div className="ar-head">
        <div className="ar-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-print.png" alt="First Fix" />
        </div>
        <div className="ar-title">HSE AUDIT FORM – SCORING RATE</div>
      </div>
      <table className="ar-info">
        <tbody>
          <tr>
            <td className="k">Project</td>
            <td>{a.projectName}</td>
            <td className="k">Contractor</td>
            <td>{a.contractor}</td>
            <td className="k">Date</td>
            <td>{formatDate(a.auditDate)}</td>
          </tr>
          <tr>
            <td className="k">HSE Manager</td>
            <td>{a.hseManager}</td>
            <td className="k">Project Manager</td>
            <td>{a.projectManager}</td>
            <td className="k">Auditor</td>
            <td>{a.auditor}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default function AuditReport({ audit: a }: { audit: HseAudit }) {
  const hs = scoreOf(a.hsScores, HS_ITEMS);
  const env = scoreOf(a.envScores, ENV_ITEMS);
  const cols = [CHECKLIST_SECTIONS.slice(0, 3), CHECKLIST_SECTIONS.slice(3, 5), CHECKLIST_SECTIONS.slice(5)];
  const findings = a.findings.filter((f) => f.observation.trim());

  return (
    <div className="ar">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Page 1 — checklist and scores */}
      <div className="ar-page">
        <Head a={a} />
        <div className="ar-grid3">
          {cols.map((secs, ci) => (
            <div key={ci} className="ar-box">
              {secs.map((sec) => (
                <div key={sec.title}>
                  <div className="ar-sec">{sec.title}</div>
                  {sec.items.map((item) => {
                    const v = a.checklist[item];
                    const s = v ? YN[v] : null;
                    return (
                      <div key={item} className="ar-row">
                        <span className="l">{item}</span>
                        <span className="ar-cell" style={s ? { background: s.bg, color: s.fg } : undefined}>
                          {s?.label ?? ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="ar-legend">
          <span>
            <b style={{ color: "#65a30d" }}>Y</b> = FULL COMPLIANCE
          </span>
          <span>
            <b style={{ color: "#dc2626" }}>N</b> = NON COMPLIANT
          </span>
          <span>N/A = NOT APPLICABLE</span>
        </div>

        <div className="ar-grid3">
          <div className="ar-box">
            <div className="ar-sec">Health and Safety</div>
            <ScoreRows items={HS_ITEMS} scores={a.hsScores} />
          </div>
          <div className="ar-box">
            <div className="ar-sec">Environmental</div>
            <ScoreRows items={ENV_ITEMS} scores={a.envScores} />
          </div>
          <div>
            <Total title="Health & Safety Score" r={hs} target={a.targetPct} />
            <Total title="Environmental Score" r={env} target={a.targetPct} />
            <p className="ar-note">
              Where a compliant score is achieved overall, actions are still required to close out any areas marked Amber or
              Red within the report.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 4, textAlign: "center", fontWeight: 700, color: TEAL }}>
          All scores are out of 10 (N/A if not applicable to the project at this time)
        </p>
      </div>

      {/* Page 2 — findings and close out */}
      <div className="ar-page ar-break">
        <Head a={a} />
        <div className="ar-h2">Findings &amp; Required Close Out</div>
        <table className="ar-table">
          <thead>
            <tr>
              <th style={{ width: 22 }}>No.</th>
              <th style={{ width: 90 }}>Category</th>
              <th>Observation</th>
              <th style={{ width: 128 }}>Evidence</th>
              <th style={{ width: 44 }}>Priority</th>
              <th style={{ width: 62 }}>Close Out By</th>
              <th style={{ width: 120 }}>Corrective Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {findings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 12 }}>
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
                    <span
                      className="ar-pill"
                      style={{ display: "inline-block", background: PRIORITY_STYLE[f.priority].bg, color: PRIORITY_STYLE[f.priority].fg }}
                    >
                      {f.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: isOverdue(f) ? "#b91c1c" : undefined }}>
                    {formatDate(f.closeOutDate)}
                    {f.status === "Closed" && (
                      <div style={{ color: "#15803d", fontWeight: 700, marginTop: 2 }}>Closed {formatDate(f.closedOn)}</div>
                    )}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{f.status === "Closed" ? f.closureNote : ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="ar-h2">Summary</div>
        <div style={{ border: "1px solid #cbd5e1", padding: 6, minHeight: 50, whiteSpace: "pre-wrap", marginTop: 4 }}>{a.summary}</div>

        <div className="ar-sign">
          <div>HSE Auditor</div>
          <div>FF Project / Site Manager Signature</div>
          <div>First Fix HSE Director</div>
        </div>

        <div className="ar-keep">
        <div className="ar-h2" style={{ marginTop: 12 }}>
          Scoring Matrix
        </div>
        <table className="ar-table">
          <thead>
            <tr>
              <th style={{ width: 38 }}>Score</th>
              <th style={{ width: 150 }}>Assessment</th>
              <th>Close Out Actions</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((m) => (
              <tr key={m.score}>
                <td style={{ textAlign: "center", fontWeight: 800, background: TONE_STYLE[m.tone].bg, color: TONE_STYLE[m.tone].fg }}>
                  {m.score}
                </td>
                <td style={{ fontWeight: 700 }}>{m.label}</td>
                <td>{m.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
