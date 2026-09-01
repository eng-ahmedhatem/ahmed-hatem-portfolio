import type { ContentRepository } from "@/domain/content/repositories";
import type {
  BlogCategory,
  BlogPost,
  Homepage,
  Locale,
  LocalizedRouteEntry,
  Project,
  ResolvedBlogCategory,
  ResolvedBlogPost,
  ResolvedHomepage,
  ResolvedProject,
  ResolvedSiteSettings,
  ResolvedStaticPage,
  SiteSettings,
  StaticPage,
  TranslationState,
} from "@/domain/content/types";
import { getDirection } from "@/lib/i18n/config";

import { mockCategories } from "../mock/categories";
import { mockHomepage } from "../mock/homepage";
import { mockStaticPages } from "../mock/pages";
import { mockPosts } from "../mock/posts";
import { mockProjects } from "../mock/projects";
import { mockSiteSettings } from "../mock/site-settings";

export interface ContentSnapshot {
  siteSettings: SiteSettings;
  homepage: Homepage;
  staticPages: readonly StaticPage[];
  projects: readonly Project[];
  posts: readonly BlogPost[];
  categories: readonly BlogCategory[];
}

const mockSnapshot: ContentSnapshot = {
  siteSettings: mockSiteSettings,
  homepage: mockHomepage,
  staticPages: mockStaticPages,
  projects: mockProjects,
  posts: mockPosts,
  categories: mockCategories,
};

function requireTranslation<T>(
  translations: TranslationState<T>,
  locale: Locale,
  entityLabel: string,
): T {
  const translation = translations[locale];

  if (!translation) {
    throw new Error(`Missing ${locale} translation for ${entityLabel}.`);
  }

  return translation;
}

function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function projectPaths(project: Project): TranslationState<string> {
  return Object.fromEntries(
    Object.entries(project.translations).map(([locale, translation]) => [
      locale,
      `/${locale}/work/${translation.slug}`,
    ]),
  );
}

function postPaths(post: BlogPost): TranslationState<string> {
  return Object.fromEntries(
    Object.entries(post.translations).map(([locale, translation]) => [
      locale,
      `/${locale}/blog/${translation.slug}`,
    ]),
  );
}

function categoryPaths(category: BlogCategory): TranslationState<string> {
  return Object.fromEntries(
    Object.entries(category.translations).map(([locale, translation]) => [
      locale,
      `/${locale}/blog/category/${translation.slug}`,
    ]),
  );
}

function resolveProject(project: Project, locale: Locale): ResolvedProject | null {
  const translation = project.translations[locale];

  if (!translation || project.status === "draft") {
    return null;
  }

  const { translations, ...sharedProject } = project;
  void translations;

  return {
    ...sharedProject,
    ...translation,
    locale,
    alternatePaths: projectPaths(project),
  };
}

function resolvePost(post: BlogPost, locale: Locale): ResolvedBlogPost | null {
  const translation = post.translations[locale];

  if (!translation || post.status !== "published") {
    return null;
  }

  const { translations, ...sharedPost } = post;
  void translations;

  return {
    ...sharedPost,
    ...translation,
    locale,
    alternatePaths: postPaths(post),
  };
}

function resolveCategory(
  category: BlogCategory,
  locale: Locale,
): ResolvedBlogCategory | null {
  const translation = category.translations[locale];

  if (!translation) {
    return null;
  }

  const { translations, ...sharedCategory } = category;
  void translations;

  return {
    ...sharedCategory,
    ...translation,
    locale,
    alternatePaths: categoryPaths(category),
  };
}

export class MockContentRepository implements ContentRepository {
  constructor(private readonly snapshot: ContentSnapshot = mockSnapshot) {}

  async getSiteSettings(locale: Locale): Promise<ResolvedSiteSettings> {
    const translation = requireTranslation(
      this.snapshot.siteSettings.translations,
      locale,
      "site settings",
    );

    return {
      ...translation,
      id: this.snapshot.siteSettings.id,
      locale,
      direction: getDirection(locale),
      identity: this.snapshot.siteSettings.identity,
    };
  }

  async getHomepage(locale: Locale): Promise<ResolvedHomepage> {
    const translation = requireTranslation(
      this.snapshot.homepage.translations,
      locale,
      "homepage",
    );

    const sections = this.snapshot.homepage.sections
      .filter((section) => section.enabled && section.translations[locale])
      .sort((first, second) => first.order - second.order)
      .map((section) => ({
        ...requireTranslation(
          section.translations,
          locale,
          `homepage section ${section.id}`,
        ),
        id: section.id,
        type: section.type,
        order: section.order,
      }));

    return {
      ...translation,
      id: this.snapshot.homepage.id,
      locale,
      actions: this.snapshot.homepage.actions,
      sections,
      alternatePaths: { ar: "/ar", en: "/en" },
    };
  }

  async getProjects(locale: Locale): Promise<readonly ResolvedProject[]> {
    return this.snapshot.projects.flatMap((project) => {
      const resolved = resolveProject(project, locale);
      return resolved ? [resolved] : [];
    });
  }

