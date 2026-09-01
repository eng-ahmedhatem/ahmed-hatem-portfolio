import type { MediaAsset, Project } from "@/domain/content/types";

import { createMockSeo } from "./seo";

function localizedMedia(
  id: string,
  src: string,
  width: number,
  height: number,
  arAlt: string,
  enAlt: string,
): MediaAsset {
  return {
    id,
    src,
    width,
    height,
    translations: {
      ar: { alt: arAlt },
      en: { alt: enAlt },
    },
  };
}

export const mockProjects: readonly Project[] = [
  {
    id: "project-ranova-arte-jazeera",
    status: "published",
    technologies: [],
    filterKey: "company-website",
    featured: true,
    featuredOrder: 1,
    links: [],
    coverMediaId: "ranova-cover",
    media: [
      localizedMedia(
        "ranova-cover",
        "/assets/projects/project-01/cover.png",
        1920,
        1536,
        "الواجهة الرئيسية لموقع RANova Arte Jazeera داخل إطار متصفح",
        "RANova Arte Jazeera homepage shown in a browser frame",
      ),
      localizedMedia("ranova-services", "/assets/projects/project-01/01.png", 1920, 1536, "صفحة خدمات RANova Arte Jazeera", "RANova Arte Jazeera services page"),
      localizedMedia("ranova-selected-work", "/assets/projects/project-01/02.png", 1920, 1536, "قسم الأعمال المختارة في موقع RANova Arte Jazeera", "Selected work section on the RANova Arte Jazeera website"),
      localizedMedia("ranova-projects", "/assets/projects/project-01/03.png", 1920, 1536, "أرشيف مشاريع RANova Arte Jazeera", "RANova Arte Jazeera project archive"),
      localizedMedia("ranova-project-detail", "/assets/projects/project-01/04.png", 1920, 1536, "صفحة تفاصيل مشروع في موقع RANova Arte Jazeera", "Project detail page on the RANova Arte Jazeera website"),
      localizedMedia("ranova-about", "/assets/projects/project-01/05.png", 1920, 1536, "قسم التعريف بشركة RANova Arte Jazeera", "RANova Arte Jazeera company profile section"),
      localizedMedia("ranova-mobile", "/assets/projects/project-01/06.png", 1920, 1536, "الواجهة الرئيسية لموقع RANova Arte Jazeera على الهاتف", "RANova Arte Jazeera mobile homepage"),
    ],
    translations: {
      ar: {
        title: "RANova Arte Jazeera",
        slug: "رانوفا-آرت-الجزيرة",
        excerpt: "موقع شركة بتركيب بصري داكن يعرض الخدمات والمشاريع وتجربة هاتف مكتملة.",
        overview: "تكشف لقطات المشروع عن موقع شركة متعدد الصفحات يضم الخدمات وأرشيف الأعمال وصفحات التفاصيل والتعريف بالشركة، مع نسخة هاتف واضحة.",
        projectType: "موقع شركة",
        filterLabel: "مواقع الشركات",
        seo: createMockSeo(
          "RANova Arte Jazeera | أعمال أحمد حاتم",
          "عرض موقع RANova Arte Jazeera من الواجهة الرئيسية حتى أرشيف المشاريع وتجربة الهاتف.",
          "CreativeWork",
          { url: "/assets/projects/project-01/cover.png", width: 1920, height: 1536, alt: "واجهة موقع RANova Arte Jazeera" },
        ),
      },
      en: {
        title: "RANova Arte Jazeera",
        slug: "ranova-arte-jazeera",
        excerpt: "A dark, image-led company website spanning services, project discovery, detail views, and a complete mobile experience.",
        overview: "The supplied project captures show a multi-page company website with services, a work archive, project detail views, a company profile, and a considered mobile composition.",
        projectType: "Company website",
        filterLabel: "Company websites",
        seo: createMockSeo(
          "RANova Arte Jazeera | Ahmed Hatem work",
          "Explore the RANova Arte Jazeera website across its homepage, services, project archive, detail views, and mobile experience.",
          "CreativeWork",
          { url: "/assets/projects/project-01/cover.png", width: 1920, height: 1536, alt: "RANova Arte Jazeera website homepage" },
        ),
      },
    },
    updatedAt: "2026-08-14T00:00:00.000Z",
  },
  {
    id: "project-assile-france",
    status: "published",
    technologies: [],
    filterKey: "service-website",
    featured: true,
    featuredOrder: 2,
    links: [],
    coverMediaId: "assile-cover",
    media: [
      localizedMedia(
        "assile-cover",
        "/assets/projects/project-02/cover.png",
        1920,
        1280,
        "الواجهة الرئيسية لموقع ASSILE داخل إطار متصفح",
        "ASSILE homepage shown in a browser frame",
      ),
      localizedMedia("assile-project", "/assets/projects/project-02/01.png", 1920, 1280, "معرض مشروع تشطيبات داخل موقع ASSILE", "Interior finishing project gallery on the ASSILE website"),
      localizedMedia("assile-detail", "/assets/projects/project-02/02.png", 1920, 1280, "صفحة تفاصيل مشروع في موقع ASSILE", "ASSILE project detail page"),
      localizedMedia("assile-dark", "/assets/projects/project-02/03.png", 1920, 1280, "نسخة داكنة من الواجهة الرئيسية لموقع ASSILE", "Dark homepage presentation of the ASSILE website"),
      localizedMedia("assile-faq", "/assets/projects/project-02/04.png", 1920, 1280, "صفحة الأسئلة المتكررة في موقع ASSILE", "ASSILE frequently asked questions page"),
      localizedMedia("assile-archive", "/assets/projects/project-02/05.png", 1920, 1280, "أرشيف مشروعات ASSILE", "ASSILE project archive"),
    ],
    translations: {
      ar: {
        title: "ASSILE France",
        slug: "أسيل-فرنسا",
        excerpt: "موقع خدمات فرنسي يجمع تقديم الخدمة وأرشيف المشروعات وصفحات التفاصيل والأسئلة المتكررة.",
        overview: "توضح اللقطات موقع خدمات متكاملًا بواجهات للمشروعات الفردية، ومعارض صور، وأرشيف للأعمال، ومحتوى أسئلة متكررة.",
        projectType: "موقع خدمات",
        filterLabel: "مواقع الخدمات",
        seo: createMockSeo(
          "ASSILE France | أعمال أحمد حاتم",
          "عرض موقع ASSILE France عبر الواجهة الرئيسية وصفحات المشاريع والمعرض والأسئلة المتكررة.",
          "CreativeWork",
          { url: "/assets/projects/project-02/cover.png", width: 1920, height: 1280, alt: "واجهة موقع ASSILE France" },
        ),
      },
      en: {
        title: "ASSILE France",
        slug: "assile-france",
        excerpt: "A French service website connecting service discovery with project archives, detailed galleries, and practical FAQs.",
        overview: "The supplied captures document a complete service website with individual project pages, image galleries, a work archive, and an FAQ experience.",
        projectType: "Service website",
        filterLabel: "Service websites",
        seo: createMockSeo(
          "ASSILE France | Ahmed Hatem work",
          "Explore the ASSILE France website across its homepage, project pages, gallery, archive, and FAQ experience.",
          "CreativeWork",
          { url: "/assets/projects/project-02/cover.png", width: 1920, height: 1280, alt: "ASSILE France website homepage" },
        ),
      },
    },
    updatedAt: "2026-08-14T00:00:00.000Z",
  },
];
