"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import AdminOnly from "@/components/iir/AdminOnly";
import IirEditor from "@/components/iir/IirEditor";

export default function NewIirPage() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <AdminOnly>
        <PageTitle section="IIR" title="New Report" />
        <IirEditor variant="admin" onSaved={(id) => router.replace(`/iir/${id}`)} />
      </AdminOnly>
    </ProtectedRoute>
  );
}
