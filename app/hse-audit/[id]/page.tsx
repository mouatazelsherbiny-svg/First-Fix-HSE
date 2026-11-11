"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuditForm from "@/components/hseAudit/AuditForm";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { HseAudit, formatDate, mapAudit, mapFinding } from "@/lib/hseAudit";
import PageTitle from "@/components/PageTitle";

export default function HseAuditDetailPage() {
  return (
    <ProtectedRoute>
      <AuditDetail />
    </ProtectedRoute>
  );
}

function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [audit, setAudit] = useState<HseAudit | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("hse_audits").select("*").eq("id", id).maybeSingle(),
      supabase.from("hse_audit_findings").select("*").eq("audit_id", id).order("item_no"),
    ]).then(([a, f]) => {
      if (!active) return;
      if (a.error || !a.data) return setError("Audit not found.");
      setAudit(mapAudit(a.data, (f.data ?? []).map(mapFinding)));
    });
    return () => {
      active = false;
    };
  }, [id, version]);

  const remove = async () => {
    if (!window.confirm("Delete this audit and all its findings?")) return;
    setDeleting(true);
    const { error: e } = await supabase.from("hse_audits").delete().eq("id", id);
    setDeleting(false);
    if (e) return setError(e.message);
    router.push("/hse-audit");
  };

  return (
    <div>
      <Link href="/hse-audit" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-gray hover:text-brand-orange">
        <ArrowLeft className="h-4 w-4" /> HSE Audit
      </Link>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      {saved && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Audit saved.</p>}
      {!audit && !error && <p className="text-sm text-brand-gray">Loading…</p>}
      {audit && (
        <>
          <PageTitle section="HSE Audit" title={audit.projectName}>
            <span className="text-sm text-white/60">{formatDate(audit.auditDate)}</span>
            <div className="flex flex-wrap gap-2">
              <a href={`/hse-audit/${id}/print`} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2">
                <Printer className="h-4 w-4" /> Print Report
              </a>
              {audit.reportFile && (
                <a href={audit.reportFile} download={audit.reportFileName || "HSE Audit Report"} className="btn-secondary gap-2">
                  <Download className="h-4 w-4" /> Report File
                </a>
              )}
              {isAdmin && (
                <button type="button" onClick={remove} disabled={deleting} className="btn-secondary gap-2 !text-red-600 disabled:opacity-60">
                  <Trash2 className="h-4 w-4" /> {deleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </PageTitle>
          <AuditForm
            key={version}
            initial={audit}
            onSaved={() => {
              setAudit(null);
              setSaved(true);
              setVersion((v) => v + 1);
            }}
            onCancel={() => router.push("/hse-audit")}
          />
        </>
      )}
    </div>
  );
}
