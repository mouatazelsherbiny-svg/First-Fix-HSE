"use client";

/** Phone app → Daily → Observation: the same form as the main app's Observation. */

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ObservationForm from "@/components/observations/ObservationForm";
import PageTitle from "@/components/PageTitle";

export default function MobileDailyObservationPage() {
  const [k, setK] = useState(0);
  return (
    <ProtectedRoute>
      <PageTitle section="Daily" title="Observation" />
      <ObservationForm key={k} embedded presetType={""} onDone={() => setK((x) => x + 1)} />
    </ProtectedRoute>
  );
}
