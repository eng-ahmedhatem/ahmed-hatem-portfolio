import type { StaticPage } from "@/domain/content/types";

import { createMockSeo } from "./seo";

export const mockStaticPages: readonly StaticPage[] = [
  {
    id: "page-work",
    key: "work",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: { eyebrow: "أعمال مختارة", title: "مواقع صُممت لتعمل، لا لتكتفي بالظهور.", summary: "تجارب ويب منتقاة تجمع وضوح الفكرة، دقة التنفيذ، وتجربة استخدام تخدم هدف المشروع.", body: [], seo: createMockSeo("مشاريع أحمد حاتم", "مشروعات مواقع ويب موثقة بصورها الأصلية.", "CollectionPage") },
      en: { eyebrow: "Selected work", title: "Websites designed to work, not merely look the part.", summary: "A selection of web experiences where a clear idea, precise execution, and useful interaction work as one.", body: [], seo: createMockSeo("Ahmed Hatem projects", "Documented website projects using their supplied imagery.", "CollectionPage") },
    },
  },
  {
    id: "page-blog",
    key: "blog",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: { eyebrow: "المدونة", title: "ملاحظات عملية من داخل بناء المواقع.", summary: "WordPress، الأداء، وهندسة المحتوى بلغة تربط القرار التقني بتجربة الموقع.", body: [], seo: createMockSeo("مدونة أحمد حاتم", "مقالات عن WordPress وأداء وهندسة مواقع الويب.", "CollectionPage") },
      en: { eyebrow: "Blog", title: "Practical notes from inside the website build.", summary: "WordPress, performance, and content architecture explained through the decisions that shape the experience.", body: [], seo: createMockSeo("Ahmed Hatem blog", "Articles about WordPress, performance, and web architecture.", "CollectionPage") },
    },
  },
  {
    id: "page-about",
    key: "about",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: {
        eyebrow: "عني",
        title: "خمسة أعوام أتعامل فيها مع الموقع كمنتج كامل.",
        summary: "أنا أحمد حاتم، مطوّر WordPress ومواقع ويب أركز على البناء المخصص وجودة الواجهة والأداء.",
        body: [
          { id: "about-ar-1", type: "heading", level: 2, text: "WordPress أولًا، والأداة تخدم المشروع" },
          { id: "about-ar-2", type: "paragraph", text: "أتخصص في بناء مواقع WordPress وحلول مواقع مخصصة تتعامل مع المحتوى والتحرير والاستجابة والأداء كنظام واحد." },
          { id: "about-ar-3", type: "paragraph", text: "أهتم بتحويل التصميم إلى واجهة دقيقة وسهلة الاستخدام، مع بنية دلالية وتهيئة تقنية تجعل الموقع جاهزًا لـ SEO من البداية." },
          { id: "about-ar-4", type: "heading", level: 2, text: "قدرات إضافية عند الحاجة" },
          { id: "about-ar-5", type: "paragraph", text: "خبرة MERN تساعدني عندما يحتاج المشروع منطق تطبيق أو مكونات مخصصة، بينما تتيح تكاملات API ربط الموقع بخدمات أخرى. أستخدم معرفة الأتمتة كطبقة داعمة لما يحدث خلف الموقع." },
          { id: "about-ar-6", type: "list", items: ["تطوير WordPress مخصص", "تنفيذ واجهات متجاوبة", "تحسين الأداء", "بنية SEO جاهزة", "حلول MERN عند الحاجة", "تكاملات API"] },
        ],
        seo: createMockSeo("عن أحمد حاتم", "خمسة أعوام من تطوير WordPress والمواقع المخصصة.", "ProfilePage"),
      },
      en: {
        eyebrow: "About",
        title: "Five years treating the website as a complete product.",
        summary: "I’m Ahmed Hatem, a WordPress and web developer focused on custom builds, interface craft, and performance.",
        body: [
          { id: "about-en-1", type: "heading", level: 2, text: "WordPress first, with the tool serving the project" },
          { id: "about-en-2", type: "paragraph", text: "I specialize in WordPress and custom website solutions that treat content, editing, responsiveness, and performance as one system." },
          { id: "about-en-3", type: "paragraph", text: "I care about translating design into precise, usable interfaces with semantic structure and a technical foundation that is SEO-ready from the start." },
          { id: "about-en-4", type: "heading", level: 2, text: "Additional capability when the project needs it" },
          { id: "about-en-5", type: "paragraph", text: "MERN experience supports projects that need application logic or custom interface systems, while API integrations connect the website to other services. Automation remains a supporting layer behind the website." },
          { id: "about-en-6", type: "list", items: ["Custom WordPress development", "Responsive UI implementation", "Performance engineering", "SEO-ready structure", "MERN solutions when needed", "API integrations"] },
        ],
        seo: createMockSeo("About Ahmed Hatem", "Five years of WordPress and custom website development.", "ProfilePage"),
      },
    },
  },
  {
    id: "page-contact",
    key: "contact",
    updatedAt: "2026-08-14T00:00:00.000Z",
    translations: {
      ar: { eyebrow: "تواصل", title: "ابدأ طلب موقعك من نطاق واضح.", summary: "صف المشروع والخدمة والأولويات التي تفكر فيها ليبدأ الطلب بملخص عملي ومفيد.", body: [], seo: createMockSeo("تواصل مع أحمد حاتم", "ابدأ طلب مشروع WordPress أو موقع ويب مخصص.") },
      en: { eyebrow: "Contact", title: "Start your website request with a clear scope.", summary: "Describe the project, service, and priorities you have in mind so the request starts with a useful brief.", body: [], seo: createMockSeo("Contact Ahmed Hatem", "Start a WordPress or custom website project request.") },
    },
  },
];
