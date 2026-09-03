"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { usePermits } from "@/context/PermitContext";
import { useHsePassport } from "@/context/HsePassportContext";
import { useChecklistSubmissions } from "@/context/ChecklistSubmissionContext";
import { buildNotifications } from "@/lib/notifications";

const TONE_CLASSES: Record<"red" | "amber" | "blue", string> = {
  red: "bg-red-500/10 text-red-400",
  amber: "bg-amber-500/10 text-amber-400",
  blue: "bg-blue-500/10 text-blue-400",
};

/** Shared top bar rendered once, above every page's content (see
 *  ProtectedRoute). Shows a time-of-day greeting, a live clock, and a
 *  notifications bell built from real, current data — never placeholders. */
export default function Topbar() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { permits } = usePermits();
  const { employees, ppeRecords, trainingRecords } = useHsePassport();
  const { submissions: checklistSubmissions } = useChecklistSubmissions();

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
    });
  }, [t, user, permits, employees, ppeRecords, trainingRecords, checklistSubmissions]);

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
    <div className="mb-6 flex flex-col gap-3 border-b border-brand-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-bold text-brand-black">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </p>
        <p className="text-xs font-medium text-brand-gray">
          {dateStr}
          {dateStr && timeStr ? " · " : ""}
          {timeStr}
        </p>
      </div>

      <div className="relative shrink-0 self-end sm:self-auto" ref={panelRef}>
        <button
          type="button"
          onClick={() => setShowNotifications((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-grayLight text-brand-grayDark transition-colors hover:bg-brand-orangeLight hover:text-brand-orange"
          aria-label={t.topbar.notifications}
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute end-0 z-20 mt-2 w-72 rounded-xl border border-brand-border bg-brand-surface p-3 shadow-cardHover">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-grayDark">
              {t.topbar.notifications}
            </p>
            {notifications.length === 0 ? (
              <p className="text-xs text-brand-gray">{t.topbar.noNotifications}</p>
            ) : (
              <ul className="space-y-2">
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
    </div>
  );
}
