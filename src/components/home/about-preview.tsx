"use client";

import { useReducedMotion, useScroll, useTransform } from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import { useRef } from "react";

import { Container } from "@/components/ui/container";
import { ScrollArtwork } from "@/components/ui/scroll-artwork";

import styles from "./about-preview.module.css";

interface AboutPreviewProps {
  about: {
    locale: "ar" | "en";
    intro: { id: string; eyebrow?: string; title: string };
    experienceNumber: string;
    experienceUnit: string;
    title: string;
    summary: string;
    primarySkill: string;
    secondarySkills: readonly string[];
    employment?: { label: string; role: string; company: string; description: string; url: string };
    profile?: { src: string; width: number; height: number; alt: string };
  };
}

export function AboutPreview({ about }: AboutPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const fromStart = about.locale === "ar" ? 28 : -28;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [28, -18],
  );
  const portraitRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : about.locale === "ar" ? [1.4, -1.2] : [-1.4, 1.2],
  );
  const portraitScale = useTransform(
    scrollYProgress,
    [0, 0.52, 1],
    reduce ? [1, 1, 1] : [0.965, 1.015, 0.99],
  );
  const copyY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [16, -12],
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      tabIndex={-1}
      className={styles.section}
      aria-labelledby={`${about.intro.id}-title`}
    >
      <ScrollArtwork
        variant="about"
        locale={about.locale}
        className={styles.scrollArtwork}
      />
      <Container className={styles.layout}>
        <motion.div
          className={styles.copy}
          style={{ y: copyY }}
          initial={reduce ? false : { opacity: 0, x: fromStart }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: reduce ? 0.01 : 0.62,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {about.intro.eyebrow ? (
            <p className={styles.eyebrow}>{about.intro.eyebrow}</p>
          ) : null}
          <p className={styles.primarySkill} translate="no">
            {about.primarySkill}
          </p>
          <h2 id={`${about.intro.id}-title`}>{about.title}</h2>
          <p className={styles.summary}>{about.summary}</p>
          {about.employment ? <aside className={styles.employment}>
            <span>{about.employment.label}</span>
            <a href={about.employment.url} target="_blank" rel="noopener noreferrer">{about.employment.company}<span aria-hidden="true"> ↗</span></a>
            <strong>{about.employment.role}</strong>
            <p>{about.employment.description}</p>
          </aside> : null}
          <ul className={styles.skills}>
            {about.secondarySkills.map((skill) => (
              <li key={skill} translate="no">
                {skill}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className={styles.portraitStage}>
          <span className={styles.stageNumber} aria-hidden="true">
            {about.experienceNumber.padStart(2, "0")}
          </span>
          <span className={styles.stageRail} aria-hidden="true" />
          <motion.span
            className={styles.stageProgress}
            style={{ scaleY: reduce ? 1 : scrollYProgress }}
            aria-hidden="true"
          />
          <motion.div
            className={styles.portraitReveal}
            initial={
              reduce
                ? false
                : { opacity: 0, clipPath: "inset(16% 0 0 0)", scale: 0.94 }
            }
            whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)", scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: reduce ? 0.01 : 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.figure
              className={styles.portrait}
              style={{
                y: portraitY,
                rotate: portraitRotate,
                scale: portraitScale,
              }}
            >
              {about.profile ? (
                <Image
                  src={about.profile.src}
                  width={about.profile.width}
                  height={about.profile.height}
                  alt={about.profile.alt}
                  sizes="(max-width: 768px) 92vw, 47vw"
                />
              ) : null}
            </motion.figure>
          </motion.div>
          <motion.div
            className={styles.experience}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              delay: reduce ? 0 : 0.15,
              duration: reduce ? 0.01 : 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <strong>{about.experienceNumber}</strong>
            <span>{about.experienceUnit}</span>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
