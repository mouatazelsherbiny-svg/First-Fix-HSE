"use client";

/**
 * Phone app → FICC Report: only adding a new FICC (the same "Add FICC" form as
 * the FICC page), shown in the page. After saving, a confirmation appears and
 * the form is ready for the next one.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import FiccFormModal from "@/components/ficc/FiccFormModal";
import { useIncidents } from "@/context/IncidentsContext";
import { MOBILE_HOME } from "@/lib/mobileApp";
import type { FiccInput } from "@/types/incident";

export default function MobileFiccPage() {
  return (
    <ProtectedRoute>
      <AddFicc />
    </ProtectedRoute>
  );
}

function AddFicc() {
  const router = useRouter();
  const { submitFicc } = useIncidents();
  const [formKey, setFormKey] = useState(0);
  const [saved, setSaved] = useState(false);
  // Set by a successful save, so the form's "close" after saving resets it
  // instead of leaving the page (Cancel still goes back home).
  const justSaved = useRef(false);

  return (
    <div>
      <PageTitle section="FICC" title="Add FICC" />
      {saved && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300">
          <CircleCheck className="h-5 w-5 shrink-0" />
          FICC submitted. You can add another one below.
        </div>
      )}
      <FiccFormModal
        key={formKey}
        embedded
        onSubmit={async (values: FiccInput) => {
          await submitFicc(values);
          justSaved.current = true;
        }}
        onClose={() => {
          if (justSaved.current) {
            justSaved.current = false;
            setSaved(true);
            setFormKey((k) => k + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push(MOBILE_HOME);
          }
        }}
      />
    </div>
  );
}
