"use client";

/**
 * Building blocks of the phone app (HSE-Reporting), drawn to the approved
 * mock-ups: the First Fix brand, the floating bottom bar, the side menu,
 * the notifications panel, card icons, and the "REPORTS" menu page used by
 * Daily / Monthly / Incident (worker photo, vertical REPORTS, glowing cards,
 * search bar).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Download,
  House,
  LogOut,
  Search,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePermits } from "@/context/PermitContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { useIncidents } from "@/context/IncidentsContext";
import { buildNotifications } from "@/lib/notifications";
import { MOBILE_HOME } from "@/lib/mobileApp";
import { useInstall } from "@/lib/useInstall";

export const ORANGE = "#ff6a13";

/* ---------------- brand ---------------- */

export function MobileBrand({ size = 44, stacked = false }: { size?: number; stacked?: boolean }) {
  return (
    <span className={`inline-flex items-center ${stacked ? "flex-col gap-1" : "gap-2"}`}>
      <BrandMark size={size} />
      <span className="whitespace-nowrap font-extrabold leading-none tracking-tight text-white" style={{ fontSize: size * (stacked ? 0.62 : 0.72) }}>
        First Fix
      </span>
    </span>
  );
}

/** "HSE REPORTING" with the orange bar under it. */
export function HseReportingTitle({ center = false, size = 40, barUnder = "hse" }: { center?: boolean; size?: number | string; barUnder?: "hse" | "all" }) {
  return (
    <div className={center ? "flex flex-col items-center" : ""}>
      <h1 className="whitespace-nowrap font-black uppercase leading-none tracking-tight" style={{ fontSize: size }}>
        <span className={barUnder === "hse" ? "relative inline-block" : ""}>
          HSE
          {barUnder === "hse" && <span className="absolute -bottom-3 left-0 h-[5px] w-full rounded-full" style={{ background: ORANGE }} />}
        </span>{" "}
        <span style={{ color: ORANGE }}>REPORTING</span>
      </h1>
      {barUnder === "all" && <span className="mt-3 h-[6px] w-[58%] rounded-full" style={{ background: ORANGE }} />}
    </div>
  );
}

/* ---------------- icons on the cards ---------------- */

/** A white line icon with an optional coloured badge icon at its corner (like the mock-ups). */
export function CardIcon({ icon: Icon, accent: Accent, accentColor = ORANGE, size = 54 }: { icon: LucideIcon; accent?: LucideIcon; accentColor?: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <Icon className="h-full w-full text-white" strokeWidth={1.6} />
      {Accent && (
        <Accent
          className="absolute -bottom-1 -right-2 rounded-md bg-[#141414]"
          style={{ width: size * 0.55, height: size * 0.55, color: accentColor, filter: `drop-shadow(0 0 6px ${accentColor}99)` }}
          strokeWidth={2.2}
        />
      )}
    </span>
  );
}

/* ---------------- bottom bar ---------------- */

export const NAV = [
  { href: MOBILE_HOME, match: [], label: "Home", icon: House },
  { href: "/m/reports/daily", match: ["/m/reports/daily"], label: "Daily", icon: ClipboardList },
  { href: "/m/reports/monthly", match: ["/m/reports/monthly", "/checklists", "/my-checklists"], label: "Monthly", icon: CalendarDays },
  { href: "/m/reports/incident", match: ["/m/reports/incident", "/m/reports/iir", "/iir"], label: "Incident", icon: TriangleAlert },
];
/** The side menu also lists Search (reached from the 🔍 at the top of the pages). */
const DRAWER = [...NAV, { href: "/m/search", match: ["/m/search"], label: "Search", icon: Search }];

