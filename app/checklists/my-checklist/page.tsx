"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { exportChecklistToWord } from "@/lib/exportChecklistWord";
import { CHECKLIST_TEMPLATES } from "@/lib/checklists";
import { ChecklistSubmission } from "@/types/checklistSubmission";
import { PointValue } from "@/types/checklist";

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

  const handleExportWord = async (submission: ChecklistSubmission) => {
    const template = CHECKLIST_TEMPLATES[submission.templateKey];
    if (!template) return;

    setExportingId(submission.id);
    try {
      const sectionStats = template.sections.map((section) => {
        const stat = submission.sectionStats.find((s) => s.id === section.id);
        return {
          section,
          possible: stat?.possible ?? 0,
          scored: stat?.scored ?? 0,
          pct: stat?.pct ?? 0,
        };
      });

      await exportChecklistToWord({
        templateTitle: typeLabel(submission.templateKey),
        inspectedBy: submission.inspectedBy,
        general: {
          inspectionDate: submission.inspectionDate,
          projectDirector: submission.projectDirector,
          totalManpower: String(submission.totalManpower),
          activity: submission.activity,
          projectName: submission.projectName,
        },
        sectionStats,
        possibleMap: submission.possibleMap as Record<string, PointValue>,
        scoredMap: submission.scoredMap as Record<string, PointValue>,
        grandPossible: submission.grandPossible,
        grandScored: submission.grandScored,
        grandPct: submission.grandPct,
        labels: { ...t.checklist, projectName: t.form.projectName },
      });
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">{t.myChecklist.title}</h1>
          <p className="mt-1 text-sm text-brand-gray">
            {t.myChecklist.subtitle} ({project})
          </p>
        </div>
      </div>

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
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
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
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => handleExportWord(s)}
                      disabled={exportingId === s.id}
                      className="btn-secondary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download className="me-1.5 h-3.5 w-3.5" />
                      {exportingId === s.id ? t.common.exporting : t.common.exportWord}
                    </button>
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
