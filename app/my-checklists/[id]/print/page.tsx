"use client";

/**
 * Monthly Checklist print view → "Save as PDF", laid out like the company's
 * Excel form (Cover, Inspection + Summary, Corrective Actions, Photos), with
 * "Page N of M" on each page. Opens the print dialog once pictures load.
 */

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChecklistPrint from "@/components/checklist/ChecklistPrint";
import { buildChecklistReport } from "@/lib/checklistReport";
import { checklistFileName } from "@/lib/checklistWord";
import { useChecklistSubmission } from "@/lib/useChecklistSubmission";

export default function PrintChecklistPage() {
  return (
    <ProtectedRoute bare>
      <PrintView />
    </ProtectedRoute>
  );
}

function PrintView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { submission, template, error } = useChecklistSubmission(id);
  const printed = useRef(false);

  useEffect(() => {
    if (!submission || !template || printed.current) return;
    printed.current = true;
    document.title = checklistFileName(template, submission, "pdf").replace(/\.pdf$/, "");
    const imgs = Array.from(document.images);
    Promise.all(imgs.map((im) => (im.complete ? null : new Promise((r) => (im.onload = im.onerror = r))))).then(() => setTimeout(() => window.print(), 400));
  }, [submission, template]);

  return (
    <div className="ck-print-root" style={{ background: "#e5e7eb", minHeight: "100vh", padding: "16px 0", color: "#000" }}>
      <style>{`
        @page {
          size: A4;
          margin: 10mm 10mm 12mm;
          @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 600 8.5pt Calibri, Carlito, Arial, sans-serif; color: #333; }
        }
        @media print {
          .ck-print-root { background: #fff !important; padding: 0 !important; }
          .ck-noprint { display: none !important; }
          .ck-paper { box-shadow: none !important; width: auto !important; padding: 0 !important; margin: 0 !important; }
          html, body { background: #fff !important; }
        }
      `}</style>
      <div className="ck-noprint" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
        <button type="button" onClick={() => router.back()} style={{ color: "#374151", fontSize: 14 }}>
          ← Back
        </button>
        <button type="button" onClick={() => window.print()} style={{ background: "#F36F24", color: "#fff", fontWeight: 700, padding: "8px 18px", borderRadius: 10, fontSize: 14 }}>
          Print / Save as PDF
        </button>
      </div>
      {error && <p style={{ textAlign: "center", color: "#b91c1c" }}>{error}</p>}
      {submission && template && (
        <div className="ck-paper" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto", background: "#fff", padding: "10mm", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <ChecklistPrint r={buildChecklistReport(template, submission)} />
        </div>
      )}
    </div>
  );
}
