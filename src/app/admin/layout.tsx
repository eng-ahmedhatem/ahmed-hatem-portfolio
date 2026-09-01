import type { Metadata } from "next";
import type { ReactNode } from "react";

import { fontVariables } from "@/app/fonts";

import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "إدارة الموقع | Ahmed Hatem",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables} data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
