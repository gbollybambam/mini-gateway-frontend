import type { Metadata } from "next";
// Assuming you are using Manrope based on your globals.css variables
import { Manrope } from "next/font/google"; 
import "./globals.css";

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope" 
});

export const metadata: Metadata = {
  title: "Payflow Merchant Console",
  description: "Move money with more clarity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}