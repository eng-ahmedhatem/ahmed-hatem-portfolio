import localFont from "next/font/local";

const arabicBodyFont = localFont({
  src: [
    {
      path: "./local-fonts/almarai-arabic-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./local-fonts/almarai-arabic-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./local-fonts/almarai-arabic-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-ar-body",
  display: "swap",
  preload: false,
  fallback: ["Arial"],
});

const arabicDisplayFont = localFont({
  src: "./local-fonts/el-messiri-arabic-500-700.woff2",
  variable: "--font-ar-display",
  weight: "500 700",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["Arial"],
});

const englishFont = localFont({
  src: "./local-fonts/manrope-latin-400-700.woff2",
  variable: "--font-en",
  weight: "400 700",
  style: "normal",
  display: "swap",
  fallback: ["Arial"],
});

export const fontVariables = `${arabicBodyFont.variable} ${arabicDisplayFont.variable} ${englishFont.variable}`;
