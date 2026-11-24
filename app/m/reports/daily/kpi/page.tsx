"use client";

/** Phone app → Daily → KPI. */

import ProtectedRoute from "@/components/ProtectedRoute";
import DailyKpiGrid from "@/components/reports/DailyKpiGrid";
import PageTitle from "@/components/PageTitle";

export default function MobileDailyKpiPage() {
  return (
    <ProtectedRoute>
      <PageTitle section="Daily" title="KPI" />
      <DailyKpiGrid />
    </ProtectedRoute>
  );
}
