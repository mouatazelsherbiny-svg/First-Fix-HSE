"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOnly from "@/components/iir/AdminOnly";
import PerformanceForm from "@/components/hsePerformance/PerformanceForm";
import PageTitle from "@/components/PageTitle";
import { supabase } from "@/lib/supabaseClient";
import { formatDate } from "@/lib/hseAudit";
import { mapPerformance, weekLabel, type HsePerformance } from "@/lib/hsePerformance";

export default function HsePerformanceDetailPage() {
  return (
    <ProtectedRoute>
      <AdminOnly>
        <PerformanceDetail />
      </AdminOnly>
    </ProtectedRoute>
  );
}

function PerformanceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<HsePerformance | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("hse_performance")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (!active) return;
        if (e || !data) return setError("Report not found.");
        setP(mapPerformance(data));
      });
    return () => {
      active = false;
    };
  }, [id, version]);

  const remove = async () => {
    if (!window.confirm("Delete this HSE Performance report?")) return;
    const { error: e } = await supabase.from("hse_performance").delete().eq("id", id);
    if (e) return setError(e.message);
    router.push("/hse-performance");
  };

  return (
    <div>
      <Link href="/hse-performance" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-gray hover:text-brand-orange">
        <ArrowLeft className="h-4 w-4" /> HSE Performance
      </Link>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      {saved && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Report saved.</p>}
      {!p && !error && <p className="text-sm text-brand-gray">Loading…</p>}
      {p && (
        <>
          <PageTitle section="HSE Performance" title={p.projectName || "Report"}>
            <span className="text-sm text-white/60">{weekLabel(p.assessmentDate)} · {formatDate(p.assessmentDate)}</span>
            <button type="button" onClick={remove} className="btn-secondary gap-2 !text-red-600">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </PageTitle>
          <PerformanceForm
            key={version}
            initial={p}
            onSaved={() => {
              setSaved(true);
              setVersion((v) => v + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onCancel={() => router.push("/hse-performance")}
          />
        </>
      )}
    </div>
  );
}
