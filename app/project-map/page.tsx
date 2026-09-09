"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { usePermits } from "@/context/PermitContext";
import { PROJECT_LOCATIONS } from "@/lib/projectLocations";

// Leaflet touches `window` at import time, so it can only ever run in the
// browser — loading it through next/dynamic with ssr:false keeps it out of
// the server render entirely instead of crashing it.
const ProjectMap = dynamic(() => import("@/components/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
    </div>
  ),
});

export default function ProjectMapPage() {
  return (
    <ProtectedRoute>
      <ProjectMapContent />
    </ProtectedRoute>
  );
}

function ProjectMapContent() {
  const { t } = useLanguage();
  const { permits, isLoading } = usePermits();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    permits.forEach((p) => {
      map.set(p.projectName, (map.get(p.projectName) ?? 0) + 1);
    });
    return PROJECT_LOCATIONS.map((loc) => ({
      project: loc.project,
      count: map.get(loc.project) ?? 0,
    })).sort((a, b) => b.count - a.count);
  }, [permits]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">{t.projectMap.title}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.projectMap.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="card !p-2 lg:flex-1">
            <div className="h-[65vh] w-full overflow-hidden rounded-xl">
              <ProjectMap />
            </div>
          </div>

          <div className="card w-full shrink-0 !p-4 lg:w-72">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-grayDark">
              {t.projectMap.listTitle}
            </h2>
            <div className="max-h-[60vh] space-y-1 overflow-y-auto">
              {counts.map((c) => (
                <div
                  key={c.project}
                  className="flex items-center justify-between rounded-lg bg-brand-grayLight/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-brand-grayDark">{c.project}</span>
                  <span className="font-bold text-brand-black">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
