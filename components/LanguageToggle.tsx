"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { t, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-grayDark shadow-sm transition hover:border-brand-orange hover:text-brand-orange ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-3.5 w-3.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
      </svg>
      {t.lang.switchTo}
    </button>
  );
}