  async getFeaturedProjects(locale: Locale): Promise<readonly ResolvedProject[]> {
    const projects = await this.getProjects(locale);

    return projects
      .filter((project) => project.featured)
      .sort(
        (first, second) =>
          (first.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
          (second.featuredOrder ?? Number.MAX_SAFE_INTEGER),
      );
  }

  async getProjectBySlug(
    locale: Locale,
    slug: string,
  ): Promise<ResolvedProject | null> {
    const normalizedSlug = decodeSlug(slug);
    const project = this.snapshot.projects.find(
      (candidate) => candidate.translations[locale]?.slug === normalizedSlug,
    );

    return project ? resolveProject(project, locale) : null;
  }

  async getPosts(locale: Locale): Promise<readonly ResolvedBlogPost[]> {
    return this.snapshot.posts.flatMap((post) => {
      const resolved = resolvePost(post, locale);
      return resolved ? [resolved] : [];
    });
  }

  async getPostBySlug(
    locale: Locale,
    slug: string,
  ): Promise<ResolvedBlogPost | null> {
    const normalizedSlug = decodeSlug(slug);
    const post = this.snapshot.posts.find(
      (candidate) => candidate.translations[locale]?.slug === normalizedSlug,
    );

    return post ? resolvePost(post, locale) : null;
  }

  async getCategories(
    locale: Locale,
  ): Promise<readonly ResolvedBlogCategory[]> {
    return this.snapshot.categories.flatMap((category) => {
      const resolved = resolveCategory(category, locale);
      return resolved ? [resolved] : [];
    });
  }

  async getCategoryBySlug(
    locale: Locale,
    slug: string,
  ): Promise<ResolvedBlogCategory | null> {
    const normalizedSlug = decodeSlug(slug);
    const category = this.snapshot.categories.find(
      (candidate) => candidate.translations[locale]?.slug === normalizedSlug,
    );

    return category ? resolveCategory(category, locale) : null;
  }

  async getPostsByCategory(
    locale: Locale,
    categoryId: string,
  ): Promise<readonly ResolvedBlogPost[]> {
    const posts = await this.getPosts(locale);
    return posts.filter((post) => post.categoryIds.includes(categoryId));
  }

  async getStaticPage(
    locale: Locale,
    key: StaticPage["key"],
  ): Promise<ResolvedStaticPage> {
    const page = this.snapshot.staticPages.find((candidate) => candidate.key === key);

    if (!page) {
      throw new Error(`Missing static page: ${key}.`);
    }

    const translation = requireTranslation(
      page.translations,
      locale,
      `static page ${key}`,
    );

    return {
      ...translation,
      id: page.id,
      key,
      locale,
      updatedAt: page.updatedAt,
      alternatePaths: {
        ar: `/ar/${key}`,
        en: `/en/${key}`,
      },
    };
  }

  async getRouteManifest(): Promise<readonly LocalizedRouteEntry[]> {
    const staticRoutes: LocalizedRouteEntry[] = [
      {
        id: "route-home",
        kind: "home",
        paths: { ar: "/ar", en: "/en" },
        fallbackPaths: { ar: "/ar", en: "/en" },
      },
      {
        id: "route-work",
        kind: "work-archive",
        paths: { ar: "/ar/work", en: "/en/work" },
        fallbackPaths: { ar: "/ar/work", en: "/en/work" },
      },
      {
        id: "route-blog",
        kind: "blog-archive",
        paths: { ar: "/ar/blog", en: "/en/blog" },
        fallbackPaths: { ar: "/ar/blog", en: "/en/blog" },
      },
      {
        id: "route-contact",
        kind: "contact",
        paths: { ar: "/ar/contact", en: "/en/contact" },
        fallbackPaths: { ar: "/ar/contact", en: "/en/contact" },
      },
    ];

    const projectRoutes = this.snapshot.projects
      .filter((project) => project.status !== "draft")
      .map<LocalizedRouteEntry>((project) => ({
        id: `route-${project.id}`,
        kind: "project",
        paths: projectPaths(project),
        fallbackPaths: { ar: "/ar/work", en: "/en/work" },
        lastModified: project.updatedAt,
      }));

    const postRoutes = this.snapshot.posts
      .filter((post) => post.status === "published")
      .map<LocalizedRouteEntry>((post) => ({
        id: `route-${post.id}`,
        kind: "post",
        paths: postPaths(post),
        fallbackPaths: { ar: "/ar/blog", en: "/en/blog" },
        lastModified: post.updatedAt,
      }));

    const categoryRoutes = this.snapshot.categories.map<LocalizedRouteEntry>((category) => ({
      id: `route-${category.id}`,
      kind: "category",
      paths: categoryPaths(category),
      fallbackPaths: { ar: "/ar/blog", en: "/en/blog" },
      lastModified: category.updatedAt,
    }));

    return [...staticRoutes, ...projectRoutes, ...postRoutes, ...categoryRoutes];
  }

  async getPublishedPostEntities(): Promise<readonly BlogPost[]> {
    return this.snapshot.posts.filter((post) => post.status === "published");
  }
}
