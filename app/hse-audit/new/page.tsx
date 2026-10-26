"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuditForm from "@/components/hseAudit/AuditForm";
import { emptyAudit } from "@/lib/hseAudit";

export default function NewHseAuditPage() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <div>
        <Link href="/hse-audit" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-gray hover:text-brand-orange">
          <ArrowLeft className="h-4 w-4" /> HSE Audit
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-brand-black">New HSE Audit — Scoring Rate</h1>
        <AuditForm initial={emptyAudit()} onSaved={(id) => router.push(`/hse-audit/${id}`)} onCancel={() => router.push("/hse-audit")} />
      </div>
    </ProtectedRoute>
  );
}
