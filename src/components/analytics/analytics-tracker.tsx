"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import type { Locale } from "@/domain/content/types";

const VISITOR_KEY = "ah-portfolio-visitor:v1";
const trackedPaths = new Set<string>();

function visitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function AnalyticsTracker({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || trackedPaths.has(pathname) || navigator.doNotTrack === "1") return;
    const track = () => {
      if (trackedPaths.has(pathname)) return;
      trackedPaths.add(pathname);
      const payload = JSON.stringify({
        visitorId: visitorId(),
        path: pathname,
        locale,
        referrer: document.referrer || undefined,
      });
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon("/api/cms/analytics", blob)) {
        void fetch("/api/cms/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(track, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(track, 1200);
    return () => globalThis.clearTimeout(timeoutId);
  }, [locale, pathname]);

  return null;
}
