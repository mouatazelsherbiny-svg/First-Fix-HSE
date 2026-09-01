import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F26522",
          orangeDark: "#D9541A",
          orangeLight: "#FDECE2",
          gray: "#6B6E70",
          grayDark: "#3A3B3C",
          grayLight: "#F2F2F2",
          black: "#1A1A1A",
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
        card: "0 2px 10px rgba(0,0,0,0.06)",
        cardHover: "0 6px 20px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
