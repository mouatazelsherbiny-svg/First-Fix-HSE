"use client";

import { MATRIX, TONE_STYLE } from "@/lib/hseAudit";

/** Scoring Matrix reference (last page of the paper form), always shown at the bottom. */
export default function ScoringMatrix({ highlight = [] }: { highlight?: number[] }) {
  return (
    <div className="card mt-6 overflow-x-auto !p-0">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-bold text-brand-black">Scoring Matrix — Reference</h2>
        <p className="text-xs text-brand-gray">
          Each category is scored out of 10. The overall percentage gives the Action Status (e.g. 48% → 4 Areas at Risk).
        </p>
      </div>
      <table className="mt-3 w-full min-w-[900px] text-start text-xs">
        <thead>
          <tr className="text-white" style={{ background: "#0F5F5C" }}>
            <th className="px-3 py-2 text-start">Assessment</th>
            <th className="px-3 py-2 text-center">Score</th>
            <th className="px-3 py-2 text-start">Potential Outcomes</th>
            <th className="px-3 py-2 text-start">DAH Stop Work Notice</th>
            <th className="px-3 py-2 text-start">Close Out Actions</th>
          </tr>
        </thead>
        <tbody>
          {MATRIX.map((m) => {
            const tone = TONE_STYLE[m.tone];
            const on = highlight.includes(m.score);
            return (
              <tr
                key={m.score}
                className="border-b border-brand-border last:border-0"
                style={on ? { outline: "2px solid #F36F24", outlineOffset: -2, background: "rgba(243,111,36,0.08)" } : undefined}
              >
                <td className="px-3 py-2 font-bold uppercase" style={{ background: tone.bg, color: tone.fg }}>
                  {m.label}
                </td>
                <td className="px-3 py-2 text-center text-base font-extrabold" style={{ background: tone.bg, color: tone.fg }}>
                  {m.score}
                </td>
                <td className="px-3 py-2 text-brand-grayDark">{m.outcome}</td>
                <td className="px-3 py-2 font-semibold" style={{ color: m.stopWork === "YES" ? "#DC2626" : undefined }}>
                  {m.stopWork}
                </td>
                <td className="px-3 py-2 text-brand-grayDark">{m.action}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
