"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { usePermits } from "@/context/PermitContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { useIncidents } from "@/context/IncidentsContext";
import { buildNotifications } from "@/lib/notifications";
import { BrandMark, SHELL_BG, TOPBAR_HEIGHT } from "@/components/Sidebar";

const TONE_CLASSES: Record<"red" | "amber" | "blue", string> = {
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
};

/** Fixed dark top bar (see ProtectedRoute), styled to the approved mockup:
 *  brand on the left over the sidebar column; greeting/clock, language,
 *  notifications (real data only), user and logout on the right. The menu
 *  button opens the sidebar drawer below `lg`. */
export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { t, locale } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { permits } = usePermits();
  const { employees, ppeRecords, trainingRecords } = useHsePassport();
  const { submissions: checklistSubmissions } = useChecklistSubmissions();
  const { incidents } = useIncidents();

  // `now` starts null so the server-rendered markup and the first client
  // render match (no time-dependent text) — filled in after mount, then
  // ticked every 30s. Avoids a hydration mismatch on the greeting/clock.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications) return;
    const onClickAway = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [showNotifications]);

  const greeting = useMemo(() => {
    if (!now) return "";
    const h = now.getHours();
    if (h < 12) return t.topbar.greetingMorning;
    if (h < 18) return t.topbar.greetingAfternoon;
    return t.topbar.greetingEvening;
  }, [now, t]);

  const notifications = useMemo(() => {
    if (!user) return [];
    return buildNotifications({
      t,
      project: user.project,
      permits,
      employees,
      ppeRecords,
      trainingRecords,
      checklistSubmissions,
      incidents,
    });
  }, [t, user, permits, employees, ppeRecords, trainingRecords, checklistSubmissions, incidents]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const dateStr = now
    ? now.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const timeStr = now
    ? now.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b px-3 sm:px-4 lg:ps-0"
      style={{ height: TOPBAR_HEIGHT, background: SHELL_BG, borderColor: "rgba(255,255,255,0.06)" }}
    >
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/75 transition hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Brand — sits over the sidebar column on desktop */}
      <Link
        href="/dashboard"
        aria-label="First Fix HSE — Dashboard"
        className="flex shrink-0 items-center gap-2.5 lg:w-64 lg:px-5"
      >
        <span className="rounded-full p-0.5 ring-2 ring-white/80">
          <BrandMark size={34} />
        </span>
        <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">First Fix</span>
      </Link>

      <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <p className="hidden text-end leading-tight xl:block">
          <span className="block text-xs font-semibold text-white/85">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </span>
          <span className="block text-[11px] text-white/45">
            {dateStr}
            {dateStr && timeStr ? " · " : ""}
            {timeStr}
          </span>
        </p>

        <LanguageToggle className="!border-white/15 !bg-transparent !text-white/85 !shadow-none hover:!border-brand-orange hover:!text-brand-orange" />

        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/85 transition-colors hover:text-brand-orange"
            aria-label={t.topbar.notifications}
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-brand-onAccent">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute end-0 z-20 mt-2 w-72 rounded-xl border border-brand-border bg-brand-surface p-3 shadow-cardHover">
              <p className="mb-2 text-xs font-bold tracking-wide text-brand-grayDark">
                {t.topbar.notifications}
              </p>
              {notifications.length === 0 ? (
                <p className="text-xs text-brand-gray">{t.topbar.noNotifications}</p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`rounded-lg px-3 py-2 text-xs font-medium ${TONE_CLASSES[n.tone]}`}
                    >
                      {n.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar name={user.name} src={user.avatarUrl} size={34} className="ring-2 ring-white/15" />
            <p className="max-w-[9rem] truncate text-sm font-semibold text-white">{user.name}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          aria-label={t.nav.logout}
          title={t.nav.logout}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-colors hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
