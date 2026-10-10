"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface NavCardItem {
  key: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  /** Navigate to a page… */
  href?: string;
  /** …or switch a view on the same page. */
  onClick?: () => void;
}

/**
 * Section buttons drawn as small cards — the same look as the Monthly
 * checklist cards in Reports. The selected one gets an orange outline.
 */
export default function NavCards({ items, className = "mb-6" }: { items: NavCardItem[]; className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {items.map((it) => {
        const cls = `card flex flex-col items-start gap-3 text-start transition hover:shadow-cardHover ${
          it.active ? "!border-brand-orange ring-2 ring-brand-orange/40" : ""
        }`;
        const inner = (
          <>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                it.active ? "bg-brand-orange text-brand-onAccent" : "bg-brand-orangeLight text-brand-orange"
              }`}
            >
              <it.icon className="h-4.5 w-4.5" />
            </span>
            <span className={`text-sm font-semibold ${it.active ? "text-brand-orange" : "text-brand-black"}`}>
              {it.label}
            </span>
          </>
        );
        return it.href ? (
          <Link key={it.key} href={it.href} className={cls} aria-current={it.active ? "page" : undefined}>
            {inner}
          </Link>
        ) : (
          <button key={it.key} type="button" onClick={it.onClick} className={cls} aria-pressed={it.active}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
