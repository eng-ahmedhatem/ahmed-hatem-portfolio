"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ImageViewModel } from "@/features/site/view-models";

import styles from "./project-gallery.module.css";

interface Labels { openImage: string; close: string; previousImage: string; nextImage: string; imageCounter: string }

function LightboxIcon({ kind }: { kind: "arrow" | "close" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === "close" ? (
        <><path d="M5.5 5.5 18.5 18.5" /><path d="m18.5 5.5-13 13" /></>
      ) : (
        <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>
      )}
    </svg>
  );
}

export function ProjectGallery({ images, labels }: { images: readonly ImageViewModel[]; labels: Labels }) {
  const [active, setActive] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState(1);
  const reduce = Boolean(useReducedMotion());
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function open(index: number, trigger: HTMLElement) { triggerRef.current = trigger; setSlideDirection(1); setActive(index); }
  const close = useCallback(() => {
    setActive(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const move = useCallback((delta: number) => {
    const directionFactor = document.documentElement.dir === "rtl" ? -1 : 1;
    setSlideDirection(delta * directionFactor);
    setActive((current) => current === null ? null : (current + delta + images.length) % images.length);
  }, [images.length]);

  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("has-open-lightbox");
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(document.documentElement.dir === "rtl" ? -1 : 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(document.documentElement.dir === "rtl" ? 1 : -1); }
      if (event.key === "Tab") {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []);
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("has-open-lightbox"); document.removeEventListener("keydown", onKey); };
  }, [isOpen, close, move]);

  if (images.length === 0) return null;
  return (
    <>
      <div className={styles.gallery}>
        {images.map((image, index) => (
          <motion.button
            key={image.id}
            className={styles.imageButton}
            data-size={index % 4 === 0 ? "wide" : "standard"}
            type="button"
            aria-label={`${labels.openImage}: ${image.alt}`}
            onClick={(event) => open(index, event.currentTarget)}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.988 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.14 }}
            whileTap={reduce ? undefined : { scale: 0.992 }}
            transition={{ delay: reduce ? 0 : (index % 2) * 0.06, duration: reduce ? 0.01 : 0.56, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes={index % 4 === 0 ? "(max-width: 768px) 100vw, 78vw" : "(max-width: 768px) 100vw, 48vw"} />
            <span className={styles.mediaIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {image.caption ? <span className={styles.caption}>{image.caption}</span> : null}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {active !== null ? (
          <motion.div
            key="project-lightbox"
            ref={dialogRef}
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={images[active].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.28, ease: [0.4, 0, 0.2, 1] }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
          >
            <div className={styles.lightboxBar}>
              <p className={styles.counter} aria-live="polite"><span>{labels.imageCounter}</span><b>{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</b></p>
              <button ref={closeRef} className={styles.close} type="button" aria-label={labels.close} onClick={close}><LightboxIcon kind="close" /></button>
            </div>
            <div className={styles.stage} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
              <button className={styles.previous} type="button" aria-label={labels.previousImage} onClick={() => move(-1)}><LightboxIcon kind="arrow" /></button>
              <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
                <motion.figure
                  key={images[active].id}
                  custom={slideDirection}
                  initial={reduce ? false : { opacity: 0, scale: 0.975, x: slideDirection * 28 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.985, x: slideDirection * -18 }}
                  transition={{ duration: reduce ? 0.01 : 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={images[active].src} width={images[active].width} height={images[active].height} alt={images[active].alt} sizes="96vw" />
                  {images[active].caption ? <figcaption>{images[active].caption}</figcaption> : null}
                </motion.figure>
              </AnimatePresence>
              <button className={styles.next} type="button" aria-label={labels.nextImage} onClick={() => move(1)}><LightboxIcon kind="arrow" /></button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
