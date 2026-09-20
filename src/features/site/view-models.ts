import { cache } from "react";

import { contentRepository } from "@/data/content-repository";
import type { ContentRepository } from "@/domain/content/repositories";
import type {
  ContactFormTranslation,
  HeroBlueprintTranslation,
  HomepageSectionType,
  Locale,
  LocaleSwitchRoute,
  MediaAsset,
  PageKey,
  ResolvedBlogCategory,
  ResolvedBlogPost,
  ResolvedProject,
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

export interface SiteChromeViewModel {
  settings: ResolvedSiteSettings;
  routes: readonly LocaleSwitchRoute[];
}

export interface ImageViewModel {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface ProjectCardViewModel {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  projectType: string;
  filterKey: string;
  filterLabel: string;
  technologies: readonly string[];
  dateLabel?: string;
  cover: ImageViewModel;
}

export interface HeroViewModel {
  locale: Locale;
  name: string;
  role: string;
  eyebrow: string;
  title: string;
  summary: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  capabilityLabel: string;
  capabilities: readonly string[];
  blueprint: HeroBlueprintTranslation;
  profile?: ImageViewModel;
  employment?: { label: string; role: string; company: string; description: string; url: string };
}

export interface HomepageSectionIntroViewModel {
  id: string;
  eyebrow?: string;
  title: string;
  summary?: string;
}

export interface ContactViewModel {
  locale: Locale;
  title: string;
  summary: string;
  emailLabel: string;
  form: ContactFormTranslation;
}

function pageHref(locale: Locale, page: PageKey): string {
  return page === "home" ? `/${locale}` : `/${locale}/${page}`;
}

function sectionIntro(
  sections: readonly (HomepageSectionIntroViewModel & { type: HomepageSectionType })[],
  type: HomepageSectionType,
): HomepageSectionIntroViewModel {
  const section = sections.find((candidate) => candidate.type === type);
  if (!section) throw new Error(`Missing homepage section: ${type}.`);
  return section;
}

function resolvedMedia(media: MediaAsset, locale: Locale): ImageViewModel {
  const translation = media.translations[locale];
  if (!translation) throw new Error(`Missing ${locale} media translation: ${media.id}.`);
  return { id: media.id, src: media.src, width: media.width, height: media.height, ...translation };
}

function projectCover(project: ResolvedProject): ImageViewModel {
  const cover = project.media.find((media) => media.id === project.coverMediaId);
  if (!cover) throw new Error(`Missing cover media for ${project.id}.`);
  return resolvedMedia(cover, project.locale);
}

function projectCard(
  project: ResolvedProject,
  displayMedia?: MediaAsset,
): ProjectCardViewModel {
  return {
    id: project.id,
    href: `/${project.locale}/work/${project.slug}`,
    title: project.title,
    excerpt: project.excerpt,
    projectType: project.projectType,
    filterKey: project.filterKey,
    filterLabel: project.filterLabel,
    technologies: project.technologies,
    dateLabel: project.implementationDate
      ? new Intl.DateTimeFormat(project.locale, { year: "numeric", month: "long" }).format(new Date(project.implementationDate))
      : undefined,
    cover: displayMedia
      ? resolvedMedia(displayMedia, project.locale)
      : projectCover(project),
  };
}

function postCover(post: ResolvedBlogPost): ImageViewModel {
  return resolvedMedia(post.featuredImage, post.locale);
}

function categoryMap(categories: readonly ResolvedBlogCategory[]) {
  return new Map(categories.map((category) => [category.id, category]));
}

export const getSiteChromeViewModel = cache(async (locale: Locale): Promise<SiteChromeViewModel> => {
  const [settings, routes] = await Promise.all([
    contentRepository.getSiteSettings(locale),
    contentRepository.getRouteManifest(),
  ]);
  return { settings, routes: routes.map(({ paths, fallbackPaths }) => ({ paths, fallbackPaths })) };
});

export const getHomepageViewModel = cache(async (locale: Locale) => {
  const [homepage, projects, settings, testimonials] = await Promise.all([
    contentRepository.getHomepage(locale),
    contentRepository.getFeaturedProjects(locale),
    contentRepository.getSiteSettings(locale),
    contentRepository.getTestimonials(locale),
  ]);

  const featuredProjectCards = projects.slice(0, 4).map((project) => projectCard(project));
  const homepageProjectCards = featuredProjectCards;
  const employment = settings.identity.employment;
  const localizedEmployment = employment?.enabled && employment.translations[locale]
    ? { ...employment.translations[locale]!, url: employment.url }
    : undefined;

  return {
    intro: {
      eyebrow: homepage.hero.eyebrow,
      title: homepage.hero.title,
      summary: homepage.hero.summary,
      seo: homepage.seo,
      alternatePaths: homepage.alternatePaths,
    } satisfies PageIntroViewModel,
    hero: {
      locale,
      ...homepage.hero,
      employment: localizedEmployment,
      primaryAction: { label: homepage.hero.primaryActionLabel, href: pageHref(locale, homepage.actions.primaryTarget) },
      secondaryAction: { label: homepage.hero.secondaryActionLabel, href: pageHref(locale, homepage.actions.secondaryTarget) },
      profile: settings.identity.profileSrc && settings.identity.profileWidth && settings.identity.profileHeight
        ? { id: "profile-primary", src: settings.identity.profileSrc, width: settings.identity.profileWidth, height: settings.identity.profileHeight, alt: homepage.about.profileAlt }
        : undefined,
    } satisfies HeroViewModel,
    projects: {
      locale,
      intro: sectionIntro(homepage.sections, "featured-projects"),
      ...homepage.projects,
      items: homepageProjectCards,
      viewAllHref: `/${locale}/work`,
    },
    about: {
      locale,
      intro: sectionIntro(homepage.sections, "about-preview"),
      ...homepage.about,
      employment: localizedEmployment,
      profile: settings.identity.profileSrc && settings.identity.profileWidth && settings.identity.profileHeight
        ? { src: settings.identity.profileSrc, width: settings.identity.profileWidth, height: settings.identity.profileHeight, alt: homepage.about.profileAlt }
        : undefined,
    },
    testimonials: { locale, ...homepage.testimonials, items: testimonials },
    contact: {
      locale,
      intro: sectionIntro(homepage.sections, "contact-cta"),
      ...homepage.contact,
    },
  };
});

export const getWorkArchiveViewModel = cache(async (locale: Locale) => {
  const [page, projects] = await Promise.all([
    contentRepository.getStaticPage(locale, "work"),
    contentRepository.getProjects(locale),
  ]);
  const projectCards = projects.map((project) => projectCard(project));
  const items = projectCards;
  const filters = Array.from(new Map(items.map((item) => [item.filterKey, item.filterLabel])), ([key, label]) => ({ key, label }));
  return {
    locale,
    intro: page satisfies PageIntroViewModel,
    items,
    filters,
    labels: {
      all: locale === "ar" ? "الكل" : "All",
      filterLabel: locale === "ar" ? "تصفية المشاريع" : "Filter projects",
      empty: locale === "ar" ? "لا توجد مشاريع ضمن هذا التصنيف." : "No projects match this filter.",
      open: locale === "ar" ? "استكشف المشروع" : "Explore project",
      results: locale === "ar" ? "مشروع" : "projects",
      pagination: locale === "ar" ? "التنقل بين صفحات المشاريع" : "Project pagination",
      previous: locale === "ar" ? "السابق" : "Previous",
      next: locale === "ar" ? "التالي" : "Next",
      page: locale === "ar" ? "صفحة" : "Page",
      of: locale === "ar" ? "من" : "of",
    },
  };
});

export const getProjectViewModel = cache(async (locale: Locale, slug: string, repository: ContentRepository = contentRepository) => {
  const project = await repository.getProjectBySlug(locale, slug);
  if (!project) return null;
  const all = await repository.getProjects(locale);
  const index = all.findIndex((candidate) => candidate.id === project.id);
  const previous = index > 0 ? all[index - 1] : all.at(-1);
  const next = index < all.length - 1 ? all[index + 1] : all[0];
  const dateLabel = project.implementationDate
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(new Date(project.implementationDate))
    : undefined;
  return {
    intro: {
      eyebrow: project.projectType,
      title: project.title,
      summary: project.excerpt,
      seo: project.seo,
      alternatePaths: project.alternatePaths,
    } satisfies PageIntroViewModel,
    project: {
      id: project.id,
      title: project.title,
      projectType: project.projectType,
      overview: project.overview,
      challenge: project.challenge,
      solution: project.solution,
      role: project.role,
      attribution: project.attribution?.kind === "agency" && project.attribution.translations[locale]
        ? { ...project.attribution.translations[locale]!, url: project.attribution.agencyUrl }
        : undefined,
      dateLabel,
      technologies: project.technologies,
      cover: projectCover(project),
      gallery: project.media.map((media) => resolvedMedia(media, locale)),
      liveLink: project.links[0],
    },
    navigation: {
      previous: previous && previous.id !== project.id ? { href: `/${locale}/work/${previous.slug}`, title: previous.title } : undefined,
      next: next && next.id !== project.id ? { href: `/${locale}/work/${next.slug}`, title: next.title } : undefined,
    },
    labels: locale === "ar" ? {
      date: "تاريخ التنفيذ", role: "الدور", type: "نوع المشروع", technologies: "التقنيات", overview: "عن المشروع", challenge: "التحدي", solution: "الحل", gallery: "معرض المشروع", caseStudy: "دراسة حالة", story: "قصة المشروع", visualArchive: "السجل البصري", openImage: "افتح الصورة", close: "إغلاق", previousImage: "الصورة السابقة", nextImage: "الصورة التالية", imageCounter: "صورة", projectNavigation: "التنقل بين المشاريع", previousProject: "المشروع السابق", nextProject: "المشروع التالي", live: "زيارة الموقع",
    } : {
      date: "Implementation date", role: "Role", type: "Project type", technologies: "Technologies", overview: "Project overview", challenge: "Challenge", solution: "Solution", gallery: "Project gallery", caseStudy: "Case study", story: "Project story", visualArchive: "Visual record", openImage: "Open image", close: "Close", previousImage: "Previous image", nextImage: "Next image", imageCounter: "Image", projectNavigation: "Project navigation", previousProject: "Previous project", nextProject: "Next project", live: "Visit website",
    },
  };
});

export const getBlogArchiveViewModel = cache(async (locale: Locale) => {
  const [page, posts, categories] = await Promise.all([
    contentRepository.getStaticPage(locale, "blog"),
    contentRepository.getPosts(locale),
    contentRepository.getCategories(locale),
  ]);
  const categoriesById = categoryMap(categories);
  return {
    locale,
    intro: page satisfies PageIntroViewModel,
    categories: categories.map((category) => ({ id: category.id, name: category.name, href: `/${locale}/blog/category/${category.slug}` })),
    posts: posts.map((post) => ({
      id: post.id,
      href: `/${locale}/blog/${post.slug}`,
      title: post.title,
      excerpt: post.excerpt,
      featured: Boolean(post.featured),
      tags: post.tags,
      categoryIds: post.categoryIds,
      cover: postCover(post),
      categories: post.categoryIds.flatMap((id) => {
        const category = categoriesById.get(id);
        return category ? [{ id, name: category.name, href: `/${locale}/blog/category/${category.slug}` }] : [];
      }),
      dateLabel: post.publishedAt ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(post.publishedAt)) : "",
    })),
    labels: locale === "ar"
      ? {
          search: "ابحث في المقالات",
          searchPlaceholder: "WordPress، الأداء…",
          all: "الكل",
          categories: "تصفية حسب التصنيف",
          latest: "أحدث المقالات",
          read: "اقرأ المقال",
          empty: "لا توجد مقالات مطابقة.",
          results: "مقال",
          pagination: "التنقل بين صفحات المقالات",
          previous: "السابق",
          next: "التالي",
          page: "صفحة",
          of: "من",
        }
      : {
          search: "Search articles",
          searchPlaceholder: "WordPress, performance…",
          all: "All",
          categories: "Filter by category",
          latest: "Latest articles",
          read: "Read article",
          empty: "No articles match your search.",
          results: "articles",
          pagination: "Article pagination",
          previous: "Previous",
          next: "Next",
          page: "Page",
          of: "of",
        },
  };
});

export const getPostViewModel = cache(async (locale: Locale, slug: string, repository: ContentRepository = contentRepository) => {
  const post = await repository.getPostBySlug(locale, slug);
  if (!post) return null;
  const cover = postCover(post);
  const [categories, posts] = await Promise.all([
    repository.getCategories(locale),
    repository.getPosts(locale),
  ]);
  const categoriesById = categoryMap(categories);
  const related = posts.filter((candidate) => candidate.id !== post.id && candidate.categoryIds.some((id) => post.categoryIds.includes(id))).slice(0, 2);
  return {
    intro: {
      eyebrow: post.categoryIds.map((id) => categoriesById.get(id)?.name).filter(Boolean).join(" · "),
      title: post.title,
      summary: post.excerpt,
      seo: post.seo,
      alternatePaths: post.alternatePaths,
    } satisfies PageIntroViewModel,
    dateLabel: post.publishedAt ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(post.publishedAt)) : "",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    body: post.content,
    cover,
    toc: post.content.flatMap((block) => block.type === "heading" ? [{ id: block.id, text: block.text, level: block.level }] : []),
    categories: post.categoryIds.flatMap((id) => {
      const category = categoriesById.get(id);
      return category ? [{ name: category.name, href: `/${locale}/blog/category/${category.slug}` }] : [];
    }),
    related: related.map((item) => ({ title: item.title, excerpt: item.excerpt, href: `/${locale}/blog/${item.slug}` })),
    labels: locale === "ar"
      ? { article: "مقال", published: "تاريخ النشر", contents: "في هذا المقال", related: "مقالات ذات صلة", read: "اقرأ المقال" }
      : { article: "Article", published: "Published", contents: "In this article", related: "Related articles", read: "Read article" },
  };
});

export const getCategoryViewModel = cache(async (locale: Locale, slug: string) => {
  const category = await contentRepository.getCategoryBySlug(locale, slug);
  if (!category) return null;
  const archive = await getBlogArchiveViewModel(locale);
  return {
    ...archive,
    intro: {
      eyebrow: locale === "ar" ? "تصنيف" : "Category",
      title: category.name,
      summary: category.description,
      seo: category.seo,
      alternatePaths: category.alternatePaths,
    } satisfies PageIntroViewModel,
    posts: archive.posts.filter((post) => post.categoryIds.includes(category.id)),
  };
});

export const getContactPageViewModel = cache(async (locale: Locale) => {
  const [page, homepage] = await Promise.all([
    contentRepository.getStaticPage(locale, "contact"),
    contentRepository.getHomepage(locale),
  ]);
  return {
    intro: page satisfies PageIntroViewModel,
    contact: {
      locale,
      title: page.title,
      summary: page.summary,
      emailLabel: homepage.contact.emailLabel,
      form: homepage.contact.form,
      intro: { id: "contact-page", eyebrow: page.eyebrow, title: page.title },
    },
  };
});
