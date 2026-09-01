import type { BlogCategory } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockCategories: readonly BlogCategory[] = [
  {
    id: "category-wordpress",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: { name: "WordPress", slug: "ووردبريس", description: "قرارات عملية لبناء مواقع WordPress مخصصة وقابلة للإدارة.", seo: createMockSeo("مقالات WordPress", "مقالات عربية عن تطوير WordPress المخصص.", "CollectionPage") },
      en: { name: "WordPress", slug: "wordpress", description: "Practical decisions behind custom, maintainable WordPress websites.", seo: createMockSeo("WordPress articles", "Articles about custom WordPress development.", "CollectionPage") },
    },
  },
  {
    id: "category-performance",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: { name: "الأداء", slug: "الأداء", description: "كيف تُبنى السرعة والاستجابة في الموقع من البداية.", seo: createMockSeo("مقالات أداء الويب", "مقالات عربية عن أداء المواقع وتجربة المستخدم.", "CollectionPage") },
      en: { name: "Performance", slug: "performance", description: "How speed and responsiveness are designed into a website from the start.", seo: createMockSeo("Web performance articles", "Articles about website performance and user experience.", "CollectionPage") },
    },
  },
  {
    id: "category-architecture",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: { name: "هندسة الويب", slug: "هندسة-الويب", description: "بنية المحتوى والواجهات والتكاملات التي تجعل المواقع قابلة للنمو.", seo: createMockSeo("مقالات هندسة الويب", "مقالات عربية عن بنية مواقع وتطبيقات الويب.", "CollectionPage") },
      en: { name: "Web architecture", slug: "web-architecture", description: "Content, interface, and integration boundaries that keep websites ready to grow.", seo: createMockSeo("Web architecture articles", "Articles about durable website and application architecture.", "CollectionPage") },
    },
  },
];
