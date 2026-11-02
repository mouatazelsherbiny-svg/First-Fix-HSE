"use client";

/**
 * Photos for observations: the legacy data-URL photos stored on the row plus
 * photos linked through the observation_photos table (private
 * observation-photos bucket, shown via short-lived signed URLs).
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "observation-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;
// Re-sign a cached URL once it has less than this long left.
const SIGNED_URL_MIN_REMAINING_MS = 10 * 60 * 1000;

export interface ObservationPhotoUrls {
  observation: string[];
  closeOut: string[];
}

const EMPTY: ObservationPhotoUrls = { observation: [], closeOut: [] };

// Signed URLs by storage path, shared across components so paging back and
// forth through the list (or opening a details page) doesn't re-sign photos.
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

async function signPaths(paths: string[]): Promise<Map<string, string>> {
  const now = Date.now();
  const result = new Map<string, string>();
  const missing: string[] = [];
  for (const path of paths) {
    const cached = signedUrlCache.get(path);
    if (cached && cached.expiresAt - now > SIGNED_URL_MIN_REMAINING_MS) result.set(path, cached.url);
    else missing.push(path);
  }
  if (missing.length) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(missing, SIGNED_URL_TTL_SECONDS);
    if (error) throw error;
    const expiresAt = now + SIGNED_URL_TTL_SECONDS * 1000;
    for (const s of data ?? []) {
      if (!s.signedUrl || !s.path) continue;
      signedUrlCache.set(s.path, { url: s.signedUrl, expiresAt });
      result.set(s.path, s.signedUrl);
    }
  }
  return result;
}

/**
 * Linked photos for a set of observations, grouped by observation id and
 * photo type. One observation_photos query and one batched signed-URL request
 * per distinct set of ids.
 */
export function useLinkedPhotosForObservations(observationIds: string[]): Map<string, ObservationPhotoUrls> {
  const [photos, setPhotos] = useState<Map<string, ObservationPhotoUrls>>(new Map());
  const idsKey = observationIds.join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (ids.length === 0) {
      setPhotos(new Map());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("observation_photos")
          .select("observation_id, photo_type, storage_path")
          .in("observation_id", ids)
          .order("created_at");
        if (error) throw error;
        const urlByPath = await signPaths(Array.from(new Set((rows ?? []).map((r) => r.storage_path as string))));
        if (cancelled) return;

        const grouped = new Map<string, ObservationPhotoUrls>();
        for (const r of rows ?? []) {
          const url = urlByPath.get(r.storage_path as string);
          if (!url) continue;
          const entry = grouped.get(r.observation_id) ?? { observation: [], closeOut: [] };
          (r.photo_type === "close_out" ? entry.closeOut : entry.observation).push(url);
          grouped.set(r.observation_id, entry);
        }
        setPhotos(grouped);
      } catch {
        // Photos are supplementary — leave the table/page usable without them.
        if (!cancelled) setPhotos(new Map());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  return photos;
}

/** Linked photos for a single observation (details page). */
export function useLinkedObservationPhotos(observationId: string | undefined): ObservationPhotoUrls {
  const photos = useLinkedPhotosForObservations(observationId ? [observationId] : []);
  return (observationId && photos.get(observationId)) || EMPTY;
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

/**
 * Compact before/after pair for a table cell: first observation photo and
 * first close-out photo, a placeholder for a missing type, "—" for neither.
 */
export function PhotoThumbPair({
  observationUrl,
  closeOutUrl,
  beforeLabel,
  afterLabel,
}: {
  observationUrl?: string;
  closeOutUrl?: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  const [open, setOpen] = useState<{ src: string; alt: string } | null>(null);
  if (!observationUrl && !closeOutUrl) return <span className="text-brand-gray">—</span>;

  const thumb = (src: string | undefined, label: string) => (
    <div className="flex flex-col items-center gap-0.5">
      {src ? (
        <button
          type="button"
          onClick={() => setOpen({ src, alt: label })}
          title={label}
          className="h-9 w-9 overflow-hidden rounded-md border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange sm:h-11 sm:w-11"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} loading="lazy" className="h-full w-full object-cover transition hover:opacity-90" />
        </button>
      ) : (
        <div
          title={label}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-brand-border bg-brand-grayLight/40 text-brand-border sm:h-11 sm:w-11"
        >
          <ImageIcon className="h-4 w-4" aria-hidden />
        </div>
      )}
      <span className="text-[10px] leading-none text-brand-gray">{label}</span>
    </div>
  );

  return (
    <>
      <div className="flex items-start gap-1.5">
        {thumb(observationUrl, beforeLabel)}
        {thumb(closeOutUrl, afterLabel)}
      </div>
      {open && <PhotoViewer src={open.src} alt={open.alt} onClose={() => setOpen(null)} />}
    </>
  );
}

/** Full-size photo overlay. Portaled to <body> for the same reason as
 *  ConfirmDialog: a transformed .card ancestor would trap position: fixed. */
export function PhotoViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
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
