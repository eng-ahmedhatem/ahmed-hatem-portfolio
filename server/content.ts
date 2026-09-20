import type { BlogCategory, BlogPost, Homepage, Project, SiteSettings, StaticPage, Testimonial } from "../src/domain/content/types";
import { z } from "zod";
import { withEmploymentDefaults } from "../src/data/defaults/employment";
import { isPublicPost, isPublicProject, isPublicTestimonial } from "../src/domain/content/publication";
import { mockCategories } from "../src/data/mock/categories";
import { mockHomepage } from "../src/data/mock/homepage";
import { mockStaticPages } from "../src/data/mock/pages";
import { mockPosts } from "../src/data/mock/posts";
import { mockProjects } from "../src/data/mock/projects";
import { mockSiteSettings } from "../src/data/mock/site-settings";

import { type ContentKind } from "./models";
import { getSupabaseAdmin, isDatabaseReady } from "./supabase";

const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "استخدم حروفًا إنجليزية أو أرقامًا أو الشرطة (-) والشرطة السفلية (_) فقط.",
  );
const shortText = z.string().trim().min(1).max(320);
const longText = z.string().max(20_000);
const dateSchema = z.string().datetime({ offset: true });
const safeResourceSchema = z.string().min(1).max(2_048).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Use a safe site path or an HTTP(S) URL.");
const publicUrlSchema = z.string().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol));
const bilingual = <Schema extends z.ZodType>(schema: Schema) => z.object({ ar: schema, en: schema });
const seoSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(500),
  canonicalUrl: safeResourceSchema.optional(),
  robots: z.object({ index: z.boolean(), follow: z.boolean() }),
  openGraph: z.object({
    title: z.string().trim().min(1).max(180),
    description: z.string().trim().min(1).max(500),
    image: z.object({
      url: safeResourceSchema,
      width: z.number().int().positive().max(12_000),
      height: z.number().int().positive().max(12_000),
      alt: z.string().max(500),
    }).optional(),
  }),
  structuredData: z.object({
    type: z.enum(["WebPage", "ProfilePage", "BlogPosting", "CollectionPage", "CreativeWork"]),
  }).optional(),
});
const mediaAssetSchema = z.object({
  id: idSchema,
  src: z.union([z.literal(""), safeResourceSchema]),
  width: z.number().int().positive().max(12_000),
  height: z.number().int().positive().max(12_000),
  translations: bilingual(z.object({
    alt: z.string().max(500),
    caption: z.string().max(1_000).optional(),
  })),
});
const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ id: idSchema, type: z.literal("paragraph"), text: longText }),
  z.object({ id: idSchema, type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), text: shortText }),
  z.object({ id: idSchema, type: z.literal("list"), items: z.array(z.string().max(2_000)).max(100), ordered: z.boolean().optional() }),
  z.object({ id: idSchema, type: z.literal("quote"), text: longText, attribution: z.string().max(500).optional() }),
  z.object({ id: idSchema, type: z.literal("code"), code: longText, language: z.string().max(80).optional() }),
  z.object({ id: idSchema, type: z.literal("image"), src: safeResourceSchema, width: z.number().int().positive(), height: z.number().int().positive(), alt: z.string().max(500), caption: z.string().max(1_000).optional() }),
  z.object({ id: idSchema, type: z.literal("links"), links: z.array(z.object({ label: shortText, href: safeResourceSchema })).max(30) }),
  z.object({ id: idSchema, type: z.literal("table"), headers: z.array(z.string().max(500)).max(20), rows: z.array(z.array(z.string().max(2_000)).max(20)).max(100) }),
]);
const localizedPageTranslationSchema = z.object({
  eyebrow: z.string().max(320),
  title: shortText,
  summary: z.string().max(2_000),
  body: z.array(contentBlockSchema).max(200),
  seo: seoSchema,
});
const projectTranslationSchema = z.object({
  title: shortText,
  slug: z.string().trim().min(1).max(180),
  excerpt: z.string().trim().min(1).max(2_000),
  overview: longText.optional(),
  challenge: longText.optional(),
  solution: longText.optional(),
  role: z.string().max(500).optional(),
  projectType: shortText,
  filterLabel: shortText,
  seo: seoSchema,
});
const postTranslationSchema = z.object({
  title: shortText,
  slug: z.string().trim().min(1).max(180),
  excerpt: z.string().trim().min(1).max(2_000),
  content: z.array(contentBlockSchema).max(300),
  seo: seoSchema,
});
const categoryTranslationSchema = z.object({
  name: shortText,
  slug: z.string().trim().min(1).max(180),
  description: z.string().max(2_000),
  seo: seoSchema,
});
const contentSchemas: Record<ContentKind, z.ZodType<Record<string, unknown>>> = {
  "site-settings": z.object({
    id: idSchema,
    identity: z.object({
      employment: z.object({
        enabled: z.boolean(),
        url: publicUrlSchema,
        translations: bilingual(z.object({ label: shortText, role: shortText, company: shortText, description: z.string().max(2000) })),
      }).optional(),
      email: z.string().email().max(320).optional(),
      logoSrc: safeResourceSchema.optional(),
      logoWidth: z.number().int().positive().optional(),
      logoHeight: z.number().int().positive().optional(),
      profileSrc: safeResourceSchema.optional(),
      profileWidth: z.number().int().positive().optional(),
      profileHeight: z.number().int().positive().optional(),
      searchConsole: z.object({
        propertyUrl: z.union([z.literal(""), publicUrlSchema]).optional(),
        verificationToken: z.string().trim().max(512).refine(
          (value) => !/[<>]/.test(value),
          "The Search Console verification token must not contain HTML.",
        ).optional(),
      }).optional(),
      socialLinks: z.array(z.object({ id: idSchema, label: shortText, url: publicUrlSchema })).max(20),
    }),
    translations: bilingual(z.object({
      brandName: shortText,
      brandDescriptor: shortText,
      navigationLabel: shortText,
      navigation: z.array(z.object({ key: z.enum(["home", "work", "blog", "about", "contact"]), label: shortText, href: safeResourceSchema })).max(10),
      skipToContentLabel: shortText,
      languageSwitcherLabel: shortText,
      themeSwitcherLabel: shortText,
      lightThemeLabel: shortText,
      darkThemeLabel: shortText,
      mobileMenuOpenLabel: shortText,
      mobileMenuCloseLabel: shortText,
      mobileMenuLabel: shortText,
      mobileMenuTitle: shortText,
      primaryCtaLabel: shortText,
      contactDockLabel: shortText,
      whatsappLabel: shortText,
      facebookLabel: shortText,
      footerRole: shortText,
      footerNavigationLabel: shortText,
      copyrightLabel: shortText,
      footerText: z.string().trim().max(320).optional(),
      seo: seoSchema,
    })),
  }).passthrough(),
  homepage: z.object({
    id: idSchema,
    testimonials: z.object({
      enabled: z.boolean(),
      translations: bilingual(z.object({ eyebrow: shortText, title: shortText, summary: z.string().max(2000), sourceLabel: shortText })),
    }).optional(),
    actions: z.object({ primaryTarget: z.enum(["home", "work", "blog", "about", "contact"]), secondaryTarget: z.enum(["home", "work", "blog", "about", "contact"]) }),
    translations: bilingual(z.object({
      hero: z.object({
        name: shortText,
        role: shortText,
        eyebrow: shortText,
        title: shortText,
        summary: z.string().trim().min(1).max(2_000),
        primaryActionLabel: shortText,
        secondaryActionLabel: shortText,
        capabilityLabel: shortText,
        capabilities: z.array(shortText).max(20),
        blueprint: z.object({}).passthrough(),
      }),
      projects: z.object({ viewProjectLabel: shortText, projectLabel: shortText, progressLabel: shortText, viewAllLabel: shortText }),
      about: z.object({
        experienceNumber: shortText,
        experienceUnit: shortText,
        title: shortText,
        summary: z.string().trim().min(1).max(2_000),
        details: z.array(z.string().max(2_000)).max(20),
        primarySkill: shortText,
        secondarySkills: z.array(shortText).max(20),
        profileAlt: shortText,
        actionLabel: shortText,
      }),
      contact: z.object({ title: shortText, summary: z.string().max(2_000), emailLabel: shortText, form: z.object({}).passthrough() }),
      seo: seoSchema,
    })),
    sections: z.array(z.object({ id: idSchema, type: z.enum(["hero", "featured-projects", "about-preview", "contact-cta"]), enabled: z.boolean(), order: z.number().int().min(0).max(100), translations: bilingual(z.object({ eyebrow: z.string().max(320).optional(), title: shortText, summary: z.string().max(2_000).optional() })) })).max(20),
  }).passthrough(),
  "static-page": z.object({
    id: idSchema,
    key: z.enum(["work", "blog", "about", "contact"]),
    translations: bilingual(localizedPageTranslationSchema),
    updatedAt: dateSchema,
  }).passthrough(),
  project: z.object({
    id: idSchema,
    attribution: z.object({
      kind: z.enum(["independent", "agency"]),
      agencyUrl: z.union([z.literal(""), publicUrlSchema]).optional(),
      permissionConfirmed: z.boolean(),
      translations: bilingual(z.object({ agencyName: z.string().max(320), contribution: z.string().max(2000), notice: z.string().max(2000) })),
    }).optional(),
    status: z.enum(["draft", "published"]).optional(),
    implementationDate: z.string().max(120).optional(),
    filterKey: idSchema,
    featured: z.boolean(),
    featuredOrder: z.number().int().min(1).max(100).optional(),
    technologies: z.array(shortText).max(50),
    links: z.array(z.object({ label: shortText, url: publicUrlSchema })).max(20),
    media: z.array(mediaAssetSchema).min(1).max(100),
    coverMediaId: idSchema,
    translations: bilingual(projectTranslationSchema),
    updatedAt: dateSchema,
  }).passthrough().superRefine((project, context) => {
    if (project.status !== "draft" && project.attribution?.kind === "agency") {
      if (!project.attribution.permissionConfirmed) context.addIssue({ code: "custom", path: ["attribution", "permissionConfirmed"], message: "احفظ المشروع كمسودة إلى أن تتأكد من سماح الشركة والعميل بعرضه." });
      for (const locale of ["ar", "en"] as const) {
        const credit = project.attribution.translations[locale];
        if (!credit.agencyName.trim() || !credit.contribution.trim() || !credit.notice.trim()) context.addIssue({ code: "custom", path: ["attribution", "translations", locale], message: "وضّح جهة التنفيذ ومساهمتك وحقوق العرض باللغتين." });
      }
    }
    if (!project.media.some((asset) => asset.id === project.coverMediaId)) {
      context.addIssue({ code: "custom", path: ["coverMediaId"], message: "The cover image must exist in the project media gallery." });
    }
    if (project.status !== "draft") {
      const cover = project.media.find((asset) => asset.id === project.coverMediaId);
      if (!cover?.src) context.addIssue({ code: "custom", path: ["media"], message: "A published project needs a cover image." });
      if (!cover?.translations.ar.alt || !cover.translations.en.alt) context.addIssue({ code: "custom", path: ["media"], message: "A published project image needs Arabic and English alt text." });
    }
  }),
  post: z.object({
    id: idSchema,
    authorId: idSchema,
    categoryIds: z.array(idSchema).max(20),
    tags: z.array(shortText).max(50),
    status: z.enum(["draft", "published"]),
    featured: z.boolean().optional(),
    featuredImage: mediaAssetSchema,
    publishedAt: dateSchema.optional(),
    translations: bilingual(postTranslationSchema),
    updatedAt: dateSchema,
  }).passthrough().superRefine((post, context) => {
    if (post.status === "published") {
      if (!post.publishedAt) context.addIssue({ code: "custom", path: ["publishedAt"], message: "A published article needs a publication date." });
      if (!post.featuredImage.src) context.addIssue({ code: "custom", path: ["featuredImage", "src"], message: "A published article needs a featured image." });
      if (!post.featuredImage.translations.ar.alt || !post.featuredImage.translations.en.alt) context.addIssue({ code: "custom", path: ["featuredImage", "translations"], message: "A published article image needs Arabic and English alt text." });
    }
  }),
  category: z.object({ id: idSchema, translations: bilingual(categoryTranslationSchema), updatedAt: dateSchema }).passthrough(),
  testimonial: z.object({
    id: idSchema,
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
    featuredOrder: z.number().int().min(1).max(100),
    consentConfirmed: z.boolean(),
    sourceUrl: z.union([z.literal(""), publicUrlSchema]).optional(),
    avatar: mediaAssetSchema.optional(),
    translations: bilingual(z.object({ name: z.string().trim().max(160), role: z.string().trim().max(160), company: z.string().trim().max(160), quote: z.string().trim().max(1600) })),
    updatedAt: dateSchema,
  }).superRefine((item, context) => {
    if (item.status !== "published") return;
    if (!item.consentConfirmed) context.addIssue({ code: "custom", path: ["consentConfirmed"], message: "تأكد من إذن صاحب الرأي بعرض اسمه ونصه وصورته قبل النشر." });
    for (const locale of ["ar", "en"] as const) {
      if (!item.translations[locale].name || !item.translations[locale].quote) context.addIssue({ code: "custom", path: ["translations", locale], message: "أضف اسم صاحب الرأي ونصه باللغتين قبل النشر." });
    }
  }),
};

