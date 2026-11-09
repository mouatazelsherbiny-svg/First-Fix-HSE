"use client";

/**
 * One observation, opened in a box in the middle of the Observations page
 * (instead of going to its own page). Esc, the ✕ or a click outside closes it.
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Pencil, X } from "lucide-react";
import { PhotoSection, useLinkedObservationPhotos } from "@/components/observations/ObservationPhotos";
import { useLanguage } from "@/context/LanguageContext";
import type { Observation } from "@/types/observation";

const GOOD_PRACTICE = "Good Practice";

/** The app's shared pieces (photo grid, viewer) read these tokens; keep them dark in here. */
const DARK_TOKENS = {
  "--brand-black-rgb": "245 245 247",
  "--brand-gray-dark-rgb": "205 207 213",
  "--brand-gray-rgb": "150 153 162",
  "--brand-gray-light-rgb": "40 40 46",
  "--brand-surface-rgb": "24 24 27",
  "--brand-border-rgb": "52 52 58",
} as React.CSSProperties;

const PILL: Record<string, string> = {
  High: "bg-[#e5261f] text-white",
  Medium: "bg-[#f5c518] text-[#1a1a1a]",
  Low: "bg-[#16a34a] text-white",
  Closed: "bg-[#15a33a] text-white",
  Open: "bg-[#f36f24] text-white",
  "In Progress": "bg-[#f59e0b] text-[#1a1a1a]",
  Overdue: "bg-[#b91c1c] text-white",
  Cancelled: "bg-white/15 text-white/70",
  [GOOD_PRACTICE]: "bg-[#1d4ed8] text-white",
};

function Pill({ value }: { value: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${PILL[value] ?? "bg-white/15 text-white"}`}>
      {value}
    </span>
  );
}

export default function ObservationModal({ observation: o, onClose }: { observation: Observation; onClose: () => void }) {
  const { t, locale } = useLanguage();
  const linked = useLinkedObservationPhotos(o.id);
  const gp = o.observationType === GOOD_PRACTICE || o.classification === GOOD_PRACTICE;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const date = new Date(o.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const type = o.observationType === "Others" ? o.observationTypeOther || t.form.other : o.observationType;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{ ...DARK_TOKENS, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${t.detail.title} #${o.reportNumber}`}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
        style={{ background: "linear-gradient(160deg, #1b1b1e 0%, #111113 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-start gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ff8a3d]">{t.detail.title}</p>
            <h2 className="mt-0.5 text-xl font-bold sm:text-2xl">#{o.reportNumber}</h2>
            <p className="mt-0.5 text-sm text-white/60">
              {t.detail.reportedOn} {date}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill value={gp ? GOOD_PRACTICE : o.riskRating} />
            <Pill value={gp && o.status !== "Cancelled" ? GOOD_PRACTICE : o.status} />
            <Link
              href={`/observations/${o.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f36f24] px-3.5 py-1.5 text-sm font-bold text-white shadow-[0_0_12px_rgba(243,111,36,0.5)] transition hover:bg-[#ff7d33]"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t.list.edit}
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <dl className="grid gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:grid-cols-2">
            <Field label={t.form.projectName} value={o.projectName} />
            <Field label={t.form.observationType} value={type} />
            <Field label={t.form.classification} value={o.classification} />
            <Field label={t.form.inspectedBy} value={o.inspectedBy} />
          </dl>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/55">{t.form.observationDetails}</p>
            <p className="whitespace-pre-wrap rounded-xl bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-white/90">
              {o.observationDetails || "—"}
            </p>
          </div>

          <PhotoSection
            label={t.form.observationPhoto}
            urls={[...o.observationPhotos, ...linked.observation.map((p) => p.src)]}
            altPrefix="obs"
          />

          {o.closeOutDetails && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/55">{t.form.closeOutDetails}</p>
              <p className="whitespace-pre-wrap rounded-xl bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-white/90">
                {o.closeOutDetails}
              </p>
            </div>
          )}

          <PhotoSection
            label={t.form.closeOutPhoto}
            urls={[...o.closeOutPhotos, ...linked.closeOut.map((p) => p.src)]}
            altPrefix="close-out"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-xs font-medium tracking-wide text-white/55">{label}</dt>
      <dd className="text-sm font-semibold text-white">{value || "—"}</dd>
    </div>
  );
}
