"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import HomeDashboard from "@/components/dashboard/HomeDashboard";
import { useHomeDashboard } from "@/lib/useHomeDashboard";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  return (
    <ProtectedRoute hideProjectFilter>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const data = useHomeDashboard();
  const { user } = useAuth();
  return <HomeDashboard data={data} project={user?.project ?? "KSP"} />;
}
