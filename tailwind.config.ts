import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark forest-green/black theme. Key NAMES are kept stable on
        // purpose (only the hex VALUES changed) so every existing
        // `text-brand-black` / `bg-brand-orange` / etc. call site across
        // the app re-themes automatically without being touched file by
        // file. See the doc comment above each key for what it now means.
        brand: {
          // Primary accent (teal) — buttons, active nav state, focus
          // rings, links. Was orange (#F26522).
          orange: "#2DD4BF",
          // Accent hover/darker shade.
          orangeDark: "#14B8A6",
          // Accent tint — active-icon-circle bg, subtle highlight chip.
          orangeLight: "#123832",
          // Muted/tertiary text — placeholders, hints, meta text.
          gray: "#7E9089",
          // Secondary text — field labels, sub-text.
          grayDark: "#B7C7BF",
          // Elevated/hover surface — chip bg, hover bg, table header bg.
          grayLight: "#17251F",
          // Primary text — headings/body copy (was near-black on light bg,
          // now near-white on dark bg).
          black: "#EAF3EE",
          // New: card/surface background (replaces bare `bg-white`).
          surface: "#111E19",
          // New: shared border color (replaces `border-gray-100/200`).
          border: "#22332B",
          // New: secondary accent (gold) — used sparingly for one
          // distinguishing highlight, never as the primary action color.
          gold: "#D4AF37",
          // New: text/icon color for content placed on top of a solid
          // `brand.orange` (teal) fill — teal is too light for white text
          // to pass contrast, so anything on a teal chip/button uses this
          // near-black tone instead.
          onAccent: "#04211C",
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
        card: "0 2px 10px rgba(0,0,0,0.35)",
        cardHover: "0 6px 20px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
