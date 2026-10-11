"use client";

import { useEffect } from "react";

/** Restore deep links after the streamed homepage sections replace loading.tsx. */
export function HomeAnchorRestorer() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    let targetId: string;
    try { targetId = decodeURIComponent(hash.slice(1)); }
    catch { return; }

    let frame = 0;
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        if (window.location.hash === hash) {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "instant", block: "start" });
        }
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
