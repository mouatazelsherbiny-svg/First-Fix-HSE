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
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

interface Section {
  key: string;
  /** Card position on the 1672×941 design, in % (left, top, width, height). */
  box: [number, number, number, number];
  /** The card exactly as on the design (label included). */
  card: string;
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
    box: [19.86, 22.64, 18.72, 54.41],
    card: "/brand/passport/card-ppe.webp",
    title: "PPE",
    label: "PPE",
    img: "/brand/passport/panel-ppe.jpg",
    href: "/hse-passport/ppe",
    text: "Personal Protective Equipment is a vital part of protecting every person on our construction sites.",
    topics: ["Head and eye protection", "High-visibility clothing", "Hand and foot protection"],
  },
  {
    key: "training",
    box: [40.01, 22.64, 19.56, 54.41],
    card: "/brand/passport/card-training.webp",
    title: "Training",
    label: "Training",
    img: "/brand/passport/panel-training.jpg",
    href: "/hse-passport/training",
    text: "Every worker is trained and assessed before work starts, and their skills are kept current on site.",
    topics: ["Site induction", "Toolbox talks", "Competency records"],
  },
  {
    key: "disciplinary",
    box: [61.24, 22.74, 18.42, 54.41],
    card: "/brand/passport/card-disciplinary.webp",
    title: "Disciplinary Action",
    label: "Disciplinary Action",
    img: "/brand/passport/panel-disciplinary.jpg",
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

  // Dark page like Injury: paint the app's content area black while here.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prev = main.style.background;
    main.style.background = "#0a0a0c";
    return () => {
      main.style.background = prev;
    };
  }, []);

  return (
    <div
      className={`${montserrat.className} relative -mx-4 -mb-6 -mt-6 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden p-4 text-white sm:-mx-6 sm:p-6 lg:-mx-8`}
      style={{
        background:
          "radial-gradient(1200px 500px at 15% -10%, rgba(243,111,36,0.10), transparent 60%), radial-gradient(900px 500px at 110% 110%, rgba(243,111,36,0.08), transparent 60%), #0a0a0c",
      }}
    >
      {/* ---- Header, same as Injury / PMV / Incidents ---- */}
      <header className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 pb-4">
        <span className="text-2xl font-bold uppercase tracking-tight text-[#ff7a2f] sm:text-[30px]" style={{ textShadow: "0 0 16px rgba(243,111,36,0.5)" }}>
          HSE Passport
        </span>
        <span className="hidden h-10 w-px bg-gradient-to-b from-transparent via-[#f36f24] to-transparent sm:block" />
        <h1 className="text-xl font-extrabold uppercase tracking-wide sm:text-[30px]">Worker Safety Records</h1>
      </header>

      {/* ---- The three section cards ---- */}
      <div className="flex flex-1 items-center justify-center py-4">
        <div
          className={`grid w-full max-w-5xl grid-cols-1 gap-6 transition duration-500 sm:grid-cols-3 sm:gap-8 ${open ? "scale-95 opacity-0" : "opacity-100"}`}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setOpenKey(s.key)}
              aria-label={s.title}
              className="group mx-auto w-full max-w-[300px] rounded-[9%/5.5%] outline-none focus-visible:ring-4 focus-visible:ring-[#f36f24] max-sm:max-w-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.card}
                alt=""
                draggable={false}
                className="aspect-[313/512] w-full rounded-[9%/5.5%] object-cover shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] transition duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_0_2px_rgba(255,138,61,0.9),0_26px_60px_-12px_rgba(243,111,36,0.55)] max-sm:aspect-[4/3]"
              />
            </button>
          ))}
        </div>
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
            <img src={open.img} alt="" className="h-64 w-full object-cover md:h-full md:min-h-[520px]" />
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
