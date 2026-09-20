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
    type:
      | "WebPage"
      | "ProfilePage"
      | "BlogPosting"
      | "CollectionPage"
      | "CreativeWork";
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
  themeSwitcherLabel: string;
  lightThemeLabel: string;
  darkThemeLabel: string;
  mobileMenuOpenLabel: string;
  mobileMenuCloseLabel: string;
  mobileMenuLabel: string;
  mobileMenuTitle: string;
  primaryCtaLabel: string;
  contactDockLabel: string;
  whatsappLabel: string;
  facebookLabel: string;
  footerRole: string;
  footerNavigationLabel: string;
  copyrightLabel: string;
  footerText?: string;
  seo: SeoMetadata;
}

export interface SiteSettings {
  id: string;
  identity: {
    employment?: Employment;
    email?: string;
    logoSrc?: string;
    logoWidth?: number;
    logoHeight?: number;
    profileSrc?: string;
    profileWidth?: number;
    profileHeight?: number;
    searchConsole?: {
      propertyUrl?: string;
      verificationToken?: string;
    };
    socialLinks: readonly {
      id: string;
      label: string;
      url: string;
    }[];
  };
  translations: TranslationState<SiteSettingsTranslation>;
}

export interface Employment {
  enabled: boolean;
  url: string;
  translations: TranslationState<{
    label: string;
    role: string;
    company: string;
    description: string;
  }>;
}

export interface ProjectAttribution {
  kind: "independent" | "agency";
  agencyUrl?: string;
  permissionConfirmed: boolean;
  translations: TranslationState<{
    agencyName: string;
    contribution: string;
    notice: string;
  }>;
}

export interface ResolvedSiteSettings extends SiteSettingsTranslation {
  id: string;
  locale: Locale;
  direction: Direction;
  identity: SiteSettings["identity"];
}

export type HomepageSectionType =
  | "hero"
  | "featured-projects"
  | "about-preview"
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

export const HERO_BUILD_STEP_KEYS = [
  "structure",
  "design",
  "wordpress",
  "custom",
  "responsive",
  "quality",
  "launch",
] as const;

export type HeroBuildStepKey = (typeof HERO_BUILD_STEP_KEYS)[number];

export interface HeroBlueprintTranslation {
  ariaLabel: string;
  canvasLabel: string;
  progressLabel: string;
  liveLabel: string;
  steps: Record<
    HeroBuildStepKey,
    {
      label: string;
      detail: string;
    }
  >;
}

export interface ContactFormTranslation {
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  phoneOptionalLabel: string;
  serviceLabel: string;
  budgetLabel: string;
  budgetOptionalLabel: string;
  detailsLabel: string;
  contactMethodLabel: string;
  contactMethodOptionalLabel: string;
  submitLabel: string;
  requiredLabel: string;
  invalidEmailLabel: string;
  deliverySuccessLabel: string;
  deliveryUnavailableLabel: string;
  services: readonly { value: string; label: string }[];
  budgets: readonly { value: string; label: string }[];
  contactMethods: readonly { value: string; label: string }[];
}

export interface HomepageTranslation {
  hero: {
    name: string;
    role: string;
    eyebrow: string;
    title: string;
    summary: string;
    primaryActionLabel: string;
    secondaryActionLabel: string;
    capabilityLabel: string;
    capabilities: readonly string[];
    blueprint: HeroBlueprintTranslation;
  };
  projects: {
    viewProjectLabel: string;
    projectLabel: string;
    progressLabel: string;
    viewAllLabel: string;
  };
  about: {
    experienceNumber: string;
    experienceUnit: string;
    title: string;
    summary: string;
    details: readonly string[];
    primarySkill: string;
    secondarySkills: readonly string[];
    profileAlt: string;
    actionLabel: string;
  };
  contact: {
    title: string;
    summary: string;
    emailLabel: string;
    form: ContactFormTranslation;
  };
  seo: SeoMetadata;
}

export interface Homepage {
  id: string;
  testimonials?: TestimonialsSettings;
  actions: {
    primaryTarget: PageKey;
    secondaryTarget: PageKey;
  };
  translations: TranslationState<HomepageTranslation>;
  sections: readonly HomepageSection[];
}

export interface ResolvedHomepage extends HomepageTranslation {
  id: string;
  testimonials: { enabled: boolean } & TestimonialsCopy;
  locale: Locale;
  actions: Homepage["actions"];
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
  translations: TranslationState<{
    alt: string;
    caption?: string;
  }>;
}

export interface TestimonialsCopy {
  eyebrow: string;
  title: string;
  summary: string;
  sourceLabel: string;
}

export interface TestimonialsSettings {
  enabled: boolean;
  translations: Record<Locale, TestimonialsCopy>;
}

export interface TestimonialTranslation {
  name: string;
  role: string;
  company: string;
  quote: string;
}

export interface Testimonial {
  id: string;
  status: "draft" | "published";
  featured: boolean;
  featuredOrder: number;
  consentConfirmed: boolean;
  sourceUrl?: string;
  avatar?: MediaAsset;
  translations: TranslationState<TestimonialTranslation>;
  updatedAt: string;
}

export interface ResolvedTestimonial extends Omit<Testimonial, "translations">, TestimonialTranslation {
  locale: Locale;
}

export interface ProjectTranslation {
  title: string;
  slug: string;
  excerpt: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  role?: string;
  projectType: string;
  filterLabel: string;
  seo: SeoMetadata;
}

export interface Project {
  id: string;
  attribution?: ProjectAttribution;
  status?: "draft" | "published";
  implementationDate?: string;
  technologies: readonly string[];
  filterKey: string;
  featured: boolean;
  featuredOrder?: number;
  links: readonly { label: string; url: string }[];
  media: readonly MediaAsset[];
  coverMediaId: string;
  translations: TranslationState<ProjectTranslation>;
  updatedAt: string;
}

export interface ResolvedProject
  extends Omit<Project, "translations">,
    ProjectTranslation {
  locale: Locale;
  alternatePaths: TranslationState<string>;
}

export interface BlogCategoryTranslation {
  name: string;
  slug: string;
  description: string;
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
  | { id: string; type: "list"; items: readonly string[]; ordered?: boolean }
  | { id: string; type: "quote"; text: string; attribution?: string }
  | { id: string; type: "code"; code: string; language?: string }
  | {
      id: string;
      type: "image";
      src: string;
      width: number;
      height: number;
      alt: string;
      caption?: string;
    }
  | {
      id: string;
      type: "links";
      links: readonly { label: string; href: string }[];
    }
  | {
      id: string;
      type: "table";
      headers: readonly string[];
      rows: readonly (readonly string[])[];
    };

export interface BlogPostTranslation {
  title: string;
  slug: string;
  excerpt: string;
  content: readonly ContentBlock[];
  seo: SeoMetadata;
}

export interface BlogPost {
  id: string;
  authorId: string;
  categoryIds: readonly string[];
  tags: readonly string[];
  status: "draft" | "published";
  featured?: boolean;
  featuredImage: MediaAsset;
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

export type LocaleSwitchRoute = Pick<
  LocalizedRouteEntry,
  "paths" | "fallbackPaths"
>;
