"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ComingSoonPage from "@/components/ComingSoonPage";
import { useLanguage } from "@/context/LanguageContext";

export default function InjuryPage() {
  const { t } = useLanguage();
  return (
    <ProtectedRoute>
      <ComingSoonPage title={t.nav.injury} subtitle={t.common.comingSoon} />
    </ProtectedRoute>
  );
}
