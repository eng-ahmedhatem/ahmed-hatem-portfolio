import type { StaticPage } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockStaticPages: readonly StaticPage[] = [
  {
    id: "page-work",
    key: "work",
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        eyebrow: "الأعمال",
        title: "دراسات حالة تشرح النظام، لا شكله فقط.",
        summary:
          "سيعرض الأرشيف مشكلات حقيقية وقرارات البنية والتكامل والأتمتة والنتائج الموثقة.",
        body: [],
        seo: createMockSeo(
          "الأعمال ودراسات الحالة",
          "دراسات حالة عربية لتطبيقات الويب والتكاملات وسير العمل المؤتمت.",
        ),
      },
      en: {
        eyebrow: "Selected work",
        title: "Case studies that explain the system, not only its surface.",
        summary:
          "The archive will document real problems, architecture choices, integrations, automation, and verified outcomes.",
        body: [],
        seo: createMockSeo(
          "Work and case studies",
          "English case studies for web applications, integrations, and automated workflows.",
        ),
      },
    },
  },
  {
    id: "page-blog",
    key: "blog",
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        eyebrow: "المقالات",
        title: "ملاحظات عملية حول بناء الأنظمة الرقمية.",
        summary:
          "مقالات عن هندسة الويب وتكاملات API وWordPress المتقدم وأتمتة الأعمال.",
        body: [],
        seo: createMockSeo(
          "مقالات هندسة الويب والأتمتة",
          "مقالات عربية حول تطبيقات الويب وتكاملات API وWordPress والأتمتة.",
        ),
      },
      en: {
        eyebrow: "Writing",
        title: "Practical notes on building connected digital systems.",
        summary:
          "Articles about web architecture, API integrations, advanced WordPress, and business automation.",
        body: [],
        seo: createMockSeo(
          "Web architecture and automation articles",
          "English articles about web applications, API integrations, WordPress, and automation.",
        ),
      },
    },
  },
  {
    id: "page-about",
    key: "about",
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        eyebrow: "عن المنصة",
        title: "مطور يبني أنظمة رقمية كاملة، لا واجهات منفصلة.",
        summary:
          "ستعرض هذه الصفحة الخبرة والرؤية والأدلة بعد اعتماد محتواها النهائي.",
        body: [],
        seo: createMockSeo(
          "عن المطوّر",
          "تعرف على منهج بناء تطبيقات الويب والتكاملات والأتمتة.",
          "ProfilePage",
        ),
      },
      en: {
        eyebrow: "About the platform",
        title: "A developer focused on complete digital systems, not isolated screens.",
        summary:
          "This page will present experience, point of view, and proof once its final content is approved.",
        body: [],
        seo: createMockSeo(
          "About the developer",
          "Learn about the approach to web applications, integrations, and automation.",
          "ProfilePage",
        ),
      },
    },
  },
  {
    id: "page-contact",
    key: "contact",
    updatedAt: "2026-08-09T00:00:00.000Z",
    translations: {
      ar: {
        eyebrow: "تواصل",
        title: "لنبدأ من المشكلة التي يحتاج نظامك إلى حلها.",
        summary:
          "سيُضاف نموذج التواصل وتجربة إرسال الطلب في مهمة مستقلة بعد اعتماد متطلبات التحويل.",
        body: [],
        seo: createMockSeo(
          "تواصل مع المطوّر",
          "ابدأ محادثة حول تطبيق ويب أو تكامل API أو سير عمل مؤتمت.",
        ),
      },
      en: {
        eyebrow: "Contact",
        title: "Start with the problem your system needs to solve.",
        summary:
          "The contact form and lead-submission experience will be added after conversion requirements are approved.",
        body: [],
        seo: createMockSeo(
          "Contact the developer",
          "Start a conversation about a web application, API integration, or automated workflow.",
        ),
      },
    },
  },
];
