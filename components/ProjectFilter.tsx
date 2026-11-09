"use client";

import { FolderOpen } from "lucide-react";
import { useProjectFilter } from "@/context/ProjectFilterContext";

/** The project picker at the top of every signed-in page (each page keeps its own choice). */
export default function ProjectFilter({ className = "" }: { className?: string }) {
  const { project, setProject, projects } = useProjectFilter();

  return (
    <label className={`flex items-center gap-2 text-sm font-medium text-brand-grayDark ${className}`}>
      <FolderOpen className="h-4 w-4 text-brand-orange" />
      Project
      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        // Black box with white text on every page; the open list is dark too.
        className={`input-field !w-auto min-w-[12rem] !border-white/25 !bg-black !py-2 !text-white [color-scheme:dark] ${project ? "!border-brand-orange font-semibold" : ""}`}
        style={{ backgroundColor: "#000", color: "#fff" }}
      >
        <option value="" style={{ backgroundColor: "#000", color: "#fff" }}>
          All Projects
        </option>
        {projects.map((p) => (
          <option key={p} value={p} style={{ backgroundColor: "#000", color: "#fff" }}>
            {p}
          </option>
        ))}
      </select>
    </label>
  );
}
