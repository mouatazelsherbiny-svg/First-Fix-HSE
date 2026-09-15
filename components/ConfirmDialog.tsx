"use client";

/**
 * Small reusable confirmation dialog for a destructive-ish or irreversible
 * action that isn't a real delete (e.g. "Cancel this observation"). Rendered
 * via a portal straight into <body> — same reasoning as PmvLogFormModal:
 * ScrollReveal puts a `transform` on every `.card` once it animates in, and
 * any ancestor with a non-"none" transform becomes a CSS containing block
 * for `position: fixed` descendants, which would trap this dialog inside
 * whichever `.card` it was opened from instead of covering the viewport.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isBusy?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  isBusy = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isBusy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isBusy, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[140] bg-black/60"
        onClick={() => {
          if (!isBusy) onClose();
        }}
      />
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-cardHover"
        >
          <h2 className="text-base font-bold text-brand-black">{title}</h2>
          <p className="mt-2 text-sm text-brand-gray">{message}</p>

          {error && (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isBusy}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
