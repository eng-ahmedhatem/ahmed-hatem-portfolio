export const SUPPORTED_LOCALES = ["ar", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Direction = "rtl" | "ltr";
export type TranslationState<T> = Partial<Record<Locale, T>>;

export type PageKey = "home" | "work" | "blog" | "about" | "contact";

export interface SeoRobots {
  index: boolean;
  follow: boolean;
}

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
  robots: SeoRobots;
  openGraph: {
    title: string;
    description: string;
    image?: OpenGraphImage;
  };
  structuredData?: {
    type: "WebPage" | "Article" | "ProfilePage";
  };
}

export interface NavigationItem {
  key: PageKey;
  label: string;
  href: string;
}

export interface SiteSettingsTranslation {
  brandName: string;
  brandDescriptor: string;
  navigationLabel: string;
  navigation: readonly NavigationItem[];
  skipToContentLabel: string;
  languageSwitcherLabel: string;
  footerSummary: string;
  footerNavigationLabel: string;
  copyrightLabel: string;
  seo: SeoMetadata;
}

export interface SiteSettings {
  id: string;
  identity: {
    email: string;
    socialLinks: readonly {
      id: string;
      label: string;
      url: string;
    }[];
  };
  translations: TranslationState<SiteSettingsTranslation>;
}

export interface ResolvedSiteSettings extends SiteSettingsTranslation {
  id: string;
  locale: Locale;
  direction: Direction;
  identity: SiteSettings["identity"];
}

export type HomepageSectionType =
  | "foundation-intro"
  | "hero"
  | "credibility"
  | "services"
  | "featured-projects"
  | "positioning"
  | "automation"
  | "process"
  | "lab"
  | "capabilities"
  | "proof"
  | "testimonials"
  | "about-preview"
  | "latest-articles"
  | "contact-cta";

export interface HomepageSectionTranslation {
  eyebrow?: string;
  title: string;
  summary?: string;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  order: number;
  translations: TranslationState<HomepageSectionTranslation>;
}

export interface HomepageTranslation {
  title: string;
  eyebrow: string;
  summary: string;
  seo: SeoMetadata;
}

export interface Homepage {
  id: string;
  translations: TranslationState<HomepageTranslation>;
  sections: readonly HomepageSection[];
}

export interface ResolvedHomepage extends HomepageTranslation {
  id: string;
  locale: Locale;
  sections: readonly (HomepageSectionTranslation & {
    id: string;
    type: HomepageSectionType;
    order: number;
  })[];
  alternatePaths: TranslationState<string>;
}

export interface MediaAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  translations: TranslationState<{ alt: string }>;
}

export interface ProjectTranslation {
  title: string;
  slug: string;
  excerpt: string;
  overview: string;
  challenge: string;
  solution: string;
  process: readonly string[];
  architecture: string;
  automation: string;
  results: readonly string[];
  role: string;
  industry: string;
  seo: SeoMetadata;
}

export interface Project {
  id: string;
  year: number;
  technologies: readonly string[];
  featured: boolean;
  featuredOrder?: number;
  links: readonly { label: string; url: string }[];
  media: readonly MediaAsset[];
  translations: TranslationState<ProjectTranslation>;
  updatedAt: string;
}

export interface ResolvedProject extends Omit<Project, "translations">, ProjectTranslation {
  locale: Locale;
  alternatePaths: TranslationState<string>;
}

export interface BlogCategoryTranslation {
  name: string;
  slug: string;
  description: string;
  imageAlt?: string;
  seo: SeoMetadata;
}

export interface BlogCategory {
  id: string;
  translations: TranslationState<BlogCategoryTranslation>;
  updatedAt: string;
}

export interface ResolvedBlogCategory
  extends Omit<BlogCategory, "translations">,
    BlogCategoryTranslation {
  locale: Locale;
  alternatePaths: TranslationState<string>;
}

export type ContentBlock =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "list"; items: readonly string[] };

export interface BlogPostTranslation {
  title: string;
  slug: string;
  excerpt: string;
  content: readonly ContentBlock[];
  featuredImageAlt?: string;
  seo: SeoMetadata;
}

export interface BlogPost {
  id: string;
  authorId: string;
  categoryIds: readonly string[];
  status: "draft" | "published";
  publishedAt?: string;
  updatedAt: string;
  translations: TranslationState<BlogPostTranslation>;
}

export interface ResolvedBlogPost
  extends Omit<BlogPost, "translations">,
    BlogPostTranslation {
  locale: Locale;
  alternatePaths: TranslationState<string>;
}

export interface StaticPageTranslation {
  eyebrow: string;
  title: string;
  summary: string;
  body: readonly ContentBlock[];
  seo: SeoMetadata;
}

export interface StaticPage {
  id: string;
  key: Exclude<PageKey, "home">;
  translations: TranslationState<StaticPageTranslation>;
  updatedAt: string;
}

export interface ResolvedStaticPage extends StaticPageTranslation {
  id: string;
  key: StaticPage["key"];
  locale: Locale;
  updatedAt: string;
  alternatePaths: TranslationState<string>;
}

export type LocalizedRouteKind =
  | "home"
  | "work-archive"
  | "project"
  | "blog-archive"
  | "post"
  | "category"
  | "about"
  | "contact";

export interface LocalizedRouteEntry {
  id: string;
  kind: LocalizedRouteKind;
  paths: TranslationState<string>;
  fallbackPaths: Record<Locale, string>;
  lastModified?: string;
}
