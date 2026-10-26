"use client";

import { useRef, useState } from "react";
import { Camera, FileText, Paperclip, Plus, Trash2, X } from "lucide-react";
import { PROJECTS } from "@/lib/mockData";
import { compressImage } from "@/lib/compressImage";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";
import {
  AuditFinding,
  CHECKLIST_SECTIONS,
  ENV_ITEMS,
  HS_ITEMS,
  HseAudit,
  PRIORITIES,
  PRIORITY_STYLE,
  Priority,
  Scores,
  TONE_STYLE,
  YesNo,
  auditToDb,
  findingToDb,
  isOverdue,
  scoreOf,
  scoreTone,
} from "@/lib/hseAudit";
import ScorePanel from "./ScorePanel";
import ScoringMatrix from "./ScoringMatrix";

const MAX_REPORT_BYTES = 8 * 1024 * 1024;

function newFinding(no: number): AuditFinding {
  return {
    itemNo: no,
    category: "",
    observation: "",
    photo: "",
    priority: "High",
    closeOutDate: "",
    status: "Open",
    closedOn: "",
    closureNote: "",
  };
}

const YN_STYLE: Record<YesNo, { bg: string; fg: string; label: string }> = {
  Y: { bg: "#84CC16", fg: "#1F2937", label: "Y" },
  N: { bg: "#DC2626", fg: "#FFFFFF", label: "N" },
  NA: { bg: "#FFFFFF", fg: "#1F2937", label: "N/A" },
};

