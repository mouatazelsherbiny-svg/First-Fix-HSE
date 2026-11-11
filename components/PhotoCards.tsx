"use client";

/**
 * Picture cards to choose from, in the HSE Passport style (photo, dark fade,
 * label at the bottom, lift + orange glow on hover) but smaller. The chosen
 * one gets an orange outline.
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface PhotoCardItem {
  key: string;
  label: string;
  icon: LucideIcon;
  image: string;
  /** CSS object-position for the photo crop. */
  position?: string;
  active?: boolean;
  /** Navigate to a page… */
  href?: string;
  /** …or switch a view on the same page. */
  onClick?: () => void;
}

export default function PhotoCards({ items, className = "mb-6" }: { items: PhotoCardItem[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(160px,190px))] ${className}`}>
      {items.map((it) => {
        const cls = `group relative block aspect-[3/4] overflow-hidden rounded-2xl text-start outline-none transition duration-300 hover:-translate-y-1.5 focus-visible:ring-4 focus-visible:ring-[#f36f24] ${
          it.active
            ? "shadow-[0_0_0_2px_#f36f24,0_18px_40px_-12px_rgba(243,111,36,0.6)]"
            : "shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_14px_30px_-14px_rgba(0,0,0,0.9)] hover:shadow-[0_0_0_2px_rgba(255,138,61,0.9),0_22px_48px_-12px_rgba(243,111,36,0.55)]"
        }`;
        const inner = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.image}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              style={{ objectPosition: it.position ?? "center" }}
            />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(10,10,12,0.05) 30%, rgba(10,10,12,0.55) 60%, rgba(10,10,12,0.95) 100%)" }}
            />
            <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-3.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  it.active ? "bg-[#f36f24] text-white shadow-[0_0_12px_rgba(243,111,36,0.7)]" : "bg-black/50 text-[#ff8a3d] backdrop-blur-sm"
                }`}
              >
                <it.icon className="h-4 w-4" />
              </span>
              <span className={`text-sm font-bold leading-tight ${it.active ? "text-[#ff8a3d]" : "text-white"}`}>{it.label}</span>
            </span>
          </>
        );
        return it.href ? (
          <Link key={it.key} href={it.href} className={cls}>
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
