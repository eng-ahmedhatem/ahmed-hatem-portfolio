import type { Homepage } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockHomepage: Homepage = {
  id: "homepage-primary",
  translations: {
    ar: {
      eyebrow: "الأساس العام",
      title: "منصة مطوّر مصممة لتقديم أنظمة رقمية متكاملة.",
      summary:
        "تم إعداد البنية ثنائية اللغة وطبقة المحتوى ومسارات الصفحات. سيُبنى السرد البصري للصفحة الرئيسية في مرحلة مستقلة.",
      seo: createMockSeo(
        "منصة المطوّر — بناء، ربط، أتمتة",
        "منصة تقنية ثنائية اللغة لعرض تطبيقات الويب وتكاملات API وأتمتة الأعمال.",
      ),
    },
    en: {
      eyebrow: "Public foundation",
      title: "A developer platform structured around complete digital systems.",
      summary:
        "The bilingual architecture, content boundary, and public routes are in place. Homepage storytelling will be composed as a separate design task.",
      seo: createMockSeo(
        "Developer Platform — Build, Connect, Automate",
        "A bilingual technical platform for web applications, API integrations, and business automation.",
      ),
    },
  },
  sections: [
    {
      id: "foundation-intro",
      type: "foundation-intro",
      enabled: true,
      order: 0,
      translations: {
        ar: {
          title: "البنية جاهزة للتطوير المرحلي",
          summary:
            "كل قسم قادم سيستهلك محتوى محدد الأنواع عبر مستودع قابل للاستبدال.",
        },
        en: {
          title: "The foundation is ready for deliberate iteration",
          summary:
            "Every future section will consume typed content through a replaceable repository boundary.",
        },
      },
    },
  ],
};
