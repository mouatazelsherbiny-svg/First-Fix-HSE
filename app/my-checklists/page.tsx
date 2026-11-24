"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileDown, FileText, Loader2, Pencil } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { exportChecklistWord } from "@/lib/checklistWord";
import { CHECKLIST_TEMPLATES } from "@/lib/checklists";
import { ChecklistSubmission } from "@/types/checklistSubmission";
import PageTitle from "@/components/PageTitle";

export default function MyChecklistPage() {
  return (
    <ProtectedRoute>
      <MyChecklistList />
    </ProtectedRoute>
  );
}

function MyChecklistList() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { submissions, isLoading } = useChecklistSubmissions();
  const [query, setQuery] = useState("");
  const [exportingId, setExportingId] = useState<string | null>(null);

  const project = user?.project ?? "KSP";

  const projectSubmissions = useMemo(
    () => submissions.filter((s) => s.projectName === project),
    [submissions, project]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projectSubmissions;
    return projectSubmissions.filter(
      (s) =>
        s.activity.toLowerCase().includes(q) ||
        s.projectDirector.toLowerCase().includes(q)
    );
  }, [projectSubmissions, query]);

  const typeLabel = (templateKey: string) =>
    t.checklistNames[templateKey as keyof typeof t.checklistNames] ?? templateKey;

  // Word in the company's form layout (Cover, Inspection + Summary, Corrective Actions, Photos).
  const handleExportWord = async (submission: ChecklistSubmission) => {
    const template = CHECKLIST_TEMPLATES[submission.templateKey];
    if (!template) return;
    setExportingId(submission.id);
    try {
      await exportChecklistWord(template, submission);
    } finally {
      setExportingId(null);
    }
  };
  const canEdit = (s: ChecklistSubmission) => user?.role === "admin" || !s.createdBy || s.createdBy === user?.id;

  return (
    <div>
      <PageTitle section={t.myChecklist.title} title={`Monthly Checklists · ${project}`} back={{ href: "/reports?tab=monthly", label: "Monthly Reports" }} />

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.myChecklist.search}
          className="input-field max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.myChecklist.empty}</p>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[1100px] text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start">{t.myChecklist.colType}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colInspectedBy}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colInspectionDate}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colProjectDirector}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colTotalManpower}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colActivity}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colProjectName}</th>
                <th className="px-4 py-3 text-start">{t.myChecklist.colFinalScore}</th>
                <th className="px-4 py-3 text-end">{t.myChecklist.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-brand-border transition last:border-0 hover:bg-brand-grayLight/30"
                >
                  <td className="px-4 py-3 font-semibold text-brand-black">
                    {typeLabel(s.templateKey)}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark">{s.inspectedBy || "—"}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{s.inspectionDate || "—"}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{s.projectDirector || "—"}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{s.totalManpower}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{s.activity || "—"}</td>
                  <td className="px-4 py-3 text-brand-grayDark">{s.projectName}</td>
                  <td className="px-4 py-3 font-semibold text-brand-black">{s.grandPct}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit(s) && (
                        <Link
                          href={`/my-checklists/${s.id}/edit`}
                          title="Edit"
                          className="flex h-9 items-center gap-1 rounded-md border border-white/20 bg-white/[0.06] px-2.5 text-xs font-bold text-white hover:border-[#f36f24]"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleExportWord(s)}
                        disabled={exportingId === s.id}
                        title="Download Word"
                        className="flex h-9 items-center gap-1 rounded-md border border-[#2b579a]/70 bg-[#2b579a]/25 px-2.5 text-xs font-bold text-white hover:bg-[#2b579a]/50 disabled:opacity-60"
                      >
                        {exportingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Word
                      </button>
                      <a
                        href={`/my-checklists/${s.id}/print`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Print / save as PDF"
                        className="flex h-9 items-center gap-1 rounded-md border border-red-500/60 bg-red-500/15 px-2.5 text-xs font-bold text-white hover:bg-red-500/30"
                      >
                        <FileText className="h-4 w-4" /> PDF
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
