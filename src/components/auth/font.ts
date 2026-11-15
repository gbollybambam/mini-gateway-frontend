import { Bricolage_Grotesque } from "next/font/google";

// Display face for headlines. Body text keeps your existing font-sans.
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});