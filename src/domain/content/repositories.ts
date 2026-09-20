import type {
  BlogPost,
  Locale,
  LocalizedRouteEntry,
  ResolvedBlogCategory,
  ResolvedBlogPost,
  ResolvedHomepage,
  ResolvedProject,
  ResolvedTestimonial,
  ResolvedSiteSettings,
  ResolvedStaticPage,
  StaticPage,
} from "@/domain/content/types";

export interface ContentRepository {
  getTestimonials(locale: Locale): Promise<readonly ResolvedTestimonial[]>;
  getSiteSettings(locale: Locale): Promise<ResolvedSiteSettings>;
  getHomepage(locale: Locale): Promise<ResolvedHomepage>;
  getProjects(locale: Locale): Promise<readonly ResolvedProject[]>;
  getFeaturedProjects(locale: Locale): Promise<readonly ResolvedProject[]>;
  getProjectBySlug(locale: Locale, slug: string): Promise<ResolvedProject | null>;
  getPosts(locale: Locale): Promise<readonly ResolvedBlogPost[]>;
  getPostBySlug(locale: Locale, slug: string): Promise<ResolvedBlogPost | null>;
  getCategories(locale: Locale): Promise<readonly ResolvedBlogCategory[]>;
  getCategoryBySlug(
    locale: Locale,
    slug: string,
  ): Promise<ResolvedBlogCategory | null>;
  getPostsByCategory(
    locale: Locale,
    categoryId: string,
  ): Promise<readonly ResolvedBlogPost[]>;
  getStaticPage(
    locale: Locale,
    key: StaticPage["key"],
  ): Promise<ResolvedStaticPage>;
  getRouteManifest(): Promise<readonly LocalizedRouteEntry[]>;
  getPublishedPostEntities(): Promise<readonly BlogPost[]>;
}
