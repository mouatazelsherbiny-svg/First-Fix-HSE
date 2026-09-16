"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { HSE_DIRECTOR } from "@/lib/orgChart";

const LEADERSHIP_EXPERTISE = [
  "Developing and implementing corporate HSE strategies and management systems",
  "Leading large multidisciplinary safety teams across multiple project sites",
  "Managing risk management processes including JSA, hazard identification, and incident investigations",
  "Driving safety culture transformation through training, engagement, and leadership programs",
  "Ensuring compliance with international HSE standards and regulatory frameworks",
  "Supporting environmental management, sustainability initiatives, and operational safety performance",
];

const ACADEMIC_CREDENTIALS = [
  "Bachelor’s Degree in Fire & Safety Engineering from University of Central Lancashire",
  "Diploma in Safety Management System (SMS) from University of Newcastle",
  "OTHM Level 6 Diploma in Occupational Health and Safety",
];

const PROFESSIONAL_CERTIFICATIONS = [
  "IOSH Managing Safely – Institution of Occupational Safety and Health",
  "Train the Trainer Certification",
  "Accident Investigation and Risk Assessment Certifications",
  "Job Hazard Analysis and Permit to Work System Training",
  "Safety & Health Advanced Diploma – NASP",
];

export default function AboutPage() {
  const { t, dir } = useLanguage();
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="flex min-h-screen flex-col bg-app-base">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <Link href="/">
          <Logo size={34} />
        </Link>
        <LanguageToggle />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-8">
        <h1 className="mb-8 text-center text-2xl font-bold text-brand-black sm:text-3xl">
          {t.landing.navAbout}
        </h1>

        {/* Director photo — the real photo shown large and uncropped
            (a rounded-corner rectangle at its own aspect ratio), not a
            small circular avatar */}
        <div className="mb-8 flex justify-center">
          <Image
            src={HSE_DIRECTOR.photoUrl}
            alt={HSE_DIRECTOR.name}
            width={400}
            height={400}
            className="h-auto w-64 rounded-2xl border-4 border-brand-surface object-cover shadow-cardHover sm:w-80"
          />
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-brand-grayDark sm:text-base">
          <p>
            Meet our HSE Director at{" "}
            <a
              href="https://www.linkedin.com/company/first-fix-ksa/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-orange hover:underline"
            >
              FirstFix.KSA
            </a>{" "}
            in Riyadh, Rabie leads the strategic alignment of Health, Safety, and Environmental
            functions across multiple projects throughout the Kingdom. His leadership focuses on
            building a unified safety culture based on prevention, accountability, and continuous
            improvement, ensuring compliance with both national regulations and international
            standards.
          </p>

          <p>
            With more than 15 years of progressive HSE leadership experience, Rabie has played a
            key role in delivering safety excellence across major infrastructure and
            transportation developments, including the Riyadh Metro.
          </p>

          <p>
            Before joining First Fix, Rabie held several senior HSE leadership roles at Siemens,
            ICAD-KSA, Nesma Telecom &amp; Technology, and Saudi Oger, contributing to the
            successful delivery of large-scale national projects across telecom, infrastructure,
            and construction sectors.
          </p>

          <div>
            <p className="font-semibold text-brand-black">His leadership expertise includes:</p>
            <ul className="mt-2 list-disc space-y-1.5 ps-5">
              {LEADERSHIP_EXPERTISE.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-brand-black sm:text-lg">
              <GraduationCap className="h-5 w-5 text-brand-orange" />
              Academic &amp; Professional Qualifications
            </h2>
          </div>

          <div>
            <p className="font-semibold text-brand-black">
              Rabie holds strong academic and professional credentials, including:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 ps-5">
              {ACADEMIC_CREDENTIALS.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-brand-black">Professional Certifications include:</p>
            <ul className="mt-2 list-disc space-y-1.5 ps-5">
              {PROFESSIONAL_CERTIFICATIONS.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
        >
          <BackIcon className="h-4 w-4" />
          {t.landing.backHome}
        </Link>
      </div>
    </div>
  );
}
