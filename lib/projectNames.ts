/**
 * The employee roster stores some projects by their job code (J0150, J0233…).
 * Every page shows project names instead: known codes are turned into the
 * project's name, and codes we can't match are hidden (shown as no project).
 */
export const JOB_CODE_PROJECTS: Record<string, string> = {
  J0150: "ADF",
  J0209: "KSP",
  J0223: "ROSEWOOD",
  J0231: "WELLNESS",
  J0233: "P06",
  J0235: "P09",
  J0254: "MISK",
  J0256: "RCRC",
  J0261: "Al-Arab Hospital",
  J0265: "KSKD",
  J0266: "Al-Arab Hospital",
  J0271: "Al-Madinah",
  J0275: "Al-Qiddya Hotels",
};

const JOB_CODE_RE = /^(?:P\d+\s*-\s*)?(J\d{3,})$/i;

/** Project name to show for a stored project value ("" when it's an unknown job code). */
export function projectName(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  const m = v.match(JOB_CODE_RE);
  if (!m) return v;
  return JOB_CODE_PROJECTS[m[1].toUpperCase()] ?? "";
}
