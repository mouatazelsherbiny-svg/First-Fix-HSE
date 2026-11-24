"use client";

/** Phone app → Daily → Good Practice: the same form as the main app's Good Practice. */

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ObservationForm from "@/components/observations/ObservationForm";
import PageTitle from "@/components/PageTitle";

export default function MobileDailyGoodPracticePage() {
  const [k, setK] = useState(0);
  return (
    <ProtectedRoute>
      <PageTitle section="Daily" title="Good Practice" />
      <ObservationForm key={k} embedded presetType={"Good Practice"} onDone={() => setK((x) => x + 1)} />
    </ProtectedRoute>
  );
}
