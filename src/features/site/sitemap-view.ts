import { contentRepository } from "@/data/content-repository";
import type { Locale, LocalizedRouteKind } from "@/domain/content/types";

export interface SitemapItemViewModel {
  id: string;
  href: string;
  title: string;
  kind: LocalizedRouteKind;
  lastModified?: string;
}

export interface SitemapSectionViewModel {
  id: "pages" | "work" | "blog" | "categories" | "contact";
  items: SitemapItemViewModel[];
}

const sectionForKind: Record<LocalizedRouteKind, SitemapSectionViewModel["id"]> = {
  home: "pages",
  about: "pages",
  "work-archive": "work",
  project: "work",
  "blog-archive": "blog",
  post: "blog",
  category: "categories",
  contact: "contact",
};

const fallbackTitles: Record<Locale, Record<LocalizedRouteKind, string>> = {
  ar: {
    home: "الرئيسية",
    about: "عني",
    "work-archive": "كل المشاريع",
    project: "مشروع",
    "blog-archive": "كل المقالات",
    post: "مقال",
    category: "تصنيف",
    contact: "التواصل",
  },
  en: {
    home: "Home",
    about: "About",
    "work-archive": "All projects",
    project: "Project",
    "blog-archive": "All articles",
    post: "Article",
    category: "Category",
    contact: "Contact",
  },
};

const sectionOrder: SitemapSectionViewModel["id"][] = [
  "pages",
  "work",
  "blog",
  "categories",
  "contact",
];

export async function getSitemapViewModel(locale: Locale) {
  const [routes, projects, posts, categories] = await Promise.all([
    contentRepository.getRouteManifest(),
    contentRepository.getProjects(locale),
    contentRepository.getPosts(locale),
    contentRepository.getCategories(locale),
  ]);

  const titles = new Map<string, string>([
    ...projects.map((item): [string, string] => [`route-${item.id}`, item.title]),
    ...posts.map((item): [string, string] => [`route-${item.id}`, item.title]),
    ...categories.map((item): [string, string] => [`route-${item.id}`, item.name]),
  ]);

  const sections = sectionOrder.map((id): SitemapSectionViewModel => ({ id, items: [] }));

  for (const route of routes) {
    const href = route.paths[locale];
    if (!href) continue;

    const section = sections.find((candidate) => candidate.id === sectionForKind[route.kind]);
    section?.items.push({
      id: route.id,
      href,
      title: titles.get(route.id) ?? fallbackTitles[locale][route.kind],
      kind: route.kind,
      lastModified: route.lastModified,
    });
  }

  for (const section of sections) {
    section.items.sort((first, second) => {
      const firstIsArchive = first.kind === "work-archive" || first.kind === "blog-archive" || first.kind === "home";
      const secondIsArchive = second.kind === "work-archive" || second.kind === "blog-archive" || second.kind === "home";
      if (firstIsArchive !== secondIsArchive) return firstIsArchive ? -1 : 1;
      return first.title.localeCompare(second.title, locale);
    });
  }

  return {
    sections: sections.filter((section) => section.items.length > 0),
    total: sections.reduce((count, section) => count + section.items.length, 0),
  };
}
