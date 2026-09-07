"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ComingSoonPage from "@/components/ComingSoonPage";
import { useLanguage } from "@/context/LanguageContext";

export default function PmvPage() {
  const { t } = useLanguage();
  return (
    <ProtectedRoute>
      <ComingSoonPage title={t.nav.pmv} subtitle={t.common.comingSoon} />
    </ProtectedRoute>
  );
}
