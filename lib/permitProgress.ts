import { PermitToWork } from "@/types/permit";

/**
 * Derives the simplified "Permit Status" pill (New Permit / In Progress /
 * Closed) shown across the app. Only "New Permit" and "Closed" are ever
 * written to the database (see PermitProgressStatus in types/permit.ts) —
 * "In Progress" is computed here, purely for display, from the current
 * time against the permit's scheduled start date/time.
 */
export function getPermitProgress(
  permit: Pick<PermitToWork, "permitStatus" | "startDate" | "startTime">
): "New Permit" | "In Progress" | "Closed" {
  if (permit.permitStatus === "Closed") return "Closed";

  if (!permit.startDate) return "New Permit";
  const start = new Date(`${permit.startDate}T${permit.startTime || "00:00"}`);
  if (Number.isNaN(start.getTime())) return "New Permit";

  return new Date() >= start ? "In Progress" : "New Permit";
}
