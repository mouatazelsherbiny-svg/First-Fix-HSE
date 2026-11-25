"use client";

/**
 * New / edit a Weekly Performance Report (the First Fix form): Project,
 * Contractor, HSE Manager, Project Director, Auditor / Position, Date; Health
 * and Safety and Environmental scored 0–10 (or N/A); the H&S, Environmental
 * and Overall Performance scores; the three signatures (HSE Auditor, Regional
 * HSE Manager, HSE Director). Save, then Word / PDF.
 */

import { useState } from "react";
import { FileDown, FileText, Loader2, Save } from "lucide-react";
import { Field, RatingPicker, ScoreList } from "@/components/hseAudit/AuditForm";
import ScorePanel from "@/components/hseAudit/ScorePanel";
import SignaturePad from "@/components/SignaturePad";
import { PROJECTS } from "@/lib/mockData";
import { getCurrentUserId, supabase } from "@/lib/supabaseClient";
import { ENV_ITEMS, HS_ITEMS, itemsFor, ratingOf, scoreOf } from "@/lib/hseAudit";
import { PERF_SIGN_ROLES, REPORT_TITLE, overallOf, toPerformanceRow, weekLabel, type HsePerformance } from "@/lib/hsePerformance";
import { ScoreRing } from "@/components/hseAudit/SummaryWidgets";
import { exportPerformanceWord } from "@/lib/hsePerformanceWord";

export default function PerformanceForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: HsePerformance;
  onSaved: (id: string) => void;
  onCancel: () => void;
}) {
  const [p, setP] = useState<HsePerformance>(initial);
  const [busy, setBusy] = useState<"" | "save" | "word">("");
  const [error, setError] = useState("");
  const set = (patch: Partial<HsePerformance>) => setP((x) => ({ ...x, ...patch }));
  const hs = scoreOf(p.hsScores, HS_ITEMS);
  const env = scoreOf(p.envScores, ENV_ITEMS);
  const projects = PROJECTS.includes(p.projectName) || !p.projectName ? PROJECTS : [p.projectName, ...PROJECTS];

  const save = async () => {
    setError("");
    if (!p.projectName) return setError("Choose the project.");
    if (!p.assessmentDate) return setError("Enter the date.");
    setBusy("save");
    try {
      if (p.id) {
        const { error: e } = await supabase.from("hse_performance").update(toPerformanceRow(p)).eq("id", p.id);
        if (e) throw e;
        onSaved(p.id);
      } else {
        const created_by = await getCurrentUserId();
        const { data, error: e } = await supabase.from("hse_performance").insert({ ...toPerformanceRow(p), created_by }).select("id").single();
        if (e) throw e;
        onSaved(data.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the report.");
    } finally {
      setBusy("");
    }
  };

  const word = async () => {
    setBusy("word");
    try {
      await exportPerformanceWord(p);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Details — as on the Weekly Performance Report */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-black">{REPORT_TITLE}</h2>
          {p.assessmentDate && <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold text-brand-orange">{weekLabel(p.assessmentDate)}</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Project *</label>
            <select className="input-field" value={p.projectName} onChange={(e) => set({ projectName: e.target.value })}>
              <option value="">Choose…</option>
              {projects.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
          <Field label="Contractor" value={p.contractor} onChange={(v) => set({ contractor: v })} />
          <Field label="HSE Manager" value={p.hseManager} onChange={(v) => set({ hseManager: v })} />
          <Field label="Project Director" value={p.projectDirector} onChange={(v) => set({ projectDirector: v })} />
          <Field label="Auditor / Position" value={p.assessedBy} onChange={(v) => set({ assessedBy: v })} />
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <div>
              <label className="label-field">Date *</label>
              <input type="date" className="input-field" value={p.assessmentDate} onChange={(e) => set({ assessmentDate: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Target %</label>
              <input type="number" min={0} max={100} className="input-field" value={p.targetPct} onChange={(e) => set({ targetPct: Number(e.target.value) || 0 })} />
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-black">Health and Safety · Environmental</h2>
          <p className="text-xs text-brand-gray">Score each item 0 to 10 (0 lowest, 10 highest). N/A where it does not apply this week.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <ScoreList title="Health and Safety" items={itemsFor(HS_ITEMS, p.hsScores)} scores={p.hsScores} onChange={(s) => set({ hsScores: s })} />
          <ScoreList title="Environmental" items={itemsFor(ENV_ITEMS, p.envScores)} scores={p.envScores} onChange={(s) => set({ envScores: s })} />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="space-y-3">
            <ScorePanel title="Health & Safety Score" result={hs} target={p.targetPct} />
            <RatingPicker value={p.hsRating} auto={ratingOf("", hs.pct, p.targetPct)} onChange={(v) => set({ hsRating: v })} />
          </div>
          <div className="space-y-3">
            <ScorePanel title="Environmental Score" result={env} target={p.targetPct} />
            <RatingPicker value={p.envRating} auto={ratingOf("", env.pct, p.targetPct)} onChange={(v) => set({ envRating: v })} />
          </div>
          <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-[#111111] text-white">
            <p className="border-b-2 border-[#f36f24] px-3 py-2 text-center text-xs font-bold uppercase tracking-wide">Overall Performance Score</p>
            <div className="flex flex-1 items-center justify-center py-4">
              <ScoreRing value={overallOf(hs.pct, env.pct)} />
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-brand-black">Signatures</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {PERF_SIGN_ROLES.map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-brand-border p-3">
              <p className="mb-2 rounded-md bg-[#111111] px-3 py-1.5 text-center text-sm font-bold text-white">{label}</p>
              <Field label="Name" value={p.signatures[key].name} onChange={(v) => set({ signatures: { ...p.signatures, [key]: { ...p.signatures[key], name: v } } })} />
              <div className="mt-3">
                <SignaturePad label="Signature" value={p.signatures[key].image} onChange={(v) => set({ signatures: { ...p.signatures, [key]: { ...p.signatures[key], image: v } } })} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <label className="label-field">Comments</label>
          <textarea className="input-field min-h-[110px]" value={p.comments} onChange={(e) => set({ comments: e.target.value })} />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        {p.id && (
          <>
            <button type="button" onClick={word} disabled={!!busy} className="btn-secondary gap-2 disabled:opacity-60">
              {busy === "word" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Word
            </button>
            <a href={`/hse-performance/${p.id}/print`} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-2">
              <FileText className="h-4 w-4" /> PDF
            </a>
          </>
        )}
        <button type="button" onClick={save} disabled={!!busy} className="btn-primary gap-2 disabled:opacity-60">
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {p.id ? "Save" : "Save Report"}
        </button>
      </div>
    </div>
  );
}
