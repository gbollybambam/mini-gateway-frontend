import type { Config } from "tailwindcss";

/**
 * Design tokens from the Frontend Mentor Personal Finance App style guide
 * (design/personal-finance-app — style-guide.md was not present in the repo).
 */
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
        beige: {
          100: "#F8F4F0",
          500: "#98908B",
        },
        grey: {
          100: "#F2F2F2",
          300: "#B3B3B3",
          500: "#696868",
          900: "#201F24",
        },
        green: "#277C78",
        yellow: "#F2CDAC",
        cyan: "#82C9D7",
        navy: "#626070",
        red: "#C94736",
        purple: {
          DEFAULT: "#826CB0",
          light: "#AF81BA",
        },
        turquoise: "#597C7C",
        brown: "#93674F",
        magenta: "#934F6F",
        blue: "#3F82B2",
        "navy-grey": "#97A0AC",
        "army-green": "#7F9161",
        gold: "#CAB361",
        orange: "#BE6C49",
        white: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "sans-serif"],
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
