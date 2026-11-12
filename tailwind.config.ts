import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      sm: "375px",
      md: "768px",
      lg: "1024px",
      xl: "1440px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "2.5rem",
        xl: "0",
      },
      screens: {
        sm: "375px",
        md: "768px",
        xl: "1440px",
      },
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        line: "var(--line)",
        track: "var(--track)",
        "brand-900": "var(--brand-900)",
        "brand-800": "var(--brand-800)",
        "brand-500": "var(--brand-500)",
        success: "var(--success)",
        "success-tint": "var(--success-tint)",
        danger: "var(--danger)",
        "danger-tint": "var(--danger-tint)",
        pending: "var(--pending)",
        "cat-food": "var(--cat-food)",
        "cat-tfare": "var(--cat-tfare)",
        "cat-data": "var(--cat-data)",
        "cat-transfer": "var(--cat-transfer)",
        "accent-mint": "var(--marketing-accent-mint)",
        "accent-orange": "var(--marketing-accent-orange)",
        "accent-yellow": "var(--marketing-accent-yellow)",
        "accent-cream": "var(--marketing-accent-cream)",
        white: "var(--surface)",
        green: "var(--brand-500)",
        "grey-100": "var(--line)",
        "grey-300": "var(--ink-muted)",
        "grey-500": "var(--ink-muted)",
        "grey-900": "var(--ink)",
        beige: "var(--surface-muted)",
        red: "var(--danger)",
        orange: "var(--pending)",
        gold: "var(--pending)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "preset-1": [
          "2rem",
          { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0" },
        ],
        "preset-2": [
          "1.25rem",
          { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0" },
        ],
        "preset-3": [
          "1rem",
          { lineHeight: "1.5", fontWeight: "700", letterSpacing: "0" },
        ],
        "preset-4": [
          "0.875rem",
          { lineHeight: "1.5", fontWeight: "400", letterSpacing: "0" },
        ],
        "preset-4-bold": [
          "0.875rem",
          { lineHeight: "1.5", fontWeight: "700", letterSpacing: "0" },
        ],
        "preset-5": [
          "0.75rem",
          { lineHeight: "1.5", fontWeight: "400", letterSpacing: "0" },
        ],
        "preset-5-bold": [
          "0.75rem",
          { lineHeight: "1.5", fontWeight: "700", letterSpacing: "0" },
        ],
      },
    },
  },
};

export default config;
