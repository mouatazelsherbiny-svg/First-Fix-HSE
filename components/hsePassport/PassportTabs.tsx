"use client";

import { usePathname } from "next/navigation";
import { GraduationCap, HardHat, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import NavCards from "@/components/NavCards";

/** The three HSE Passport sections, shown as cards at the top of each. */
export default function PassportTabs() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const tabs = [
    { href: "/hse-passport/ppe", label: t.nav.ppe, icon: HardHat },
    { href: "/hse-passport/disciplinary", label: t.nav.disciplinaryAction, icon: ShieldAlert },
    { href: "/hse-passport/training", label: t.nav.training, icon: GraduationCap },
  ];
  return (
    <NavCards
      items={tabs.map((tab) => ({
        key: tab.href,
        label: tab.label,
        icon: tab.icon,
        href: tab.href,
        active: pathname.startsWith(tab.href),
      }))}
    />
  );
}