/** 🔍 at the top of the pages → the Search page. */
export function SearchButton({ size = 52, className = "" }: { size?: number; className?: string }) {
  return (
    <Link
      href="/m/search"
      aria-label="Search"
      title="Search"
      className={`flex items-center justify-center rounded-2xl bg-[#232323] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:bg-[#2e2e2e] ${className}`}
      style={{ width: size, height: size }}
    >
      <Search style={{ width: size * 0.52, height: size * 0.52 }} strokeWidth={1.8} />
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="fixed inset-x-0 z-40 flex justify-center px-3" style={{ bottom: "calc(env(safe-area-inset-bottom) + 10px)" }}>
      <div className="flex w-full max-w-xl items-stretch rounded-[26px] border border-white/15 bg-[#151515]/95 px-1.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur">
        {NAV.map((n, i) => {
          const active = n.href === MOBILE_HOME ? pathname === MOBILE_HOME : n.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
          return (
            <div key={n.href} className="flex flex-1 items-stretch">
              {i > 0 && <span className="my-3 w-px bg-white/15" />}
              <Link
                href={n.href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[20px] py-2.5 text-[11.5px] font-bold transition ${
                  active ? "text-[#ff7a2a]" : "text-white/85 active:text-white"
                }`}
                style={active ? { background: "radial-gradient(70% 80% at 50% 45%, rgba(255,106,19,0.38), rgba(255,106,19,0.08) 70%, transparent)" } : undefined}
              >
                <n.icon className="h-[27px] w-[27px]" strokeWidth={1.8} />
                {n.label}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------------- notifications ---------------- */

const TONE: Record<"red" | "amber" | "blue", string> = {
  red: "border-red-500/40 bg-red-500/10 text-red-200",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  blue: "border-sky-400/40 bg-sky-400/10 text-sky-100",
};

export function useMobileNotifications() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { permits } = usePermits();
  const { employees, ppeRecords, trainingRecords } = useHsePassport();
  const { submissions: checklistSubmissions } = useChecklistSubmissions();
  const { incidents } = useIncidents();
  return useMemo(
    () =>
      user
        ? buildNotifications({ t, project: user.project, permits, employees, ppeRecords, trainingRecords, checklistSubmissions, incidents })
        : [],
    [t, user, permits, employees, ppeRecords, trainingRecords, checklistSubmissions, incidents]
  );
}

export function NotificationsButton() {
  const { t } = useLanguage();
  const items = useMobileNotifications();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.topbar.notifications}
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#232323] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <Bell className="h-7 w-7" strokeWidth={1.7} />
        {items.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11.5px] font-bold text-white" style={{ background: ORANGE }}>
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <Sheet title={t.topbar.notifications} onClose={() => setOpen(false)}>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/60">{t.topbar.noNotifications}</p>
          ) : (
            <ul className="space-y-2">
              {items.map((n) => (
                <li key={n.id} className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${TONE[n.tone]}`}>
                  {n.text}
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}
    </>
  );
}

/** Bottom sheet (notifications, projects, profile). */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#141414] px-4 pt-3 text-white"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)", maxHeight: "calc(var(--mvh, 1dvh) * 80)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------- side menu (☰) and profile ---------------- */

export function useSignOut() {
  const { logout } = useAuth();
  const router = useRouter();
  return () => {
    logout();
    router.push("/m/login");
  };
}

export function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const install = useInstall();
  const signOut = useSignOut();
  const pathname = usePathname() ?? "";
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="flex h-full w-[82%] max-w-xs flex-col border-e border-white/10 bg-[#111] px-4 text-white shadow-[10px_0_40px_rgba(0,0,0,0.6)]"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 18px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 18px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <MobileBrand size={36} />
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
        {user && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="truncate font-bold">{user.name}</p>
            <p className="truncate text-xs text-white/55">{user.email}</p>
          </div>
        )}
        <nav className="flex flex-col gap-1">
          {DRAWER.map((n) => {
            const active = n.href === MOBILE_HOME ? pathname === MOBILE_HOME : n.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 font-semibold ${active ? "bg-[#ff6a13]/15 text-[#ff8a3d]" : "text-white/85"}`}
              >
                <n.icon className="h-5 w-5" />
                {n.label === "Incident" ? "Incident Report" : n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          {install.canShow && (
            <button type="button" onClick={install.run} className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-[#ff8a3d]">
              <Download className="h-5 w-5" /> Install app
            </button>
          )}
          <button type="button" onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-red-400">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- back button / slim header ---------------- */

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(MOBILE_HOME))}
      aria-label="Back"
      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur active:bg-white/25 ${className}`}
    >
      <ChevronLeft className="h-7 w-7" />
    </button>
  );
}

/* ---------------- search bar ---------------- */

export function SearchBar({ value, onChange, onSubmit, autoFocus }: { value: string; onChange: (v: string) => void; onSubmit?: () => void; autoFocus?: boolean }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="flex h-16 w-full items-center rounded-full border-2 border-white/85 bg-black/60 ps-6 backdrop-blur"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        autoFocus={autoFocus}
        className="h-full min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/85"
        enterKeyHint="search"
      />
      <span className="h-10 w-px bg-white/50" />
      <button type="submit" aria-label="Search" className="flex h-full w-20 items-center justify-center text-white">
        <Search className="h-7 w-7" strokeWidth={1.8} />
      </button>
    </form>
  );
}

/* ---------------- "REPORTS" menu page (Daily / Monthly / Incident) ---------------- */

export interface MenuCard {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: LucideIcon;
  accentColor?: string;
}

export function MobileMenuPage({ cards }: { cards: MenuCard[] }) {
  const shown = cards;
  const compact = cards.length >= 4;

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden bg-black text-white" style={{ minHeight: "calc(var(--mvh, 1dvh) * 100)" }}>
      {/* Worker photo on the left, fading into black. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/m-worker.webp"
        alt=""
        className="pointer-events-none absolute left-0 top-[23%] h-[54%] w-auto max-w-[46%] select-none object-cover object-left"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 80%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(120,120,120,0.35), transparent 70%)" }}
      />

      <div
        className="relative flex flex-col px-5"
        style={{ minHeight: "calc(var(--mvh, 1dvh) * 100)", paddingTop: "calc(env(safe-area-inset-top) + 14px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 18px)" }}
      >
        {/* Header */}
        <div className="relative flex justify-center">
          <BackButton className="absolute left-0 top-1" />
          <MobileBrand size={56} stacked />
          <SearchButton size={48} className="absolute right-0 top-1 !rounded-xl !bg-white/15" />
        </div>
        <div className="mt-3">
          <HseReportingTitle center size={36} barUnder="all" />
        </div>

        {/* REPORTS + cards */}
        <div className="relative mt-7 flex flex-1 items-start">
          <div className="flex w-[50%] shrink-0 flex-col items-end pe-3">
            <span
              className="select-none font-black leading-[0.8] text-[#ececec]"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: compact ? "clamp(48px, calc(var(--mvh, 1dvh) * 8.6), 80px)" : "clamp(48px, calc(var(--mvh, 1dvh) * 8), 76px)", letterSpacing: "0.01em" }}
            >
              REPORTS
            </span>
            <span className="mt-4 h-16 w-[7px] rounded-full" style={{ background: ORANGE }} />
          </div>
          <div className={`flex flex-1 flex-col self-stretch ${cards.length === 1 ? "justify-center" : ""} ${compact ? "gap-2.5" : "gap-4"}`}>
            {shown.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`flex flex-col items-center justify-center rounded-[24px] border-2 bg-[#0d0d0d]/85 px-2 text-center transition active:scale-[0.98] ${
                  compact ? "gap-1.5 py-2.5" : cards.length === 1 ? "gap-3 py-8" : "gap-2.5 py-4"
                }`}
                style={{ borderColor: "rgba(255,106,19,0.75)", boxShadow: "0 0 18px rgba(255,106,19,0.35), inset 0 0 24px rgba(255,106,19,0.12)" }}
              >
                <CardIcon icon={c.icon} accent={c.accent} accentColor={c.accentColor} size={compact ? 44 : cards.length === 1 ? 66 : 56} />
                <span className={`font-bold leading-tight ${compact ? "text-[13px]" : cards.length === 1 ? "text-[18.5px]" : "text-[15.5px]"}`}>{c.label}</span>
                <span className="h-[5px] w-11 rounded-full" style={{ background: ORANGE }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5">
          <p className="text-[20.5px] font-extrabold leading-tight">Your platform for</p>
          <p className="text-[24px] font-extrabold leading-tight" style={{ color: ORANGE }}>
            HSE Reports
          </p>
        </div>
      </div>
    </div>
  );
}
