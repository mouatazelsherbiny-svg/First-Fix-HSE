"use client";

/**
 * IIR print view → "Save as PDF": the form on A4 with the form's header
 * (logo + title) and footer (form number) repeated on every page. Opens the
 * print dialog once the report and its pictures have loaded. Open to whoever
 * can read the report (its author or the admin) — the phone app uses it too.
 */

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import IirSheet, { IirFooter, IirHeader } from "@/components/iir/IirSheet";
import { supabase } from "@/lib/supabaseClient";
import { mapIir, type IirReport } from "@/lib/iir";

export default function PrintIirPage() {
  return (
    <ProtectedRoute bare>
      <PrintView />
    </ProtectedRoute>
  );
}

function PrintView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<IirReport | null>(null);
  const [error, setError] = useState("");
  const printed = useRef(false);

  useEffect(() => {
    supabase
      .from("iir_reports")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: e }) => (e || !data ? setError("Report not found.") : setReport(mapIir(data))));
  }, [id]);

  useEffect(() => {
    if (!report || printed.current) return;
    printed.current = true;
    document.title = `IIR - ${report.data.project || "Report"}`;
    const imgs = Array.from(document.images);
    Promise.all(imgs.map((im) => (im.complete ? null : new Promise((r) => (im.onload = im.onerror = r))))).then(() => setTimeout(() => window.print(), 400));
  }, [report]);

  return (
    <div className="iir-print-root" style={{ background: "#e5e7eb", minHeight: "100vh", padding: "16px 0", color: "#000" }}>
      <style>{`
        @page {
          size: A4;
          margin: 10mm 10mm 12mm;
          @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 600 8.5pt Calibri, Carlito, Arial, sans-serif; color: #333; }
        }
        @media print {
          .iir-print-root { background: #fff !important; padding: 0 !important; }
          .iir-noprint { display: none !important; }
          .iir-paper { box-shadow: none !important; width: auto !important; padding: 0 !important; margin: 0 !important; }
          html, body { background: #fff !important; }
        }
        .iir-paper table.iir-wrap { width: 100%; border-collapse: collapse; }
        .iir-paper table.iir-wrap > thead > tr > td, .iir-paper table.iir-wrap > tfoot > tr > td, .iir-paper table.iir-wrap > tbody > tr > td { padding: 0; }
      `}</style>
      <div className="iir-noprint" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
        <button type="button" onClick={() => router.back()} style={{ color: "#374151", fontSize: 14 }}>
          ← Back
        </button>
        <button type="button" onClick={() => window.print()} style={{ background: "#F36F24", color: "#fff", fontWeight: 700, padding: "8px 18px", borderRadius: 10, fontSize: 14 }}>
          Print / Save as PDF
        </button>
      </div>
      {error && <p style={{ textAlign: "center", color: "#b91c1c" }}>{error}</p>}
      {report && (
        <div className="iir-paper" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto", background: "#fff", padding: "10mm", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <div className="iir print">
            <table className="iir-wrap">
              <thead>
                <tr>
                  <td>
                    <IirHeader />
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <IirSheet mode="print" report={report} />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <IirFooter />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
