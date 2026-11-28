"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  DisciplinaryRecord,
  PPERecord,
  TrainingCourseRecord,
} from "@/types/hsePassport";
import { EmployeeRecord } from "@/lib/mockData";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useProjectFilter, useProjectScoped } from "@/context/ProjectFilterContext";
import { projectName } from "@/lib/projectNames";

interface HsePassportContextValue {
  employees: EmployeeRecord[];
  disciplinaryRecords: DisciplinaryRecord[];
  ppeRecords: PPERecord[];
  /** Company-wide training totals (computed in Postgres — the table holds
   *  ~90k rows, far too many to load into the browser). Null until loaded. */
  trainingSummary: TrainingSummary | null;
  /** One employee's training history, fetched on demand. */
  fetchTrainingFor: (employeeId: string) => Promise<TrainingCourseRecord[]>;
  isLoading: boolean;
  addDisciplinaryRecord: (
    r: Omit<DisciplinaryRecord, "id" | "createdAt">
  ) => Promise<void>;
  addPPERecord: (r: Omit<PPERecord, "id" | "createdAt">) => Promise<void>;
  addTrainingRecord: (
    r: Omit<TrainingCourseRecord, "id" | "createdAt">
  ) => Promise<void>;
}

export interface TrainingSummary {
  total: number;
  employees: number;
  hours: number;
  valid: number;
  expired: number;
}

const HsePassportContext = createContext<HsePassportContextValue | undefined>(
  undefined
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEmployee(row: any): EmployeeRecord {
  return {
    id: row.id,
    name: row.name,
    employeeId: row.employee_code,
    project: projectName(row.project),
    department: row.department,
    phone: row.phone ?? "",
    jobGrade: row.job_grade ?? "",
    photoUrl: row.photo_url ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDisciplinary(row: any): DisciplinaryRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    type: row.type,
    violationCategory: row.violation_category ?? undefined,
    date: row.date,
    details: row.details ?? "",
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPpe(row: any): PPERecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    ppeType: row.ppe_type,
    received: row.received,
    dateReceived: row.date_received ?? "",
    replacementDueDate: row.replacement_due_date ?? "",
    conditionAtReturn: row.condition_at_return,
    remarks: row.remarks ?? "",
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTraining(row: any): TrainingCourseRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    courseName: row.course_name,
    date: row.date,
    status: row.status,
    hours: Number(row.hours) || 0,
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSummary(row: any): TrainingSummary {
  return {
    total: Number(row?.total) || 0,
    employees: Number(row?.employees) || 0,
    hours: Number(row?.hours) || 0,
    valid: Number(row?.valid) || 0,
    expired: Number(row?.expired) || 0,
  };
}

export function HsePassportProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<
    DisciplinaryRecord[]
  >([]);
  const [ppeRecords, setPpeRecords] = useState<PPERecord[]>([]);
  const [trainingSummary, setTrainingSummary] = useState<TrainingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Gated on `user` — see the matching comment in ObservationsContext.tsx.
  useEffect(() => {
    if (!user) {
      setEmployees([]);
      setDisciplinaryRecords([]);
      setPpeRecords([]);
      setTrainingSummary(null);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    Promise.all([
      supabase.from("employees").select("*").order("name"),
      supabase
        .from("disciplinary_records")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("ppe_records")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.rpc("hse_training_summary"),
    ]).then(([emp, disc, ppe, trn]) => {
      if (!active) return;
      if (!emp.error && emp.data) setEmployees(emp.data.map(mapEmployee));
      if (!disc.error && disc.data)
        setDisciplinaryRecords(disc.data.map(mapDisciplinary));
      if (!ppe.error && ppe.data) setPpeRecords(ppe.data.map(mapPpe));
      if (!trn.error && trn.data) setTrainingSummary(mapSummary(trn.data));
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  // Stable identity so pages can use it as an effect dependency.
  const fetchTrainingFor = useCallback(async (employeeId: string) => {
    const { data, error } = await supabase
      .from("hse_training_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("date", { ascending: false })
      .limit(1000);
    if (error || !data) return [];
    return data.map(mapTraining);
  }, []);

  // Project filter: employees by their project, records by their employee.
  const { project } = useProjectFilter();
  const scopedEmployees = useProjectScoped(employees, (e) => e.project);
  const scoped = useMemo(() => {
    if (!project) return { disciplinaryRecords, ppeRecords };
    const ids = new Set(scopedEmployees.map((e) => e.id));
    return {
      disciplinaryRecords: disciplinaryRecords.filter((r) => ids.has(r.employeeId)),
      ppeRecords: ppeRecords.filter((r) => ids.has(r.employeeId)),
    };
  }, [project, scopedEmployees, disciplinaryRecords, ppeRecords]);

  const value = useMemo<HsePassportContextValue>(
    () => ({
      employees: scopedEmployees,
      disciplinaryRecords: scoped.disciplinaryRecords,
      ppeRecords: scoped.ppeRecords,
      trainingSummary,
      fetchTrainingFor,
      isLoading,
      addDisciplinaryRecord: async (r) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("disciplinary_records")
          .insert({
            employee_id: r.employeeId,
            type: r.type,
            violation_category: r.violationCategory ?? null,
            date: r.date,
            details: r.details,
            attachments: r.attachments,
            created_by,
          })
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to add disciplinary record");
        }
        setDisciplinaryRecords((prev) => [mapDisciplinary(data), ...prev]);
      },
      addPPERecord: async (r) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("ppe_records")
          .insert({
            employee_id: r.employeeId,
            ppe_type: r.ppeType,
            received: r.received,
            date_received: r.dateReceived || null,
            replacement_due_date: r.replacementDueDate || null,
            condition_at_return: r.conditionAtReturn,
            remarks: r.remarks,
            attachments: r.attachments,
            created_by,
          })
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to add PPE record");
        }
        setPpeRecords((prev) => [mapPpe(data), ...prev]);
      },
      addTrainingRecord: async (r) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("hse_training_records")
          .insert({
            employee_id: r.employeeId,
            course_name: r.courseName,
            date: r.date,
            status: r.status,
            hours: r.hours,
            attachments: r.attachments,
            created_by,
          })
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to add training record");
        }
        const { data: summary } = await supabase.rpc("hse_training_summary");
        if (summary) setTrainingSummary(mapSummary(summary));
      },
    }),
    [scopedEmployees, scoped, trainingSummary, fetchTrainingFor, isLoading]
  );

  return (
    <HsePassportContext.Provider value={value}>
      {children}
    </HsePassportContext.Provider>
  );
}

export function useHsePassport() {
  const ctx = useContext(HsePassportContext);
  if (!ctx) {
    throw new Error("useHsePassport must be used within a HsePassportProvider");
  }
  return ctx;
}
