"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
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

  // The "First Fix" brand background photo (glassmorphism look, behind the
  // translucent cards/sidebar/topbar) is applied as a plain CSS background
  // directly on <body> (see the `.app-bg-image` rule in globals.css) rather
  // than as a separately positioned element — simpler and avoids the
  // layout/stacking edge cases a `position: fixed` element can hit. Add the
  // class only while a protected page is actually mounted, and always
  // clean it up, so the plain flat --background-app color (also set on
  // html/body) is what shows on public pages like /login.
  useEffect(() => {
    document.body.classList.add("app-bg-image");
    return () => {
      document.body.classList.remove("app-bg-image");
    };
  }, []);

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