export function validateContentPayload(kind: ContentKind, payload: unknown) {
  return contentSchemas[kind].safeParse(payload);
}

export interface PublicContentSnapshot {
  testimonials: readonly Testimonial[];
  siteSettings: SiteSettings;
  homepage: Homepage;
  staticPages: readonly StaticPage[];
  projects: readonly Project[];
  posts: readonly BlogPost[];
  categories: readonly BlogCategory[];
}

const seeds: readonly { kind: ContentKind; entityId: string; payload: Record<string, unknown> }[] = [
  { kind: "site-settings", entityId: mockSiteSettings.id, payload: mockSiteSettings as unknown as Record<string, unknown> },
  { kind: "homepage", entityId: mockHomepage.id, payload: mockHomepage as unknown as Record<string, unknown> },
  ...mockStaticPages.map((payload) => ({ kind: "static-page" as const, entityId: payload.id, payload: payload as unknown as Record<string, unknown> })),
  ...mockProjects.map((payload) => ({ kind: "project" as const, entityId: payload.id, payload: payload as unknown as Record<string, unknown> })),
  ...mockPosts.map((payload) => ({ kind: "post" as const, entityId: payload.id, payload: payload as unknown as Record<string, unknown> })),
  ...mockCategories.map((payload) => ({ kind: "category" as const, entityId: payload.id, payload: payload as unknown as Record<string, unknown> })),
];

