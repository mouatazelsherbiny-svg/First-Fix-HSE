"use client";

/**
 * The page header every app page uses, the same as Incidents / Injury / PMV:
 * the section name in glowing orange, a thin divider, the page title in
 * white capitals, and on the right the page's buttons plus the project filter.
 */

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectFilter from "@/components/ProjectFilter";
import { inMobileApp } from "@/lib/mobileApp";

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
  back,
}: {
  /** A back button before the title (e.g. a checklist → Reports / Monthly). Not shown in the phone app, which has its own. */
  back?: { href: string; label: string };
  /** Orange word(s) on the left, e.g. "Reports". */
  section: React.ReactNode;
  /** White title after the divider. */
  title?: React.ReactNode;
  /** Buttons / links shown on the right, before the project filter. */
  children?: React.ReactNode;
  className?: string;
}) {
  const { show, claim } = useContext(HeaderFilterContext);
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(inMobileApp(window.location.pathname)), []);
  useLayoutEffect(() => (show ? claim() : undefined), [show, claim]);

  return (
    <header className={`mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4 text-white ${className}`}>
      {back && !mobile && (
        <Link
          href={back.href}
          title={back.label}
          aria-label={back.label}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 text-sm font-semibold text-white/85 transition hover:border-[#f36f24] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{back.label}</span>
        </Link>
      )}
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
