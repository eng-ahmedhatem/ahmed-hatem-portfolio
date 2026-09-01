"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DirectionalArrow } from "@/components/ui/directional-arrow";
import { getBlogArchiveViewModel } from "@/features/site/view-models";
import type { AwaitedReturn } from "@/lib/types";

import styles from "./blog-index.module.css";

type Archive = Omit<AwaitedReturn<typeof getBlogArchiveViewModel>, "intro">;

const PAGE_SIZE = 2;

export function BlogIndex({
  archive,
  initialQuery = "",
  initialCategory = "all",
  initialPage = 1,
}: {
  archive: Archive;
  initialQuery?: string;
  initialCategory?: string;
  initialPage?: number;
}) {
  const validInitialCategory = archive.categories.some(
    (item) => item.id === initialCategory,
  )
    ? initialCategory
    : "all";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(validInitialCategory);
  const [page, setPage] = useState(Math.max(1, Math.trunc(initialPage)));
  const reduce = Boolean(useReducedMotion());

  const posts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(archive.locale);
    return archive.posts.filter((post) => {
      const matchesCategory =
        category === "all" || post.categoryIds.includes(category);
      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`
        .toLocaleLowerCase(archive.locale);
      return matchesCategory && (!normalized || haystack.includes(normalized));
    });
  }, [archive.locale, archive.posts, category, query]);

  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visiblePosts = posts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function sync(nextQuery: string, nextCategory: string, nextPage: number) {
    const url = new URL(window.location.href);
    if (nextQuery) url.searchParams.set("q", nextQuery);
    else url.searchParams.delete("q");
    if (nextCategory !== "all") url.searchParams.set("category", nextCategory);
    else url.searchParams.delete("category");
    if (nextPage > 1) url.searchParams.set("page", String(nextPage));
    else url.searchParams.delete("page");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
    sync(nextQuery, category, 1);
  }

  function updateCategory(nextCategory: string) {
    setCategory(nextCategory);
    setPage(1);
    sync(query, nextCategory, 1);
  }

  function updatePage(nextPage: number) {
    const boundedPage = Math.min(Math.max(nextPage, 1), pageCount);
    setPage(boundedPage);
    sync(query, category, boundedPage);
    document.getElementById("blog-results")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className={styles.index}>
      <div className={styles.controls}>
        <label className={styles.searchField}>
          <span>{archive.labels.search}</span>
          <input
            type="search"
            name="article-search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder={archive.labels.searchPlaceholder}
            autoComplete="off"
          />
        </label>
        <div className={styles.filters}>
          <div className={styles.filterHeading}>
            <span>{archive.labels.categories}</span>
            <b>{posts.length} {archive.labels.results}</b>
          </div>
          <div className={styles.filterButtons} role="group" aria-label={archive.labels.categories}>
            <button
              type="button"
              aria-pressed={category === "all"}
              onClick={() => updateCategory("all")}
            >
              {archive.labels.all}
            </button>
            {archive.categories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                onClick={() => updateCategory(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        layout
        className={styles.posts}
        data-single={visiblePosts.length === 1}
        id="blog-results"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visiblePosts.map((post, index) => (
            <motion.article
              key={post.id}
              layout
              className={styles.post}
              data-featured={post.featured}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, clipPath: "inset(0 0 14% 0)", y: 22 }
              }
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{
                delay: reduce ? 0 : index * 0.08,
                duration: reduce ? 0.01 : 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                className={styles.media}
                href={post.href}
                aria-label={`${archive.labels.read}: ${post.title}`}
              >
                <Image
                  src={post.cover.src}
                  width={post.cover.width}
                  height={post.cover.height}
                  alt={post.cover.alt}
                  sizes="(max-width: 767px) 100vw, (max-width: 1320px) 58vw, 760px"
                />
                <span aria-hidden="true">
                  {String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                </span>
              </Link>
              <div className={styles.postCopy}>
                <div className={styles.meta}>
                  <span>{post.dateLabel}</span>
                  {post.categories.map((item) => (
                    <Link key={item.id} href={item.href}>{item.name}</Link>
                  ))}
                </div>
                <h2><Link href={post.href}>{post.title}</Link></h2>
                <p>{post.excerpt}</p>
                <Link className={styles.read} href={post.href}>
                  <span>{archive.labels.read}</span>
                  <DirectionalArrow />
                </Link>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {posts.length === 0 ? (
        <p className={styles.empty} role="status">{archive.labels.empty}</p>
      ) : null}

      {posts.length > 0 && pageCount > 1 ? (
        <nav className={styles.pagination} aria-label={archive.labels.pagination}>
          <button
            type="button"
            onClick={() => updatePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <DirectionalArrow />
            <span>{archive.labels.previous}</span>
          </button>
          <div>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === currentPage ? "page" : undefined}
                aria-label={`${archive.labels.page} ${pageNumber} ${archive.labels.of} ${pageCount}`}
                onClick={() => updatePage(pageNumber)}
              >
                {String(pageNumber).padStart(2, "0")}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => updatePage(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            <span>{archive.labels.next}</span>
            <DirectionalArrow />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
