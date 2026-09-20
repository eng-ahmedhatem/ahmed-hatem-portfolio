import type { Homepage, TestimonialsSettings } from "../../domain/content/types";

export const defaultTestimonials: TestimonialsSettings = {
  enabled: true,
  translations: {
    ar: { eyebrow: "من تجربة العمل معًا", title: "الكلمة لأصحاب التجربة.", summary: "آراء من تعاونت معهم في بناء مواقعهم ومنتجاتهم الرقمية.", sourceLabel: "مصدر الرأي" },
    en: { eyebrow: "Working together", title: "In their own words.", summary: "Perspectives from the people behind the websites and digital products we built together.", sourceLabel: "Read the original" },
  },
};

export function withTestimonialsDefaults(homepage: Homepage): Homepage {
  return { ...homepage, testimonials: homepage.testimonials ?? defaultTestimonials };
}
