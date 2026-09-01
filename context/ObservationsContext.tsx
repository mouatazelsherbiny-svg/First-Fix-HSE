"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Observation } from "@/types/observation";
import { supabase, getCurrentUserId } from "@/lib/supabaseClient";

interface ObservationsContextValue {
  observations: Observation[];
  isLoading: boolean;
  getById: (id: string) => Observation | undefined;
  addObservation: (
    obs: Omit<Observation, "id" | "reportNumber" | "createdAt" | "updatedAt">
  ) => Promise<Observation>;
  updateObservation: (id: string, patch: Partial<Observation>) => Promise<void>;
}

const ObservationsContext = createContext<ObservationsContextValue | undefined>(
  undefined
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Observation {
  return {
    id: row.id,
    reportNumber: row.report_number,
    projectName: row.project_name,
    observationType: row.observation_type,
    observationTypeOther: row.observation_type_other ?? undefined,
    observationDetails: row.observation_details,
    classification: row.classification,
    riskRating: row.risk_rating,
    observationPhotos: row.observation_photos ?? [],
    closeOutPhotos: row.close_out_photos ?? [],
    closeOutDetails: row.close_out_details ?? "",
    status: row.status,
    inspectedBy: row.inspected_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function ObservationsProvider({ children }: { children: ReactNode }) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("observations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setObservations(data.map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ObservationsContextValue>(
    () => ({
      observations,
      isLoading,
      getById: (id: string) => observations.find((o) => o.id === id),
      addObservation: async (obs) => {
        const created_by = await getCurrentUserId();
        const { data, error } = await supabase
          .from("observations")
          .insert({
            project_name: obs.projectName,
            observation_type: obs.observationType,
            observation_type_other: obs.observationTypeOther ?? null,
            observation_details: obs.observationDetails,
            classification: obs.classification,
            risk_rating: obs.riskRating,
            observation_photos: obs.observationPhotos,
            close_out_photos: obs.closeOutPhotos,
            close_out_details: obs.closeOutDetails,
            status: obs.status,
            inspected_by: obs.inspectedBy,
            created_by,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to create observation");
        }
        const newObs = mapRow(data);
        setObservations((prev) => [newObs, ...prev]);
        return newObs;
      },
      updateObservation: async (id, patch) => {
        const payload: Record<string, unknown> = {};
        if (patch.status !== undefined) payload.status = patch.status;
        if (patch.closeOutDetails !== undefined)
          payload.close_out_details = patch.closeOutDetails;
        if (patch.closeOutPhotos !== undefined)
          payload.close_out_photos = patch.closeOutPhotos;

        const { data, error } = await supabase
          .from("observations")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to update observation");
        }
        const updated = mapRow(data);
        setObservations((prev) => prev.map((o) => (o.id === id ? updated : o)));
      },
    }),
    [observations, isLoading]
  );

  return (
    <ObservationsContext.Provider value={value}>
      {children}
    </ObservationsContext.Provider>
  );
}

export function useObservations() {
  const ctx = useContext(ObservationsContext);
  if (!ctx) {
    throw new Error(
      "useObservations must be used within an ObservationsProvider"
    );
  }
  return ctx;
}
