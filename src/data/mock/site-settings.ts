import type { SiteSettings } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockSiteSettings: SiteSettings = {
  id: "site-settings-primary",
  identity: {
    email: "hello@portfolio.dev",
    socialLinks: [],
  },
  translations: {
    ar: {
      brandName: "منصة المطوّر",
      brandDescriptor: "بناء الأنظمة وربطها وأتمتتها",
      navigationLabel: "التنقل الرئيسي",
      navigation: [
        { key: "home", label: "الرئيسية", href: "/ar" },
        { key: "work", label: "الأعمال", href: "/ar/work" },
        { key: "blog", label: "المقالات", href: "/ar/blog" },
        { key: "about", label: "عني", href: "/ar/about" },
        { key: "contact", label: "تواصل", href: "/ar/contact" },
      ],
      skipToContentLabel: "انتقل إلى المحتوى",
      languageSwitcherLabel: "اختيار اللغة",
      mobileMenuOpenLabel: "افتح قائمة التنقل",
      mobileMenuCloseLabel: "أغلق قائمة التنقل",
      mobileMenuLabel: "القائمة",
      mobileMenuTitle: "استكشف المنصة",
      primaryCtaLabel: "ابدأ مشروعك",
      footerSummary:
        "منصة ثنائية اللغة لعرض بناء المنتجات الرقمية وربط الواجهات وأتمتة سير العمل.",
      footerNavigationLabel: "روابط التذييل",
      copyrightLabel: "جميع الحقوق محفوظة.",
      seo: createMockSeo(
        "منصة مطوّر لبناء الأنظمة وربطها وأتمتتها",
        "منصة شخصية تقنية تعرض تطبيقات الويب وتكاملات API وأتمتة الأعمال.",
      ),
    },
    en: {
      brandName: "Developer Platform",
      brandDescriptor: "Build, connect, and automate digital systems",
      navigationLabel: "Primary navigation",
      navigation: [
        { key: "home", label: "Home", href: "/en" },
        { key: "work", label: "Work", href: "/en/work" },
        { key: "blog", label: "Blog", href: "/en/blog" },
        { key: "about", label: "About", href: "/en/about" },
        { key: "contact", label: "Contact", href: "/en/contact" },
      ],
      skipToContentLabel: "Skip to content",
      languageSwitcherLabel: "Choose language",
      mobileMenuOpenLabel: "Open navigation menu",
      mobileMenuCloseLabel: "Close navigation menu",
      mobileMenuLabel: "Menu",
      mobileMenuTitle: "Explore the platform",
      primaryCtaLabel: "Start a project",
      footerSummary:
        "A bilingual platform for building digital products, connecting APIs, and automating business workflows.",
      footerNavigationLabel: "Footer navigation",
      copyrightLabel: "All rights reserved.",
      seo: createMockSeo(
        "Developer platform for connected digital systems",
        "A technical personal platform for web applications, API integrations, and business automation.",
      ),
    },
  },
};
