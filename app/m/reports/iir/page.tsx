"use client";

/**
 * Phone app → IIR (everyone): fill the Incident Investigation Report on site,
 * submit it, and download it as Word or PDF. After submitting, the same
 * report stays open (Save updates it); "New IIR" starts a fresh one.
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import IirEditor from "@/components/iir/IirEditor";

export default function MobileIirPage() {
  return (
    <ProtectedRoute>
      <MobileIir />
    </ProtectedRoute>
  );
}

function MobileIir() {
  const [n, setN] = useState(0);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <PageTitle section="IIR" title="Incident Investigation Report">
        {saved && (
          <button
            type="button"
            onClick={() => {
              setN((x) => x + 1);
              setSaved(false);
              window.scrollTo({ top: 0 });
            }}
            className="btn-secondary gap-2"
          >
            <Plus className="h-4 w-4" /> New IIR
          </button>
        )}
      </PageTitle>
      <IirEditor key={n} variant="mobile" onSaved={() => setSaved(true)} />
    </div>
  );
}
