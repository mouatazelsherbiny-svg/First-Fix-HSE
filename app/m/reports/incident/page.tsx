"use client";

/** Phone app → Incident: the Incident Investigation Report (the "REPORTS" menu page). */

import { ClipboardList, Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MobileMenuPage } from "@/components/mobile/MobileUi";

export default function MobileIncidentMenu() {
  return (
    <ProtectedRoute hideProjectFilter>
      <MobileMenuPage cards={[{ href: "/m/reports/iir", label: "Incident Investigation Report", icon: ClipboardList, accent: Search }]} />
    </ProtectedRoute>
  );
}
