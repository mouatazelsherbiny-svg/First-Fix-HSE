"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { FiccInput, Incident } from "@/types/incident";
import { fetchAllRows, getCurrentUserId, supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const IIR_WINDOW_MS = 48 * 60 * 60 * 1000;

interface IncidentsContextValue {
  incidents: Incident[];
  isLoading: boolean;
  getById: (id: string) => Incident | undefined;
  /** Creates the FICC row (record_type "Incident", iir_status "Open") and
   *  starts its 48h IIR window. Also fires the deadline-notice email via
   *  the send-ficc-email edge function — a failure there never blocks the
   *  FICC save itself, it just leaves ficc_deadline_email_sent false. */
  submitFicc: (input: FiccInput) => Promise<Incident>;
  /** Marks the parent incident's IIR as filed once the IIR form is saved. */
  markIirSubmitted: (incidentId: string) => Promise<void>;
  /** Attaches a completed IIR document (as a base64 data URL) to the
   *  incident and closes out its IIR — the FICC page's "Attach IIR" flow,
   *  replacing the old in-app IIR form for this button. */
  attachIirFile: (
    incidentId: string,
    fileUrl: string,
    fileName: string
  ) => Promise<void>;
}

const IncidentsContext = createContext<IncidentsContextValue | undefined>(
  undefined
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Incident {
  return {
    id: row.id,
    incidentNumber: row.incident_number,
    reportYear: row.report_year,
    incidentDate: row.incident_date,
    incidentCategory: row.incident_category,
    recordType: row.record_type,
    classification: row.classification,
    projectName: row.project_name,
    incidentLocation: row.incident_location ?? "",
    team: row.team,
    subcontractorName: row.subcontractor_name,
    incidentDescription: row.incident_description ?? "",
    bodyPart: row.body_part,
    projectDirector: row.project_director,
    projectManager: row.project_manager,
    spic: row.spic,
    iirSubmissionDate: row.iir_submission_date,
    comment: row.comment,
    iirStatus: row.iir_status,
    sourceCreatedBy: row.source_created_by,
    sourceModifiedBy: row.source_modified_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    constructionManager: row.construction_manager ?? null,
    investigationCommenced: !!row.investigation_commenced,
    ficcSubmittedBy: row.ficc_submitted_by,
    iirDueAt: row.iir_due_at,
    ficcDeadlineEmailSent: !!row.ficc_deadline_email_sent,
    iirFileUrl: row.iir_file_url ?? null,
    iirFileName: row.iir_file_name ?? null,
  };
}

// Same shape as the other data providers (ObservationsContext,
// WeeklyKpiContext, ...): an unfiltered select on mount, with pages
// filtering by project client-side as needed. Writes (submitFicc /
// markIirSubmitted) power the FICC/IIR workflow (app/ficc/page.tsx);
// everything else here remains read-only, same as before.
export function IncidentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gated on `user` — see the matching comment in ObservationsContext.tsx.
  useEffect(() => {
    if (!user) {
      setIncidents([]);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    fetchAllRows<any>("incidents", (q) =>
      q.select("*").order("incident_date", { ascending: false })
    )
      .then((data) => {
        if (!active) return;
        setIncidents(data.map(mapRow));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo<IncidentsContextValue>(
    () => ({
      incidents,
      isLoading,
      getById: (id: string) => incidents.find((i) => i.id === id),

      submitFicc: async (input: FiccInput) => {
        const created_by = await getCurrentUserId();
        const incidentDateTime = input.incidentTime
          ? `${input.incidentDate}T${input.incidentTime}:00`
          : `${input.incidentDate}T00:00:00`;
        const now = new Date();
        const iirDueAt = new Date(now.getTime() + IIR_WINDOW_MS).toISOString();

        const { data, error } = await supabase
          .from("incidents")
          .insert({
            incident_category: input.incidentCategory,
            record_type: "Incident",
            project_name: input.projectName,
            incident_location: input.incidentLocation,
            incident_date: incidentDateTime,
            report_year: String(new Date(incidentDateTime).getFullYear()),
            incident_description: input.incidentDescription,
            project_director: input.projectDirector || null,
            project_manager: input.projectManager || null,
            construction_manager: input.constructionManager || null,
            spic: input.spic || null,
            investigation_commenced: input.investigationCommenced,
            iir_status: "Open",
            iir_due_at: iirDueAt,
            ficc_submitted_by: created_by,
            created_by,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to submit FICC");
        }
        const incident = mapRow(data);
        setIncidents((prev) => [incident, ...prev]);

        // Best-effort — the FICC is already saved regardless of whether the
        // notice email goes out. See supabase/functions/send-ficc-email.
        try {
          const { error: fnError } = await supabase.functions.invoke(
            "send-ficc-email",
            {
              body: {
                incidentId: incident.id,
                incidentNumber: incident.incidentNumber,
                toEmail: user?.email,
                toName: user?.name,
                projectName: incident.projectName,
                incidentLocation: incident.incidentLocation,
                iirDueAt,
              },
            }
          );
          if (!fnError) {
            await supabase
              .from("incidents")
              .update({ ficc_deadline_email_sent: true })
              .eq("id", incident.id);
            setIncidents((prev) =>
              prev.map((i) =>
                i.id === incident.id ? { ...i, ficcDeadlineEmailSent: true } : i
              )
            );
          }
        } catch {
          // Swallow — email delivery is not allowed to block or fail the
          // FICC submission itself.
        }

        return incident;
      },

      markIirSubmitted: async (incidentId: string) => {
        const { data, error } = await supabase
          .from("incidents")
          .update({
            iir_status: "Closed",
            iir_submission_date: new Date().toISOString().slice(0, 10),
          })
          .eq("id", incidentId)
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to update IIR status");
        }
        const updated = mapRow(data);
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? updated : i))
        );
      },

      attachIirFile: async (incidentId: string, fileUrl: string, fileName: string) => {
        const { data, error } = await supabase
          .from("incidents")
          .update({
            iir_file_url: fileUrl,
            iir_file_name: fileName,
            iir_status: "Closed",
            iir_submission_date: new Date().toISOString().slice(0, 10),
          })
          .eq("id", incidentId)
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message ?? "Failed to attach IIR file");
        }
        const updated = mapRow(data);
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? updated : i))
        );
      },
    }),
    [incidents, user]
  );

  return (
    <IncidentsContext.Provider value={value}>
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidents() {
  const ctx = useContext(IncidentsContext);
  if (!ctx) {
    throw new Error("useIncidents must be used within an IncidentsProvider");
  }
  return ctx;
}
