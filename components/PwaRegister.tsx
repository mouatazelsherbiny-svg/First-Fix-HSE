"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker once on the client. Mounted once in the
 * root layout so it runs on every page, signed in or not. Silently does
 * nothing on browsers without service worker support.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures (e.g. unsupported browser, dev-mode quirks)
      // should never break the app — the site works fine without it.
    });
  }, []);

  return null;
}
