"use client";

/**
 * Phone app home (after signing in), drawn to the approved mock-up: header
 * (menu, First Fix, notifications, profile), "Welcome to First Fix — HSE
 * REPORTING", the Projects button, the site card with the three big buttons (Daily,
 * Monthly, Incident Report), and the "Latest HSE update" banner.
 */

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, ChevronRight, ClipboardCheck, Download, LogOut, Menu, TriangleAlert, User, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { HseReportingTitle, MobileBrand, MobileDrawer, NotificationsButton, ORANGE, SearchButton, Sheet, useSignOut } from "@/components/mobile/MobileUi";
import { useAuth } from "@/context/AuthContext";
import { useProjectFilter } from "@/context/ProjectFilterContext";
import { useInstall } from "@/lib/useInstall";

export default function MobileHomePage() {
  return (
    <ProtectedRoute hideProjectFilter>
      <MobileHome />
    </ProtectedRoute>
  );
}

const BIG: { href: string; label: React.ReactNode; icon: LucideIcon }[] = [
  { href: "/m/reports/daily", label: "Daily", icon: ClipboardCheck },
  { href: "/m/reports/monthly", label: "Monthly", icon: CalendarDays },
  {
    href: "/m/reports/incident",
    label: (
      <>
        Incident
        <br />
        Report
      </>
    ),
    icon: TriangleAlert,
  },
];

function MobileHome() {
  const { user } = useAuth();
  const { project, setProject, projects } = useProjectFilter();
  const install = useInstall();
  const signOut = useSignOut();
  const [drawer, setDrawer] = useState(false);
  const [sheet, setSheet] = useState<"" | "projects" | "profile">("");

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button type="button" onClick={() => setDrawer(true)} aria-label="Menu" className="-ms-1 flex h-12 w-10 items-center justify-center text-white">
          <Menu className="h-8 w-8" strokeWidth={2.2} />
        </button>
        <MobileBrand size={36} />
        <div className="ms-auto flex items-center gap-2">
          <SearchButton size={48} />
          <div className="-m-0.5 scale-[0.93]">
            <NotificationsButton />
          </div>
          <button
            type="button"
            onClick={() => setSheet("profile")}
            aria-label="Profile"
            className="flex h-[48px] w-[48px] items-center justify-center rounded-2xl bg-[#232323] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <User className="h-7 w-7" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {/* Welcome */}
      <p className="mt-7 text-[16px] font-medium uppercase tracking-wide text-white/95">Welcome to First Fix</p>
      <div className="mt-1">
        <HseReportingTitle size={44} />
      </div>
      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={() => setSheet("projects")}
          className="inline-flex max-w-[70%] items-center gap-1 rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(255,106,19,0.5)]"
          style={{ background: ORANGE }}
        >
          <span className="truncate">{project || "Projects"}</span>
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={3} />
        </button>
      </div>

      {/* Site card */}
      <section
        className="relative mt-4 overflow-hidden rounded-[28px] border-2 bg-[#0c0c0c]"
        style={{ borderColor: "rgba(255,106,19,0.7)", boxShadow: "0 0 24px rgba(255,106,19,0.25)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/m-hero.webp"
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-[68%] w-[64%] select-none object-cover"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, #000 30%), linear-gradient(to bottom, #000 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 30%), linear-gradient(to bottom, #000 70%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <div className="relative px-4 pb-4 pt-20">
          <div className="origin-left" style={{ transform: "scaleX(0.84)" }}>
            <p className="text-[35px] font-black leading-[0.95] tracking-tight">HSE</p>
            <p className="text-[35px] font-black leading-[0.95] tracking-tight" style={{ color: ORANGE }}>
              REPORTING
            </p>
          </div>
          <p className="mt-2 max-w-[60%] text-[12.5px] leading-snug text-white/90">Report. Monitor. Improve Workplace Safety.</p>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {BIG.map((b, i) => (
              <Link
                key={b.href}
                href={b.href}
                className="flex aspect-[1/0.92] flex-col items-center justify-center gap-2 rounded-[20px] border bg-[#191919]/95 px-1 text-center transition active:scale-[0.97]"
                style={
                  i === 0
                    ? { borderColor: "rgba(255,106,19,0.9)", background: "linear-gradient(160deg, rgba(255,106,19,0.32), rgba(40,20,10,0.95) 60%)", boxShadow: "0 0 18px rgba(255,106,19,0.45)" }
                    : { borderColor: "rgba(255,255,255,0.14)" }
                }
              >
                <b.icon className="h-10 w-10" strokeWidth={1.6} style={{ color: i === 2 ? ORANGE : "#fff" }} />
                <span className="text-[13px] font-bold leading-tight">{b.label}</span>
                <span className="h-[5px] w-9 rounded-full" style={{ background: ORANGE }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest HSE update */}
      <section className="relative mt-6 overflow-hidden rounded-[26px] border border-white/25 bg-gradient-to-r from-[#1a1a1a] via-[#161616] to-[#2a2622]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/m-helmet.webp"
          alt=""
          className="pointer-events-none absolute bottom-0 right-0 h-full w-[46%] select-none object-cover"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, #000 35%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 35%)" }}
        />
        <div className="relative px-4 py-5">
          <p className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-wide text-white/90">
            <span className="h-5 w-[6px] rounded-full" style={{ background: ORANGE }} />
            Latest HSE Update
          </p>
          <p className="mt-2 max-w-[66%] text-[18.5px] font-extrabold leading-tight">Keep Your Site Safe</p>
          <p className="mt-2 max-w-[60%] text-[12px] leading-snug text-white/85">Report incidents on time and stay compliant.</p>
        </div>
      </section>

      {drawer && <MobileDrawer onClose={() => setDrawer(false)} />}

      {sheet === "projects" && (
        <Sheet title="Projects" onClose={() => setSheet("")}>
          <ul className="divide-y divide-white/10">
            {["", ...projects].map((p) => (
              <li key={p || "all"}>
                <button
                  type="button"
                  onClick={() => {
                    setProject(p);
                    setSheet("");
                  }}
                  className="flex w-full items-center justify-between py-3 text-start font-semibold"
                >
                  {p || "All Projects"}
                  {project === p && <Check className="h-5 w-5 text-[#ff8a3d]" />}
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}

      {sheet === "profile" && (
        <Sheet title="Profile" onClose={() => setSheet("")}>
          {user && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-white/60">{user.email}</p>
              {user.project && <p className="mt-1 text-sm text-white/60">{user.project}</p>}
            </div>
          )}
          {install.canShow && (
            <button type="button" onClick={install.run} className="mb-2 flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 font-semibold text-[#ff8a3d]">
              <Download className="h-5 w-5" /> Install app
            </button>
          )}
          <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 font-semibold text-red-400">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </Sheet>
      )}
    </div>
  );
}
