import { cache } from "react";

import { contentRepository } from "@/data/content-repository";
import type {
  ContentBlock,
  Locale,
  LocalizedRouteEntry,
  ResolvedSiteSettings,
  SeoMetadata,
  TranslationState,
} from "@/domain/content/types";

export interface PageIntroViewModel {
  eyebrow: string;
  title: string;
  summary: string;
  seo: SeoMetadata;
  alternatePaths: TranslationState<string>;
}

export interface ContentRowViewModel {
  id: string;
  href: string;
  title: string;
  summary: string;
  meta?: readonly string[];
}

export interface SiteChromeViewModel {
  settings: ResolvedSiteSettings;
  routes: readonly LocalizedRouteEntry[];
}

export const getSiteChromeViewModel = cache(
  async (locale: Locale): Promise<SiteChromeViewModel> => {
    const [settings, routes] = await Promise.all([
      contentRepository.getSiteSettings(locale),
      contentRepository.getRouteManifest(),
    ]);

    return { settings, routes };
  },
);

export const getHomepageViewModel = cache(async (locale: Locale) => {
  const homepage = await contentRepository.getHomepage(locale);
  return {
    intro: {
      eyebrow: homepage.eyebrow,
      title: homepage.title,
      summary: homepage.summary,
      seo: homepage.seo,
      alternatePaths: homepage.alternatePaths,
    } satisfies PageIntroViewModel,
    sections: homepage.sections,
  };
});

export const getWorkArchiveViewModel = cache(async (locale: Locale) => {
  const [page, projects] = await Promise.all([
    contentRepository.getStaticPage(locale, "work"),
    contentRepository.getProjects(locale),
  ]);

  return {
    intro: page satisfies PageIntroViewModel,
    rows: projects.map<ContentRowViewModel>((project) => ({
      id: project.id,
      href: `/${locale}/work/${project.slug}`,
      title: project.title,
      summary: project.excerpt,
      meta: [String(project.year), ...project.technologies],
    })),
  };
});

export const getProjectViewModel = cache(
  async (locale: Locale, slug: string) => {
    const project = await contentRepository.getProjectBySlug(locale, slug);

    if (!project) {
      return null;
    }

    return {
      intro: {
        eyebrow: `${project.industry} · ${project.year}`,
        title: project.title,
        summary: project.excerpt,
        seo: project.seo,
        alternatePaths: project.alternatePaths,
      } satisfies PageIntroViewModel,
      body: [
        { id: `${project.id}-overview`, type: "paragraph", text: project.overview },
      ] satisfies readonly ContentBlock[],
      meta: project.technologies,
    };
  },
);

export const getBlogArchiveViewModel = cache(async (locale: Locale) => {
  const [page, posts] = await Promise.all([
    contentRepository.getStaticPage(locale, "blog"),
    contentRepository.getPosts(locale),
  ]);

  return {
    intro: page satisfies PageIntroViewModel,
    rows: posts.map<ContentRowViewModel>((post) => ({
      id: post.id,
      href: `/${locale}/blog/${post.slug}`,
      title: post.title,
      summary: post.excerpt,
      meta: post.publishedAt ? [post.publishedAt.slice(0, 10)] : undefined,
    })),
  };
});

export const getPostViewModel = cache(async (locale: Locale, slug: string) => {
  const post = await contentRepository.getPostBySlug(locale, slug);

  if (!post) {
    return null;
  }

  return {
    intro: {
      eyebrow: post.publishedAt?.slice(0, 10) ?? "",
      title: post.title,
      summary: post.excerpt,
      seo: post.seo,
      alternatePaths: post.alternatePaths,
    } satisfies PageIntroViewModel,
    body: post.content,
  };
});

export const getCategoryViewModel = cache(
  async (locale: Locale, slug: string) => {
    const category = await contentRepository.getCategoryBySlug(locale, slug);

    if (!category) {
      return null;
    }

    const posts = await contentRepository.getPostsByCategory(locale, category.id);

    return {
      intro: {
        eyebrow: category.name,
        title: category.name,
        summary: category.description,
        seo: category.seo,
        alternatePaths: category.alternatePaths,
      } satisfies PageIntroViewModel,
      rows: posts.map<ContentRowViewModel>((post) => ({
        id: post.id,
        href: `/${locale}/blog/${post.slug}`,
        title: post.title,
        summary: post.excerpt,
      })),
    };
  },
);

export const getStaticPageViewModel = cache(
  async (locale: Locale, key: "about" | "contact") => {
    const page = await contentRepository.getStaticPage(locale, key);
    return {
      intro: page satisfies PageIntroViewModel,
      body: page.body,
    };
  },
);
