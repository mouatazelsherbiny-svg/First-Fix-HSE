"use client";

import Link from "next/link";
import Image from "next/image";

// The About page is the approved design artwork itself, shown exactly as
// supplied (public/brand/about-hse-hd.jpg, upscaled 2x to 2560x1440; hotspot
// coordinates below are in the original 1280x720 units). The three nav labels
// printed on it are made clickable with invisible links placed over them.
const W = 1280;
const H = 720;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const HOTSPOTS = [
  { label: "Home", href: "/", x: 992, y: 4, w: 54, h: 30 },
  { label: "About HSE", href: "/about", x: 1064, y: 4, w: 82, h: 30 },
  { label: "Our Team", href: "#team", x: 1156, y: 4, w: 74, h: 30 },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
      <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <Image
          src="/brand/about-hse-hd.jpg"
          alt="About HSE Department: Meet the HSE Director Rabih El Chaar, our mission, vision and HSE core team"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-contain"
        />
        {HOTSPOTS.map((h) => (
          <Link
            key={h.label}
            href={h.href}
            aria-label={h.label}
            className="absolute rounded"
            style={{ left: pct(h.x, W), top: pct(h.y, H), width: pct(h.w, W), height: pct(h.h, H) }}
          />
        ))}
        <span id="team" className="absolute" style={{ top: pct(490, H) }} />
      </div>
    </div>
  );
}
