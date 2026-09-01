"use client";

import {
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { DirectionalArrow } from "@/components/ui/directional-arrow";
import type { ProjectCardViewModel } from "@/features/site/view-models";

import styles from "./latest-projects.module.css";

interface LatestProjectsProps {
  projects: {
    locale: "ar" | "en";
    intro: { id: string; eyebrow?: string; title: string; summary?: string };
    viewProjectLabel: string;
    projectLabel: string;
    progressLabel: string;
    viewAllLabel: string;
    viewAllHref: string;
    items: readonly ProjectCardViewModel[];
  };
}

function ProjectFeature({
  item,
  index,
  locale,
  projectLabel,
  viewProjectLabel,
}: {
  item: ProjectCardViewModel;
  index: number;
  locale: "ar" | "en";
  projectLabel: string;
  viewProjectLabel: string;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-10, 10],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [1.04, 1.01, 1.04],
  );
  const copyY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [10, -8],
  );
  const fromStart = locale === "ar" ? 24 : -24;
  const entranceX = index % 2 === 0 ? fromStart : -fromStart;
  const instanceId = `${item.id}-home-${index + 1}`;

  return (
    <motion.article
      ref={articleRef}
      className={styles.project}
      aria-labelledby={`${instanceId}-title`}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, x: entranceX, y: 34, scale: 0.985 }
      }
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        delay: reduce ? 0 : (index % 2) * 0.1,
        duration: reduce ? 0.01 : 0.66,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        className={styles.media}
        href={item.href}
        aria-label={`${viewProjectLabel}: ${item.title}`}
      >
        <motion.div
          className={styles.mediaInner}
          style={{ y: imageY, scale: imageScale }}
        >
          <Image
            src={item.cover.src}
            width={item.cover.width}
            height={item.cover.height}
            alt={item.cover.alt}
            sizes="(max-width: 767px) 100vw, (max-width: 1320px) 50vw, 640px"
          />
        </motion.div>
        <span className={styles.mediaSignal} aria-hidden="true">
          <i />
          {String(index + 1).padStart(2, "0")}
        </span>
      </Link>

      <motion.div className={styles.copy} style={{ y: copyY }}>
        <div className={styles.projectMeta}>
          <span>{projectLabel} {String(index + 1).padStart(2, "0")}</span>
          <span>{item.projectType}</span>
        </div>
        <h3 id={`${instanceId}-title`}>
          <Link href={item.href}>{item.title}</Link>
        </h3>
        <p className={styles.excerpt}>{item.excerpt}</p>
        <div className={styles.projectFooter}>
          <ul className={styles.technologies} aria-label={item.projectType}>
            {item.technologies.slice(0, 3).map((technology) => (
              <li key={technology} translate="no">{technology}</li>
            ))}
          </ul>
          <Link className={styles.projectLink} href={item.href}>
            <span>{viewProjectLabel}</span>
            <DirectionalArrow />
          </Link>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function LatestProjects({ projects }: LatestProjectsProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const isActive = useInView(stageRef, { amount: 0.04, margin: "160px 0px" });
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start 88%", "end 18%"],
  });
  const connectionProgress = useTransform(
    scrollYProgress,
    [0, 0.82],
    [0, 1],
  );
  const topConnectionProgress = useTransform(
    connectionProgress,
    [0, 0.24],
    [0, 1],
  );
  const spineConnectionProgress = useTransform(
    connectionProgress,
    [0.16, 0.84],
    [0, 1],
  );
  const bottomConnectionProgress = useTransform(
    connectionProgress,
    [0.76, 1],
    [0, 1],
  );
  const topNodeOpacity = useTransform(
    connectionProgress,
    [0, 0.08, 0.24],
    [0, 0.45, 1],
  );
  const bottomNodeOpacity = useTransform(
    connectionProgress,
    [0.74, 0.88, 1],
    [0, 0.45, 1],
  );
  const pulseOpacity = useTransform(
    connectionProgress,
    [0, 0.82, 0.92, 1],
    [0, 0, 0.9, 0.9],
  );
  const connectionOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.88, 1],
    [0.1, 0.85, 0.85, 0.22],
  );
  const artworkY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-18, 18],
  );

  if (projects.items.length === 0) return null;

  return (
    <section
      id="projects"
      className={styles.section}
      aria-labelledby={`${projects.intro.id}-title`}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            {projects.intro.eyebrow ? <p>{projects.intro.eyebrow}</p> : null}
            <h2 id={`${projects.intro.id}-title`}>{projects.intro.title}</h2>
          </div>
          <div className={styles.headerAside}>
            {projects.intro.summary ? <p>{projects.intro.summary}</p> : null}
            <span>
              <strong>{String(projects.items.length).padStart(2, "0")}</strong>
              {projects.progressLabel}
            </span>
          </div>
        </header>

        <div ref={stageRef} className={styles.projectsStage}>
          <motion.div
            className={styles.connections}
            style={{ y: artworkY, opacity: reduce ? 0.55 : connectionOpacity }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <motion.path
                d="M438 224C468 196 532 196 562 224"
                style={{ pathLength: reduce ? 1 : topConnectionProgress }}
              />
              <motion.path
                d="M500 226C476 394 524 606 500 774"
                style={{ pathLength: reduce ? 1 : spineConnectionProgress }}
              />
              <motion.path
                d="M438 776C468 804 532 804 562 776"
                style={{ pathLength: reduce ? 1 : bottomConnectionProgress }}
              />
              <motion.circle
                cx="438"
                cy="224"
                r="5"
                style={{ opacity: reduce ? 1 : topNodeOpacity }}
              />
              <motion.circle
                cx="562"
                cy="224"
                r="5"
                style={{ opacity: reduce ? 1 : topNodeOpacity }}
              />
              <motion.circle
                cx="438"
                cy="776"
                r="5"
                style={{ opacity: reduce ? 1 : bottomNodeOpacity }}
              />
              <motion.circle
                cx="562"
                cy="776"
                r="5"
                style={{ opacity: reduce ? 1 : bottomNodeOpacity }}
              />
              <motion.circle
                className={styles.dataPulse}
                r="5"
                style={{ opacity: reduce ? 0.75 : pulseOpacity }}
                animate={
                  reduce || !isActive
                    ? { cx: 500, cy: 500 }
                    : {
                        cx: [500, 486, 514, 500],
                        cy: [235, 410, 590, 765],
                      }
                }
                transition={{
                  duration: reduce || !isActive ? 0.01 : 3.6,
                  repeat: reduce || !isActive ? 0 : Infinity,
                  ease: "linear",
                }}
              />
            </svg>
          </motion.div>
          <motion.span
            className={styles.mobileConnection}
            style={{ scaleY: reduce ? 1 : connectionProgress }}
            aria-hidden="true"
          />

          <div className={styles.projects}>
            {projects.items.map((item, index) => (
              <ProjectFeature
                key={`${item.id}-home-${index}`}
                item={item}
                index={index}
                locale={projects.locale}
                projectLabel={projects.projectLabel}
                viewProjectLabel={projects.viewProjectLabel}
              />
            ))}
          </div>
        </div>

        <div className={styles.footerAction}>
          <Link className={styles.allLink} href={projects.viewAllHref}>
            <span>{projects.viewAllLabel}</span>
            <DirectionalArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
