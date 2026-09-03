import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional navy/slate theme — clean cool-gray canvas with a
        // deep navy-blue accent and a muted gold secondary. Key NAMES are
        // kept stable on purpose (only the hex VALUES changed) so every
        // existing `text-brand-black` / `bg-brand-orange` / etc. call site
        // across the app re-themes automatically without being touched
        // file by file. See the doc comment above each key for what it
        // now means.
        brand: {
          // Primary accent (deep navy blue) — buttons, active nav state,
          // focus rings, links. Dark enough to carry white text at good
          // contrast.
          orange: "#1E4B79",
          // Accent hover/darker shade.
          orangeDark: "#163A5F",
          // Accent tint — active-icon-circle bg, subtle highlight chip.
          orangeLight: "#DCEAF3",
          // Muted/tertiary text — placeholders, hints, meta text.
          gray: "#8592A3",
          // Secondary text — field labels, sub-text.
          grayDark: "#48566B",
          // Elevated/hover surface — chip bg, hover bg, table header bg,
          // nav-pill hover/badge bg in the sidebar menu.
          grayLight: "#E4EAF2",
          // Primary text — headings/body copy.
          black: "#101B2D",
          // Card/surface background — cards, inputs, the sidebar menu
          // panel. Pure white so boxes read as a distinct, elevated
          // surface against the (now slightly darker) page canvas.
          surface: "#FFFFFF",
          // Shared border color.
          border: "#D6DEE9",
          // Secondary accent (gold) — used sparingly for one
          // distinguishing highlight, never as the primary action color.
          gold: "#B8952E",
          // Text/icon color for content placed on top of a solid
          // `brand.orange` (navy) fill — navy is dark enough here for
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
