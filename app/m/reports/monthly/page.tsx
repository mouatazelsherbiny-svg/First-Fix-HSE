"use client";

/** Phone app → Monthly: the four monthly HSE checklists (same as Reports → Monthly). */

import Link from "next/link";
import { Flame, HeartPulse, Leaf, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PhotoCards from "@/components/PhotoCards";
import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileMonthlyPage() {
  return (
    <ProtectedRoute>
      <MonthlyReport />
    </ProtectedRoute>
  );
}

function MonthlyReport() {
  const { t } = useLanguage();
  const items = [
    { href: "/checklists/environmental", label: t.nav.envChecklist, icon: Leaf, color: "#2dd4bf" },
    { href: "/checklists/fire-assessment", label: t.nav.fireChecklist, icon: Flame, color: "#ef4444" },
    { href: "/checklists/safety-health", label: t.nav.shChecklist, icon: HeartPulse, color: "#f472b6" },
    { href: "/checklists/tc-energization", label: t.nav.tcChecklist, icon: Zap, color: "#facc15" },
  ];
  return (
    <div>
      <PageTitle section={t.nav.reports} title={t.reports.tabMonthly} />
      <p className="mb-4 text-center text-sm font-semibold tracking-wide text-white/60">{t.reports.monthlyIntro}</p>
      <PhotoCards size="lg" className="mb-6" items={items.map((c) => ({ key: c.href, label: c.label, icon: c.icon, color: c.color, href: c.href }))} />
      <div className="flex justify-center">
        <Link href="/my-checklists" className="btn-secondary inline-flex">
          {t.reports.viewMyChecklist}
        </Link>
      </div>
    </div>
  );
}
