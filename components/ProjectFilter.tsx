"use client";

import { FolderOpen } from "lucide-react";
import { useProjectFilter } from "@/context/ProjectFilterContext";

/** The app-wide project picker shown at the top of every signed-in page. */
export default function ProjectFilter({ className = "" }: { className?: string }) {
  const { project, setProject, projects } = useProjectFilter();

  return (
    <label className={`flex items-center gap-2 text-sm font-medium text-brand-grayDark ${className}`}>
      <FolderOpen className="h-4 w-4 text-brand-orange" />
      Project
      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className={`input-field !w-auto min-w-[12rem] !py-2 ${project ? "!border-brand-orange font-semibold" : ""}`}
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </label>
  );
}
