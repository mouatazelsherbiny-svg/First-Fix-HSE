"use client";

import { useEffect } from "react";
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
      <Sidebar />
      {/* pt-14 clears the mobile top bar; from `lg` up the padding clears
          the floating icon rail — its inset, its width, and a matching gap
          on the content side (see RAIL_WIDTH / RAIL_INSET in Sidebar). */}
      {/* 108px = RAIL_INSET(16) + RAIL_WIDTH(76) + a 16px gap. */}
      <main className="min-h-screen pt-14 lg:ps-[108px] lg:pt-0">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <Topbar />
          <ScrollReveal>{children}</ScrollReveal>
        </div>
      </main>
    </div>
  );
}
