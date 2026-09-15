"use client";

/** Decorative "Health / Safety / Environment" graphic for the public
 *  landing page hero (app/page.tsx) — a loose cluster of colored icon
 *  badges rather than a literal recreation of any particular stock
 *  illustration, so it stays lightweight (no image asset to ship) while
 *  still reading as "health, safety, environment" at a glance. */

import { Heart, HardHat, Leaf, Building2, TrafficCone } from "lucide-react";

function Badge({
  icon: Icon,
  bg,
  fg,
  size,
  className = "",
  rotate = 0,
}: {
  icon: typeof Heart;
  bg: string;
  fg: string;
  size: number;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-3xl shadow-xl ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <Icon color={fg} strokeWidth={1.75} style={{ width: size * 0.48, height: size * 0.48 }} />
    </div>
  );
}

export default function HseHeroIllustration() {
  return (
    <div className="relative mx-auto h-[320px] w-full max-w-md sm:h-[400px]">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-100" />
      <div className="absolute -end-6 -top-6 h-28 w-28 rounded-full bg-amber-200/70 blur-2xl" />
      <div className="absolute -start-8 bottom-4 h-32 w-32 rounded-full bg-emerald-200/70 blur-2xl" />

      <Building2
        className="absolute start-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-white/70 sm:h-52 sm:w-52"
        strokeWidth={1}
      />

      <Badge icon={Heart} bg="#FEE2E2" fg="#DC2626" size={76} className="start-6 top-8" rotate={-6} />
      <Badge icon={HardHat} bg="#FFEDDC" fg="#F36F24" size={92} className="end-8 top-16 sm:end-10" rotate={5} />
      <Badge icon={Leaf} bg="#DCFCE7" fg="#16A34A" size={72} className="end-12 bottom-10 sm:end-16" rotate={-4} />
      <Badge icon={TrafficCone} bg="#FEF3C7" fg="#D97706" size={64} className="start-10 bottom-6" rotate={8} />
    </div>
  );
}
