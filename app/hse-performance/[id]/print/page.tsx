"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PerformanceReport from "@/components/hsePerformance/PerformanceReport";
import { supabase } from "@/lib/supabaseClient";
import { mapPerformance, type HsePerformance } from "@/lib/hsePerformance";

export default function PrintHsePerformancePage() {
  return (
    <ProtectedRoute bare>
      <PrintView />
    </ProtectedRoute>
  );
}

function PrintView() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<HsePerformance | null>(null);
  const [error, setError] = useState("");
  const printed = useRef(false);

  useEffect(() => {
    supabase
      .from("hse_performance")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (e || !data) return setError("Report not found.");
        setP(mapPerformance(data));
      });
  }, [id]);

  useEffect(() => {
    if (!p || printed.current) return;
    printed.current = true;
    const imgs = Array.from(document.images);
    Promise.all(imgs.map((im) => (im.complete ? null : new Promise((r) => (im.onload = im.onerror = r))))).then(() =>
      setTimeout(() => window.print(), 300)
    );
  }, [p]);

  return (
    <div style={{ background: "#e5e7eb", minHeight: "100vh", padding: "16px 0" }}>
      <div className="ar-noprint" style={{ width: "210mm", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href={`/hse-performance/${id}`} style={{ color: "#374151", fontSize: 14 }}>
          ← Back to report
        </Link>
        <button type="button" onClick={() => window.print()} style={{ background: "#F36F24", color: "#fff", fontWeight: 700, padding: "8px 18px", borderRadius: 10, fontSize: 14 }}>
          Print / Save as PDF
        </button>
      </div>
      {error && <p style={{ textAlign: "center", color: "#dc2626" }}>{error}</p>}
      {!p && !error && <p style={{ textAlign: "center", color: "#6b7280" }}>Loading…</p>}
      {p && <PerformanceReport p={p} />}
    </div>
  );
}
