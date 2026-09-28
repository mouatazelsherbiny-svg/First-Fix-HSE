"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Binoculars,
  ChartColumn,
  ChartLine,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FileWarning,
  GraduationCap,
  House,
  IdCard,
  Network,
  ShieldCheck,
  SquarePlus,
  TriangleAlert,
  Truck,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { usePermits } from "@/context/PermitContext";
import { useHsePassport } from "@/context/HsePassportContext";

/**
 * Labelled dark sidebar, built to the approved "First Fix HSE Department"
 * mockup: icon + label rows, a solid orange pill for the active page, and
 * a safety-message photo panel pinned to the bottom.
 *
 * Desktop (lg+): fixed under the top bar (components/Topbar.tsx).
 * Mobile: the same panel slides in as a drawer, opened from the top bar's
 * menu button. ProtectedRoute owns the open/closed state.
 *
 * Route list and role rules are unchanged from the previous sidebar: the
 * two admin-only entries stay admin-only and HSE Passport is still a group.
 */

/** Keep in sync with ProtectedRoute's content padding and Topbar's brand area. */
export const SIDEBAR_WIDTH = 256;
export const TOPBAR_HEIGHT = 64;

/** Shell colours taken from the mockup. */
export const SHELL_BG = "#0e0e0f";
/** The safety photo covers the whole sidebar; the dark gradient on top keeps
 *  the menu readable and lets the photo show through most at the bottom. */
const SIDEBAR_BG = [
  "linear-gradient(180deg, rgba(14,14,15,0.96) 0%, rgba(14,14,15,0.9) 40%, rgba(14,14,15,0.62) 70%, rgba(14,14,15,0.9) 100%)",
  "url('/brand/sidebar-bg.jpg') center / cover no-repeat",
  "#0e0e0f",
].join(", ");

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface NavGroupItem {
  label: string;
  icon: LucideIcon;
  basePath: string[];
  count?: number;
  children: { href: string; label: string }[];
}

type NavEntry = ({ kind: "link" } & NavLinkItem) | ({ kind: "group" } & NavGroupItem);

const ROW =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] leading-tight font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/70";
const ROW_IDLE = "text-white/85 hover:bg-white/[0.07] hover:text-white";
const ROW_ACTIVE = "bg-brand-orange text-brand-onAccent shadow-[0_6px_16px_-6px_rgb(var(--brand-orange-rgb)/0.8)]";

function CountBadge({ count, active }: { count?: number; active?: boolean }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
        active ? "text-brand-onAccent" : "text-white/60"
      }`}
      style={{ background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)" }}
    >
      {count > 999 ? "999+" : count}
    </span>
  );
}

function NavLink({ href, label, icon: Icon, count, active }: NavLinkItem & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${ROW} ${active ? ROW_ACTIVE : ROW_IDLE}`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
      <span className="flex-1 text-start">{label}</span>
      <CountBadge count={count} active={active} />
    </Link>
  );
}

