import type { Employment, SiteSettings } from "../../domain/content/types";

// Explicitly supplied by the portfolio owner. Never assigns ownership of projects.
export const defaultEmployment: Employment = {
  enabled: true,
  url: "https://www.arbiseo.com/",
  translations: {
    ar: {
      label: "أعمل حاليًا لدى",
      role: "خبير تطوير الويب",
      company: "عربي سيو للتسويق الإلكتروني",
      description: "أساهم ضمن فريق عربي سيو في تطوير مواقع الويب. أُوضّح مساهمتي وجهة التنفيذ في كل مشروع يُعرض من أعمال الفريق، مع حفظ حقوق الشركة وأصحاب المشاريع.",
    },
    en: {
      label: "Currently working at",
      role: "Web Development Expert",
      company: "Arbi SEO Digital Marketing",
      description: "I contribute to web development as part of the Arbi SEO team. Team projects shown here identify my contribution and the agency, with credit to the company and project owners.",
    },
  },
};

export function withEmploymentDefaults(settings: SiteSettings): SiteSettings {
  return { ...settings, identity: { ...settings.identity, employment: settings.identity.employment ?? defaultEmployment } };
}
