"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { startAmbientLoop } from "@/components/motion/ambient-loop";
import styles from "./hero.module.css";

/** A single, cancellable clock choreographs the whole background, not the copy. */
export function HeroAmbient({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.1 });

  useEffect(() => {
    if (reducedMotion || !visible || !ref.current) return;
    const elements = Array.from(ref.current.children) as HTMLElement[];
    let cursor = 0;
    let stopLoop: (() => void) | undefined;
    let animations: Array<{ stop: () => void }> = [];
    function stop() {
      stopLoop?.();
      animations.forEach((animation) => animation.stop());
      animations = [];
    }
    function syncVisibility() {
      stop();
      if (document.hidden) return;
      stopLoop = startAmbientLoop(() => {
        const available = elements.filter((element) => element.getClientRects().length);
        if (!available.length) return 5000;
        // Only two accents move at a time; a real timer always yields to hydration.
        animations = [0, 1].map((offset) => animate(available[(cursor + offset) % available.length], {
          x: (Math.random() - 0.5) * 64,
          y: (Math.random() - 0.5) * 80,
          rotate: (Math.random() - 0.5) * 32,
        }, { duration: 3.8 + Math.random(), ease: "easeInOut" }));
        cursor = (cursor + 2) % available.length;
        return 5000;
      });
    }
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [reducedMotion, visible]);

  return <div ref={ref} className={styles.heroAmbient} aria-hidden="true">
    {Array.from({ length: 8 }, (_, index) => <div key={index} className={styles.ambientSymbol}>
      <svg viewBox="0 0 64 64" fill="none" focusable="false">
        {index % 4 === 0 ? <><path d="M14 47a23 23 0 1 1 37-27" /><path className={styles.detailEcho} d="M22 44a16 16 0 0 0 25-19" /><circle cx="51" cy="20" r="3" className={styles.detailNode} /></>
          : index % 4 === 1 ? <><path d="m16 46 16-32 16 32M23 33h18" /><path className={styles.detailEcho} d="M10 53h44" /><circle cx="48" cy="46" r="2.5" className={styles.detailNode} /></>
          : index % 4 === 2 ? <><path d="M12 38c10 0 10-16 20-16s10 16 20 16" /><circle cx="12" cy="38" r="3" className={styles.detailNode} /><circle cx="52" cy="38" r="5" /></>
          : <><path d="M32 15v34M15 32h34" /><circle cx="32" cy="32" r="17" className={styles.detailEcho} /><circle cx="32" cy="15" r="2.5" className={styles.detailNode} /></>}
      </svg>
    </div>)}
  </div>;
}
