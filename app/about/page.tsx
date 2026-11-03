"use client";

import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { HSE_DIRECTOR } from "@/lib/orgChart";

const PILLARS = [
  { icon: Users, title: "LEADERSHIP", text: "Set the direction, build capability, and lead by example." },
  { icon: ShieldCheck, title: "PREVENTION", text: "Identify risks early and take proactive action to keep people safe." },
  { icon: ClipboardCheck, title: "ACCOUNTABILITY", text: "Own our safety responsibilities and deliver on our commitments." },
];

const CORE_TEAM = [
  { name: "Soheb Fessl Alhassan", title: "Regional HSE Manager", photo: "/brand/team/regional-hsem.jpg" },
  { name: "Rasha Issam Al Souki", title: "HSE Coordinator", photo: "/brand/team/hsedc-1.jpg" },
  { name: "Moataz Ahmed Ahmed Elsherbiny", title: "HSE Data Analysis Manager", photo: "/brand/team/alarab.jpg" },
  { name: "Arshad Hussain Pathan", title: "HSE Training Manager", photo: "/brand/team/training-mgr.jpg" },
  { name: "Robert Jayson Maglonzo", title: "HSE Coordinator / Team Leader", photo: "/brand/team/hsedc-2.jpg" },
  { name: "Khalid Turki M Alharthi", title: "Security and Compliance Manager", photo: "/brand/team/compliance-mgr.jpg" },
];

const NAV = [
  { label: "Home", href: "/" },
  { label: "About HSE", href: "/about", active: true },
  { label: "Our Team", href: "#team" },
];

/** Slanted photo frame, like the parallelogram photos in the design. */
const slant = { clipPath: "polygon(9% 0, 100% 0, 91% 100%, 0 100%)" };

function SectionMark() {
  return <span className="block h-1.5 w-14 rounded bg-brand-orange" />;
}

