import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark charcoal + accent-color theme. Every value below reads a
        // "R G B" (space-separated, no rgb() wrapper) CSS custom property
        // defined in globals.css, using Tailwind's documented
        // `rgb(var(--x) / <alpha-value>)` pattern — this lets Tailwind's
        // opacity modifiers (e.g. `bg-brand-surface/40`) keep working
        // exactly as before, while the underlying RGB values can be
        // swapped at runtime via a `[data-theme="..."]` attribute on
        // <html> (see the Appearance/color-theme switcher). Key NAMES are
        // kept stable on purpose so every existing `text-brand-black` /
        // `bg-brand-orange` / etc. call site across the app keeps working
        // untouched. See the doc comment above each CSS variable in
        // globals.css for what it means and which themes change it.
        brand: {
          orange: "rgb(var(--brand-orange-rgb) / <alpha-value>)",
          orangeDark: "rgb(var(--brand-orange-dark-rgb) / <alpha-value>)",
          orangeLight: "rgb(var(--brand-orange-light-rgb) / <alpha-value>)",
          gray: "rgb(var(--brand-gray-rgb) / <alpha-value>)",
          grayDark: "rgb(var(--brand-gray-dark-rgb) / <alpha-value>)",
          grayLight: "rgb(var(--brand-gray-light-rgb) / <alpha-value>)",
          black: "rgb(var(--brand-black-rgb) / <alpha-value>)",
          surface: "rgb(var(--brand-surface-rgb) / <alpha-value>)",
          border: "rgb(var(--brand-border-rgb) / <alpha-value>)",
          gold: "rgb(var(--brand-gold-rgb) / <alpha-value>)",
          onAccent: "rgb(var(--brand-on-accent-rgb) / <alpha-value>)",
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
