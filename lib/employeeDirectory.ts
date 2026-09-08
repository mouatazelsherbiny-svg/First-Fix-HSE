import { supabase } from "./supabaseClient";
import { EmployeeRecord } from "./mockData";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEmployee(row: any): EmployeeRecord {
  return {
    id: row.id,
    name: row.name,
    employeeId: row.employee_code,
    project: row.project,
    department: row.department,
    phone: row.phone ?? "",
    jobGrade: row.job_grade ?? "",
    photoUrl: row.photo_url ?? "",
  };
}

/** Searches the employees directory by name or employee code, server-side.
 *  The table holds the company's full real employee roster (thousands of
 *  rows), so callers must never load it all into the browser — this always
 *  runs the filter in Postgres and returns at most `limit` matches. */
export async function searchEmployees(
  query: string,
  limit = 8
): Promise<EmployeeRecord[]> {
  const q = query.trim();
  if (!q) return [];

  // Escape ilike wildcards the user might type literally, and quote marks
  // that would otherwise break the .or() filter string.
  const escaped = q.replace(/[%_,()]/g, (m) => `\\${m}`);

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .or(`name.ilike.%${escaped}%,employee_code.ilike.%${escaped}%`)
    .order("name")
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapEmployee);
}
