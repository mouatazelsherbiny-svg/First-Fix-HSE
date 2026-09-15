"use client";

import PublicComingSoon from "@/components/PublicComingSoon";
import { useLanguage } from "@/context/LanguageContext";

export default function HseKpisPage() {
  const { t } = useLanguage();
  return <PublicComingSoon title={t.landing.navKpis} />;
}
