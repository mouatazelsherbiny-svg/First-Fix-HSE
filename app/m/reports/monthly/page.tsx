"use client";

/** Phone app → Monthly: the four monthly checklists (the "REPORTS" menu page). */

import { ClipboardList, Flame, HardHat, Leaf, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MobileMenuPage } from "@/components/mobile/MobileUi";

export default function MobileMonthlyMenu() {
  return (
    <ProtectedRoute hideProjectFilter>
      <MobileMenuPage
        cards={[
          { href: "/checklists/safety-health", label: "Health & Safety Checklist", icon: ClipboardList, accent: HardHat },
          { href: "/checklists/environmental", label: "Environmental Checklist", icon: ClipboardList, accent: Leaf, accentColor: "#4ade80" },
          { href: "/checklists/tc-energization", label: "T&C and Energization Checklist", icon: ClipboardList, accent: Zap },
          { href: "/checklists/fire-assessment", label: "Fire Assessment Checklist", icon: ClipboardList, accent: Flame, accentColor: "#ff4d1a" },
        ]}
      />
    </ProtectedRoute>
  );
}
