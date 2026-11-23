"use client";

/** Phone app home (after signing in): big cards — Daily, Monthly and IIR. */

import { CalendarDays, ClipboardList, FileSearch } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PhotoCards from "@/components/PhotoCards";
import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileHomePage() {
  return (
    <ProtectedRoute>
      <MobileHome />
    </ProtectedRoute>
  );
}

function MobileHome() {
  const { t } = useLanguage();
  return (
    <div>
      <PageTitle section={t.nav.reports} title="HSE Reporting" />
      <div className="flex min-h-[calc(100dvh-20rem)] items-center justify-center">
        <PhotoCards
          size="lg"
          className="w-full"
          items={[
            { key: "daily", label: t.reports.tabDaily, icon: ClipboardList, color: "#f36f24", href: "/m/reports/daily" },
            { key: "monthly", label: t.reports.tabMonthly, icon: CalendarDays, color: "#4f8fd6", href: "/m/reports/monthly" },
            { key: "iir", label: "IIR", icon: FileSearch, color: "#ef4444", href: "/m/reports/iir" },
          ]}
        />
      </div>
    </div>
  );
}
