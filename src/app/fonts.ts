import { IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";

const arabicFont = IBM_Plex_Sans_Arabic({
  variable: "--font-ar",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const englishFont = Manrope({
  variable: "--font-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const fontVariables = `${arabicFont.variable} ${englishFont.variable}`;
