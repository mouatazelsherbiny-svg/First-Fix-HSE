"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOnly from "@/components/iir/AdminOnly";
import PerformanceForm from "@/components/hsePerformance/PerformanceForm";
import PageTitle from "@/components/PageTitle";
import { emptyPerformance } from "@/lib/hsePerformance";

export default function NewHsePerformancePage() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <AdminOnly>
        <div>
          <Link href="/hse-performance" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-gray hover:text-brand-orange">
            <ArrowLeft className="h-4 w-4" /> HSE Performance
          </Link>
          <PageTitle section="HSE Performance" title="New Report — HSE Project Assessment" />
          <PerformanceForm
            initial={emptyPerformance()}
            onSaved={(id) => router.push(`/hse-performance/${id}`)}
            onCancel={() => router.push("/hse-performance")}
          />
        </div>
      </AdminOnly>
    </ProtectedRoute>
  );
}
