import type { Metadata } from "next";
import type { ReactNode } from "react";

import { fontVariables } from "@/app/fonts";

import "../globals.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
