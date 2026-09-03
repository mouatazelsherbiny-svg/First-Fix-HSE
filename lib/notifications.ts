import { PermitToWork } from "@/types/permit";
import { PPERecord, TrainingCourseRecord } from "@/types/hsePassport";
import { EmployeeRecord } from "@/lib/mockData";
import { ChecklistSubmission } from "@/types/checklistSubmission";
import { getPermitProgress } from "@/lib/permitProgress";
import { TranslationShape } from "@/lib/i18n";

export interface AppNotification {
  id: string;
  text: string;
  tone: "red" | "amber" | "blue";
}

/** Must match every `key` in lib/checklists/*.ts (and CHECKLIST_PAGES in
 *  app/dashboard/page.tsx) — the 4 Monthly Checklist templates. */
const CHECKLIST_KEYS = ["environmental", "fireAssessment", "safetyHealth", "tcEnergization"];

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Builds the short, real-data notification list shown in the Topbar bell.
 * Every entry reflects something actually true right now in the user's own
 * project data — nothing here is a placeholder or a static example.
 */
export function buildNotifications({
  t,
  project,
  permits,
  employees,
  ppeRecords,
  trainingRecords,
  checklistSubmissions,
}: {
  t: TranslationShape;
  project: string;
  permits: PermitToWork[];
  employees: EmployeeRecord[];
  ppeRecords: PPERecord[];
  trainingRecords: TrainingCourseRecord[];
  checklistSubmissions: ChecklistSubmission[];
}): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = Date.now();

  // Permits currently "In Progress" that are ending within 2 hours, or
  // already past their scheduled end time and still awaiting manual closure.
  const permitsNeedingAttention = permits.filter((p) => {
    if (p.projectName !== project) return false;
    if (getPermitProgress(p) !== "In Progress") return false;
    if (!p.endDate) return false;
    const end = new Date(`${p.endDate}T${p.endTime || "23:59"}`).getTime();
    if (Number.isNaN(end)) return false;
    return end - now <= TWO_HOURS_MS;
  });
  if (permitsNeedingAttention.length > 0) {
    notifications.push({
      id: "permits-attention",
      text: t.topbar.permitsNeedingAttention.replace(
        "{count}",
        String(permitsNeedingAttention.length)
      ),
      tone: "red",
    });
  }

  const projectEmployeeIds = new Set(
    employees.filter((e) => e.project === project).map((e) => e.id)
  );

  // PPE due for replacement within the next 14 days (or already overdue).
  const ppeDue = ppeRecords.filter((r) => {
    if (!projectEmployeeIds.has(r.employeeId)) return false;
    if (!r.replacementDueDate) return false;
    const due = new Date(r.replacementDueDate).getTime();
    if (Number.isNaN(due)) return false;
    return due - now <= FOURTEEN_DAYS_MS;
  });
  if (ppeDue.length > 0) {
    notifications.push({
      id: "ppe-due",
      text: t.topbar.ppeReplacementDue.replace("{count}", String(ppeDue.length)),
      tone: "amber",
    });
  }

  // Training records already marked Expired.
  const expiredTraining = trainingRecords.filter(
    (r) => projectEmployeeIds.has(r.employeeId) && r.status === "Expired"
  );
  if (expiredTraining.length > 0) {
    notifications.push({
      id: "training-expired",
      text: t.topbar.trainingExpired.replace("{count}", String(expiredTraining.length)),
      tone: "red",
    });
  }

  // Monthly Checklists not yet submitted for the current calendar month.
  const nowDate = new Date();
  const submittedKeysThisMonth = new Set(
    checklistSubmissions
      .filter((s) => {
        if (s.projectName !== project) return false;
        const d = new Date(s.inspectionDate || s.createdAt);
        return (
          d.getMonth() === nowDate.getMonth() && d.getFullYear() === nowDate.getFullYear()
        );
      })
      .map((s) => s.templateKey)
  );
  const missingChecklists = CHECKLIST_KEYS.filter((k) => !submittedKeysThisMonth.has(k));
  if (missingChecklists.length > 0) {
    notifications.push({
      id: "checklists-missing",
      text: t.topbar.checklistsNotSubmitted.replace(
        "{count}",
        String(missingChecklists.length)
      ),
      tone: "amber",
    });
  }

  return notifications;
}
