"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ScrollReveal from "./ScrollReveal";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { morphism } = useThemeSettings();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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

  return (
    <div className="min-h-screen">
      <Topbar onMenu={openMenu} />
      <Sidebar mobileOpen={menuOpen} onClose={closeMenu} />
      {/* Clears the fixed 64px top bar and, from `lg` up, the 256px sidebar
          (TOPBAR_HEIGHT / SIDEBAR_WIDTH in Sidebar.tsx). */}
      <main className="min-h-screen pt-16 lg:ps-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <ScrollReveal>{children}</ScrollReveal>
        </div>
      </main>
    </div>
  );
}
