"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Incident } from "@/types/incident";
import { supabase } from "@/lib/supabaseClient";

interface IncidentsContextValue {
  incidents: Incident[];
  isLoading: boolean;
  getById: (id: string) => Incident | undefined;
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
  };
}

// Same shape as the other data providers (ObservationsContext,
// ToolboxTalkContext, ...): an unfiltered select on mount, with pages
// filtering by project client-side as needed. Read-only for now — nothing
// in the app creates/edits incidents yet, this just powers the FICC-related
// dashboard cards.
export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("incidents")
      .select("*")
      .order("incident_date", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setIncidents(data.map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<IncidentsContextValue>(
    () => ({
      incidents,
      isLoading,
      getById: (id: string) => incidents.find((i) => i.id === id),
    }),
    [incidents, isLoading]
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
