"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { exportChecklistToWord } from "@/lib/exportChecklistWord";
import { PROJECTS } from "@/lib/mockData";
import {
  ChecklistTemplate as ChecklistTemplateData,
  PointValue,
  POINT_VALUES,
} from "@/types/checklist";

interface GeneralInfo {
  inspectionDate: string;
  projectDirector: string;
  totalManpower: string;
  activity: string;
  projectName: string;
}

function sumPoints(map: Record<string, PointValue>, ids: string[]): number {
  return ids.reduce((acc, id) => {
    const v = map[id];
    return v === undefined || v === "N/A" ? acc : acc + Number(v);
  }, 0);
}

export default function ChecklistTemplate({
  template,
}: {
  template: ChecklistTemplateData;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addSubmission } = useChecklistSubmissions();
  const router = useRouter();

  const inspectedBy = user ? `${user.name} (${user.employeeCode})` : "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isExportingWord, setIsExportingWord] = useState(false);

  const [general, setGeneral] = useState<GeneralInfo>({
    inspectionDate: "",
    projectDirector: "",
    totalManpower: "",
    activity: "",
    projectName: "",
  });

  const [possibleMap, setPossibleMap] = useState<Record<string, PointValue>>(
    () =>
      Object.fromEntries(
        template.sections.flatMap((s) =>
          s.questions.map((q) => [q.id, q.defaultPossible])
        )
      )
  );

  const [scoredMap, setScoredMap] = useState<Record<string, PointValue>>(() =>
    Object.fromEntries(
      template.sections.flatMap((s) => s.questions.map((q) => [q.id, "N/A"]))
    )
  );

  const updateGeneral = (field: keyof GeneralInfo, value: string) =>
    setGeneral((prev) => ({ ...prev, [field]: value }));

  const sectionStats = useMemo(
    () =>
      template.sections.map((section) => {
        const ids = section.questions.map((q) => q.id);
        const possible = sumPoints(possibleMap, ids);
        const scored = sumPoints(scoredMap, ids);
        const pct = possible > 0 ? Math.round((scored / possible) * 100) : 0;
        return { section, possible, scored, pct };
      }),
    [template.sections, possibleMap, scoredMap]
  );

  const grandPossible = sectionStats.reduce((a, s) => a + s.possible, 0);
  const grandScored = sectionStats.reduce((a, s) => a + s.scored, 0);
  const grandPct =
    grandPossible > 0 ? Math.round((grandScored / grandPossible) * 100) : 0;

  const handleSubmit = async () => {
    setSubmitError("");

    if (!general.projectName || !general.inspectionDate) {
      setSubmitError(t.checklist.selectProjectAndDate);
      return;
    }

    setIsSubmitting(true);
    try {
      await addSubmission({
        templateKey: template.key,
        projectName: general.projectName,
        inspectionDate: general.inspectionDate,
        projectDirector: general.projectDirector,
        totalManpower: Number(general.totalManpower) || 0,
        activity: general.activity,
        sectionStats: sectionStats.map(({ section, possible, scored, pct }) => ({
          id: section.id,
          title: section.title,
          possible,
          scored,
          pct,
        })),
        possibleMap,
        scoredMap,
        grandPossible,
        grandScored,
        grandPct,
      });
      setSubmitSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.common.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportChecklistToWord({
        templateTitle: template.title,
        inspectedBy,
        general,
        sectionStats,
        possibleMap,
        scoredMap,
        grandPossible,
        grandScored,
        grandPct,
        labels: { ...t.checklist, projectName: t.form.projectName },
      });
    } finally {
      setIsExportingWord(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">
          {template.title}
        </h1>
      </div>

      {/* General information */}
      <div className="card mb-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-grayDark">
          {t.checklist.generalInfo}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label-field">{t.checklist.inspectedBy}</label>
            <input
              type="text"
              value={inspectedBy}
              readOnly
              disabled
              className="input-field bg-brand-grayLight text-brand-gray"
            />
          </div>
          <div>
            <label className="label-field">{t.checklist.inspectionDate}</label>
            <input
              type="date"
              value={general.inspectionDate}
              onChange={(e) =>
                updateGeneral("inspectionDate", e.target.value)
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t.checklist.projectDirector}</label>
            <input
              type="text"
              value={general.projectDirector}
              onChange={(e) =>
                updateGeneral("projectDirector", e.target.value)
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t.checklist.totalManpower}</label>
            <input
              type="number"
              min={0}
              value={general.totalManpower}
              onChange={(e) =>
                updateGeneral("totalManpower", e.target.value)
              }
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">{t.checklist.activity}</label>
            <input
              type="text"
              value={general.activity}
              onChange={(e) => updateGeneral("activity", e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">{t.form.projectName}</label>
            <select
              value={general.projectName}
              onChange={(e) => updateGeneral("projectName", e.target.value)}
              className="input-field"
            >
              <option value="" disabled>
                {t.form.projectPlaceholder}
              </option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sectionStats.map(({ section, possible, scored }) => (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-card"
          >
            <div className="bg-black px-4 py-3 sm:px-6">
              <h3 className="text-sm font-bold text-white sm:text-base">
                {section.id}. {section.title}
                {section.criticality && (
                  <span
                    className={`ms-2 font-semibold ${
                      section.criticality === "life-critical"
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    (
                    {section.criticality === "life-critical"
                      ? "Life Critical Item"
                      : "Non-Life Critical Item"}
                    )
                  </span>
                )}
              </h3>
            </div>

            <div className="hidden items-center gap-4 border-b border-brand-border px-6 pt-4 text-end text-[11px] font-semibold uppercase tracking-wide text-brand-gray sm:flex">
              <span className="flex-1" />
              <span className="w-32">{t.checklist.possible}</span>
              <span className="w-32">{t.checklist.scored}</span>
            </div>

            <div>
              {section.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex flex-col gap-3 border-b border-brand-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
                >
                  <p className="flex-1 text-sm text-brand-grayDark">
                    <span className="font-semibold text-brand-black">
                      {idx + 1}.
                    </span>{" "}
                    {q.text}
                  </p>
                  <div className="flex gap-3 sm:contents">
                    <div className="w-full sm:w-32">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray sm:hidden">
                        {t.checklist.possible}
                      </span>
                      <select
                        value={possibleMap[q.id]}
                        onChange={(e) =>
                          setPossibleMap((prev) => ({
                            ...prev,
                            [q.id]: e.target.value as PointValue,
                          }))
                        }
                        className="input-field !py-2 text-center"
                      >
                        {POINT_VALUES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-32">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray sm:hidden">
                        {t.checklist.scored}
                      </span>
                      <select
                        value={scoredMap[q.id]}
                        onChange={(e) =>
                          setScoredMap((prev) => ({
                            ...prev,
                            [q.id]: e.target.value as PointValue,
                          }))
                        }
                        className="input-field !py-2 text-center"
                      >
                        {POINT_VALUES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-start gap-3 border-t border-brand-border bg-brand-grayLight/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-grayDark">
                {t.checklist.possiblePointsAwarded}
              </span>
              <div className="flex gap-3">
                <div className="min-w-[84px] rounded-lg bg-blue-600 px-4 py-2 text-center text-white">
                  <div className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                    {t.checklist.possible}
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    {possible}
                  </div>
                </div>
                <div className="min-w-[84px] rounded-lg bg-blue-600 px-4 py-2 text-center text-white">
                  <div className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                    {t.checklist.scored}
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    {scored}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary report */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-brand-black">
          {t.checklist.summaryReport}
        </h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[560px] text-start text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <th className="px-4 py-3 text-start sm:px-6">
                  {t.checklist.section}
                </th>
                <th className="px-4 py-3 text-start sm:px-6">
                  {t.checklist.totalPossible}
                </th>
                <th className="px-4 py-3 text-start sm:px-6">
                  {t.checklist.totalScored}
                </th>
                <th className="px-4 py-3 text-start sm:px-6">
                  {t.checklist.finalScore}
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionStats.map(({ section, possible, scored, pct }) => (
                <tr
                  key={section.id}
                  className="border-b border-brand-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-brand-black sm:px-6">
                    {section.id}. {section.title}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark sm:px-6">
                    {possible}
                  </td>
                  <td className="px-4 py-3 text-brand-grayDark sm:px-6">
                    {scored}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-orange sm:px-6">
                    {pct}%
                  </td>
                </tr>
              ))}
              <tr className="bg-brand-orange">
                <td className="px-4 py-3 font-bold text-brand-onAccent sm:px-6">
                  {t.checklist.grandTotal}
                </td>
                <td className="px-4 py-3 font-bold text-brand-onAccent sm:px-6">
                  {grandPossible}
                </td>
                <td className="px-4 py-3 font-bold text-brand-onAccent sm:px-6">
                  {grandScored}
                </td>
                <td className="px-4 py-3 font-bold text-brand-onAccent sm:px-6">
                  {grandPct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6">
        {submitError && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {t.checklist.success}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportWord}
            disabled={isExportingWord}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExportingWord ? t.common.exporting : t.common.exportWord}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || submitSuccess}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t.checklist.submitting
              : submitSuccess
              ? t.checklist.submitted
              : t.checklist.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
