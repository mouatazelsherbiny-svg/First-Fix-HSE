"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  CalendarCheck,
  ClipboardCheck,
  ChevronDown,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useObservations } from "@/context/ObservationsContext";
import { useToolboxTalk } from "@/context/ToolboxTalkContext";
import { useWeeklyKpi } from "@/context/WeeklyKpiContext";
import { usePermits } from "@/context/PermitContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { useHsePassport } from "@/context/HsePassportContext";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import Avatar from "./Avatar";

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface NavGroupItem {
  label: string;
  icon: LucideIcon;
  basePath: string;
  count?: number;
  children: { href: string; label: string }[];
}

/** Pill row shared shell: icon badge + label + optional count badge,
 *  filled/tinted teal when the item (or its group) is the active route. */
const PILL_ROW =
  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200";
const PILL_ACTIVE = "bg-brand-orangeLight text-brand-orange";
const PILL_INACTIVE = "text-brand-grayDark hover:bg-brand-grayLight hover:text-brand-black";

function IconBadge({ Icon, active }: { Icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
        active
          ? "bg-brand-orange text-brand-onAccent"
          : "bg-brand-grayLight text-brand-gray group-hover:text-brand-orange"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

function CountBadge({ count, active }: { count?: number; active: boolean }) {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
        active ? "bg-brand-orange text-brand-onAccent" : "bg-brand-grayLight text-brand-gray"
      }`}
    >
      {count}
    </span>
  );
}

function PillLink({ href, label, icon: Icon, count, active }: NavLinkItem & { active: boolean }) {
  return (
    <Link href={href} className={`${PILL_ROW} ${active ? PILL_ACTIVE : PILL_INACTIVE}`}>
      <IconBadge Icon={Icon} active={active} />
      <span className="flex-1 truncate text-start">{label}</span>
      <CountBadge count={count} active={active} />
    </Link>
  );
}

function PillGroup({ label, icon: Icon, basePath, count, children }: NavGroupItem) {
  const pathname = usePathname();
  const active = pathname.startsWith(basePath);
  const [open, setOpen] = useState(active);

  // Auto-expand whenever navigation lands inside this group; the user can
  // still collapse it manually afterwards without it snapping back open
  // (this effect only re-fires when the route itself changes).
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${PILL_ROW} ${active ? PILL_ACTIVE : PILL_INACTIVE}`}
      >
        <IconBadge Icon={Icon} active={active} />
        <span className="flex-1 truncate text-start">{label}</span>
        <CountBadge count={count} active={active} />
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="ms-4 mt-1 space-y-0.5 border-s border-brand-border ps-4">
          {children.map((c) => {
            const childActive = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                  childActive
                    ? "font-semibold text-brand-orange"
                    : "text-brand-grayDark hover:text-brand-black"
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

/** Persistent left sidebar navigation. Replaces the old horizontal Navbar.
 *  Rendered once per protected page via ProtectedRoute. On small screens it
 *  collapses to a slim top bar with a hamburger-triggered slide-in drawer;
 *  from `lg` up it is always visible as a fixed-width column. */
export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, dir } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { observations } = useObservations();
  const { records: toolboxRecords } = useToolboxTalk();
  const { records: kpiRecords } = useWeeklyKpi();
  const { permits } = usePermits();
  const { submissions: checklistSubmissions } = useChecklistSubmissions();
  const { disciplinaryRecords, ppeRecords, trainingRecords } = useHsePassport();

  // Close the mobile drawer automatically after any navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links: NavLinkItem[] = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    {
      href: "/observations",
      label: t.nav.myObservations,
      icon: ClipboardList,
      count: observations.length,
    },
    { href: "/observations/new", label: t.nav.newObservation, icon: PlusCircle },
    // Points at the Toolbox Talk list page (not the create form) — a
    // persistent nav item pointing straight at a "new" form is unusual,
    // and the list page is the natural home for a running count.
    {
      href: "/toolbox-talk",
      label: t.nav.toolboxTalk,
      icon: GraduationCap,
      count: toolboxRecords.length,
    },
    {
      href: "/weekly-kpi",
      label: t.nav.weeklyKpi,
      icon: BarChart3,
      count: kpiRecords.length,
    },
    {
      href: "/permit-to-work",
      label: t.nav.permitToWork,
      icon: ClipboardCheck,
      count: permits.length,
    },
    {
      href: "/permit-to-work/my-permits",
      label: t.nav.myPermits,
      icon: ClipboardCheck,
      count: permits.filter((p) => p.projectName === user?.project).length,
    },
  ];

  const hsePassportGroup: NavGroupItem = {
    label: t.nav.hsePassport,
    icon: ShieldCheck,
    basePath: "/hse-passport",
    // Combined count across all three sub-records — a single summary
    // badge on the parent reads cleaner than three near-duplicate badges.
    count: disciplinaryRecords.length + ppeRecords.length + trainingRecords.length,
    children: [
      { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction },
      { href: "/hse-passport/ppe", label: t.nav.ppe },
      { href: "/hse-passport/training", label: t.nav.training },
    ],
  };

  const checklistsGroup: NavGroupItem = {
    label: t.nav.monthlyChecklists,
    icon: CalendarCheck,
    basePath: "/checklists",
    count: checklistSubmissions.length,
    children: [
      { href: "/checklists/environmental", label: t.nav.envChecklist },
      { href: "/checklists/fire-assessment", label: t.nav.fireChecklist },
      { href: "/checklists/safety-health", label: t.nav.shChecklist },
      { href: "/checklists/tc-energization", label: t.nav.tcChecklist },
    ],
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closedTranslate = dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      {/* Mobile top bar (hidden from lg up, where the sidebar is always visible) */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-brand-border bg-brand-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-grayDark transition hover:bg-brand-grayLight"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard">
          <Logo size={30} />
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

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-brand-border bg-brand-surface transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : closedTranslate
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <Link href="/dashboard" className="min-w-0">
            <Logo size={34} showText />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="ms-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-gray transition hover:bg-brand-grayLight lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {links.map((link) => (
            <PillLink key={link.href} {...link} active={pathname === link.href} />
          ))}
          <PillGroup {...hsePassportGroup} />
          <PillGroup {...checklistsGroup} />
        </nav>

        <div className="shrink-0 space-y-3 border-t border-brand-border px-4 py-4">
          <LanguageToggle className="w-full justify-center" />
          {user && (
            <div className="flex items-center gap-2.5 px-1">
              <Avatar name={user.name} src={user.avatarUrl} size={34} />
              <div className="min-w-0">
                <p className="truncate text-xs text-brand-gray">{t.nav.hello}</p>
                <p className="truncate text-sm font-semibold text-brand-black">{user.name}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary w-full !py-2 text-xs"
          >
            {t.nav.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
