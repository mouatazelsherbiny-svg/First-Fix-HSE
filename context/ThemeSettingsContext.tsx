"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ColorThemeId, MorphismId } from "@/lib/themeOptions";

interface ThemeSettingsContextValue {
  colorTheme: ColorThemeId;
  morphism: MorphismId;
  setColorTheme: (id: ColorThemeId) => void;
  setMorphism: (id: MorphismId) => void;
}

const ThemeSettingsContext = createContext<ThemeSettingsContextValue | undefined>(
  undefined
);

const THEME_STORAGE_KEY = "ffhse-color-theme";
const MORPHISM_STORAGE_KEY = "ffhse-morphism";

const VALID_THEMES: ColorThemeId[] = ["orange", "blue", "green", "red", "purple"];
const VALID_MORPHISMS: MorphismId[] = ["glass", "solid"];

/** App-wide Appearance settings (color theme + glass/solid card style),
 *  picked from the ThemeCustomizer panel and persisted per device. The
 *  color theme is applied globally via a `data-theme` attribute on <html>
 *  (see globals.css) so it also affects the public login/signup screens.
 *  The morphism style is intentionally NOT applied here — ProtectedRoute
 *  applies the `data-morphism` attribute only while an authenticated app
 *  page is mounted, so this in-app setting never touches the login/signup
 *  glass design. */
export function ThemeSettingsProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorThemeId>("orange");
  const [morphism, setMorphism] = useState<MorphismId>("glass");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme && VALID_THEMES.includes(storedTheme as ColorThemeId)) {
      setColorTheme(storedTheme as ColorThemeId);
    }
    const storedMorphism = window.localStorage.getItem(MORPHISM_STORAGE_KEY);
    if (storedMorphism && VALID_MORPHISMS.includes(storedMorphism as MorphismId)) {
      setMorphism(storedMorphism as MorphismId);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    window.localStorage.setItem(MORPHISM_STORAGE_KEY, morphism);
  }, [morphism]);

  const value = useMemo<ThemeSettingsContextValue>(
    () => ({ colorTheme, morphism, setColorTheme, setMorphism }),
    [colorTheme, morphism]
  );

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  const ctx = useContext(ThemeSettingsContext);
  if (!ctx) {
    throw new Error("useThemeSettings must be used within a ThemeSettingsProvider");
  }
  return ctx;
}
