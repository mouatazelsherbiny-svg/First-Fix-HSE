"use client";

/**
 * Photos for one observation: the legacy data-URL photos stored on the row
 * plus photos linked through the observation_photos table (private
 * observation-photos bucket, shown via short-lived signed URLs).
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "observation-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export interface ObservationPhotoUrls {
  observation: string[];
  closeOut: string[];
}

/** Signed URLs for the observation's linked photos, grouped by photo type. */
export function useLinkedObservationPhotos(observationId: string | undefined): ObservationPhotoUrls {
  const [urls, setUrls] = useState<ObservationPhotoUrls>({ observation: [], closeOut: [] });

  useEffect(() => {
    if (!observationId) return;
    let cancelled = false;
    (async () => {
      const { data: rows, error } = await supabase
        .from("observation_photos")
        .select("photo_type, storage_path")
        .eq("observation_id", observationId)
        .order("created_at");
      if (error || !rows?.length) return;

      const paths = Array.from(new Set(rows.map((r) => r.storage_path as string)));
      const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (signError || !signed || cancelled) return;

      const urlByPath = new Map(signed.filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
      const pick = (type: string) =>
        rows
          .filter((r) => r.photo_type === type)
          .map((r) => urlByPath.get(r.storage_path as string))
          .filter((u): u is string => Boolean(u));
      setUrls({ observation: pick("observation"), closeOut: pick("close_out") });
    })();
    return () => {
      cancelled = true;
    };
  }, [observationId]);

  return urls;
}

/** Labeled thumbnail grid; clicking a thumbnail opens the full-size photo. */
export function PhotoSection({ label, urls, altPrefix }: { label: string; urls: string[]; altPrefix: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (urls.length === 0) return null;

  return (
    <div>
      <p className="label-field">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="overflow-hidden rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${altPrefix}-${i}`}
              loading="lazy"
              className="aspect-square w-full object-cover transition hover:opacity-90"
            />
          </button>
        ))}
      </div>
      {openIndex !== null && (
        <PhotoViewer src={urls[openIndex]} alt={`${altPrefix}-${openIndex}`} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  );
}

/** Full-size photo overlay. Portaled to <body> for the same reason as
 *  ConfirmDialog: a transformed .card ancestor would trap position: fixed. */
function PhotoViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-2xl leading-none text-white hover:bg-white/20"
      >
        &times;
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>,
    document.body
  );
}
