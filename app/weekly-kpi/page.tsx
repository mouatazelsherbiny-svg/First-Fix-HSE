"use client";

// The KPI page moved into Reports (tabs "KPI Data" and "Performance Goals").
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WeeklyKpiRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/reports?tab=kpi");
  }, [router]);
  return null;
}