function SlantPhoto({ src, alt, className = "", position = "center" }: { src: string; alt: string; className?: string; position?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={slant}>
      <Image src={src} alt={alt} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" style={{ objectPosition: position }} />
      <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-brand-orange/80" style={slant} />
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#0d0d0f] text-white">
      {/* Background: soft orange glows and diagonal streaks */}
      <div className="pointer-events-none absolute -right-32 -top-20 -z-10 h-[560px] w-[560px] rounded-full bg-brand-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-[55%] -z-10 h-[460px] w-[460px] rounded-full bg-brand-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[30%] -top-40 -z-10 hidden h-[760px] w-[3px] rotate-[35deg] bg-gradient-to-b from-transparent via-brand-orange to-transparent lg:block" />
      <div className="pointer-events-none absolute right-[18%] -top-40 -z-10 hidden h-[760px] w-[2px] rotate-[35deg] bg-gradient-to-b from-transparent via-brand-orange/60 to-transparent lg:block" />

      {/* Top bar */}
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-brand-orange/50 px-5 pb-2 pt-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/ff-mark.png" alt="" width={160} height={149} className="h-10 w-auto" priority />
          <span className="text-xl font-extrabold tracking-wide">FIRST FIX</span>
          <span className="h-6 w-0.5 bg-brand-orange" />
          <span className="text-lg font-medium tracking-wide text-white/90">HSE DEPARTMENT</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="flex gap-6 text-sm font-medium sm:gap-8">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`border-b-2 pb-1 transition-colors ${n.active ? "border-brand-orange text-white" : "border-transparent text-white/85 hover:text-brand-orange"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <LanguageToggle className="bg-white/90 shadow-card" />
        </div>
      </header>

      <main>
        {/* Director */}
        <section className="mx-auto grid max-w-7xl items-end gap-6 px-5 pt-6 sm:px-8 lg:grid-cols-[1.25fr_1fr]">
          <div className="pb-8">
            <h1 className="flex items-center gap-4 text-4xl font-black tracking-tight sm:text-5xl">
              <span className="h-10 w-1.5 shrink-0 rounded bg-brand-orange" />
              MEET THE HSE DIRECTOR
            </h1>
            <p className="mt-2 ps-6 text-3xl font-extrabold sm:text-4xl">Rabih El Chaar</p>
            <p className="ps-6 text-sm text-white/80">HSE Director&nbsp;&nbsp;|&nbsp;&nbsp;First Fix</p>
            <p className="mt-4 max-w-xl ps-6 text-[15px] leading-relaxed text-white/90">
              With 16+ years of HSE leadership and a degree in Safety Engineering, Rabih champions Zero
              Harm across complex projects in Saudi Arabia.
            </p>
            <p className="mt-5 flex items-center gap-4 text-2xl font-extrabold sm:text-3xl">
              <span className="h-8 w-1.5 shrink-0 rounded bg-brand-orange" />
              Safety is not optional. It is how we work.
            </p>
            <span className="ms-6 mt-4 inline-block rounded-full bg-gradient-to-b from-[#ff8a2a] to-brand-orange px-5 py-2 text-sm font-extrabold tracking-wide shadow-[0_0_18px_rgba(255,106,26,0.55)]">
              ZERO HARM PHILOSOPHY
            </span>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-orange/35 blur-3xl lg:left-auto lg:right-16 lg:translate-x-0" />
            <Image
              src={HSE_DIRECTOR.photoUrl}
              alt="Rabih El Chaar, HSE Director"
              width={400}
              height={400}
              priority
              className="relative h-auto w-72 rounded-t-[2rem] object-cover sm:w-80 lg:me-10"
              style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent)" }}
            />
          </div>
        </section>

        {/* Pillars */}
        <section className="grid border-y border-white/10 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className={`flex items-center gap-5 px-6 py-5 sm:px-10 ${
                i === 0 ? "bg-[#17171a]" : i === 1 ? "bg-gradient-to-r from-brand-orange to-[#e8641a]" : "bg-gradient-to-r from-[#c9561a] to-[#8a3a12]"
              }`}
            >
              <p.icon className={`h-12 w-12 shrink-0 ${i === 0 ? "text-brand-orange" : "text-white"}`} strokeWidth={1.6} />
              <div>
                <p className={`text-xl font-extrabold tracking-wide ${i === 0 ? "" : "text-white"}`}>{p.title}</p>
                <p className="text-sm leading-snug text-white/90">{p.text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Mission and vision */}
        <section className="grid border-b border-white/10 lg:grid-cols-2">
          <div className="grid items-center gap-6 px-5 py-7 sm:grid-cols-[0.8fr_1.2fr] sm:px-10 lg:border-e lg:border-white/10">
            <div>
              <SectionMark />
              <h2 className="mt-2 text-4xl font-black tracking-tight">OUR MISSION</h2>
              <p className="mt-2 text-[15px] leading-snug text-white/90">
                We believe every workplace injury and environmental incident is preventable.
              </p>
              <p className="mt-3 text-[15px] leading-snug text-white/90">
                We protect our people through leadership, training, and proactive risk management.
              </p>
            </div>
            <SlantPhoto src="/brand/news/walkthrough.jpg" alt="First Fix HSE team on site" className="aspect-[16/9] w-full" position="center 40%" />
          </div>
          <div className="grid items-center gap-6 px-5 py-7 sm:grid-cols-[0.8fr_1.2fr] sm:px-10">
            <div>
              <SectionMark />
              <h2 className="mt-2 text-4xl font-black tracking-tight">OUR VISION</h2>
              <p className="mt-2 text-[15px] leading-snug text-white/90">
                To build a lasting Zero Harm culture where everyone owns safety and every First Fix project
                sets the standard for responsible delivery.
              </p>
              <span className="mt-4 inline-block rounded-full bg-gradient-to-b from-[#ff8a2a] to-brand-orange px-5 py-2 text-sm font-extrabold tracking-wide shadow-[0_0_18px_rgba(255,106,26,0.55)]">
                OUR COMMITMENT
              </span>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <SlantPhoto src="/brand/news/training-oceanarium.jpg" alt="Toolbox talk on site" className="row-span-2 aspect-[4/3] h-full w-full" position="center 15%" />
              <SlantPhoto src="/brand/news/training-oceanarium.jpg" alt="" className="aspect-[16/9] w-full" position="left 92%" />
              <SlantPhoto src="/brand/news/eyewash-rosewood.jpg" alt="Emergency eyewash station" className="aspect-[16/9] w-full" position="center 20%" />
            </div>
          </div>
        </section>

        {/* Core team */}
        <section id="team" className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-14 pt-8 sm:px-8">
          <SectionMark />
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">MEET OUR HSE CORE TEAM</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CORE_TEAM.map((m) => (
              <div
                key={m.name}
                className="overflow-hidden rounded-xl border border-brand-orange/80 bg-gradient-to-b from-[#1b1b1e] to-[#0f0f11] shadow-[0_0_18px_rgba(255,106,26,0.25)]"
              >
                <div className="relative aspect-[4/3.4] w-full">
                  <Image src={m.photo} alt={m.name} fill sizes="(min-width:1024px) 16vw, 45vw" className="object-cover object-top" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#111113] to-transparent" />
                </div>
                <div className="px-2 pb-3 pt-1 text-center">
                  <p className="text-[13.5px] font-bold leading-tight">{m.name}</p>
                  <p className="mt-0.5 text-[12px] text-white/75">{m.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
