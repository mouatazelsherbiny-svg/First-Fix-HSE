"use client";

/**
 * Cards to choose from, in the HSE Passport style (tall rounded card, lift +
 * glow on hover) but smaller and centred. Each card is drawn, not a photo:
 * a dark panel lit in its own colour, a fine grid, and a large glowing icon.
 * The chosen one gets an orange outline.
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface PhotoCardItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** The card's light colour (hex). */
  color: string;
  active?: boolean;
  /** Navigate to a page… */
  href?: string;
  /** …or switch a view on the same page. */
  onClick?: () => void;
}

export default function PhotoCards({ items, className = "mb-6" }: { items: PhotoCardItem[]; className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {items.map((it) => {
        const cls = `group relative flex aspect-[3/4] w-[calc(50%-0.375rem)] flex-col items-center justify-between overflow-hidden rounded-2xl px-3 pb-4 pt-6 text-center outline-none transition duration-300 hover:-translate-y-1.5 focus-visible:ring-4 focus-visible:ring-[#f36f24] sm:w-[170px] ${
          it.active
            ? "shadow-[0_0_0_2px_#f36f24,0_18px_40px_-12px_rgba(243,111,36,0.6)]"
            : "shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_14px_30px_-14px_rgba(0,0,0,0.9)] hover:shadow-[0_0_0_2px_rgba(255,138,61,0.9),0_22px_48px_-12px_rgba(243,111,36,0.55)]"
        }`;
        const inner = (
          <>
            {/* Lit background in the card's colour + a fine grid. */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(120% 70% at 50% 28%, ${it.color}55 0%, ${it.color}14 45%, transparent 75%), linear-gradient(170deg, #1d1d21 0%, #0e0e10 100%)`,
              }}
            />
            <span
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                maskImage: "radial-gradient(circle at 50% 30%, black 0%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle at 50% 30%, black 0%, transparent 70%)",
              }}
            />
            {/* Big glowing icon in a ring. */}
            <span className="relative mt-2 flex flex-1 items-center justify-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-full border transition duration-300 group-hover:scale-110"
                style={{ borderColor: `${it.color}88`, background: `${it.color}1f`, boxShadow: `0 0 28px ${it.color}66, inset 0 0 18px ${it.color}33` }}
              >
                <it.icon className="h-10 w-10" strokeWidth={1.6} style={{ color: it.color, filter: `drop-shadow(0 0 8px ${it.color})` }} />
              </span>
            </span>
            <span className={`relative text-sm font-bold leading-tight ${it.active ? "text-[#ff8a3d]" : "text-white"}`}>{it.label}</span>
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
