"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuditReport from "@/components/hseAudit/AuditReport";
import { supabase } from "@/lib/supabaseClient";
import { HseAudit, mapAudit, mapFinding } from "@/lib/hseAudit";

export default function PrintHseAuditPage() {
  return (
    <ProtectedRoute bare>
      <PrintView />
    </ProtectedRoute>
  );
}

function PrintView() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<HseAudit | null>(null);
  const [error, setError] = useState("");
  const printed = useRef(false);

  useEffect(() => {
    Promise.all([
      supabase.from("hse_audits").select("*").eq("id", id).maybeSingle(),
      supabase.from("hse_audit_findings").select("*").eq("audit_id", id).order("item_no"),
    ]).then(([a, f]) => {
      if (a.error || !a.data) return setError("Audit not found.");
      setAudit(mapAudit(a.data, (f.data ?? []).map(mapFinding)));
    });
  }, [id]);

  // Open the print dialog once the report and its photos have loaded.
  useEffect(() => {
    if (!audit || printed.current) return;
    printed.current = true;
    const imgs = Array.from(document.images);
    Promise.all(imgs.map((im) => (im.complete ? null : new Promise((r) => (im.onload = im.onerror = r))))).then(() =>
      setTimeout(() => window.print(), 300)
    );
  }, [audit]);

  return (
    <div style={{ background: "#e5e7eb", minHeight: "100vh", padding: "16px 0" }}>
      <div
        className="ar-noprint"
        style={{ width: "210mm", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Link href={`/hse-audit/${id}`} style={{ color: "#374151", fontSize: 14 }}>
          ← Back to audit
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: "#F36F24", color: "#fff", fontWeight: 700, padding: "8px 18px", borderRadius: 10, fontSize: 14 }}
        >
          Print / Save as PDF
        </button>
      </div>
      {error && <p style={{ textAlign: "center", color: "#dc2626" }}>{error}</p>}
      {!audit && !error && <p style={{ textAlign: "center", color: "#6b7280" }}>Loading…</p>}
      {audit && <AuditReport audit={audit} />}
    </div>
  );
}
