"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PerformanceForm from "@/components/hsePerformance/PerformanceForm";
import PageTitle from "@/components/PageTitle";
import { emptyPerformance } from "@/lib/hsePerformance";

export default function NewHsePerformancePage() {
  return (
    <ProtectedRoute>
      <NewReport />
    </ProtectedRoute>
  );
}

function NewReport() {
  const router = useRouter();
  return (
    <>
        <div>
          <Link href="/hse-performance" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-gray hover:text-brand-orange">
            <ArrowLeft className="h-4 w-4" /> HSE Performance
          </Link>
          <PageTitle section="HSE Performance" title="New Weekly Performance Report" />
          <PerformanceForm
            initial={emptyPerformance()}
            onSaved={(id) => router.push(`/hse-performance/${id}`)}
            onCancel={() => router.push("/hse-performance")}
          />
        </div>
    </>
  );
}
