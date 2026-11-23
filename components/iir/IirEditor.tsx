"use client";

/**
 * Create / edit one IIR: the form (IirSheet) with Save, Word and PDF.
 * Used by the main app (admin: /iir/new, /iir/[id]) and the phone app
 * (/m/reports/iir — everyone). PDF opens the print view (/iir/[id]/print)
 * after saving; Word is built in the browser from the company's own form.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, FileDown, FileText, Loader2, Save } from "lucide-react";
import IirSheet from "@/components/iir/IirSheet";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { emptyIir, emptyPhoto, mapIir, toIirRow, type IirReport } from "@/lib/iir";
import { exportIirWord } from "@/lib/iirWord";

const today = () => new Date().toISOString().slice(0, 10);

function blankReport(name: string): IirReport {
  const data = emptyIir();
  data.reportDate = today();
  data.reportTime = new Date().toTimeString().slice(0, 5);
  return { createdByName: name, status: "Submitted", data, coverPhoto: "", photos: [emptyPhoto(), emptyPhoto()], signatures: { hse: "", pm: "" } };
}

export default function IirEditor({
  id,
  variant,
  onSaved,
}: {
  /** Existing report to edit; none = a new one. */
  id?: string;
  variant: "admin" | "mobile";
  /** Called after a new report is saved the first time. */
  onSaved?: (id: string) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState<IirReport | null>(id ? null : blankReport(user?.name ?? ""));
  const [savedId, setSavedId] = useState<string | undefined>(id);
  const [busy, setBusy] = useState<"" | "save" | "word" | "pdf">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("iir_reports")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setMsg({ ok: false, text: "Report not found." });
        else setReport(mapIir(data));
      });
  }, [id]);

  const save = async (): Promise<string | undefined> => {
    if (!report) return;
    if (!report.data.project.trim()) {
      setMsg({ ok: false, text: "Please enter the Project (section 1)." });
      return;
    }
    setBusy("save");
    setMsg(null);
    try {
      const row = toIirRow({ ...report, createdByName: report.createdByName || user?.name || "" });
      if (savedId) {
        const { error } = await supabase.from("iir_reports").update(row).eq("id", savedId);
        if (error) throw error;
        setMsg({ ok: true, text: "IIR saved." });
        return savedId;
      }
      const { data, error } = await supabase.from("iir_reports").insert(row).select("id").single();
      if (error) throw error;
      setSavedId(data.id);
      setMsg({ ok: true, text: "IIR submitted." });
      onSaved?.(data.id);
      return data.id as string;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not save the IIR." });
    } finally {
      setBusy("");
    }
  };

  const word = async () => {
    if (!report) return;
    setBusy("word");
    try {
      await exportIirWord(report);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not create the Word file." });
    } finally {
      setBusy("");
    }
  };

  const pdf = async () => {
    const sid = await save();
    if (sid) router.push(`/iir/${sid}/print`);
  };

  if (!report) {
    return <p className="py-16 text-center text-sm text-white/60">{msg?.text ?? "Loading…"}</p>;
  }

  const btn = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60";

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#0e0e10]/90 px-1 py-2 backdrop-blur" style={variant === "mobile" ? { top: "calc(56px + env(safe-area-inset-top))" } : undefined}>
        <button type="button" onClick={save} disabled={!!busy} className={`${btn} bg-[#f36f24] text-white shadow-[0_0_14px_rgba(243,111,36,0.45)] hover:bg-[#ff7d33]`}>
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {savedId ? "Save" : "Submit IIR"}
        </button>
        <button type="button" onClick={word} disabled={!!busy} className={`${btn} border border-[#2b579a]/70 bg-[#2b579a]/20 text-white hover:bg-[#2b579a]/40`}>
          {busy === "word" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Word
        </button>
        <button type="button" onClick={pdf} disabled={!!busy} className={`${btn} border border-red-500/60 bg-red-500/15 text-white hover:bg-red-500/30`}>
          <FileText className="h-4 w-4" />
          PDF
        </button>
        {msg && (
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${msg.ok ? "text-green-400" : "text-red-400"}`}>
            {msg.ok && <CircleCheck className="h-4 w-4" />}
            {msg.text}
          </span>
        )}
      </div>

      <div className="mx-auto max-w-[900px] rounded-xl bg-white p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] sm:p-6">
        <IirSheet mode="edit" report={report} onChange={setReport} />
      </div>
    </div>
  );
}
