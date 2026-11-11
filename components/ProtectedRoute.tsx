"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ScrollReveal from "./ScrollReveal";
import ProjectFilter from "./ProjectFilter";
import { HeaderFilterContext } from "./PageTitle";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export default function ProtectedRoute({
  children,
  hideProjectFilter = false,
  bare = false,
}: {
  children: React.ReactNode;
  /** For pages that place the project filter themselves (the dashboard). */
  hideProjectFilter?: boolean;
  /** No sidebar / top bar — for print views. Still requires sign-in. */
  bare?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const { morphism } = useThemeSettings();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  // A page header (PageTitle) takes the project filter into itself; until then
  // it shows above the page as before.
  const [claimed, setClaimed] = useState(0);
  const claim = useCallback(() => {
    setClaimed((c) => c + 1);
    return () => setClaimed((c) => c - 1);
  }, []);
  const headerFilter = useMemo(() => ({ show: !hideProjectFilter, claim }), [hideProjectFilter, claim]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // The glass/solid "morphism" style (see globals.css and
  // ThemeSettingsContext) is only ever applied while an authenticated app
  // page is mounted, so it never touches the public login/signup screens'
  // own glass design. There's currently no UI to change it (the appearance
  // customizer panel was removed), so this applies whatever the stored
  // default/last-picked value is.
  // Every signed-in page uses the dark look (globals.css → html.app-dark);
  // print views ("bare") stay light.
  useEffect(() => {
    if (bare) return;
    document.documentElement.classList.add("app-dark");
    return () => document.documentElement.classList.remove("app-dark");
  }, [bare]);

  useEffect(() => {
    document.documentElement.setAttribute("data-morphism", morphism);
    return () => {
      document.documentElement.removeAttribute("data-morphism");
    };
  }, [morphism]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  if (bare) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <Topbar onMenu={openMenu} />
      <Sidebar mobileOpen={menuOpen} onClose={closeMenu} />
      {/* Clears the fixed 64px top bar and, from `lg` up, the 256px sidebar
          (TOPBAR_HEIGHT / SIDEBAR_WIDTH in Sidebar.tsx). */}
      <main className="min-h-screen pt-16 lg:ps-64">
        <div className={`${montserrat.className} px-4 py-6 text-white sm:px-6 lg:px-8`}>
          {/* App-wide project filter — every page's data follows it. Pages with a
              PageTitle header show it in the header instead. */}
          {!hideProjectFilter && claimed === 0 && (
            <div className="relative z-20 mb-4 flex justify-end">
              <ProjectFilter className="!text-white/75" />
            </div>
          )}
          <HeaderFilterContext.Provider value={headerFilter}>
            <ScrollReveal>{children}</ScrollReveal>
          </HeaderFilterContext.Provider>
        </div>
      </main>
    </div>
  );
}
