"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, Check, GraduationCap, ShieldCheck, Users } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { HSE_DIRECTOR } from "@/lib/orgChart";

const LEADERSHIP_EXPERTISE = [
  "Developing and implementing corporate HSE strategies",
  "Risk assessment processes, JSA, hazard identification and incident investigations",
  "Driving safety culture through training and leadership",
  "Ensuring compliance and supporting environmental management and sustainability initiatives",
];

const ACADEMIC_QUALIFICATIONS = [
  "Bachelor’s Degree in Fire & Safety Engineering",
  "Diploma in Safety Management System (SMS)",
  "OTHM Level 6 Diploma in Occupational Health and Safety",
];

const CERTIFICATIONS = [
  "IOSH Managing Safely – Institution of Occupational Safety and Health",
  "Train the Trainer Certification",
  "Accident Investigation and Risk Assessment Certifications",
  "Job Hazard Analysis and Permit to Work System Training",
  "Safety & Health Advanced Diploma – NASP",
];

const NAV = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about", active: true },
  { label: "HSE DASHBOARD", href: "/dashboard" },
  { label: "CONTACT", href: "/contact" },
];

const glow = "shadow-[0_0_28px_rgba(255,106,26,0.28)]";

function CheckDot() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange shadow-[0_0_10px_rgba(255,106,26,0.6)]">
      <Check className="h-3.5 w-3.5 text-black" strokeWidth={3.2} />
    </span>
  );
}

function InfoCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Users;
  title: string;
  items: string[];
}) {
  return (
    <section
      className={`relative rounded-2xl border border-brand-orange/40 bg-gradient-to-b from-[#1a1a1d] to-[#0f0f11] p-6 ${glow}`}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-11 w-11 shrink-0 text-brand-orange" strokeWidth={1.7} />
        <span className="h-10 w-0.5 rounded bg-brand-orange" />
        <h2 className="text-lg font-extrabold uppercase tracking-wide sm:text-xl">{title}</h2>
      </div>
      <ul className="mt-5 space-y-3.5 text-[15px] leading-snug text-white/90">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckDot />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Orange-lit crane and skyline silhouette behind the heading (decorative). */
function Skyline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 520"
      preserveAspectRatio="xMinYMax slice"
      className="pointer-events-none absolute inset-y-0 left-0 -z-10 h-full w-[38%] max-w-[520px] opacity-80"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7a1a" stopOpacity="0.05" />
          <stop offset="0.55" stopColor="#ff6a1a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff5a00" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b0b0d" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0b0d" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="400" height="520" fill="url(#sky)" />
      <g fill="#120c08">
        <rect x="0" y="330" width="40" height="190" />
        <rect x="45" y="280" width="34" height="240" />
        <path d="M86 520V250l14-30 14 30v270z" />
        <rect x="122" y="300" width="30" height="220" />
        <rect x="158" y="360" width="46" height="160" />
        <rect x="210" y="320" width="26" height="200" />
        {/* tower crane */}
        <rect x="62" y="120" width="8" height="180" />
        <path d="M20 128h250v6H20z" />
        <path d="M66 96l-46 32h8l38-26 38 26h8z" />
        <rect x="236" y="134" width="3" height="70" />
        <rect x="229" y="204" width="17" height="10" />
      </g>
      <g stroke="#120c08" strokeWidth="1.5" fill="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M62 ${130 + i * 14}l8 14M70 ${130 + i * 14}l-8 14`} />
        ))}
      </g>
      <rect x="250" width="150" height="520" fill="url(#fade)" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#0b0b0d] text-white">
      {/* Background glows and the orange diagonal streaks on the right edge */}
      <div className="pointer-events-none absolute -right-40 top-10 -z-10 h-[520px] w-[520px] rounded-full bg-brand-orange/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-[420px] w-[620px] rounded-full bg-brand-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 -z-10 hidden h-[900px] w-40 rotate-[28deg] bg-gradient-to-b from-transparent via-brand-orange/50 to-transparent lg:block" />
      <div className="pointer-events-none absolute -right-6 top-40 -z-10 hidden h-[900px] w-10 rotate-[28deg] bg-gradient-to-b from-transparent via-brand-orange/70 to-transparent lg:block" />

      {/* Top bar */}
      <header className="border-b border-brand-orange/30 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt="First Fix" width={52} height={52} className="h-12 w-12 object-contain" priority />
            <span className="leading-none">
              <span className="block text-2xl font-extrabold tracking-tight">First Fix</span>
              <span className="block text-sm font-extrabold tracking-wider text-brand-orange">KSA</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="order-3 flex w-full justify-center gap-6 text-sm font-semibold sm:order-none sm:w-auto sm:gap-10 sm:text-[15px]">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`border-b-[3px] pb-2 pt-2 transition-colors ${
                  n.active ? "border-brand-orange text-brand-orange" : "border-transparent text-white/90 hover:text-brand-orange"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <LanguageToggle className="bg-white/90 shadow-card" />
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8">
        <Skyline />

        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.8fr_1fr]">
          {/* Heading and introduction */}
          <div className="lg:ps-16">
            <p className="text-sm font-bold tracking-[0.35em] text-brand-orange">FIRST FIX KSA</p>
            <h1 className="mt-2 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              ABOUT
              <span className="mt-1 block text-brand-orange">HSE DEPARTMENT</span>
            </h1>
            <p className="mt-3 text-2xl font-medium sm:text-3xl">Meet Our HSE Director</p>
            <span className="mt-5 block h-1 w-20 rounded bg-brand-orange" />
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/90">
              Rabih El Chaar is the HSE Director at First Fix KSA, with over 16 years of extensive HSE
              leadership experience across complex construction and infrastructure projects in Saudi
              Arabia. He leads the HSE Department with a clear focus on protecting people,
              strengthening safety culture, and delivering measurable results through proactive risk
              management, team engagement, and continuous improvement.
            </p>
          </div>

          {/* Director photo */}
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border-[3px] border-brand-orange p-1 shadow-[0_0_34px_rgba(255,106,26,0.55)]">
              <Image
                src={HSE_DIRECTOR.photoUrl}
                alt="Rabih El Chaar, HSE Director"
                width={400}
                height={400}
                className="h-auto w-64 rounded-xl object-cover sm:w-72"
                priority
              />
            </div>
            <p className="mt-4 text-2xl font-extrabold tracking-wide sm:text-3xl">RABIH EL CHAAR</p>
            <p className="mt-1 text-base font-bold tracking-wide text-brand-orange sm:text-lg">HSE DIRECTOR | FIRST FIX KSA</p>
          </div>

          {/* Commitment quote */}
          <div className={`rounded-3xl border border-white/15 bg-gradient-to-br from-[#1c1c20] to-[#0e0e10] p-8 ${glow}`}>
            <svg aria-hidden viewBox="0 0 120 96" className="h-20 w-24 sm:h-24 sm:w-28">
              <defs>
                <linearGradient id="q" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ff8a2a" />
                  <stop offset="1" stopColor="#f25a0f" />
                </linearGradient>
              </defs>
              <path
                fill="url(#q)"
                d="M8 96V56C8 26 22 8 50 2l5 12C38 20 32 32 31 44h21v52zM66 96V56c0-30 14-48 42-54l5 12c-17 6-23 18-24 30h21v52z"
              />
            </svg>
            <p className="mt-5 text-sm font-semibold tracking-[0.35em] text-brand-orange">OUR HSE COMMITMENT</p>
            <p className="mt-3 text-3xl font-extrabold leading-tight sm:text-[34px]">
              Safety is not optional.
              <span className="block text-brand-orange">It is how we work.</span>
            </p>
            <span className="mt-6 block h-1 w-16 rounded bg-brand-orange" />
            <div className="mt-6 flex items-center gap-5">
              <ShieldCheck className="h-14 w-14 shrink-0 text-brand-orange" strokeWidth={1.6} />
              <span className="h-12 w-0.5 rounded bg-brand-orange" />
              <span className="text-lg font-semibold tracking-[0.12em]">ZERO HARM PHILOSOPHY</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <InfoCard icon={Users} title="Leadership Expertise" items={LEADERSHIP_EXPERTISE} />
          <InfoCard icon={GraduationCap} title="Academic Qualifications" items={ACADEMIC_QUALIFICATIONS} />
          <InfoCard icon={Award} title="Certifications" items={CERTIFICATIONS} />
        </div>
      </main>
    </div>
  );
}
