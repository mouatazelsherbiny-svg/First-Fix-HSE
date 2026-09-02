"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { PermitToWork } from "@/types/permit";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";

interface PermitContextValue {
  permits: PermitToWork[];
  isLoading: boolean;
  getById: (id: string) => PermitToWork | undefined;
  addPermit: (
    permit: Omit<PermitToWork, "id" | "permitNumber" | "createdAt" | "updatedAt">
  ) => Promise<PermitToWork>;
  updatePermit: (id: string, patch: Partial<PermitToWork>) => Promise<void>;
}

const PermitContext = createContext<PermitContextValue | undefined>(
  undefined
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): PermitToWork {
  return {
    id: row.id,
    permitNumber: row.permit_number,
    projectName: row.project_name,
    permitType: row.permit_type,
    permitTypeOther: row.permit_type_other ?? undefined,
    workLocation: row.work_location,
    workDescription: row.work_description,
    contractor: row.contractor,
    numberOfWorkers: row.number_of_workers,
    startDate: row.start_date ?? "",
    startTime: row.start_time ?? "",
    endDate: row.end_date ?? "",
    endTime: row.end_time ?? "",
    hazardsIdentified: row.hazards_identified ?? [],
    ppeRequired: row.ppe_required ?? [],
    isolationRequired: row.isolation_required,
    precautions: row.precautions,
    permitPhotos: row.permit_photos ?? [],
    attachments: row.attachments ?? [],
    status: row.status,
    requestedBy: row.requested_by,
    receiver: row.receiver ?? "",
    hseValidator: row.hse_validator ?? "",
    supervisorForeman: row.supervisor_foreman ?? "",
    emergencyContactNumber: row.emergency_contact_number ?? "",
    issuerSignature: row.issuer_signature ?? "",
    receiverSignature: row.receiver_signature ?? "",
    permitStatus: row.permit_status ?? "New Permit",
    approvedBy: row.approved_by ?? undefined,
    closeOutDetails: row.close_out_details ?? "",
    closeOutPhotos: row.close_out_photos ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function PermitProvider({ children }: { children: ReactNode }) {
  const [permits, setPermits] = useState<PermitToWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("permits")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setPermits(data.map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<PermitContextValue>(
    () => ({
      permits,
      isLoading,
      getById: (id: string) => permits.find((p) => p.id === id),
      addPermit: async (permit) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("permits")
          .insert({
            project_name: permit.projectName,
            permit_type: permit.permitType,
            permit_type_other: permit.permitTypeOther ?? null,
            work_location: permit.workLocation,
            work_description: permit.workDescription,
            contractor: permit.contractor,
            number_of_workers: permit.numberOfWorkers,
            start_date: permit.startDate || null,
            start_time: permit.startTime || null,
            end_date: permit.endDate || null,
            end_time: permit.endTime || null,
            hazards_identified: permit.hazardsIdentified,
            ppe_required: permit.ppeRequired,
            isolation_required: permit.isolationRequired,
            precautions: permit.precautions,
            permit_photos: permit.permitPhotos,
            attachments: permit.attachments,
            status: permit.status,
            requested_by: permit.requestedBy,
            receiver: permit.receiver,
            hse_validator: permit.hseValidator,
            supervisor_foreman: permit.supervisorForeman,
            emergency_contact_number: permit.emergencyContactNumber,
            issuer_signature: permit.issuerSignature,
            receiver_signature: permit.receiverSignature,
            permit_status: permit.permitStatus,
            close_out_details: permit.closeOutDetails,
            close_out_photos: permit.closeOutPhotos,
            created_by,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to create permit");
        }
        const newPermit = mapRow(data);
        setPermits((prev) => [newPermit, ...prev]);
        return newPermit;
      },
      updatePermit: async (id, patch) => {
        const payload: Record<string, unknown> = {};
        if (patch.status !== undefined) payload.status = patch.status;
        if (patch.approvedBy !== undefined) payload.approved_by = patch.approvedBy;
        if (patch.permitStatus !== undefined) payload.permit_status = patch.permitStatus;
        if (patch.closeOutDetails !== undefined)
          payload.close_out_details = patch.closeOutDetails;
        if (patch.closeOutPhotos !== undefined)
          payload.close_out_photos = patch.closeOutPhotos;

        const { data, error } = await supabase
          .from("permits")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to update permit");
        }
        const updated = mapRow(data);
        setPermits((prev) => prev.map((p) => (p.id === id ? updated : p)));
      },
    }),
    [permits, isLoading]
  );

  return (
    <PermitContext.Provider value={value}>{children}</PermitContext.Provider>
  );
}

export function usePermits() {
  const ctx = useContext(PermitContext);
  if (!ctx) {
    throw new Error("usePermits must be used within a PermitProvider");
  }
  return ctx;
}
