"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  HeartPulse,
  FileText,
  Footprints,
  FileSpreadsheet,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  ClipboardCheck,
  FileWarning,
  ChevronRight,
  Menu,
  X,
  Users,
  Network,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { usePermits } from "@/context/PermitContext";
import { useHsePassport } from "@/context/HsePassportContext";
import Avatar from "./Avatar";
import LanguageToggle from "./LanguageToggle";

/**
 * Icons-only dark rail, rebuilt to design/reference.png.jpeg: a narrow,
 * heavily-rounded charcoal bar floating clear of the page edge, orange
 * brand mark at the top, user avatar pinned to the bottom, and the active
 * route's icon tinted orange with a short orange underline beneath it.
 *
 * Every route and role rule from the previous labelled sidebar is kept
 * verbatim — the two admin-only entries are still admin-only, and HSE
 * Passport is still a group, rendered here as a hover/focus flyout since
 * there is no room for inline children in a 76px rail.
 *
 * Because the rail shows no labels, each item carries both an aria-label
 * (for assistive tech) and a hover/focus tooltip (for sighted mouse and
 * keyboard users). Below `lg` the rail is replaced by the slim top bar +
 * drawer, where items ARE labelled — an icon-only bar is poor on a phone.
 */

/** Rail geometry. Kept here because ProtectedRoute pads the main column by
 *  RAIL_INSET + RAIL_WIDTH + RAIL_INSET; change both together. */
export const RAIL_WIDTH = 76;
export const RAIL_INSET = 16;

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface NavGroupItem {
  label: string;
  icon: LucideIcon;
  /** One or more route prefixes that count as "inside this group" for the
   *  active highlight. An array is needed when a group's children don't
   *  share a single common prefix (e.g. HSE Passport's Disciplinary + PPE
   *  children live under two different sub-paths). */
  basePath: string | string[];
  count?: number;
  children: { href: string; label: string }[];
}

type NavEntry = ({ kind: "link" } & NavLinkItem) | ({ kind: "group" } & NavGroupItem);

/** Small orange dash under the active icon (see the reference's home icon). */
function ActiveUnderline() {
  return (
    <span className="absolute -bottom-1 left-1/2 h-[2.5px] w-3.5 -translate-x-1/2 rounded-full bg-brand-orange" />
  );
}

/** Unread/queue marker. A bare dot, not a number: the rail is 76px wide and
 *  the reference carries no counters, so the exact figures live in the
 *  labelled mobile drawer and on each page instead. */
function CountDot({ count }: { count?: number }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className="absolute end-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-brand-orange ring-2"
      style={{ ["--tw-ring-color" as string]: "var(--ref-ink)" }}
    />
  );
}

const RAIL_ITEM =
  "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/70";

/** What the fixed overlay layer is currently showing. */
interface RailOverlay {
  /** Viewport Y of the trigger's vertical centre. */
  top: number;
  label: string;
  /** Present for the group entry — renders a flyout instead of a tooltip. */
  items?: { href: string; label: string }[];
}

