import type { BlogCategory } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockCategories: readonly BlogCategory[] = [
  {
    id: "category-architecture",
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        name: "الهندسة",
        slug: "الهندسة",
        description: "قرارات البنية التي تجعل المنتجات قابلة للنمو والاستبدال.",
        seo: createMockSeo(
          "مقالات الهندسة",
          "مقالات عربية حول هندسة تطبيقات الويب وتكاملات الأنظمة.",
        ),
      },
      en: {
        name: "Architecture",
        slug: "architecture",
        description: "Structural decisions that keep products replaceable and ready to grow.",
        seo: createMockSeo(
          "Architecture articles",
          "English articles about web application and integration architecture.",
        ),
      },
    },
  },
];
