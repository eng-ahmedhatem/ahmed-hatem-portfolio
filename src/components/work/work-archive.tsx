"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DirectionalArrow } from "@/components/ui/directional-arrow";
import type { Locale } from "@/domain/content/types";
import type { ProjectCardViewModel } from "@/features/site/view-models";

import styles from "./work-archive.module.css";

const PROJECTS_PER_PAGE = 4;

interface WorkArchiveProps {
  archive: {
    locale: Locale;
    items: readonly ProjectCardViewModel[];
    filters: readonly { key: string; label: string }[];
    labels: {
      all: string;
      filterLabel: string;
      empty: string;
      open: string;
      results: string;
      pagination: string;
      previous: string;
      next: string;
      page: string;
      of: string;
    };
  };
  initialFilter?: string;
  initialPage?: number;
}

export function WorkArchive({
  archive,
  initialFilter = "all",
  initialPage = 1,
}: WorkArchiveProps) {
  const validInitialFilter = archive.filters.some(
    (filter) => filter.key === initialFilter,
  )
    ? initialFilter
    : "all";
  const [active, setActive] = useState(validInitialFilter);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const reduce = Boolean(useReducedMotion());
  const number = useMemo(
    () => new Intl.NumberFormat(archive.locale, { minimumIntegerDigits: 2 }),
    [archive.locale],
  );
  const counts = useMemo(
    () =>
      new Map(
        archive.filters.map((filter) => [
          filter.key,
          archive.items.filter((item) => item.filterKey === filter.key).length,
        ]),
      ),
    [archive.filters, archive.items],
  );
  const filteredItems = useMemo(
    () =>
      active === "all"
        ? archive.items
        : archive.items.filter((item) => item.filterKey === active),
    [active, archive.items],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PROJECTS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE,
  );

  function updateUrl(filter: string, nextPage: number) {
    const url = new URL(window.location.href);
    if (filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);
    if (nextPage === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(nextPage));
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }

  function selectFilter(key: string) {
    setActive(key);
    setPage(1);
    updateUrl(key, 1);
  }

  function selectPage(nextPage: number) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setPage(safePage);
    updateUrl(active, safePage);
  }

  return (
    <section className={styles.archive} aria-labelledby="work-filter-title">
      <div className={styles.toolbar}>
        <p className={styles.filterTitle} id="work-filter-title">
          {archive.labels.filterLabel}
        </p>
        <div className={styles.filters} role="group" aria-labelledby="work-filter-title">
          <button
            type="button"
            aria-pressed={active === "all"}
            onClick={() => selectFilter("all")}
          >
            <span>{archive.labels.all}</span>
            <small>{number.format(archive.items.length)}</small>
            {active === "all" ? (
              <motion.span className={styles.activeLine} layoutId={reduce ? undefined : "work-filter-line"} />
            ) : null}
          </button>
          {archive.filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              aria-pressed={active === filter.key}
              onClick={() => selectFilter(filter.key)}
            >
              <span>{filter.label}</span>
              <small>{number.format(counts.get(filter.key) ?? 0)}</small>
              {active === filter.key ? (
                <motion.span className={styles.activeLine} layoutId={reduce ? undefined : "work-filter-line"} />
              ) : null}
            </button>
          ))}
        </div>
        <p className={styles.resultCount} aria-live="polite">
          <strong>{number.format(filteredItems.length)}</strong>
          <span>{archive.labels.results}</span>
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${active}-${currentPage}`}
          id="project-grid"
          className={styles.grid}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduce ? 0.01 : 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          {visibleItems.map((item, index) => {
            const itemNumber = (currentPage - 1) * PROJECTS_PER_PAGE + index + 1;
            return (
              <motion.article
                key={`${item.id}-${itemNumber}`}
                className={styles.project}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0.01 : 0.46,
                  delay: reduce ? 0 : index * 0.055,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className={styles.projectMeta}>
                  <span>{number.format(itemNumber)}</span>
                  <span>{item.projectType}</span>
                </div>
                <Link
                  className={styles.media}
                  href={item.href}
                  aria-label={`${archive.labels.open}: ${item.title}`}
                >
                  <Image
                    src={item.cover.src}
                    width={item.cover.width}
                    height={item.cover.height}
                    alt={item.cover.alt}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <span className={styles.mediaAction} aria-hidden="true">
                    <DirectionalArrow />
                  </span>
                </Link>
                <div className={styles.copy}>
                  <h2><Link href={item.href}>{item.title}</Link></h2>
                  <p>{item.excerpt}</p>
                  <Link className={styles.open} href={item.href}>
                    <span>{archive.labels.open}</span>
                    <DirectionalArrow />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredItems.length === 0 ? (
        <p className={styles.empty} role="status">{archive.labels.empty}</p>
      ) : null}

      {filteredItems.length > 0 ? (
        <nav className={styles.pagination} aria-label={archive.labels.pagination}>
          <button
            type="button"
            onClick={() => selectPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <DirectionalArrow />
            <span>{archive.labels.previous}</span>
          </button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  aria-label={`${archive.labels.page} ${number.format(pageNumber)} ${archive.labels.of} ${number.format(totalPages)}`}
                  onClick={() => selectPage(pageNumber)}
                >
                  {number.format(pageNumber)}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={() => selectPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span>{archive.labels.next}</span>
            <DirectionalArrow />
          </button>
        </nav>
      ) : null}
    </section>
  );
}
