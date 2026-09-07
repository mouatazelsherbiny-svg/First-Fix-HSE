"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { COLOR_THEMES, MORPHISM_STYLES } from "@/lib/themeOptions";

/** Floating "Appearance" customizer — a small tab fixed to the physical
 *  left edge of the viewport (independent of language direction/RTL, and
 *  above the sidebar) that opens a panel for picking the color theme and
 *  glass/solid card style. Rendered once from ProtectedRoute, so it's
 *  available on every authenticated page. */
export default function ThemeCustomizer() {
  const { t, locale } = useLanguage();
  const { colorTheme, setColorTheme, morphism, setMorphism } = useThemeSettings();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.appearance.openLabel}
        title={t.appearance.openLabel}
        className="fixed bottom-5 left-3 z-[110] flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-orange shadow-cardHover transition hover:scale-105 hover:bg-brand-orangeLight lg:bottom-40"
      >
        <Palette className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[120] bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t.appearance.title}
            className="fixed inset-y-0 left-0 z-[130] flex w-72 flex-col gap-6 overflow-y-auto border-r border-brand-border bg-brand-surface/95 p-5 shadow-cardHover backdrop-blur-xl sm:w-80"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-black">{t.appearance.title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
                className="rounded-lg p-1.5 text-brand-gray transition hover:bg-brand-grayLight hover:text-brand-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-grayDark">
                {t.appearance.colorTheme}
              </p>
              <div className="flex flex-wrap gap-3">
                {COLOR_THEMES.map((theme) => {
                  const isActive = colorTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setColorTheme(theme.id)}
                      aria-label={theme.name[locale]}
                      title={theme.name[locale]}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                        isActive ? "ring-2 ring-offset-2 ring-offset-brand-surface" : ""
                      }`}
                      style={{
                        backgroundColor: theme.swatch,
                        ...(isActive ? ({ ["--tw-ring-color" as string]: theme.swatch } as React.CSSProperties) : {}),
                      }}
                    >
                      {isActive && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-grayDark">
                {t.appearance.morphismStyle}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MORPHISM_STYLES.map((style) => {
                  const isActive = morphism === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setMorphism(style.id)}
                      className={`rounded-xl border p-3 text-start text-xs font-semibold transition ${
                        isActive
                          ? "border-brand-orange bg-brand-orangeLight text-brand-orange"
                          : "border-brand-border bg-brand-grayLight/40 text-brand-grayDark hover:border-brand-orange/50"
                      }`}
                    >
                      <span className="mb-1 block">{style.name[locale]}</span>
                      <span className="block text-[10px] font-normal text-brand-gray">
                        {style.description[locale]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
