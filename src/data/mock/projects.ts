import type { Project } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockProjects: readonly Project[] = [
  {
    id: "project-automation-platform",
    year: 2026,
    technologies: ["Next.js", "Node.js", "REST API", "n8n"],
    featured: true,
    featuredOrder: 1,
    links: [],
    media: [],
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        title: "نموذج منصة أتمتة",
        slug: "منصة-الأتمتة",
        excerpt:
          "نموذج محتوى تأسيسي يوضح كيف ستُقدّم دراسات الحالة المترجمة عبر طبقة البيانات.",
        overview:
          "هذه صفحة هيكلية لا تدّعي مشروع عميل منشور، وتُستخدم للتحقق من المسارات والعقود ثنائية اللغة.",
        challenge: "فصل السرد المحلي عن البيانات التقنية المشتركة.",
        solution: "عقود ترجمة صريحة ومستودع محتوى واعٍ باللغة.",
        process: ["تعريف العقود", "حل الترجمة", "تمرير نموذج العرض"],
        architecture: "واجهة عرض ← نموذج عرض ← مستودع محتوى.",
        automation: "ستُضاف تجارب الأتمتة الفعلية في مهمة لاحقة.",
        results: ["مسار عربي مستقل", "حالة ترجمة صريحة"],
        role: "نموذج بنية المحتوى",
        industry: "عرض تقني",
        seo: createMockSeo(
          "نموذج منصة أتمتة | الأعمال",
          "صفحة هيكلية عربية لاختبار دراسة الحالة ومسارات المحتوى المحلية.",
        ),
      },
      en: {
        title: "Automation platform model",
        slug: "automation-platform",
        excerpt:
          "A foundation content model showing how translated case studies will flow through the data layer.",
        overview:
          "This is an architecture fixture, not a published client claim. It verifies bilingual routes and content contracts.",
        challenge: "Separate localized narrative from shared technical data.",
        solution: "Explicit translation contracts and a locale-aware content repository.",
        process: ["Define contracts", "Resolve translation", "Pass the view model"],
        architecture: "View → view model → content repository.",
        automation: "Real automation demonstrations will be added in a later task.",
        results: ["Independent English route", "Explicit translation state"],
        role: "Content architecture fixture",
        industry: "Technical demonstration",
        seo: createMockSeo(
          "Automation platform model | Work",
          "An English case-study shell for validating localized routes and content contracts.",
        ),
      },
    },
  },
];
