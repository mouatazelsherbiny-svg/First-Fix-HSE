"use client";

/** Phone app → Daily Report: the same Daily section as Reports (KPI, New Observation, Good Practice). */

import { useState } from "react";
import { ChartColumn, Eye, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DailyKpiGrid from "@/components/reports/DailyKpiGrid";
import ObservationForm from "@/components/observations/ObservationForm";
import PhotoCards from "@/components/PhotoCards";
import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileReportsPage() {
  return (
    <ProtectedRoute>
      <DailyReport />
    </ProtectedRoute>
  );
}

function DailyReport() {
  const { t } = useLanguage();
  const [view, setView] = useState<"observation" | "kpi" | "good">("kpi");
  const [formKey, setFormKey] = useState(0);

  const VIEWS = [
    { key: "observation" as const, label: t.list.newBtn.replace(/^\+\s*/, ""), icon: Eye, color: "#f36f24" },
    { key: "kpi" as const, label: "KPI", icon: ChartColumn, color: "#4f8fd6" },
    { key: "good" as const, label: t.list.goodPracticeBtn.replace(/^\+\s*/, ""), icon: Sparkles, color: "#22c55e" },
  ];

  return (
    <div>
      <PageTitle section={t.nav.reports} title={t.reports.tabDaily} />
      <PhotoCards
        className="mb-5"
        items={VIEWS.map((v) => ({ ...v, active: view === v.key, onClick: () => setView(v.key) }))}
      />
      {view === "kpi" ? (
        <DailyKpiGrid />
      ) : (
        <ObservationForm
          key={`${view}-${formKey}`}
          embedded
          presetType={view === "good" ? "Good Practice" : ""}
          onDone={() => setFormKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
