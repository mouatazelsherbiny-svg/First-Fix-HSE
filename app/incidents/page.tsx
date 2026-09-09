"use client";

import { useMemo } from "react";
import { Wrench, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";

export default function IncidentsPage() {
  return (
    <ProtectedRoute>
      <IncidentsOverview />
    </ProtectedRoute>
  );
}

interface Metric {
  key: string;
  label: string;
  value: number;
  /** Real icon image extracted from the reference design. */
  image?: string;
  /** Fallback lucide icon — used only where no source image exists
   *  (Property Damage wasn't visible in the reference screenshot). */
  fallbackIcon?: LucideIcon;
}

function MetricIcon({ metric }: { metric: Metric }) {
  if (metric.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={metric.image} alt="" className="h-14 w-14 shrink-0 object-contain" />;
  }
  const Icon = metric.fallbackIcon!;
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-grayLight text-brand-gray">
      <Icon className="h-7 w-7" strokeWidth={1.75} />
    </div>
  );
}

function IncidentsOverview() {
  const { t } = useLanguage();
  const { records, isLoading } = useWeeklyKpi();

  // Every number here is a live sum across all Weekly KPI records, so it
  // updates automatically whenever that data changes — nothing here is
  // hand-entered. "Total Recordable" isn't its own KPI column; it's the
  // standard recordable-incidents total (Medical Treatment + Restricted
  // Work + Lost Time + Fatality — First Aid Cases are not "recordable").
  const sums = useMemo(() => {
    const totals = {
      firstAidCases: 0,
      medicalTreatmentCases: 0,
      restrictedWorkCases: 0,
      nearMisses: 0,
      lostTimeIncidents: 0,
      fatality: 0,
      environmentalIncident: 0,
      dangerousOccurrence: 0,
      propertyDamage: 0,
    };
    records.forEach((r) => {
      totals.firstAidCases += r.firstAidCases || 0;
      totals.medicalTreatmentCases += r.medicalTreatmentCases || 0;
      totals.restrictedWorkCases += r.restrictedWorkCases || 0;
      totals.nearMisses += r.nearMisses || 0;
      totals.lostTimeIncidents += r.lostTimeIncidentRate || 0;
      totals.fatality += r.fatality || 0;
      totals.environmentalIncident += r.environmentalIncident || 0;
      totals.dangerousOccurrence += r.dangerousOccurrence || 0;
      totals.propertyDamage += r.propertyDamage || 0;
    });
    return totals;
  }, [records]);

  const totalRecordable =
    sums.medicalTreatmentCases + sums.restrictedWorkCases + sums.lostTimeIncidents + sums.fatality;

  const metrics: Metric[] = [
    { key: "firstAid", label: t.incidentsOverview.firstAidCases, value: sums.firstAidCases, image: "/brand/incidents/first-aid.png" },
    { key: "medical", label: t.incidentsOverview.medicalTreatmentCases, value: sums.medicalTreatmentCases, image: "/brand/incidents/medical.png" },
    { key: "restricted", label: t.incidentsOverview.restrictedWorkCases, value: sums.restrictedWorkCases, image: "/brand/incidents/restricted.png" },
    { key: "nearMiss", label: t.incidentsOverview.nearMisses, value: sums.nearMisses, image: "/brand/incidents/near-miss.png" },
    { key: "totalRecordable", label: t.incidentsOverview.totalRecordable, value: totalRecordable, image: "/brand/incidents/total-recordable.png" },
    { key: "lostTime", label: t.incidentsOverview.lostTimeIncidents, value: sums.lostTimeIncidents, image: "/brand/incidents/lost-time.png" },
    { key: "environmental", label: t.incidentsOverview.majorEnvironmentalIncidents, value: sums.environmentalIncident, image: "/brand/incidents/environmental.png" },
    { key: "dangerous", label: t.incidentsOverview.dangerousOccurrence, value: sums.dangerousOccurrence, image: "/brand/incidents/dangerous.png" },
    { key: "fatality", label: t.incidentsOverview.fatality, value: sums.fatality, image: "/brand/incidents/fatality.png" },
    { key: "propertyDamage", label: t.incidentsOverview.propertyDamage, value: sums.propertyDamage, fallbackIcon: Wrench },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black">{t.nav.incidents}</h1>
        <p className="mt-1 text-sm text-brand-gray">{t.incidentsOverview.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-brand-gray">{t.common.loading}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((m) => (
            <div
              key={m.key}
              className="card flex flex-col items-center gap-3 !p-7 text-center"
            >
              <div className="flex items-center gap-3">
                <MetricIcon metric={m} />
                <span className="text-4xl font-extrabold leading-none text-brand-black">
                  {m.value}
                </span>
              </div>
              <p className="text-base font-semibold text-brand-grayDark">{m.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
