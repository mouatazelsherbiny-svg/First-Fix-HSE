export type ColorThemeId = "orange" | "blue" | "green" | "red" | "purple";
export type MorphismId = "glass" | "solid";

interface Bilingual {
  en: string;
  ar: string;
}

interface ColorThemeOption {
  id: ColorThemeId;
  /** Swatch hex shown as the picker circle — matches the theme's accent CSS var in globals.css. */
  swatch: string;
  name: Bilingual;
}

interface MorphismOption {
  id: MorphismId;
  name: Bilingual;
  description: Bilingual;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: "orange", swatch: "#E8590C", name: { en: "Safety Orange", ar: "برتقالي السلامة" } },
  { id: "blue", swatch: "#2563EB", name: { en: "Ocean Blue", ar: "أزرق المحيط" } },
  { id: "green", swatch: "#16A34A", name: { en: "Industrial Green", ar: "أخضر صناعي" } },
  { id: "red", swatch: "#DC2626", name: { en: "Crimson Red", ar: "أحمر قرمزي" } },
  { id: "purple", swatch: "#7C3AED", name: { en: "Royal Purple", ar: "بنفسجي ملكي" } },
];

export const MORPHISM_STYLES: MorphismOption[] = [
  {
    id: "glass",
    name: { en: "Glass", ar: "زجاجي" },
    description: { en: "Translucent, blurred surfaces", ar: "أسطح شفافة وضبابية" },
  },
  {
    id: "solid",
    name: { en: "Solid", ar: "معتم" },
    description: { en: "Opaque, high-contrast surfaces", ar: "أسطح معتمة وواضحة التباين" },
  },
];
