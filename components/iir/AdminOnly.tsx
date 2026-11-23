"use client";

/** Main-app IIR pages are for the admin only (the phone app's IIR is for everyone). */

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-white/70">
        <ShieldAlert className="h-10 w-10 text-[#ff8a3d]" />
        <p className="text-lg font-bold text-white">IIR</p>
        <p className="text-sm">This page is available to the admin only.</p>
      </div>
    );
  }
  return <>{children}</>;
}
