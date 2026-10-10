"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, HardHat, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/** The three HSE Passport sections, shown as buttons at the top of each. */
export default function PassportTabs() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const tabs = [
    { href: "/hse-passport/ppe", label: t.nav.ppe, icon: HardHat },
    { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction, icon: ShieldAlert },
    { href: "/hse-passport/training", label: t.nav.training, icon: GraduationCap },
  ];
  return (
    <div className="mb-6 inline-flex flex-wrap gap-1 rounded-xl border border-brand-border bg-brand-surface p-1">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              active
                ? "bg-brand-orange text-brand-onAccent shadow-sm"
                : "text-brand-grayDark hover:bg-brand-grayLight/60 hover:text-brand-black"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
