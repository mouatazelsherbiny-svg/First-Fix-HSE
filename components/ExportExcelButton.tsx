"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { exportToExcel, ExcelSheet } from "@/lib/exportExcel";

interface ExportExcelButtonProps {
  /** File name without extension — ".xlsx" is appended automatically. */
  filename: string;
  sheets: ExcelSheet[];
  disabled?: boolean;
  className?: string;
}

/** A single reusable "Export to Excel" button — used across the list pages
 *  (My Observations, Weekly KPI, HSE Passport, My Permits). Generates the
 *  workbook and downloads it entirely in the browser; no data leaves the
 *  page beyond what's already loaded. */
export default function ExportExcelButton({
  filename,
  sheets,
  disabled,
  className = "",
}: ExportExcelButtonProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(filename, sheets);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`btn-secondary disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Download className="me-1.5 h-4 w-4" />
      {isExporting ? t.common.exporting : t.common.exportExcel}
    </button>
  );
}
