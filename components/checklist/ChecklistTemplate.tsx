"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ClipboardCheck, Images, ListChecks, Plus, Trash2 } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import { compressImage } from "@/lib/compressImage";
import { EMPTY_SIGNOFF } from "@/context/ChecklistSubmissionContext";
import type {
  ChecklistCorrectiveAction,
  ChecklistDesignation,
  ChecklistObservation,
  ChecklistPhotoItem,
  ChecklistSignoff,
  ChecklistSubmission,
} from "@/types/checklistSubmission";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { exportChecklistWord } from "@/lib/checklistWord";
import { ACTION_ROWS, DESIGNATION_ROWS, OBS_ROWS } from "@/lib/checklistReport";
import { PROJECTS } from "@/lib/mockData";

const MAX_CHECKLIST_PHOTOS = 30;
const pad = <T,>(rows: T[], n: number, blank: () => T) => [...rows, ...Array.from({ length: Math.max(0, n - rows.length) }, blank)];
import {
  ChecklistTemplate as ChecklistTemplateData,
  PointValue,
  POINT_VALUES,
  POSSIBLE_POINT_VALUES,
} from "@/types/checklist";
import PageTitle from "@/components/PageTitle";
import { inMobileApp } from "@/lib/mobileApp";

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
  initial,
}: {
  template: ChecklistTemplateData;
  /** Edit a submitted checklist (My Checklists → Edit). */
  initial?: ChecklistSubmission;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addSubmission, updateSubmission } = useChecklistSubmissions();
  const router = useRouter();
  const isEdit = !!initial;

  const inspectedBy = initial?.inspectedBy || (user ? `${user.name} (${user.employeeCode})` : "");
  // The three pages of the company's form: Inspection, Corrective Actions, Photos.
  const [page, setPage] = useState<"inspection" | "actions" | "photos">("inspection");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isExportingWord, setIsExportingWord] = useState(false);

  const [general, setGeneral] = useState<GeneralInfo>({
    inspectionDate: initial?.inspectionDate ?? "",
    projectDirector: initial?.projectDirector ?? "",
    totalManpower: initial ? String(initial.totalManpower || "") : "",
    activity: initial?.activity ?? "",
    projectName: initial?.projectName ?? "",
  });

  const [possibleMap, setPossibleMap] = useState<Record<string, PointValue>>(
    () =>
      Object.fromEntries(
        template.sections.flatMap((s) =>
          s.questions.map((q) => [q.id, ((initial?.possibleMap[q.id] as PointValue) ?? "2") as PointValue])
        )
      )
  );

  const [scoredMap, setScoredMap] = useState<Record<string, PointValue>>(() =>
    Object.fromEntries(
      template.sections.flatMap((s) => s.questions.map((q) => [q.id, ((initial?.scoredMap[q.id] as PointValue) ?? "0") as PointValue]))
    )
  );

  const [observations, setObservations] = useState<ChecklistObservation[]>(() =>
    pad(initial?.observations ?? [], OBS_ROWS, () => ({ description: "", dateRequired: "" }))
  );
  const [actions, setActions] = useState<ChecklistCorrectiveAction[]>(() =>
    pad(initial?.correctiveActions ?? [], ACTION_ROWS, () => ({ action: "", dateCompleted: "" }))
  );
  const [designations, setDesignations] = useState<ChecklistDesignation[]>(() =>
    pad(initial?.designations ?? [], 3, () => ({ name: "", signature: "", designation: "" }))
  );
  const [photoItems, setPhotoItems] = useState<ChecklistPhotoItem[]>(() => initial?.photoItems ?? []);
  const [signoff, setSignoff] = useState<ChecklistSignoff>(() => ({ ...EMPTY_SIGNOFF, ...(initial?.signoff ?? {}) }));

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
      const payload = {
        templateKey: template.key,
        inspectedBy,
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
        ...extraPayload(),
      };
      if (initial) await updateSubmission(initial.id, payload);
      else await addSubmission(payload);
      setSubmitSuccess(true);
      setTimeout(
        () => router.push(isEdit ? "/my-checklists" : inMobileApp(window.location.pathname) ? "/m/reports/monthly" : "/reports?tab=monthly"),
        1200
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.common.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** The Corrective Actions / Photos / sign-off part of what is saved (blank rows dropped). */
  const extraPayload = () => {
    const items = photoItems.filter((p) => p.image);
    return {
      observations: observations.filter((o) => o.description.trim() || o.dateRequired),
      correctiveActions: actions.filter((a) => a.action.trim() || a.dateCompleted),
      designations: designations.filter((d) => d.name.trim() || d.designation.trim() || d.signature),
      photoItems: items,
      photos: items.map((p) => p.image),
      signoff,
    };
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportChecklistWord(template, {
        id: initial?.id ?? "",
        createdAt: initial?.createdAt ?? new Date().toISOString(),
        templateKey: template.key,
        inspectedBy,
        projectName: general.projectName,
        inspectionDate: general.inspectionDate,
        projectDirector: general.projectDirector,
        totalManpower: Number(general.totalManpower) || 0,
        activity: general.activity,
        sectionStats: sectionStats.map(({ section, possible, scored, pct }) => ({ id: section.id, title: section.title, possible, scored, pct })),
        possibleMap,
        scoredMap,
        grandPossible,
        grandScored,
        grandPct,
        ...extraPayload(),
      });
    } finally {
      setIsExportingWord(false);
    }
  };

  const PAGES = [
    { key: "inspection" as const, label: "Inspection", icon: ClipboardCheck },
    { key: "actions" as const, label: "Corrective Actions", icon: ListChecks },
    { key: "photos" as const, label: "Photos", icon: Images },
  ];
  const questionOptions = template.sections.flatMap((s) => s.questions.map((q, i) => ({ id: q.id, label: `${s.id}${i + 1}`, text: q.text })));

  return (
    <div>
      <PageTitle
        section={isEdit ? "Edit Checklist" : "Checklists"}
        title={template.title}
        back={isEdit ? { href: "/my-checklists", label: "My Checklists" } : { href: "/reports?tab=monthly", label: "Monthly Reports" }}
      />

      {/* The form's three pages */}
      <div className="mb-6 flex flex-wrap gap-2">
        {PAGES.map((pg, i) => (
          <button
            key={pg.key}
            type="button"
            onClick={() => setPage(pg.key)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
              page === pg.key
                ? "border-[#f36f24] bg-[#f36f24]/15 text-white shadow-[0_0_14px_rgba(243,111,36,0.35)]"
                : "border-white/15 bg-white/[0.04] text-white/70 hover:text-white"
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${page === pg.key ? "bg-[#f36f24] text-white" : "bg-white/10"}`}>{i + 1}</span>
            <pg.icon className="h-4 w-4" />
            {pg.label}
          </button>
        ))}
      </div>

      {page === "inspection" && (
      <>
      {/* General information */}
      <div className="card mb-6">
        <h2 className="mb-4 text-sm font-bold tracking-wide text-brand-grayDark">
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
            className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface/55 shadow-card backdrop-blur-xl"
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

            <div className="hidden items-center gap-4 border-b border-brand-border px-6 pt-4 text-end text-[11px] font-semibold tracking-wide text-brand-gray sm:flex">
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
                      <span className="mb-1 block text-[11px] font-semibold tracking-wide text-brand-gray sm:hidden">
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
                        {POSSIBLE_POINT_VALUES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-32">
                      <span className="mb-1 block text-[11px] font-semibold tracking-wide text-brand-gray sm:hidden">
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
              <span className="text-xs font-bold tracking-wide text-brand-grayDark">
                {t.checklist.possiblePointsAwarded}
              </span>
              <div className="flex gap-3">
                <div className="min-w-[84px] rounded-lg bg-blue-600 px-4 py-2 text-center text-white">
                  <div className="text-[10px] font-medium tracking-wide opacity-80">
                    {t.checklist.possible}
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    {possible}
                  </div>
                </div>
                <div className="min-w-[84px] rounded-lg bg-blue-600 px-4 py-2 text-center text-white">
                  <div className="text-[10px] font-medium tracking-wide opacity-80">
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
              <tr className="border-b border-brand-border bg-brand-grayLight/50 text-xs font-semibold tracking-wide text-brand-gray">
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

      </>
      )}

      {page === "actions" && (
        <CorrectiveActionsPage
          observations={observations}
          setObservations={setObservations}
          actions={actions}
          setActions={setActions}
          designations={designations}
          setDesignations={setDesignations}
          signoff={signoff}
          setSignoff={setSignoff}
        />
      )}

      {page === "photos" && <PhotosPage items={photoItems} setItems={setPhotoItems} options={questionOptions} />}

      {page !== "photos" && (
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => { setPage(page === "inspection" ? "actions" : "photos"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-secondary">
            Next: {page === "inspection" ? "Corrective Actions" : "Photos"} →
          </button>
        </div>
      )}

      {/* Submit */}
      <div className="mt-6">
        {submitError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
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
              : isEdit
              ? t.common.save
              : t.checklist.submit}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Corrective Actions page ================= */

const SUB = "border-b border-white/10 bg-black text-[11px] font-bold uppercase tracking-wide text-white";
const CELL_IN = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-[#f36f24]";

function BlackBar({ title }: { title: string }) {
  return <div className="bg-black px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">{title}</div>;
}

function CorrectiveActionsPage({
  observations,
  setObservations,
  actions,
  setActions,
  designations,
  setDesignations,
  signoff,
  setSignoff,
}: {
  observations: ChecklistObservation[];
  setObservations: (v: ChecklistObservation[]) => void;
  actions: ChecklistCorrectiveAction[];
  setActions: (v: ChecklistCorrectiveAction[]) => void;
  designations: ChecklistDesignation[];
  setDesignations: (v: ChecklistDesignation[]) => void;
  signoff: ChecklistSignoff;
  setSignoff: (v: ChecklistSignoff) => void;
}) {
  const box = "overflow-hidden rounded-2xl border border-brand-border bg-brand-surface/55 shadow-card";
  const rm = (onClick: () => void) => (
    <button type="button" onClick={onClick} aria-label="Remove row" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/40 hover:bg-red-500/15 hover:text-red-400">
      <Trash2 className="h-4 w-4" />
    </button>
  );
  const addBtn = (onClick: () => void, label: string) => (
    <button type="button" onClick={onClick} className="m-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#f36f24]/70 px-3 py-1.5 text-xs font-bold text-[#ff8a3d] hover:bg-[#f36f24]/10">
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Observations */}
      <div className={box}>
        <BlackBar title="Observations" />
        <div className={`hidden gap-3 px-4 py-2 sm:flex ${SUB}`}>
          <span className="w-10 text-center">Item</span>
          <span className="flex-1">Description</span>
          <span className="w-44">Date Required</span>
          <span className="w-9" />
        </div>
        {observations.map((o, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2.5 sm:flex-nowrap">
            <span className="w-10 text-center text-sm font-bold text-white/70">{i + 1}</span>
            <input className={`${CELL_IN} min-w-0 flex-1`} placeholder="Description" value={o.description} onChange={(e) => setObservations(observations.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            <input type="date" className={`${CELL_IN} sm:w-44`} value={o.dateRequired} onChange={(e) => setObservations(observations.map((x, j) => (j === i ? { ...x, dateRequired: e.target.value } : x)))} />
            {rm(() => setObservations(observations.filter((_, j) => j !== i)))}
          </div>
        ))}
        {addBtn(() => setObservations([...observations, { description: "", dateRequired: "" }]), "Add observation")}
      </div>

      {/* Contractor corrective actions */}
      <div className={box}>
        <BlackBar title="Contractor Corrective Actions" />
        <div className={`hidden gap-3 px-4 py-2 sm:flex ${SUB}`}>
          <span className="w-10 text-center">Item</span>
          <span className="flex-1">Corrective Action</span>
          <span className="w-44">Date Completed</span>
          <span className="w-9" />
        </div>
        {actions.map((a, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2.5 sm:flex-nowrap">
            <span className="w-10 text-center text-sm font-bold text-white/70">{i + 1}</span>
            <input className={`${CELL_IN} min-w-0 flex-1`} placeholder="Corrective action" value={a.action} onChange={(e) => setActions(actions.map((x, j) => (j === i ? { ...x, action: e.target.value } : x)))} />
            <input type="date" className={`${CELL_IN} sm:w-44`} value={a.dateCompleted} onChange={(e) => setActions(actions.map((x, j) => (j === i ? { ...x, dateCompleted: e.target.value } : x)))} />
            {rm(() => setActions(actions.filter((_, j) => j !== i)))}
          </div>
        ))}
        {addBtn(() => setActions([...actions, { action: "", dateCompleted: "" }]), "Add corrective action")}
      </div>

      {/* Designation */}
      <div className={box}>
        <div className="flex items-stretch bg-black">
          <span className="flex-1" />
          <span className="bg-sky-300 px-6 py-2.5 text-sm font-extrabold text-black">Designation</span>
        </div>
        {designations.map((d, i) => (
          <div key={i} className="grid gap-3 border-b border-white/10 px-4 py-3 sm:grid-cols-[2.5rem_1fr_1fr_1fr_2.25rem] sm:items-center">
            <span className="text-center text-sm font-bold text-white/70">{i + 1}</span>
            <input className={CELL_IN} placeholder="Name" value={d.name} onChange={(e) => setDesignations(designations.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <div className="[&_.label-field]:hidden">
              <SignaturePad label="" value={d.signature} onChange={(v) => setDesignations(designations.map((x, j) => (j === i ? { ...x, signature: v } : x)))} />
            </div>
            <input className={CELL_IN} placeholder="Designation" value={d.designation} onChange={(e) => setDesignations(designations.map((x, j) => (j === i ? { ...x, designation: e.target.value } : x)))} />
            {rm(() => setDesignations(designations.filter((_, j) => j !== i)))}
          </div>
        ))}
        {designations.length < DESIGNATION_ROWS && addBtn(() => setDesignations([...designations, { name: "", signature: "", designation: "" }]), "Add person")}
      </div>

      {/* Cover page sign-off */}
      <div className={box}>
        <BlackBar title="Sign-off (cover page)" />
        <div className="grid gap-5 p-4 md:grid-cols-2">
          {(
            [
              ["Prepared By", "Project HSE Manager", "preparedName", "preparedSignature", "preparedDate"],
              ["Approved By", "HSE Director", "approvedName", "approvedSignature", "approvedDate"],
            ] as const
          ).map(([title, role, nameK, sigK, dateK]) => (
            <div key={title} className="rounded-xl border border-white/10 p-4">
              <p className="text-sm font-extrabold text-white">{title}</p>
              <p className="mb-3 text-xs text-white/55">{role}</p>
              <label className="label-field">Name</label>
              <input className={CELL_IN} value={signoff[nameK]} onChange={(e) => setSignoff({ ...signoff, [nameK]: e.target.value })} />
              <div className="mt-3">
                <SignaturePad label="Signature" value={signoff[sigK]} onChange={(v) => setSignoff({ ...signoff, [sigK]: v })} />
              </div>
              <label className="label-field mt-3">Date</label>
              <input type="date" className={CELL_IN} value={signoff[dateK]} onChange={(e) => setSignoff({ ...signoff, [dateK]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Photos page ================= */

function PhotosPage({
  items,
  setItems,
  options,
}: {
  items: ChecklistPhotoItem[];
  setItems: (v: ChecklistPhotoItem[]) => void;
  options: { id: string; label: string; text: string }[];
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const next = [...items];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_CHECKLIST_PHOTOS) break;
      try {
        next.push({ image: await compressImage(f, 1600, 0.8), item: "" });
      } catch {
        /* not an image */
      }
    }
    setItems(next);
    setBusy(false);
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface/55 shadow-card">
      <BlackBar title="Photos" />
      <p className="px-4 pt-3 text-xs text-white/55">For each photo choose the checklist item it shows — its number and text appear under the photo in the report (up to {MAX_CHECKLIST_PHOTOS} photos).</p>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => {
          const q = options.find((o) => o.id === p.item);
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-white/15 bg-black/30">
              <div className="relative flex aspect-[4/3] items-center justify-center bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={`Photo ${i + 1}`} className="max-h-full max-w-full object-contain" />
                <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold text-white">{q ? q.label : `#${i + 1}`}</span>
                <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Remove photo" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-red-400 hover:bg-red-500/30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <label className="label-field">Checklist item</label>
                <select className={CELL_IN} value={p.item} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))}>
                  <option value="">Choose the item…</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label} — {o.text.length > 70 ? `${o.text.slice(0, 70)}…` : o.text}
                    </option>
                  ))}
                </select>
                {q && <p className="mt-2 text-xs leading-snug text-white/70">{q.text}</p>}
              </div>
            </div>
          );
        })}
        {items.length < MAX_CHECKLIST_PHOTOS && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#f36f24]/60 text-[#ff8a3d] hover:bg-[#f36f24]/10"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm font-bold">{busy ? "Adding…" : "Add photos"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
