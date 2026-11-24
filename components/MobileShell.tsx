"use client";

/**
 * Layout of the phone app (see lib/mobileApp.ts), three kinds of page:
 *  - home (/m/reports): the page draws its own header; floating bottom bar.
 *  - menu pages (Daily / Monthly / Incident): full-screen "REPORTS" pages
 *    with their own back button and search bar; no bottom bar.
 *  - every other page (the forms, checklists, IIR, search): a slim header
 *    (back + First Fix) and the floating bottom bar.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BackButton, MobileBrand, MobileNav, NotificationsButton } from "@/components/mobile/MobileUi";
import { MOBILE_HOME } from "@/lib/mobileApp";

const MENU_PAGES = ["/m/reports/daily", "/m/reports/monthly", "/m/reports/incident"];

export default function MobileShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname() ?? "";
  const kind = pathname === MOBILE_HOME ? "home" : MENU_PAGES.includes(pathname) ? "menu" : "page";
  // Larger text, fields and buttons in the phone app (see globals.css → html.m-app).
  useEffect(() => {
    document.documentElement.classList.add("m-app");
    return () => document.documentElement.classList.remove("m-app");
  }, []);

  if (kind === "menu") {
    return <div className={`min-h-[100dvh] bg-black text-white ${className}`}>{children}</div>;
  }

  return (
    <div className={`min-h-[100dvh] bg-[#050505] text-white ${className}`}>
      {kind === "page" && (
        <header
          className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "max(0.875rem, env(safe-area-inset-left))", paddingRight: "max(0.875rem, env(safe-area-inset-right))" }}
        >
          <div className="mx-auto flex h-[64px] max-w-6xl items-center gap-3">
            <BackButton className="!h-11 !w-11" />
            <MobileBrand size={34} />
            <div className="ms-auto scale-[0.78]">
              <NotificationsButton />
            </div>
          </div>
        </header>
      )}
      <main
        className="pb-32"
        style={{
          paddingTop: kind === "page" ? "calc(64px + env(safe-area-inset-top) + 1.1rem)" : "calc(env(safe-area-inset-top) + 0.75rem)",
          paddingLeft: "max(10px, env(safe-area-inset-left))",
          paddingRight: "max(10px, env(safe-area-inset-right))",
        }}
      >
        <div className={`mx-auto w-full ${kind === "home" ? "max-w-md" : "max-w-6xl"}`}>{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
