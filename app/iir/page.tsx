"use client";

/** IIR — Incident Investigation Reports (main app, admin only): every report, open / Word / PDF, and New IIR. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDown, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import AdminOnly from "@/components/iir/AdminOnly";
import { DarkPanel, SEARCH_INPUT, TABLE_TITLE, TD, TH, TH_ROW, TR } from "@/components/charts/InjuryStyle";
import { useProjectScoped } from "@/context/ProjectFilterContext";
import { supabase } from "@/lib/supabaseClient";
import { fmtDate, IIR_LIST_COLUMNS, mapIir, tlpTone, type IirReport } from "@/lib/iir";
import { exportIirWord } from "@/lib/iirWord";

export default function IirListPage() {
  return (
    <ProtectedRoute>
      <AdminOnly>
        <IirList />
      </AdminOnly>
    </ProtectedRoute>
  );
}

const TONE: Record<string, string> = { high: "bg-red-600 text-white", medium: "bg-yellow-400 text-black", low: "bg-green-500 text-black" };

function IirList() {
  const router = useRouter();
  const [rows, setRows] = useState<IirReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");

  const load = () =>
    supabase
      .from("iir_reports")
      .select(IIR_LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []).map(mapIir));
        setLoading(false);
      });
  useEffect(() => {
    load();
  }, []);

  const scoped = useProjectScoped(rows, (r) => r.data.project);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? scoped.filter((r) => [r.data.project, r.data.coverCategory, r.createdByName, r.data.location, r.data.firstName, r.data.surname].join(" ").toLowerCase().includes(q))
      : scoped;
  }, [scoped, query]);

  const word = async (id: string) => {
    setBusy(id);
    try {
      const { data } = await supabase.from("iir_reports").select("*").eq("id", id).single();
      if (data) await exportIirWord(mapIir(data));
    } finally {
      setBusy("");
    }
  };
  const remove = async (r: IirReport) => {
    if (!r.id || !window.confirm(`Delete the IIR for ${r.data.project || "this project"}?`)) return;
    await supabase.from("iir_reports").delete().eq("id", r.id);
    setRows((x) => x.filter((y) => y.id !== r.id));
  };

  return (
    <div>
      <PageTitle section="IIR" title="Incident Investigation Report">
        <Link href="/iir/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> New IIR
        </Link>
      </PageTitle>
      <DarkPanel>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className={TABLE_TITLE}>Reports</h2>
          <label className="relative w-full sm:ms-auto sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search project, category, employee…" className={SEARCH_INPUT} />
          </label>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full min-w-[900px] text-start text-sm">
            <thead>
              <tr className={TH_ROW}>
                <th className={`${TH} rounded-s-lg`}>Project</th>
                <th className={TH}>Incident Category</th>
                <th className={TH}>Incident Date</th>
                <th className={TH}>Location</th>
                <th className={`${TH} !text-center`}>Total Loss Potential</th>
                <th className={TH}>Filed by</th>
                <th className={`${TH} rounded-e-lg !text-center`}>Export</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/50">
                    No IIR yet — click New IIR to add the first one.
                  </td>
                </tr>
              ) : (
                list.map((r) => {
                  const tone = tlpTone(r.data.tlp);
                  return (
                    <tr key={r.id} onClick={() => router.push(`/iir/${r.id}`)} className={`${TR} cursor-pointer`}>
                      <td className={`${TD} font-bold text-white`}>{r.data.project || "—"}</td>
                      <td className={`${TD} text-white/85`}>{r.data.coverCategory || "—"}</td>
                      <td className={`${TD} whitespace-nowrap text-white/80`}>{fmtDate(r.data.incidentDate) || "—"}</td>
                      <td className={`${TD} text-white/80`}>{r.data.location || "—"}</td>
                      <td className={`${TD} text-center`}>
                        {tone ? <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${TONE[tone]}`}>{r.data.tlp}</span> : <span className="text-white/40">—</span>}
                      </td>
                      <td className={`${TD} text-white/80`}>
                        {r.createdByName || "—"}
                        <div className="text-[11px] text-white/45">{fmtDate((r.createdAt ?? "").slice(0, 10))}</div>
                      </td>
                      <td className={`${TD} text-center`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => r.id && word(r.id)}
                            title="Download Word"
                            className="flex h-9 items-center gap-1 rounded-md border border-[#2b579a]/70 bg-[#2b579a]/25 px-2 text-xs font-bold text-white hover:bg-[#2b579a]/50"
                          >
                            {busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Word
                          </button>
                          <a
                            href={`/iir/${r.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Print / save as PDF"
                            className="flex h-9 items-center gap-1 rounded-md border border-red-500/60 bg-red-500/15 px-2 text-xs font-bold text-white hover:bg-red-500/30"
                          >
                            <FileText className="h-4 w-4" /> PDF
                          </a>
                          <button type="button" onClick={() => remove(r)} title="Delete" className="flex h-9 w-9 items-center justify-center rounded-md text-white/50 hover:bg-red-500/20 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DarkPanel>
    </div>
  );
}