function RailLink({
  href,
  label,
  icon: Icon,
  count,
  active,
  onShow,
}: NavLinkItem & { active: boolean; onShow: (el: HTMLElement, label: string) => void }) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onMouseEnter={(e) => onShow(e.currentTarget, label)}
      onFocus={(e) => onShow(e.currentTarget, label)}
      className={`${RAIL_ITEM} ${
        active ? "bg-brand-orange/12 text-brand-orange" : "text-white/45 hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
      <CountDot count={count} />
      {active && <ActiveUnderline />}
    </Link>
  );
}

/** Group entry: the trigger behaves like any other rail icon; its children
 *  appear in the shared overlay layer as a flyout. */
function RailGroup({
  label,
  icon: Icon,
  basePath,
  count,
  children,
  onShow,
}: NavGroupItem & {
  onShow: (el: HTMLElement, label: string, items: { href: string; label: string }[]) => void;
}) {
  const pathname = usePathname();
  const basePaths = Array.isArray(basePath) ? basePath : [basePath];
  const active = basePaths.some((bp) => pathname.startsWith(bp));

  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-current={active ? "page" : undefined}
      onMouseEnter={(e) => onShow(e.currentTarget, label, children)}
      onFocus={(e) => onShow(e.currentTarget, label, children)}
      className={`${RAIL_ITEM} ${
        active ? "bg-brand-orange/12 text-brand-orange" : "text-white/45 hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
      <CountDot count={count} />
      {active && <ActiveUnderline />}
    </button>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { observations } = useObservations();
  const { records: kpiRecords } = useWeeklyKpi();
  const { permits } = usePermits();
  const { disciplinaryRecords, ppeRecords, trainingRecords } = useHsePassport();

  // Close the mobile drawer automatically after any navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // --- Rail tooltip / flyout overlay ---
  const [overlay, setOverlay] = useState<RailOverlay | null>(null);
  // A short close delay lets the pointer travel the 10px gap from a group
  // icon into its flyout without the panel vanishing underneath it.
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const hideOverlay = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setOverlay(null), 120);
  }, [cancelHide]);

  const showTooltip = useCallback(
    (el: HTMLElement, label: string) => {
      cancelHide();
      const rect = el.getBoundingClientRect();
      setOverlay({ top: rect.top + rect.height / 2, label });
    },
    [cancelHide]
  );

  const showFlyout = useCallback(
    (el: HTMLElement, label: string, items: { href: string; label: string }[]) => {
      cancelHide();
      const rect = el.getBoundingClientRect();
      setOverlay({ top: rect.top + rect.height / 2, label, items });
    },
    [cancelHide]
  );

  // Never leave a stale overlay pinned after a route change.
  useEffect(() => {
    cancelHide();
    setOverlay(null);
  }, [pathname, cancelHide]);

  useEffect(() => () => cancelHide(), [cancelHide]);

  // Admin-only: link to the pending-signups / user approval page (see
  // app/user-management/page.tsx). Hidden entirely for regular employees
  // rather than shown-but-blocked, since a nav item for a page you can't
  // use is just clutter. Rendered last, after every other nav item.
  const userManagementLink: NavLinkItem | null =
    user?.role === "admin"
      ? { href: "/user-management", label: t.nav.userManagement, icon: Users }
      : null;

  const editRequestsLink: NavLinkItem | null =
    user?.role === "admin"
      ? { href: "/edit-requests", label: t.nav.editRequests, icon: ClipboardCheck }
      : null;

  const navEntries: NavEntry[] = [
    { kind: "link", href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    {
      kind: "link",
      href: "/observations",
      label: t.nav.myObservations,
      icon: ClipboardList,
      count: observations.length,
    },
    { kind: "link", href: "/incidents", label: t.nav.incidents, icon: AlertTriangle },
    { kind: "link", href: "/ficc", label: t.nav.ficc, icon: FileWarning },
    { kind: "link", href: "/injury", label: t.nav.injury, icon: HeartPulse },
    { kind: "link", href: "/reports", label: t.nav.reports, icon: FileText },
    {
      kind: "link",
      href: "/weekly-kpi",
      label: t.nav.weeklyKpi,
      icon: BarChart3,
      count: kpiRecords.length,
    },
    { kind: "link", href: "/pmv", label: t.nav.pmv, icon: Footprints },
    {
      kind: "link",
      href: "/permit-to-work",
      label: t.nav.permitToWork,
      icon: ClipboardCheck,
      count: permits.length,
    },
    {
      kind: "group",
      label: t.nav.hsePassport,
      icon: ShieldCheck,
      basePath: ["/hse-passport/disciplinary", "/hse-passport/ppe"],
      count: disciplinaryRecords.length + ppeRecords.length,
      children: [
        { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction },
        { href: "/hse-passport/ppe", label: t.nav.ppe },
      ],
    },
    {
      kind: "link",
      href: "/hse-passport/training",
      label: t.nav.training,
      icon: GraduationCap,
      count: trainingRecords.length,
    },
    {
      kind: "link",
      href: "/summary-performance-report",
      label: t.nav.summaryPerformanceReport,
      icon: FileSpreadsheet,
    },
    { kind: "link", href: "/hse-team", label: t.nav.hseTeam, icon: Network },
  ];

  const adminLinks: NavLinkItem[] = [
    ...(editRequestsLink ? [editRequestsLink] : []),
    ...(userManagementLink ? [userManagementLink] : []),
  ];

  const closedTranslate = dir === "rtl" ? "translate-x-full" : "-translate-x-full";
  const displayName = user?.name ?? "";

  return (
    <>
      {/* ---- Mobile top bar (hidden from lg up, where the rail takes over) ---- */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-4 lg:hidden"
        style={{ backgroundColor: "var(--ref-ink)" }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" aria-label="First Fix HSE" className="flex items-center gap-2">
          <BrandMark size={28} />
          <span className="text-sm font-extrabold tracking-wide text-white">
            First Fix <span className="text-brand-orange">HSE</span>
          </span>
        </Link>
        <LanguageToggle className="!px-2.5 !py-1" />
      </header>

      {/* Backdrop behind the mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* ---- Mobile drawer: same entries, but LABELLED ---- */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : closedTranslate
        }`}
        style={{ backgroundColor: "var(--ref-ink)" }}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <BrandMark size={30} />
          <span className="text-base font-extrabold tracking-wide text-white">
            First Fix <span className="text-brand-orange">HSE</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="ms-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
          {navEntries.map((entry) =>
            entry.kind === "link" ? (
              <DrawerLink key={entry.href} {...entry} active={pathname === entry.href} />
            ) : (
              <div key={entry.children[0].href} className="pt-1">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                  {entry.label}
                </p>
                {entry.children.map((c) => (
                  <DrawerLink
                    key={c.href}
                    href={c.href}
                    label={c.label}
                    icon={entry.icon}
                    active={pathname === c.href}
                  />
                ))}
              </div>
            )
          )}
          {adminLinks.map((link) => (
            <DrawerLink key={link.href} {...link} active={pathname === link.href} />
          ))}
        </nav>

        {user && (
          <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
            <Avatar name={displayName} src={user.avatarUrl} size={34} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-white">{displayName}</span>
              <span className="block truncate text-[11px] text-white/45">{user.project}</span>
            </span>
          </div>
        )}
      </aside>

      {/* ---- Desktop icon rail ----
           The nav scrolls when the viewport is too short for 15 icons, and
           a scroll container clips its descendants on BOTH axes — so
           tooltips and the group flyout cannot live inside it. They are
           rendered instead in a fixed-position layer that is a sibling of
           the rail, positioned from the trigger's measured rect. */}
      <aside
        aria-label="Main navigation"
        onMouseLeave={hideOverlay}
        className="fixed z-40 hidden flex-col items-center lg:flex"
        style={{
          insetBlock: RAIL_INSET,
          insetInlineStart: RAIL_INSET,
          width: RAIL_WIDTH,
          backgroundColor: "var(--ref-ink)",
          borderRadius: 30,
          boxShadow: "var(--ref-shadow-lift)",
        }}
      >
        <Link
          href="/dashboard"
          aria-label="First Fix HSE — Dashboard"
          className="mt-5 shrink-0 transition-transform hover:scale-105"
        >
          <BrandMark size={34} />
        </Link>

        <span className="mt-4 h-px w-8 shrink-0 bg-white/10" />

        <nav
          onScroll={hideOverlay}
          className="flex w-full flex-1 flex-col items-center gap-1.5 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navEntries.map((entry) =>
            entry.kind === "link" ? (
              <RailLink
                key={entry.href}
                {...entry}
                active={pathname === entry.href}
                onShow={showTooltip}
              />
            ) : (
              <RailGroup key={entry.children[0].href} {...entry} onShow={showFlyout} />
            )
          )}

          {adminLinks.length > 0 && <span className="my-1 h-px w-8 shrink-0 bg-white/10" />}
          {adminLinks.map((link) => (
            <RailLink
              key={link.href}
              {...link}
              active={pathname === link.href}
              onShow={showTooltip}
            />
          ))}
        </nav>

        {user && (
          <div
            className="mb-5 shrink-0"
            onMouseEnter={(e) => showTooltip(e.currentTarget, displayName)}
          >
            <Avatar
              name={displayName}
              src={user.avatarUrl}
              size={38}
              className="ring-2 ring-white/15"
            />
          </div>
        )}
      </aside>

      {/* ---- Fixed overlay layer: tooltips + the group flyout ---- */}
      {overlay && (
        <div
          className="fixed z-50 hidden lg:block"
          style={{
            top: overlay.top,
            [dir === "rtl" ? "right" : "left"]: RAIL_INSET + RAIL_WIDTH + 10,
            transform: "translateY(-50%)",
            pointerEvents: overlay.items ? "auto" : "none",
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={hideOverlay}
        >
          {overlay.items ? (
            <div
              className="min-w-[196px] rounded-2xl border border-white/10 p-1.5"
              style={{ backgroundColor: "var(--ref-ink)", boxShadow: "var(--ref-shadow-lift)" }}
            >
              <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                {overlay.label}
              </p>
              {overlay.items.map((c) => {
                const childActive = pathname === c.href;
                return (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={`flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                      childActive
                        ? "bg-brand-orange/15 font-semibold text-brand-orange"
                        : "text-white/70 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {c.label}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 rtl:rotate-180" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <span
              className="block whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--ref-ink)", boxShadow: "var(--ref-shadow-lift)" }}
            >
              {overlay.label}
            </span>
          )}
        </div>
      )}
    </>
  );
}

function DrawerLink({ href, label, icon: Icon, count, active }: NavLinkItem & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
        active
          ? "bg-brand-orange/15 font-semibold text-brand-orange"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      <span className="flex-1 truncate text-start">{label}</span>
      {!!count && count > 0 && (
        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/70">
          {count}
        </span>
      )}
    </Link>
  );
}

/**
 * The brand emblem alone. public/logo-icon.png is a 1754x1242 lockup —
 * circular mark on top of a BLACK "First Fix" wordmark — and that wordmark
 * is invisible on the dark rail. These offsets crop to just the mark,
 * scaled to `size`, using background-position so no extra asset is needed.
 */
function BrandMark({ size }: { size: number }) {
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
