"use client";

import { useEffect, useRef, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import Avatar from "./Avatar";

interface NavLink {
  href: string;
  label: string;
}

const ITEM_WIDTH = "w-16 sm:w-20";
const DROPDOWN_ITEM_CLASS =
  "block rounded-lg px-3 py-2 text-sm font-medium transition duration-200 hover:scale-105";
const DROPDOWN_ITEM_ACTIVE = "bg-brand-orangeLight text-brand-orange";
const DROPDOWN_ITEM_INACTIVE = "text-brand-grayDark hover:bg-brand-grayLight";

/** Circular icon badge shared by plain nav items and dropdown triggers —
 *  filled orange when the item (or one of its dropdown children) is active. */
function NavCircle({ Icon, active }: { Icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
        active
          ? "border-brand-orange bg-brand-orange text-white"
          : "border-transparent bg-brand-grayLight text-brand-orange"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
  );
}

function NavItemLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`text-center text-[11px] leading-tight ${
        active ? "font-semibold text-brand-orange" : "font-medium text-brand-grayDark"
      }`}
    >
      {children}
    </span>
  );
}

function NavItem({ href, label, icon: Icon }: NavLink & { icon: LucideIcon }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex ${ITEM_WIDTH} flex-col items-center gap-1 rounded-lg py-1 transition duration-200 hover:scale-105`}
    >
      <NavCircle Icon={Icon} active={active} />
      <NavItemLabel active={active}>{label}</NavItemLabel>
    </Link>
  );
}

function NavDropdown({
  label,
  icon: Icon,
  items,
  active,
}: {
  label: string;
  icon: LucideIcon;
  items: NavLink[];
  active: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative flex ${ITEM_WIDTH} flex-col items-center`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-col items-center gap-1 rounded-lg py-1 transition duration-200 hover:scale-105"
      >
        <NavCircle Icon={Icon} active={active} />
        <NavItemLabel active={active}>
          <span className="inline-flex items-center gap-0.5">
            {label}
            <ChevronDown
              className={`h-2.5 w-2.5 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </NavItemLabel>
      </button>

      {open && (
        <div className="absolute start-1/2 top-full z-30 mt-1 w-56 -translate-x-1/2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
          {items.map((item) => {
            const itemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`${DROPDOWN_ITEM_CLASS} ${
                  itemActive ? DROPDOWN_ITEM_ACTIVE : DROPDOWN_ITEM_INACTIVE
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const links: (NavLink & { icon: LucideIcon })[] = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/observations", label: t.nav.myObservations, icon: ClipboardList },
    { href: "/observations/new", label: t.nav.newObservation, icon: PlusCircle },
    { href: "/toolbox-talk/new", label: t.nav.toolboxTalk, icon: GraduationCap },
    { href: "/weekly-kpi", label: t.nav.weeklyKpi, icon: BarChart3 },
    { href: "/permit-to-work", label: t.nav.permitToWork, icon: ClipboardCheck },
  ];

  const hseLinks: NavLink[] = [
    { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction },
    { href: "/hse-passport/ppe", label: t.nav.ppe },
    { href: "/hse-passport/training", label: t.nav.training },
  ];
  const hseActive = pathname.startsWith("/hse-passport");

  const checklistLinks: NavLink[] = [
    { href: "/checklists/environmental", label: t.nav.envChecklist },
    { href: "/checklists/fire-assessment", label: t.nav.fireChecklist },
    { href: "/checklists/safety-health", label: t.nav.shChecklist },
    { href: "/checklists/tc-energization", label: t.nav.tcChecklist },
  ];
  const checklistsActive = pathname.startsWith("/checklists");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="shrink-0">
          <Logo size={38} showText />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user && (
            <div className="hidden items-center gap-2 md:flex">
              <Avatar name={user.name} src={user.avatarUrl} size={32} />
              <span className="text-sm text-brand-gray">
                {t.nav.hello}, <span className="font-semibold text-brand-black">{user.name}</span>
              </span>
            </div>
          )}
          <button onClick={handleLogout} className="btn-secondary !px-4 !py-2 text-xs sm:text-sm">
            {t.nav.logout}
          </button>
        </div>
      </div>

      <nav className="flex flex-wrap items-start justify-center gap-x-3 gap-y-2 border-t border-gray-200 px-4 py-2.5 sm:gap-x-4 sm:px-6">
        {links.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
        <NavDropdown
          label={t.nav.hsePassport}
          icon={ShieldCheck}
          items={hseLinks}
          active={hseActive}
        />
        <NavDropdown
          label={t.nav.monthlyChecklists}
          icon={CalendarCheck}
          items={checklistLinks}
          active={checklistsActive}
        />
      </nav>
    </header>
  );
}
