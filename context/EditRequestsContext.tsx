"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { EditRequest, EditRequestStatus } from "@/types/editRequest";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";

interface EditRequestsContextValue {
  requests: EditRequest[];
  isLoading: boolean;
  submitRequest: (input: {
    tableName: string;
    recordId: string;
    recordLabel: string;
    requesterName: string;
    requesterProject: string;
    notes: string;
  }) => Promise<void>;
  updateStatus: (id: string, status: EditRequestStatus) => Promise<void>;
}

const EditRequestsContext = createContext<EditRequestsContextValue | undefined>(
  undefined
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): EditRequest {
  return {
    id: row.id,
    tableName: row.table_name,
    recordId: row.record_id,
    recordLabel: row.record_label ?? "",
    requestedBy: row.requested_by,
    requesterName: row.requester_name ?? "",
    requesterProject: row.requester_project ?? "",
    notes: row.notes ?? "",
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

// Read-only-by-default data model: employees can no longer edit records
// like Weekly KPI directly (see app/weekly-kpi/[id]/page.tsx) — instead
// they submit a request here, which an admin reviews (see
// app/edit-requests/page.tsx) and applies by hand.
export function EditRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("edit_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setRequests(data.map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<EditRequestsContextValue>(
    () => ({
      requests,
      isLoading,
      submitRequest: async (input) => {
        const requested_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("edit_requests")
          .insert({
            table_name: input.tableName,
            record_id: input.recordId,
            record_label: input.recordLabel,
            requested_by,
            requester_name: input.requesterName,
            requester_project: input.requesterProject,
            notes: input.notes,
            status: "Pending",
          })
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to submit request");
        }
        setRequests((prev) => [mapRow(data), ...prev]);
      },
      updateStatus: async (id, status) => {
        const { data, error } = await supabase
          .from("edit_requests")
          .update({ status, resolved_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to update request");
        }
        setRequests((prev) => prev.map((r) => (r.id === id ? mapRow(data) : r)));
      },
    }),
    [requests, isLoading]
  );

  return (
    <EditRequestsContext.Provider value={value}>
      {children}
    </EditRequestsContext.Provider>
  );
}

export function useEditRequests() {
  const ctx = useContext(EditRequestsContext);
  if (!ctx) {
    throw new Error("useEditRequests must be used within an EditRequestsProvider");
  }
  return ctx;
}
