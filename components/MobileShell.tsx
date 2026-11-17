"use client";

/**
 * Layout of the phone app (see lib/mobileApp.ts): a slim top bar (logo, app
 * name, Install, Sign out) and a bottom tab bar with its two parts —
 * Daily Report and Permit to Work. No sidebar.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Download, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "@/components/Sidebar";
import { MOBILE_HOME } from "@/lib/mobileApp";
import { useInstall } from "@/lib/useInstall";

const TABS = [
  { href: MOBILE_HOME, match: "/m", label: "Daily Report", icon: ClipboardList },
  { href: "/permit-to-work", match: "/permit-to-work", label: "Permit to Work", icon: ShieldCheck },
];

export default function MobileShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { logout } = useAuth();
  const install = useInstall();

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Top bar */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex items-center gap-2.5 border-b border-white/10 bg-[#0e0e0f]/95 backdrop-blur"
        style={{
          height: 56,
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
          boxSizing: "content-box",
        }}
      >
        <BrandMark size={30} />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-extrabold">HSE-Reporting</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff8a3d]">First Fix HSE</p>
        </div>
        <div className="ms-auto flex items-center gap-1.5">
          {install.canShow && (
            <button
              type="button"
              onClick={install.run}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f36f24] px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_12px_rgba(243,111,36,0.5)]"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <main
        className={`pb-28 ${className}`}
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top) + 1.25rem)",
          // Landscape phones: keep clear of the notch on either side.
          paddingLeft: "max(0.875rem, env(safe-area-inset-left))",
          paddingRight: "max(0.875rem, env(safe-area-inset-right))",
        }}
      >
        {/* Full width on phones; on tablets / wide screens the content stays a comfortable width. */}
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {/* Bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0e0e0f]/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-2">
        {TABS.map((tab) => {
          const active = pathname === tab.match || pathname.startsWith(`${tab.match}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition [@media(max-height:500px)]:flex-row [@media(max-height:500px)]:justify-center [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:py-1 ${
                active ? "text-[#ff8a3d]" : "text-white/60 hover:text-white"
              }`}
            >
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                  active ? "bg-[#f36f24]/20 shadow-[0_0_14px_rgba(243,111,36,0.35)]" : ""
                }`}
              >
                <tab.icon className="h-5 w-5" />
              </span>
              {tab.label}
            </Link>
          );
        })}
        </div>
      </nav>
    </div>
  );
}
