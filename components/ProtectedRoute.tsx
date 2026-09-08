"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ThemeCustomizer from "./ThemeCustomizer";
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

  // The glass/solid "morphism" style (see globals.css and ThemeCustomizer)
  // is only ever applied while an authenticated app page is mounted, so
  // this in-app appearance setting never touches the public login/signup
  // screens' own glass design. Re-applies whenever the user changes it in
  // the customizer panel.
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
      <ThemeCustomizer />
      {/* pt-14 clears the mobile top bar; lg:ps-64 clears the fixed
          sidebar's width once it's always-visible from `lg` up. */}
      <main className="min-h-screen pt-14 lg:ps-64 lg:pt-0">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <Topbar />
          <ScrollReveal>{children}</ScrollReveal>
        </div>
      </main>
    </div>
  );
}
