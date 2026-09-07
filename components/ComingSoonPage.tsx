"use client";

import ConstructionIllustration from "./ConstructionIllustration";

/** Shared placeholder for nav sections that exist in the sidebar but don't
 *  have their content built yet (Incidents, Injury, PMV, Summary
 *  Performance Report, and the Reports page's still-empty Daily/Weekly
 *  tabs). Swap this out for the real page content once it's defined. */
export default function ComingSoonPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="w-48 sm:w-56">
        <ConstructionIllustration />
      </div>
      <div>
        <h1 className="text-xl font-bold text-brand-black">{title}</h1>
        {subtitle && <p className="mt-2 max-w-md text-sm text-brand-gray">{subtitle}</p>}
      </div>
    </div>
  );
}
