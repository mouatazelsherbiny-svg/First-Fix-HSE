"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ObservationForm from "@/components/observations/ObservationForm";

export default function NewObservationPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <NewObservation />
      </Suspense>
    </ProtectedRoute>
  );
}

function NewObservation() {
  const searchParams = useSearchParams();
  return <ObservationForm presetType={searchParams.get("type") || ""} />;
}
