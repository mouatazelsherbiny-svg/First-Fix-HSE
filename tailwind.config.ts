import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light forest theme — soft mint/sage canvas with a deep teal
        // accent and a muted gold secondary. Key NAMES are kept stable on
        // purpose (only the hex VALUES changed) so every existing
        // `text-brand-black` / `bg-brand-orange` / etc. call site across
        // the app re-themes automatically without being touched file by
        // file. See the doc comment above each key for what it now means.
        brand: {
          // Primary accent (deep teal) — buttons, active nav state, focus
          // rings, links. Dark enough to carry white text at good contrast.
          orange: "#0D9488",
          // Accent hover/darker shade.
          orangeDark: "#0F766E",
          // Accent tint — active-icon-circle bg, subtle highlight chip.
          orangeLight: "#CCFBF1",
          // Muted/tertiary text — placeholders, hints, meta text.
          gray: "#7C8F85",
          // Secondary text — field labels, sub-text.
          grayDark: "#46584F",
          // Elevated/hover surface — chip bg, hover bg, table header bg,
          // nav-pill hover/badge bg in the sidebar menu.
          grayLight: "#DCEAE3",
          // Primary text — headings/body copy.
          black: "#142620",
          // Card/surface background — cards, inputs, the sidebar menu
          // panel. A step darker than pure white so boxes read as a
          // distinct surface against the page canvas.
          surface: "#F3FAF7",
          // Shared border color.
          border: "#C6DAD0",
          // Secondary accent (gold) — used sparingly for one
          // distinguishing highlight, never as the primary action color.
          gold: "#B8952E",
          // Text/icon color for content placed on top of a solid
          // `brand.orange` (teal) fill — teal is dark enough here for
          // plain white text/icons.
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
