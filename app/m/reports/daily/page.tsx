"use client";

/** Phone app → Daily: Observations, KPI and Good Practice (the "REPORTS" menu page). */

import { Award, ChartNoAxesColumnIncreasing, ClipboardList, ListChecks, TrendingUp } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MobileMenuPage } from "@/components/mobile/MobileUi";

export default function MobileDailyMenu() {
  return (
    <ProtectedRoute hideProjectFilter>
      <MobileMenuPage
        cards={[
          { href: "/m/reports/daily/observation", label: "Observations", icon: ClipboardList, accent: ListChecks },
          { href: "/m/reports/daily/kpi", label: "KPI", icon: ChartNoAxesColumnIncreasing, accent: TrendingUp },
          { href: "/m/reports/daily/good-practice", label: "Good Practice", icon: Award },
        ]}
      />
    </ProtectedRoute>
  );
}
