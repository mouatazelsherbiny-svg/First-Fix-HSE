"use client";

import PublicComingSoon from "@/components/PublicComingSoon";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  return <PublicComingSoon title={t.landing.navContact} />;
}
