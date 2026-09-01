import type { BlogPost } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockPosts: readonly BlogPost[] = [
  {
    id: "post-wordpress-custom-build",
    authorId: "site-owner",
    categoryIds: ["category-wordpress"],
    tags: ["WordPress", "Custom Development"],
    status: "published",
    featured: true,
    featuredImage: {
      id: "blog-cover-wordpress-custom-build",
      src: "/assets/blog/wordpress-custom-build.svg",
      width: 1600,
      height: 1000,
      translations: {
        ar: { alt: "رسم تقني لنواة WordPress مرتبطة بمكونات موقع مخصص" },
        en: { alt: "Technical illustration of a WordPress core connected to custom website components" },
      },
    },
    publishedAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
    translations: {
      ar: {
        title: "متى يحتاج موقع WordPress إلى بناء مخصص؟",
        slug: "متى-يحتاج-ووردبريس-إلى-بناء-مخصص",
        excerpt: "الفرق بين تركيب قالب وبين بناء نظام محتوى وواجهة يخدمان المشروع على المدى الطويل.",
        content: [
          { id: "ar-wp-p1", type: "paragraph", text: "البناء المخصص لا يعني تعقيد WordPress. معناه أن تبدأ من المحتوى والمهام الفعلية التي يحتاجها الفريق، ثم تصمم القوالب والمكونات حولها." },
          { id: "ar-wp-h2", type: "heading", level: 2, text: "ابدأ من بنية المحتوى" },
          { id: "ar-wp-p2", type: "paragraph", text: "عندما تكون أنواع المحتوى والعلاقات ومسارات التحرير واضحة، يصبح تصميم الواجهة أدق ويظل الموقع سهل الإدارة بعد الإطلاق." },
          { id: "ar-wp-list", type: "list", items: ["قوالب تناسب نوع المحتوى", "مكونات تحرير محددة وواضحة", "أداء محسوب بدل إضافات متراكمة", "مسار نمو لا يعتمد على قالب مغلق"] },
          { id: "ar-wp-h3", type: "heading", level: 2, text: "التخصيص الجيد يقلل الفوضى" },
          { id: "ar-wp-p3", type: "paragraph", text: "الهدف ليس كتابة أكبر قدر من الكود؛ الهدف حذف ما لا يحتاجه المشروع وجعل ما يحتاجه واضحًا ومستقرًا." },
        ],
        seo: createMockSeo("متى يحتاج WordPress إلى بناء مخصص؟", "دليل عملي لفهم قيمة تطوير WordPress المخصص.", "BlogPosting"),
      },
      en: {
        title: "When does a WordPress website need a custom build?",
        slug: "when-wordpress-needs-a-custom-build",
        excerpt: "The difference between installing a theme and building a content and interface system that serves the project long term.",
        content: [
          { id: "en-wp-p1", type: "paragraph", text: "A custom build does not have to make WordPress complicated. It starts with the content and jobs the team actually needs, then shapes templates and components around them." },
          { id: "en-wp-h2", type: "heading", level: 2, text: "Start with content structure" },
          { id: "en-wp-p2", type: "paragraph", text: "Clear content types, relationships, and editorial flows lead to a more precise interface and a website the team can still manage after launch." },
          { id: "en-wp-list", type: "list", items: ["Templates shaped around content", "Purposeful editing components", "Measured performance instead of plugin accumulation", "A growth path that is not locked to a theme"] },
          { id: "en-wp-h3", type: "heading", level: 2, text: "Good customization removes noise" },
          { id: "en-wp-p3", type: "paragraph", text: "The goal is not to write the most code. It is to remove what the project does not need and make the necessary parts clear and durable." },
        ],
        seo: createMockSeo("When WordPress needs a custom build", "A practical guide to the value of custom WordPress development.", "BlogPosting"),
      },
    },
  },
  {
    id: "post-performance-before-polish",
    authorId: "site-owner",
    categoryIds: ["category-performance"],
    tags: ["Performance", "Core Web Vitals", "Responsive"],
    status: "published",
    featuredImage: {
      id: "blog-cover-performance",
      src: "/assets/blog/performance-budget.svg",
      width: 1600,
      height: 1000,
      translations: {
        ar: { alt: "رسم تقني لمؤشرات أداء وسرعة واجهة ويب" },
        en: { alt: "Technical illustration of web performance and speed indicators" },
      },
    },
    publishedAt: "2026-08-08T00:00:00.000Z",
    updatedAt: "2026-08-08T00:00:00.000Z",
    translations: {
      ar: {
        title: "الأداء ليس مرحلة تنظيف أخيرة",
        slug: "الأداء-ليس-مرحلة-أخيرة",
        excerpt: "السرعة نتيجة قرارات مبكرة في الصور والخطوط وحدود JavaScript وتكوين الصفحة.",
        content: [
          { id: "ar-perf-p1", type: "paragraph", text: "يصعب إصلاح موقع ثقيل في نهاية المشروع لأن أكثر مشكلات الأداء تبدأ من قرارات التصميم والبنية، لا من رقم داخل تقرير." },
          { id: "ar-perf-h2", type: "heading", level: 2, text: "صمّم ضمن ميزانية أداء" },
          { id: "ar-perf-p2", type: "paragraph", text: "حجم الصور وعدد أوزان الخطوط وحدود المكونات التفاعلية يجب أن تكون قرارات مرئية في التصميم والتنفيذ معًا." },
          { id: "ar-perf-quote", type: "quote", text: "الموقع السريع لا يبدو أقل جودة؛ الاستجابة نفسها جزء من الإحساس بالجودة." },
          { id: "ar-perf-list", type: "list", items: ["صور بالحجم المناسب لكل شاشة", "مكونات خادم للمحتوى الثابت", "حركة تعتمد على transform وopacity", "تحميل متأخر لما لا يظهر في البداية"] },
        ],
        seo: createMockSeo("الأداء ليس مرحلة أخيرة", "كيف تُبنى سرعة الموقع ضمن قرارات التصميم والتطوير.", "BlogPosting"),
      },
      en: {
        title: "Performance is not a final cleanup pass",
        slug: "performance-is-not-a-final-pass",
        excerpt: "Speed is the result of early decisions about imagery, fonts, JavaScript boundaries, and page composition.",
        content: [
          { id: "en-perf-p1", type: "paragraph", text: "A heavy website is difficult to repair at the end because most performance problems begin in design and architecture decisions—not in a report score." },
          { id: "en-perf-h2", type: "heading", level: 2, text: "Design within a performance budget" },
          { id: "en-perf-p2", type: "paragraph", text: "Image sizes, font weights, and interactive component boundaries should be visible decisions across both design and implementation." },
          { id: "en-perf-quote", type: "quote", text: "A fast website does not feel less premium. Responsiveness is part of the quality." },
          { id: "en-perf-list", type: "list", items: ["Right-sized imagery per viewport", "Server components for static content", "Transform and opacity based motion", "Deferred loading below the first view"] },
        ],
        seo: createMockSeo("Performance is not a final pass", "How website speed is designed into the project from the start.", "BlogPosting"),
      },
    },
  },
  {
    id: "post-content-architecture-first",
    authorId: "site-owner",
    categoryIds: ["category-architecture"],
    tags: ["Architecture", "Content", "API"],
    status: "published",
    featuredImage: {
      id: "blog-cover-content-contracts",
      src: "/assets/blog/content-contracts.svg",
      width: 1600,
      height: 1000,
      translations: {
        ar: { alt: "رسم شبكي يوضح اتصال الواجهة بعقود المحتوى ومصدر البيانات" },
        en: { alt: "Network illustration showing an interface connected to content contracts and a data source" },
      },
    },
    publishedAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    translations: {
      ar: {
        title: "لماذا تبدأ المنصة من عقود المحتوى",
        slug: "لماذا-تبدأ-المنصة-من-عقود-المحتوى",
        excerpt: "فصل العرض عن مصدر البيانات يجعل الموقع جاهزًا للانتقال من المحتوى المحلي إلى API من دون إعادة بناء الواجهة.",
        content: [
          { id: "ar-arch-p1", type: "paragraph", text: "عندما تستقبل المكونات بيانات محددة الأنواع من طبقة واضحة، يمكن تغيير مصدر المحتوى من مستودع محلي إلى API من دون نقل هذه التفاصيل إلى واجهة العرض." },
          { id: "ar-arch-h2", type: "heading", level: 2, text: "واجهة واحدة، مصادر قابلة للاستبدال" },
          { id: "ar-arch-p2", type: "paragraph", text: "العقد يحمي المكونات من معرفة ما إذا جاءت البيانات من ملف محلي أو CMS أو خدمة مستقلة. هذا يقلل تكلفة المرحلة التالية ويحافظ على قابلية الاختبار." },
          { id: "ar-arch-code", type: "code", language: "text", code: "UI → View Model → Content Repository → Data Source" },
        ],
        seo: createMockSeo("ابدأ من عقود المحتوى", "مقال عن فصل واجهة العرض عن مستودع المحتوى.", "BlogPosting"),
      },
      en: {
        title: "Why the platform starts with content contracts",
        slug: "why-the-platform-starts-with-content-contracts",
        excerpt: "Separating presentation from its data source lets a site move from local content to an API without rebuilding the interface.",
        content: [
          { id: "en-arch-p1", type: "paragraph", text: "When components receive typed data through a clear boundary, the content source can move from a local repository to an API without leaking those details into presentation." },
          { id: "en-arch-h2", type: "heading", level: 2, text: "One interface, replaceable sources" },
          { id: "en-arch-p2", type: "paragraph", text: "The contract keeps components unaware of whether data comes from a fixture, CMS, or independent service. That lowers the cost of the next phase and keeps the system testable." },
          { id: "en-arch-code", type: "code", language: "text", code: "UI → View Model → Content Repository → Data Source" },
        ],
        seo: createMockSeo("Start with content contracts", "An article about separating presentation from the content repository.", "BlogPosting"),
      },
    },
  },
];
