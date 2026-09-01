"use client";

import {
  createContext,
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

interface HsePassportContextValue {
  employees: EmployeeRecord[];
  disciplinaryRecords: DisciplinaryRecord[];
  ppeRecords: PPERecord[];
  trainingRecords: TrainingCourseRecord[];
  isLoading: boolean;
  addDisciplinaryRecord: (
    r: Omit<DisciplinaryRecord, "id" | "createdAt">
  ) => Promise<void>;
  addPPERecord: (r: Omit<PPERecord, "id" | "createdAt">) => Promise<void>;
  addTrainingRecord: (
    r: Omit<TrainingCourseRecord, "id" | "createdAt">
  ) => Promise<void>;
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
    project: row.project,
    department: row.department,
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

export function HsePassportProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<
    DisciplinaryRecord[]
  >([]);
  const [ppeRecords, setPpeRecords] = useState<PPERecord[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<
    TrainingCourseRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
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
      supabase
        .from("hse_training_records")
        .select("*")
        .order("created_at", { ascending: false }),
    ]).then(([emp, disc, ppe, trn]) => {
      if (!active) return;
      if (!emp.error && emp.data) setEmployees(emp.data.map(mapEmployee));
      if (!disc.error && disc.data)
        setDisciplinaryRecords(disc.data.map(mapDisciplinary));
      if (!ppe.error && ppe.data) setPpeRecords(ppe.data.map(mapPpe));
      if (!trn.error && trn.data) setTrainingRecords(trn.data.map(mapTraining));
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<HsePassportContextValue>(
    () => ({
      employees,
      disciplinaryRecords,
      ppeRecords,
      trainingRecords,
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
        setTrainingRecords((prev) => [mapTraining(data), ...prev]);
      },
    }),
    [employees, disciplinaryRecords, ppeRecords, trainingRecords, isLoading]
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
