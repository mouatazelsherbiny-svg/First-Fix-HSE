"use client";

/**
 * HSE Passport landing: three photo cards (PPE, Training, Disciplinary
 * Action). Opening a card brings up its intro panel — photo, short
 * description, topics — with "Open dashboard" to go to that section and
 * "Back to sections" to return to the cards.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

interface Section {
  key: string;
  title: string;
  /** Card label (may wrap onto two lines). */
  label: string;
  img: string;
  href: string;
  text: string;
  topics: string[];
}

const SECTIONS: Section[] = [
  {
    key: "ppe",
    title: "PPE",
    label: "PPE",
    img: "/brand/passport/ppe.jpg",
    href: "/hse-passport/ppe",
    text: "Personal Protective Equipment is a vital part of protecting every person on our construction sites.",
    topics: ["Head and eye protection", "High-visibility clothing", "Hand and foot protection"],
  },
  {
    key: "training",
    title: "Training",
    label: "Training",
    img: "/brand/passport/training.jpg",
    href: "/hse-passport/training",
    text: "Every worker is trained and assessed before work starts, and their skills are kept current on site.",
    topics: ["Site induction", "Toolbox talks", "Competency records"],
  },
  {
    key: "disciplinary",
    title: "Disciplinary Action",
    label: "Disciplinary Action",
    img: "/brand/passport/disciplinary.jpg",
    href: "/hse-passport/disciplinary",
    text: "Clear and fair follow-up on safety violations protects the whole team and keeps our standards high.",
    topics: ["Warnings", "Violations and LSR", "Employee history"],
  },
];

export default function HsePassportLanding() {
  return (
    <ProtectedRoute hideProjectFilter>
      <Landing />
    </ProtectedRoute>
  );
}

function Landing() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = SECTIONS.find((s) => s.key === openKey) ?? null;

  // Esc closes the intro panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenKey(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-8`}
      style={{ background: "radial-gradient(1200px 700px at 40% 45%, #f2f3f4 0%, #e3e4e6 55%, #d5d7da 100%)" }}
    >
      {/* Orange-to-yellow sweep down the right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[20%] h-[140%] w-[34%] rotate-[14deg]"
        style={{ background: "linear-gradient(180deg, #ffd21f 0%, #ffb200 45%, #ff7a12 100%)", borderRadius: "40% 0 0 40%" }}
      />

      {/* ---- The three section cards ---- */}
      <div
        className={`relative z-10 grid w-full max-w-4xl grid-cols-1 gap-6 transition-all duration-500 sm:grid-cols-3 sm:gap-7 ${
          open ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setOpenKey(s.key)}
            className="group relative mx-auto aspect-[3/5] w-full max-w-[260px] overflow-hidden rounded-[28px] text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)] outline-none ring-[#f36f24] transition duration-300 hover:-translate-y-2 hover:shadow-[0_26px_50px_-14px_rgba(0,0,0,0.6)] focus-visible:ring-4 max-sm:aspect-[4/3] max-sm:max-w-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/45 transition group-hover:via-black/15" />
            <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-2xl font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              {s.label}
            </span>
            <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/90 transition group-hover:border-[#ffd21f] group-hover:bg-[#ffd21f] group-hover:text-[#1a1a1a]">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
            </span>
          </button>
        ))}
      </div>

      {/* ---- Intro panel for the opened section ---- */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center p-4 transition duration-500 sm:p-8 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "radial-gradient(1000px 600px at 50% 50%, rgba(70,68,64,0.55), rgba(25,24,22,0.85))", backdropFilter: "blur(10px)" }}
        onClick={() => setOpenKey(null)}
      >
        {open && (
          <div
            key={open.key}
            onClick={(e) => e.stopPropagation()}
            className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/25 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] [animation:passportIn_.5s_cubic-bezier(.2,.8,.2,1)] md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
            style={{ background: "linear-gradient(135deg, rgba(92,92,96,0.92), rgba(58,58,62,0.92))" }}
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.img} alt="" className="h-64 w-full object-cover md:h-[480px]" />
            <div className="flex flex-col justify-center px-6 py-8 text-white sm:px-12 sm:py-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffcf7a] sm:text-sm">First Fix · HSE Department</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-none sm:text-6xl">{open.title}</h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">{open.text}</p>
              <div className="mt-6 flex max-w-md flex-wrap gap-2.5">
                {open.topics.map((tp) => (
                  <span key={tp} className="rounded-full border border-white/70 px-4 py-1.5 text-sm font-semibold">
                    {tp}
                  </span>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setOpenKey(null)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ffe500] px-5 py-3 text-sm font-bold text-[#7a1f00] shadow-[0_0_18px_rgba(255,229,0,0.35)] transition hover:brightness-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sections
                </button>
                <Link
                  href={open.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f36f24] px-5 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(243,111,36,0.5)] transition hover:bg-[#ff7d33]"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes passportIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(12px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
