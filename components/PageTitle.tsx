"use client";

/**
 * The page header every app page uses, the same as Incidents / Injury / PMV:
 * the section name in glowing orange, a thin divider, the page title in
 * white capitals, and on the right the page's buttons plus the project filter.
 */

import { createContext, useContext, useLayoutEffect } from "react";
import ProjectFilter from "@/components/ProjectFilter";

/** Set by ProtectedRoute: whether this page shows the project filter, and how a
 *  header claims it (so the filter sits in the header, not above it). */
export const HeaderFilterContext = createContext<{ show: boolean; claim: () => () => void }>({
  show: false,
  claim: () => () => {},
});

export default function PageTitle({
  section,
  title,
  children,
  className = "",
}: {
  /** Orange word(s) on the left, e.g. "Reports". */
  section: React.ReactNode;
  /** White title after the divider. */
  title?: React.ReactNode;
  /** Buttons / links shown on the right, before the project filter. */
  children?: React.ReactNode;
  className?: string;
}) {
  const { show, claim } = useContext(HeaderFilterContext);
  useLayoutEffect(() => (show ? claim() : undefined), [show, claim]);

  return (
    <header className={`mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4 text-white ${className}`}>
      <span
        className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]"
        style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}
      >
        {section}
      </span>
      {title && (
        <>
          <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
          <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">{title}</h1>
        </>
      )}
      {(children || show) && (
        <div className="ms-auto flex flex-wrap items-center justify-end gap-2.5">
          {children}
          {show && <ProjectFilter className="!text-white/75" />}
        </div>
      )}
    </header>
  );
}
