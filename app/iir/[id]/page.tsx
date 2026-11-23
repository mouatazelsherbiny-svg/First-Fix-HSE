"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import AdminOnly from "@/components/iir/AdminOnly";
import IirEditor from "@/components/iir/IirEditor";

export default function EditIirPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ProtectedRoute>
      <AdminOnly>
        <PageTitle section="IIR" title="Incident Investigation Report" />
        <IirEditor key={id} id={id} variant="admin" />
      </AdminOnly>
    </ProtectedRoute>
  );
}
