"use client";

import { useEffect, useState } from "react";

/** Chrome / Android's install prompt event (not in the TS DOM types). */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** "Install" button on Android/Chrome; a one-time "Add to Home Screen" tip on iPhone. */
export function useInstall() {
  const [evt, setEvt] = useState<InstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    let seen = false;
    try {
      seen = localStorage.getItem("ff.iosInstallHint") === "1";
    } catch {}
    if (ios && !seen) setIosHint(true);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  return {
    ios,
    canShow: !!evt,
    run: async () => {
      if (!evt) return;
      await evt.prompt();
      await evt.userChoice.catch(() => null);
      setEvt(null);
    },
    iosHint,
    dismissIos: () => {
      setIosHint(false);
      try {
        localStorage.setItem("ff.iosInstallHint", "1");
      } catch {}
    },
  };
}
