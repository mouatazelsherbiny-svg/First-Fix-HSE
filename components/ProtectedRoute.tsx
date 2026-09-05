"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import AppBackground from "./AppBackground";
import Topbar from "./Topbar";
import ScrollReveal from "./ScrollReveal";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // The flat page canvas color still lives once, globally, on <html>/<body>
  // (see globals.css: --background-app) as the fallback underneath
  // everything. AppBackground layers the brand image + scrim on top of
  // that, fixed behind the whole app (see components/AppBackground.tsx).
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppBackground />
      <Sidebar />
      {/* pt-14 clears the mobile top bar; lg:ps-64 clears the fixed
          sidebar's width once it's always-visible from `lg` up. */}
      <main className="min-h-screen pt-14 lg:ps-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Topbar />
          <ScrollReveal>{children}</ScrollReveal>
        </div>
      </main>
    </div>
  );
}
