"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import HomeDashboard from "@/components/dashboard/HomeDashboard";
import { useHomeDashboard } from "@/lib/useHomeDashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const data = useHomeDashboard();
  return <HomeDashboard data={data} />;
}