export default function AuditForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: HseAudit;
  onSaved: (id: string) => void;
  onCancel: () => void;
}) {
  const [a, setA] = useState<HseAudit>(initial);
  const [removed, setRemoved] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<HseAudit>) => setA((prev) => ({ ...prev, ...patch }));
  const setFinding = (i: number, patch: Partial<AuditFinding>) =>
    setA((prev) => ({ ...prev, findings: prev.findings.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }));

  const projects = PROJECTS.includes(a.projectName) || !a.projectName ? PROJECTS : [a.projectName, ...PROJECTS];

  const handleReport = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_REPORT_BYTES) return setError("The report file is larger than 8 MB — please upload a smaller copy.");
    const reader = new FileReader();
    reader.onload = () => set({ reportFile: reader.result as string, reportFileName: file.name });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setError("");
    if (!a.projectName) return setError("Choose the project.");
    if (!a.auditDate) return setError("Enter the audit date.");
    const findings = a.findings.filter((f) => f.observation.trim());
    if (a.findings.some((f) => !f.observation.trim() && (f.category || f.photo)))
      return setError("Each finding needs an observation.");
    setSaving(true);
    try {
      let id = a.id;
      if (id) {
        const { error: e } = await supabase.from("hse_audits").update(auditToDb(a)).eq("id", id);
        if (e) throw e;
      } else {
        const created_by = await getCurrentUserId();
        const { data, error: e } = await supabase
          .from("hse_audits")
          .insert({ ...auditToDb(a), created_by })
          .select("id")
          .single();
        if (e) throw e;
        id = data.id as string;
      }
      if (removed.length) {
        const { error: e } = await supabase.from("hse_audit_findings").delete().in("id", removed);
        if (e) throw e;
      }
      for (const [i, f] of findings.entries()) {
        const row = findingToDb({ ...f, itemNo: i + 1 }, id!);
        const { error: e } = f.id
          ? await supabase.from("hse_audit_findings").update(row).eq("id", f.id)
          : await supabase.from("hse_audit_findings").insert(row);
        if (e) throw e;
      }
      onSaved(id!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save the audit");
    } finally {
      setSaving(false);
    }
  };

  const hs = scoreOf(a.hsScores, HS_ITEMS);
  const env = scoreOf(a.envScores, ENV_ITEMS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-brand-black">Audit Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label-field">Project *</label>
            <select className="input-field" value={a.projectName} onChange={(e) => set({ projectName: e.target.value })}>
              <option value="" disabled>
                Select project
              </option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Field label="Contractor" value={a.contractor} onChange={(v) => set({ contractor: v })} />
          <div>
            <label className="label-field">Date *</label>
            <input type="date" className="input-field" value={a.auditDate} onChange={(e) => set({ auditDate: e.target.value })} />
          </div>
          <Field label="HSE Manager" value={a.hseManager} onChange={(v) => set({ hseManager: v })} />
          <Field label="Project Manager" value={a.projectManager} onChange={(v) => set({ projectManager: v })} />
          <Field label="Auditor / Position" value={a.auditor} onChange={(v) => set({ auditor: v })} />
        </div>
      </div>

      {/* Y / N / N/A checklist */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-black">Compliance Checklist</h2>
          <p className="text-xs text-brand-gray">Y = Full compliance · N = Non compliant · N/A = Not applicable</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {CHECKLIST_SECTIONS.map((sec) => (
            <div key={sec.title} className="overflow-hidden rounded-xl border border-brand-border">
              <p className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white" style={{ background: "#0F5F5C" }}>
                {sec.title}
              </p>
              {sec.items.map((item) => (
                <div key={item} className="flex items-center justify-between gap-2 border-t border-brand-border px-3 py-1.5">
                  <span className="text-xs text-brand-grayDark">{item}</span>
                  <div className="flex shrink-0 gap-1">
                    {(["Y", "N", "NA"] as YesNo[]).map((v) => {
                      const on = a.checklist[item] === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            set({
                              checklist: on
                                ? Object.fromEntries(Object.entries(a.checklist).filter(([k]) => k !== item))
                                : { ...a.checklist, [item]: v },
                            })
                          }
                          className="h-6 min-w-[2.1rem] rounded-md border px-1 text-[11px] font-bold transition"
                          style={
                            on
                              ? { background: YN_STYLE[v].bg, color: YN_STYLE[v].fg, borderColor: v === "NA" ? "#1F2937" : YN_STYLE[v].bg }
                              : { background: "transparent", color: "#9CA3AF", borderColor: "#E5E7EB" }
                          }
                        >
                          {YN_STYLE[v].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scores */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-black">Scoring (1 – 10)</h2>
          <p className="text-xs text-brand-gray">Leave as N/A if not applicable to the project at this time.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <ScoreList title="Health and Safety" items={HS_ITEMS} scores={a.hsScores} onChange={(s) => set({ hsScores: s })} />
          <ScoreList title="Environmental" items={ENV_ITEMS} scores={a.envScores} onChange={(s) => set({ envScores: s })} />
          <div className="space-y-4">
            <ScorePanel title="Health & Safety Score" result={hs} target={a.targetPct} />
            <ScorePanel title="Environmental Score" result={env} target={a.targetPct} />
            <div>
              <label className="label-field">Target %</label>
              <input
                type="number"
                min={1}
                max={100}
                className="input-field"
                value={a.targetPct}
                onChange={(e) => set({ targetPct: Number(e.target.value) || 70 })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-black">Findings &amp; Close Out</h2>
          <button
            type="button"
            className="btn-secondary gap-2"
            onClick={() => set({ findings: [...a.findings, newFinding(a.findings.length + 1)] })}
          >
            <Plus className="h-4 w-4" /> Add Finding
          </button>
        </div>
        {a.findings.length === 0 && <p className="text-sm text-brand-gray">No findings added.</p>}
        <datalist id="audit-categories">
          {[...HS_ITEMS, ...ENV_ITEMS].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="space-y-4">
          {a.findings.map((f, i) => (
            <FindingEditor
              key={f.id ?? `new-${i}`}
              no={i + 1}
              f={f}
              onChange={(patch) => setFinding(i, patch)}
              onRemove={() => {
                if (f.id) setRemoved((r) => [...r, f.id!]);
                set({ findings: a.findings.filter((_, idx) => idx !== i) });
              }}
            />
          ))}
        </div>
      </div>

      {/* Summary & report */}
      <div className="card">
        <h2 className="mb-4 text-lg font-bold text-brand-black">Summary</h2>
        <textarea
          className="input-field min-h-[110px]"
          value={a.summary}
          onChange={(e) => set({ summary: e.target.value })}
          placeholder="Brief summary of the audit…"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary gap-2" onClick={() => reportRef.current?.click()}>
            <Paperclip className="h-4 w-4" /> {a.reportFile ? "Replace Report File" : "Attach Report File (PDF)"}
          </button>
          <input
            ref={reportRef}
            type="file"
            accept=".pdf,image/*,.xlsx,.docx"
            className="hidden"
            onChange={(e) => {
              handleReport(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          {a.reportFile && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand-grayLight/60 px-3 py-1.5 text-sm text-brand-grayDark">
              <FileText className="h-4 w-4 text-brand-orange" />
              {a.reportFileName || "Report"}
              <button type="button" onClick={() => set({ reportFile: "", reportFileName: "" })} aria-label="Remove file">
                <X className="h-4 w-4 text-brand-gray hover:text-red-500" />
              </button>
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save Audit"}
        </button>
      </div>

      <ScoringMatrix highlight={[hs.level?.score, env.level?.score].filter((x): x is number => x != null)} />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label-field">{label}</label>
      <input className="input-field" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ScoreList({
  title,
  items,
  scores,
  onChange,
}: {
  title: string;
  items: string[];
  scores: Scores;
  onChange: (s: Scores) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-border">
      <p className="flex justify-between px-3 py-2 text-xs font-bold uppercase tracking-wide text-white" style={{ background: "#0F5F5C" }}>
        <span>{title}</span>
        <span>Score</span>
      </p>
      {items.map((item) => {
        const v = scores[item];
        const tone = typeof v === "number" ? TONE_STYLE[scoreTone(v)] : null;
        return (
          <div key={item} className="flex items-center justify-between gap-2 border-t border-brand-border px-3 py-1.5">
            <span className="text-xs text-brand-grayDark">{item}</span>
            <select
              value={typeof v === "number" ? String(v) : ""}
              onChange={(e) => {
                const next = { ...scores };
                if (e.target.value) next[item] = Number(e.target.value);
                else delete next[item];
                onChange(next);
              }}
              className="h-7 w-[4.2rem] shrink-0 rounded-md border border-brand-border text-center text-xs font-bold"
              style={tone ? { background: tone.bg, color: tone.fg } : undefined}
            >
              <option value="">N/A</option>
              {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function FindingEditor({
  no,
  f,
  onChange,
  onRemove,
}: {
  no: number;
  f: AuditFinding;
  onChange: (patch: Partial<AuditFinding>) => void;
  onRemove: () => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const overdue = isOverdue(f);
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: overdue ? "#DC2626" : undefined, background: overdue ? "rgba(220,38,38,0.05)" : undefined }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-brand-black">
          Finding {no}
          {overdue && <span className="ms-2 text-xs font-semibold text-red-600">Overdue</span>}
        </p>
        <button type="button" onClick={onRemove} className="text-brand-gray hover:text-red-500" aria-label="Remove finding">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-field">Category</label>
            <input className="input-field" list="audit-categories" value={f.category} onChange={(e) => onChange({ category: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Observation *</label>
            <textarea className="input-field min-h-[80px]" value={f.observation} onChange={(e) => onChange({ observation: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p: Priority) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ priority: p })}
                  className="flex-1 rounded-lg border px-2 py-2 text-xs font-bold"
                  style={
                    f.priority === p
                      ? { background: PRIORITY_STYLE[p].bg, color: PRIORITY_STYLE[p].fg, borderColor: PRIORITY_STYLE[p].bg }
                      : { color: "#6B7280" }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-field">Close Out Date</label>
            <input type="date" className="input-field" value={f.closeOutDate} onChange={(e) => onChange({ closeOutDate: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Status</label>
            <select
              className="input-field"
              value={f.status}
              onChange={(e) =>
                onChange({
                  status: e.target.value as AuditFinding["status"],
                  closedOn: e.target.value === "Closed" ? f.closedOn || new Date().toISOString().slice(0, 10) : "",
                })
              }
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          {f.status === "Closed" && (
            <div>
              <label className="label-field">Closed On</label>
              <input type="date" className="input-field" value={f.closedOn} onChange={(e) => onChange({ closedOn: e.target.value })} />
            </div>
          )}
          {f.status === "Closed" && (
            <div className="sm:col-span-2">
              <label className="label-field">Close Out Note</label>
              <input className="input-field" value={f.closureNote} onChange={(e) => onChange({ closureNote: e.target.value })} />
            </div>
          )}
        </div>
        <div>
          <label className="label-field">Evidence</label>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-brand-border bg-brand-grayLight/40 text-brand-gray hover:border-brand-orange"
          >
            {f.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.photo} alt="Evidence" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs">
                <Camera className="h-6 w-6" /> Add photo
              </span>
            )}
          </button>
          {f.photo && (
            <button type="button" onClick={() => onChange({ photo: "" })} className="mt-1 text-xs text-red-500">
              Remove photo
            </button>
          )}
          {photoError && <p className="mt-1 text-xs text-red-500">{photoError}</p>}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setPhotoError("");
              try {
                onChange({ photo: await compressImage(file, 1024, 0.7) });
              } catch (err) {
                setPhotoError(err instanceof Error ? err.message : "Could not read the photo");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
