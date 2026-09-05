import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark charcoal + safety-orange theme — a dark, low-glare canvas
        // with a vivid safety-orange accent and a muted gold secondary.
        // Key NAMES are kept stable on purpose (only the hex VALUES
        // changed) so every existing `text-brand-black` / `bg-brand-orange`
        // / etc. call site across the app re-themes automatically without
        // being touched file by file. See the doc comment above each key
        // for what it now means.
        brand: {
          // Primary accent (safety orange) — buttons, active nav state,
          // focus rings, links. Dark enough to carry white text at good
          // contrast, vivid enough to read as "safety orange".
          orange: "#E8590C",
          // Accent hover/darker shade.
          orangeDark: "#C24A09",
          // Accent tint — active-icon-circle bg, subtle highlight chip.
          // A dark warm-tinted swatch (not a pale wash) so it still reads
          // against the dark card behind it.
          orangeLight: "#3A2416",
          // Muted/tertiary text — placeholders, hints, meta text.
          gray: "#8B92A0",
          // Secondary text — field labels, sub-text.
          grayDark: "#C7CBD1",
          // Elevated/hover surface — chip bg, hover bg, table header bg,
          // nav-pill hover/badge bg in the sidebar menu. A step lighter
          // than the card surface for a visible hover/elevation cue.
          grayLight: "#343940",
          // Primary text — headings/body copy. Near-white, not pure white,
          // so large blocks of text stay easy on the eye.
          black: "#F3F4F6",
          // Card/surface background — cards, inputs, the sidebar menu
          // panel. A step lighter than the page canvas so boxes read as a
          // distinct, elevated surface against it.
          surface: "#292D32",
          // Shared border color — visible but subtle against dark cards.
          border: "#3E434B",
          // Secondary accent (gold) — used sparingly for one
          // distinguishing highlight, never as the primary action color.
          gold: "#C9A227",
          // Text/icon color for content placed on top of a solid
          // `brand.orange` fill — this orange is dark enough for plain
          // white text/icons at good contrast.
          onAccent: "#FFFFFF",
        },
        // Single source of truth for the app-wide page background — reads
        // the CSS variable defined once in globals.css (--background-app).
        app: {
          base: "var(--background-app)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "Tahoma", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 2px 10px rgba(20,38,32,0.06)",
        cardHover: "0 6px 20px rgba(20,38,32,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
