"use client";

/** Phone app → Search: find any report of the app by name and open it. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, ChartNoAxesColumnIncreasing, ChevronRight, ClipboardList, Flame, HardHat, History, Leaf, Search, Zap, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTitle from "@/components/PageTitle";
import { SearchBar } from "@/components/mobile/MobileUi";

const ITEMS: { href: string; label: string; group: string; icon: LucideIcon; keys: string }[] = [
  { href: "/m/reports/daily/observation", label: "Observations", group: "Daily", icon: ClipboardList, keys: "observation unsafe act condition" },
  { href: "/m/reports/daily/kpi", label: "KPI", group: "Daily", icon: ChartNoAxesColumnIncreasing, keys: "kpi manpower hours" },
  { href: "/m/reports/daily/good-practice", label: "Good Practice", group: "Daily", icon: Award, keys: "good practice" },
  { href: "/checklists/safety-health", label: "Health & Safety Checklist", group: "Monthly", icon: HardHat, keys: "health safety checklist monthly" },
  { href: "/checklists/environmental", label: "Environmental Checklist", group: "Monthly", icon: Leaf, keys: "environmental environment checklist monthly" },
  { href: "/checklists/tc-energization", label: "T&C and Energization Checklist", group: "Monthly", icon: Zap, keys: "testing commissioning energization electrical checklist monthly" },
  { href: "/checklists/fire-assessment", label: "Fire Assessment Checklist", group: "Monthly", icon: Flame, keys: "fire assessment checklist monthly" },
  { href: "/my-checklists", label: "My Checklists", group: "Monthly", icon: History, keys: "my checklists submitted history" },
  { href: "/m/reports/iir", label: "Incident Investigation Report", group: "Incident", icon: Search, keys: "iir incident investigation report accident injury" },
];

export default function MobileSearchPage() {
  return (
    <ProtectedRoute hideProjectFilter>
      <MobileSearch />
    </ProtectedRoute>
  );
}

function MobileSearch() {
  const [q, setQ] = useState("");
  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? ITEMS.filter((i) => `${i.label} ${i.group} ${i.keys}`.toLowerCase().includes(s)) : ITEMS;
  }, [q]);

  return (
    <div>
      <PageTitle section="Search" title="Reports" />
      <SearchBar value={q} onChange={setQ} autoFocus />
      <ul className="mt-5 space-y-2.5">
        {list.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="flex items-center gap-3 rounded-2xl border border-[#ff6a13]/40 bg-[#111] px-4 py-3.5 shadow-[0_0_12px_rgba(255,106,19,0.12)] active:scale-[0.99]">
              <i.icon className="h-6 w-6 shrink-0 text-[#ff7a2a]" strokeWidth={1.8} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{i.label}</span>
                <span className="text-xs text-white/50">{i.group}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </Link>
          </li>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-white/55">No report matches “{q}”.</p>}
      </ul>
    </div>
  );
}
