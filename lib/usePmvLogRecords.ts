"use client";

/**
 * Generic data hook for the 11 PMV Log tables (see lib/pmvLogs.ts). Rows are
 * kept as raw snake_case Supabase records — no camelCase mapping layer,
 * since the table/column set is config-driven and only ever rendered
 * generically (components/pmv/PmvLogTable.tsx + PmvLogFormModal.tsx).
 *
 * Convention match with the rest of the app: no delete (this app never
 * exposes delete anywhere), created_by stamped from the session on insert,
 * updated_at stamped on update.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase, getCurrentUserId, fetchAllRows } from "@/lib/supabaseClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PmvLogRow = Record<string, any> & {
  id: string;
  project_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at?: string | null;
};

export function usePmvLogRecords(table: string) {
  const [rows, setRows] = useState<PmvLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllRows<PmvLogRow>(table, (q) =>
        q.select("*").order("created_at", { ascending: false })
      );
      setRows(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setIsLoading(false);
    }
  }, [table]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addRow = useCallback(
    async (values: Record<string, unknown>) => {
      const created_by = await getCurrentUserId();
      const { data, error } = await supabase
        .from(table)
        .insert({ ...values, created_by })
        .select()
        .single();
      if (error || !data) {
        throw new Error(error?.message ?? "Failed to add record");
      }
      const row = data as PmvLogRow;
      setRows((prev) => [row, ...prev]);
      return row;
    },
    [table]
  );

  const updateRow = useCallback(
    async (id: string, values: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from(table)
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error || !data) {
        throw new Error(error?.message ?? "Failed to update record");
      }
      const row = data as PmvLogRow;
      setRows((prev) => prev.map((r) => (r.id === id ? row : r)));
      return row;
    },
    [table]
  );

  return { rows, isLoading, error, refetch, addRow, updateRow };
}