function NavGroup({ label, icon: Icon, basePath, count, children }: NavGroupItem) {
  const pathname = usePathname();
  const inside = basePath.some((bp) => pathname.startsWith(bp));
  const [open, setOpen] = useState(inside);

  useEffect(() => {
    if (inside) setOpen(true);
  }, [inside]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${ROW} ${inside && !open ? ROW_ACTIVE : ROW_IDLE}`}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
        <span className="flex-1 truncate text-start">{label}</span>
        <CountBadge count={count} active={inside && !open} />
        <ChevronDown className={`h-4 w-4 shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5 border-s border-white/10 ps-3 ms-5">
          {children.map((c) => {
            const active = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-brand-orange font-semibold text-brand-onAccent" : "text-white/70 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Safety message at the bottom of the sidebar, over the background photo. */
function SafetyMessage() {
  return (
    <div className="shrink-0 px-5 pb-4 pt-6 [@media(max-height:760px)]:hidden">
      <span className="block font-display text-4xl leading-none text-brand-orange">&ldquo;</span>
      <p className="text-[18px] font-bold leading-snug text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">
        Safety
        <br />
        is everyone&rsquo;s
        <br />
        responsibility.
      </p>
      <span className="mt-2 block h-0.5 w-8 rounded bg-brand-orange" />
    </div>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const pathname = usePathname();

  const { observations } = useObservations();
  const { records: kpiRecords } = useWeeklyKpi();
  const { permits } = usePermits();
  const { disciplinaryRecords, ppeRecords, trainingRecords } = useHsePassport();

  // Close the mobile drawer after any navigation.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navEntries: NavEntry[] = [
    { kind: "link", href: "/dashboard", label: t.nav.dashboard, icon: House },
    { kind: "link", href: "/observations", label: t.nav.myObservations, icon: Binoculars, count: observations.length },
    { kind: "link", href: "/incidents", label: t.nav.incidents, icon: TriangleAlert },
    { kind: "link", href: "/ficc", label: t.nav.ficc, icon: FileWarning },
    { kind: "link", href: "/injury", label: t.nav.injury, icon: SquarePlus },
    { kind: "link", href: "/reports", label: t.nav.reports, icon: FileText },
    { kind: "link", href: "/weekly-kpi", label: t.nav.weeklyKpi, icon: ChartColumn, count: kpiRecords.length },
    { kind: "link", href: "/pmv", label: t.nav.pmv, icon: Truck },
    { kind: "link", href: "/permit-to-work", label: t.nav.permitToWork, icon: ShieldCheck, count: permits.length },
    {
      kind: "group",
      label: t.nav.hsePassport,
      icon: IdCard,
      basePath: ["/hse-passport/disciplinary", "/hse-passport/ppe"],
      count: disciplinaryRecords.length + ppeRecords.length,
      children: [
        { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction },
        { href: "/hse-passport/ppe", label: t.nav.ppe },
      ],
    },
    { kind: "link", href: "/hse-passport/training", label: t.nav.training, icon: GraduationCap, count: trainingRecords.length },
    { kind: "link", href: "/summary-performance-report", label: t.nav.summaryPerformanceReport, icon: ChartLine },
    { kind: "link", href: "/hse-team", label: t.nav.hseTeam, icon: Network },
  ];

  // Admin-only pages — hidden entirely for regular employees.
  const adminLinks: NavLinkItem[] =
    user?.role === "admin"
      ? [
          { href: "/edit-requests", label: t.nav.editRequests, icon: ClipboardCheck },
          { href: "/user-management", label: t.nav.userManagement, icon: UserCog },
        ]
      : [];

  const closedTranslate = dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      {/* Backdrop behind the mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed bottom-0 start-0 z-50 flex flex-col transition-transform duration-300 ease-out lg:z-30 lg:translate-x-0 ${
          mobileOpen ? "top-0 translate-x-0" : `top-0 ${closedTranslate}`
        }`}
        style={{ width: SIDEBAR_WIDTH, background: SIDEBAR_BG }}
      >
        {/* Spacer under the fixed top bar on desktop; close row on mobile */}
        <div className="hidden shrink-0 lg:block" style={{ height: TOPBAR_HEIGHT }} />
        <div className="flex h-14 shrink-0 items-center justify-end px-3 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-3 [scrollbar-width:thin]">
          {navEntries.map((entry) =>
            entry.kind === "link" ? (
              <NavLink key={entry.href} {...entry} active={pathname === entry.href} />
            ) : (
              <NavGroup key={entry.label} {...entry} />
            )
          )}

          {adminLinks.length > 0 && <div className="my-2 h-px bg-white/10" />}
          {adminLinks.map((link) => (
            <NavLink key={link.href} {...link} active={pathname === link.href} />
          ))}
        </nav>

        <SafetyMessage />

        <p className="shrink-0 border-t border-white/10 px-5 py-2.5 font-script text-lg text-brand-orange">
          Build a Safer Tomorrow
        </p>
      </aside>
    </>
  );
}

/**
 * The brand emblem alone. public/logo-icon.png is a 1754x1242 lockup —
 * circular mark on top of a BLACK "First Fix" wordmark — and that wordmark
 * is invisible on the dark shell. These offsets crop to just the mark.
 */
export function BrandMark({ size }: { size: number }) {
  const EMBLEM = { x: 555, y: 160, box: 600, w: 1754, h: 1242 };
  const scale = size / EMBLEM.box;
  return (
    <span
      role="img"
      aria-hidden
      style={{
        display: "block",
        width: size,
        height: size,
        backgroundImage: "url('/logo-icon.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${EMBLEM.w * scale}px ${EMBLEM.h * scale}px`,
        backgroundPosition: `${-EMBLEM.x * scale}px ${-EMBLEM.y * scale}px`,
      }}
    />
  );
}
