"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ComingSoonPage from "@/components/ComingSoonPage";
import { useLanguage } from "@/context/LanguageContext";

export default function IncidentsPage() {
  const { t } = useLanguage();
  return (
    <ProtectedRoute>
      <ComingSoonPage title={t.nav.incidents} subtitle={t.common.comingSoon} />
    </ProtectedRoute>
  );
}
