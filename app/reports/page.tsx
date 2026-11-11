"use client";

import { useState } from "react";
import Link from "next/link";
import { ChartColumn, Eye, Flame, HeartPulse, Leaf, Sparkles, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DailyKpiGrid from "@/components/reports/DailyKpiGrid";
import ObservationForm from "@/components/observations/ObservationForm";
import PhotoCards from "@/components/PhotoCards";
import { useLanguage } from "@/context/LanguageContext";
import PageTitle from "@/components/PageTitle";

type ReportTab = "daily" | "monthly";

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<ReportTab>("daily");
  const [dailyView, setDailyView] = useState<"observation" | "kpi" | "good">("kpi");
  // Bumped after a save / cancel so the form comes back empty.
  const [formKey, setFormKey] = useState(0);

  const DAILY_VIEWS = [
    { key: "observation" as const, label: t.list.newBtn.replace(/^\+\s*/, ""), icon: Eye, image: "/brand/passport/panel-disciplinary.jpg" },
    { key: "kpi" as const, label: "KPI", icon: ChartColumn, image: "/brand/dashboard-hero.jpg", position: "35% center" },
    { key: "good" as const, label: t.list.goodPracticeBtn.replace(/^\+\s*/, ""), icon: Sparkles, image: "/brand/news/eyewash-rosewood.jpg", position: "center 30%" },
  ];

  // The 4 monthly HSE checklist templates — previously their own sidebar
  // group, now surfaced here under Reports → Monthly (see the sidebar
  // restructure). The pages themselves are unchanged.
  const monthlyChecklists = [
    { href: "/checklists/environmental", label: t.nav.envChecklist, icon: Leaf, image: "/brand/news/walkthrough.jpg", position: "55% center" },
    { href: "/checklists/fire-assessment", label: t.nav.fireChecklist, icon: Flame, image: "/brand/news/training-oceanarium.jpg", position: "center 25%" },
    { href: "/checklists/safety-health", label: t.nav.shChecklist, icon: HeartPulse, image: "/brand/passport/panel-ppe.jpg" },
    { href: "/checklists/tc-energization", label: t.nav.tcChecklist, icon: Zap, image: "/brand/sidebar-bg.jpg", position: "center 30%" },
  ];

  const TABS: { key: ReportTab; label: string }[] = [
    { key: "daily", label: t.reports.tabDaily },
    { key: "monthly", label: t.reports.tabMonthly },
  ];

  return (
    <div>
      <PageTitle section={t.nav.reports} title="HSE Reporting" />

      <div className="mb-6 flex gap-1 border-b border-brand-border">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === tabItem.key
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-brand-grayDark hover:text-brand-black"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "monthly" ? (
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-brand-gray">
              {t.reports.monthlyIntro}
            </h2>
            <PhotoCards
              className=""
              items={monthlyChecklists.map((c) => ({ key: c.href, label: c.label, icon: c.icon, image: c.image, position: c.position, href: c.href }))}
            />
          </div>
          <Link href="/my-checklists" className="btn-secondary inline-flex">
            {t.reports.viewMyChecklist}
          </Link>
        </div>
      ) : (
        <div>
          <PhotoCards
            className="mb-5"
            items={DAILY_VIEWS.map((v) => ({
              key: v.key,
              label: v.label,
              icon: v.icon,
              image: v.image,
              position: v.position,
              active: dailyView === v.key,
              onClick: () => setDailyView(v.key),
            }))}
          />
          {dailyView === "kpi" ? (
            <DailyKpiGrid />
          ) : (
            <div>
              <ObservationForm
                key={`${dailyView}-${formKey}`}
                embedded
                presetType={dailyView === "good" ? "Good Practice" : ""}
                onDone={() => setFormKey((k) => k + 1)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
