"use client";

/**
 * App-wide project filter.
 *
 * One selection ("All projects" or a single project) shared by every page.
 * The data providers (Observations, Incidents/FICC, Weekly KPI, Permits,
 * Checklists, HSE Passport) read it and hand pages only the matching rows,
 * so every card, chart and table follows the filter without page changes.
 * Look-ups by id (getById) still search all rows so detail pages keep working.
 *
 * The choice is remembered per browser (localStorage, best-effort).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PROJECTS } from "@/lib/mockData";

const STORAGE_KEY = "ff.projectFilter";

interface ProjectFilterValue {
  /** "" means all projects. */
  project: string;
  setProject: (p: string) => void;
  /** Every project name seen in the data, plus the standard project list. */
  projects: string[];
  /** Data providers report the project names they loaded. */
  addProjects: (names: (string | null | undefined)[]) => void;
}

const ProjectFilterContext = createContext<ProjectFilterValue | null>(null);

export function ProjectFilterProvider({ children }: { children: React.ReactNode }) {
  const [project, setProjectState] = useState("");
  const [known, setKnown] = useState<Set<string>>(() => new Set(PROJECTS));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setProjectState(saved);
    } catch {
      /* storage unavailable — default to all projects */
    }
  }, []);

  const setProject = useCallback((p: string) => {
    setProjectState(p);
    try {
      if (p) window.localStorage.setItem(STORAGE_KEY, p);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const addProjects = useCallback((names: (string | null | undefined)[]) => {
    setKnown((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const n of names) {
        const v = n?.trim();
        if (v && !next.has(v)) {
          next.add(v);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const projects = useMemo(() => Array.from(known).sort((a, b) => a.localeCompare(b)), [known]);

  const value = useMemo(
    () => ({ project, setProject, projects, addProjects }),
    [project, setProject, projects, addProjects]
  );

  return <ProjectFilterContext.Provider value={value}>{children}</ProjectFilterContext.Provider>;
}

export function useProjectFilter() {
  const ctx = useContext(ProjectFilterContext);
  if (!ctx) throw new Error("useProjectFilter must be used within a ProjectFilterProvider");
  return ctx;
}

/**
 * Returns `rows` narrowed to the selected project, and reports the rows'
 * project names so they appear in the filter's options.
 */
export function useProjectScoped<T>(rows: T[], projectOf: (row: T) => string | null | undefined): T[] {
  const { project, addProjects } = useProjectFilter();

  useEffect(() => {
    addProjects(rows.map(projectOf));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, addProjects]);

  return useMemo(
    () => (project ? rows.filter((r) => (projectOf(r) ?? "").trim() === project) : rows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, project]
  );
}
