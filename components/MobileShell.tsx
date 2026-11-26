"use client";

/**
 * Layout of the phone app (see lib/mobileApp.ts), three kinds of page:
 *  - home (/m/reports): the page draws its own header (with 🔍); no bottom bar.
 *  - menu pages (Daily / Monthly / Incident): full-screen "REPORTS" pages
 *    with their own back button and search bar; no bottom bar.
 *  - every other page (the forms, checklists, IIR, search): a slim header
 *    (back + First Fix + 🔍 + notifications) and the floating bottom bar.
 *
 * Fits any screen: in portrait the whole app is drawn at a 390px phone width
 * and scaled (CSS zoom) to the real width, so it always fills the screen the
 * same way — on a large phone, a tablet, or a browser in "desktop site" mode.
 * Inside, heights use var(--mvh) (1% of the screen height in the app's own
 * scaled units) instead of dvh, which zoom would enlarge.
 */

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BackButton, MobileBrand, MobileNav, NotificationsButton, SearchButton } from "@/components/mobile/MobileUi";
import { MOBILE_HOME } from "@/lib/mobileApp";

const MENU_PAGES = ["/m/reports/daily", "/m/reports/monthly", "/m/reports/incident"];
/** The width the phone app is designed at. */
const DESIGN_W = 430;
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Scale for the current screen (1 in landscape) and the matching --mvh.
 *  On a wide portrait screen (≥ 640px — tablet, "desktop site" mode) html
 *  also gets `m-zoom`, which keeps the pages' tablet / desktop layouts
 *  (two columns etc.) in their phone form — see globals.css. */
function useFit() {
  const [k, setK] = useState(1);
  useIso(() => {
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const next = h > w ? Math.max(0.75, Math.min(3, w / DESIGN_W)) : 1;
      document.documentElement.classList.toggle("m-zoom", h > w && w >= 640);
      setK(next);
      document.documentElement.style.setProperty("--mvh", next === 1 ? "1dvh" : `${h / next / 100}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      document.documentElement.style.removeProperty("--mvh");
      document.documentElement.classList.remove("m-zoom");
    };
  }, []);
  return k;
}

export const FULL_H = "calc(var(--mvh, 1dvh) * 100)";

export default function MobileShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname() ?? "";
  const kind = pathname === MOBILE_HOME ? "home" : MENU_PAGES.includes(pathname) ? "menu" : "page";
  const k = useFit();
  // Larger text, fields and buttons in the phone app (see globals.css → html.m-app).
  useEffect(() => {
    document.documentElement.classList.add("m-app");
    return () => document.documentElement.classList.remove("m-app");
  }, []);

  if (kind === "menu") {
    return (
      <div className={`bg-black text-white ${className}`} style={{ zoom: k, minHeight: FULL_H }}>
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-[#050505] text-white ${className}`} style={{ zoom: k, minHeight: FULL_H }}>
      {kind === "page" && (
        <header
          className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "max(0.875rem, env(safe-area-inset-left))", paddingRight: "max(0.875rem, env(safe-area-inset-right))" }}
        >
          <div className="mx-auto flex h-[64px] max-w-6xl items-center gap-3">
            <BackButton className="!h-11 !w-11" />
            <MobileBrand size={34} />
            <div className="ms-auto flex items-center gap-2">
              {pathname !== "/m/search" && <SearchButton size={42} className="!rounded-xl" />}
              <div className="-m-1.5 scale-[0.8]">
                <NotificationsButton />
              </div>
            </div>
          </div>
        </header>
      )}
      <main
        className={kind === "home" ? "pb-8" : "pb-32"}
        style={{
          paddingTop: kind === "page" ? "calc(64px + env(safe-area-inset-top) + 1.1rem)" : "calc(env(safe-area-inset-top) + 0.75rem)",
          paddingLeft: "max(10px, env(safe-area-inset-left))",
          paddingRight: "max(10px, env(safe-area-inset-right))",
        }}
      >
        <div className={`mx-auto w-full ${kind === "home" ? "max-w-xl" : "max-w-6xl"}`}>{children}</div>
      </main>
      {kind === "page" && <MobileNav />}
    </div>
  );
}