export function getBundledSnapshot(): PublicContentSnapshot {
  return {
    testimonials: [],
    siteSettings: withEmploymentDefaults(mockSiteSettings),
    homepage: mockHomepage,
    staticPages: mockStaticPages,
    projects: mockProjects.filter(isPublicProject),
    posts: mockPosts.filter(isPublicPost),
    categories: mockCategories,
  };
}

export async function seedContent() {
  if (!isDatabaseReady()) return false;
  // Seed a new installation only; never resurrect a record deleted in the CMS.
  const existing = await getSupabaseAdmin().from("content_records").select("id", { count: "exact", head: true });
  if (existing.error) throw new Error("Unable to inspect content initialization.");
  if (existing.count) return true;
  const { error } = await getSupabaseAdmin()
    .from("content_records")
    .upsert(
      seeds.map((seed) => ({
        kind: seed.kind,
        entity_id: seed.entityId,
        payload: seed.payload,
      })),
      { onConflict: "kind,entity_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Unable to seed Supabase content: ${error.message}`);
  return true;
}

function asPayload<T>(value: unknown): T {
  return value as T;
}

export async function getPublicSnapshot(): Promise<PublicContentSnapshot> {
  const { data, error } = await getSupabaseAdmin()
    .from("content_records")
    .select("kind,entity_id,payload");
  if (error) throw new Error(`Unable to read Supabase content: ${error.message}`);
  const records = data ?? [];
  const one = <T>(kind: ContentKind) => {
    const record = records.find((candidate) => candidate.kind === kind);
    if (!record) throw new Error(`Missing required ${kind} content.`);
    return asPayload<T>(record.payload);
  };
  const many = <T>(kind: ContentKind) =>
    records.filter((candidate) => candidate.kind === kind).map((record) => asPayload<T>(record.payload));

  return {
    siteSettings: withEmploymentDefaults(one<SiteSettings>("site-settings")),
    homepage: one<Homepage>("homepage"),
    staticPages: many<StaticPage>("static-page"),
    projects: many<Project>("project").filter(isPublicProject),
    posts: many<BlogPost>("post").filter(isPublicPost),
    categories: many<BlogCategory>("category"),
    testimonials: many<Testimonial>("testimonial").filter(isPublicTestimonial),
  };
}
