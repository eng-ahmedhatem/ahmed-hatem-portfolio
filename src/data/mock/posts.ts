import type { BlogPost } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockPosts: readonly BlogPost[] = [
  {
    id: "post-architecture-first",
    authorId: "site-owner",
    categoryIds: ["category-architecture"],
    status: "published",
    publishedAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        title: "لماذا تبدأ منصة المطوّر من بنية المحتوى",
        slug: "بنية-منصة-المطور",
        excerpt:
          "مقال تأسيسي قصير يوضح سبب فصل واجهة العرض عن مصدر المحتوى.",
        content: [
          {
            id: "ar-p1",
            type: "paragraph",
            text: "عندما تستقبل المكوّنات محتوى محدد الأنواع، يمكن تغيير مصدر البيانات من نموذج محلي إلى API من دون إعادة بناء الواجهة.",
          },
        ],
        seo: createMockSeo(
          "بنية المحتوى أولاً | المقالات",
          "مقال عربي عن فصل واجهة العرض عن مستودع المحتوى.",
          "Article",
        ),
      },
      en: {
        title: "Why the developer platform starts with content architecture",
        slug: "architecture-first-portfolio",
        excerpt:
          "A short foundation article explaining why presentation and content sources stay separate.",
        content: [
          {
            id: "en-p1",
            type: "paragraph",
            text: "When components receive typed content, the source can move from local fixtures to an API without rebuilding the interface.",
          },
        ],
        seo: createMockSeo(
          "Content architecture first | Blog",
          "An English article about separating presentation from the content repository.",
          "Article",
        ),
      },
    },
  },
];
