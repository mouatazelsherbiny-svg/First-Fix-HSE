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
    <div className="card mb-6 grid gap-2 !p-2 sm:grid-cols-3">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              active
                ? "bg-brand-orange text-brand-onAccent shadow-sm"
                : "text-brand-grayDark hover:bg-brand-grayLight/60 hover:text-brand-black"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
