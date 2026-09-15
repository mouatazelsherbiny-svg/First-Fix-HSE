"use client";

import PublicComingSoon from "@/components/PublicComingSoon";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return <PublicComingSoon title={t.landing.navAbout} />;
}
