import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CONTENT_SNAPSHOT_CACHE_TAG } from "@/data/content-cache";
import { MockContentRepository, type ContentSnapshot } from "@/data/repositories/mock-content-repository";
import type { ContentRepository } from "@/domain/content/repositories";
import type { Locale, StaticPage } from "@/domain/content/types";
import { ensureBackendReady } from "@server/backend";
import { getBundledSnapshot, getPublicSnapshot } from "@server/content";

const getCachedPublicSnapshot = unstable_cache(
  getPublicSnapshot,
  ["portfolio-public-content"],
  { tags: [CONTENT_SNAPSHOT_CACHE_TAG], revalidate: 3600 },
);

async function fetchSnapshot(): Promise<ContentSnapshot> {
  try {
    if (!(await ensureBackendReady())) return getBundledSnapshot();
    return await getCachedPublicSnapshot();
  } catch (error) {
    console.error("Supabase content is temporarily unavailable; using bundled content.", error);
    return getBundledSnapshot();
  }
}

const repository = cache(async (): Promise<MockContentRepository> => {
  return new MockContentRepository(await fetchSnapshot());
});

export class ApiContentRepository implements ContentRepository {
  async getTestimonials(locale: Locale) { return (await repository()).getTestimonials(locale); }
  async getSiteSettings(locale: Locale) { return (await repository()).getSiteSettings(locale); }
  async getHomepage(locale: Locale) { return (await repository()).getHomepage(locale); }
  async getProjects(locale: Locale) { return (await repository()).getProjects(locale); }
  async getFeaturedProjects(locale: Locale) { return (await repository()).getFeaturedProjects(locale); }
  async getProjectBySlug(locale: Locale, slug: string) { return (await repository()).getProjectBySlug(locale, slug); }
  async getPosts(locale: Locale) { return (await repository()).getPosts(locale); }
  async getPostBySlug(locale: Locale, slug: string) { return (await repository()).getPostBySlug(locale, slug); }
  async getCategories(locale: Locale) { return (await repository()).getCategories(locale); }
  async getCategoryBySlug(locale: Locale, slug: string) { return (await repository()).getCategoryBySlug(locale, slug); }
  async getPostsByCategory(locale: Locale, categoryId: string) { return (await repository()).getPostsByCategory(locale, categoryId); }
  async getStaticPage(locale: Locale, key: StaticPage["key"]) { return (await repository()).getStaticPage(locale, key); }
  async getRouteManifest() { return (await repository()).getRouteManifest(); }
  async getPublishedPostEntities() { return (await repository()).getPublishedPostEntities(); }
}
