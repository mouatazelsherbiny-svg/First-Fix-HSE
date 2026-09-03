"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface PermitQrCodeProps {
  label: string;
  hint: string;
  value: string;
}

/** Renders a QR code encoding `value` (the permit's own detail-page URL) —
 *  generated entirely client-side, no network call. Scanning it opens this
 *  permit's read-only detail page with its current data, nothing embedded
 *  or editable in the code itself. */
export default function PermitQrCode({ label, hint, value }: PermitQrCodeProps) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: 220,
      margin: 1,
      color: { dark: "#101B2D", light: "#FFFFFF" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div>
      <p className="label-field">{label}</p>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-brand-surface p-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={label} className="h-40 w-40" />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center text-xs text-brand-gray">
            …
          </div>
        )}
        <p className="text-center text-xs text-brand-gray">{hint}</p>
      </div>
    </div>
  );
}
