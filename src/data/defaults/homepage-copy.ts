import type { Homepage, Locale } from "../../domain/content/types";

// Upgrade only exact, previously bundled editorial copy. CMS-authored text stays
// untouched; the same upgrade is exposed in the editor and public repository.
const revisions: Record<Locale, Record<string, string>> = {
  ar: {
    "WordPress · مواقع مخصّصة · أداء سريع": "تصميم وتطوير مواقع لأعمالك",
    "أصمم مواقع ويب\nتعمل بثقة وتنمو بذكاء.": "موقع يعبّر عنك.\nويقرّب عملاءك منك.",
    "أبني تجارب WordPress ومواقع مخصّصة تجمع بين وضوح التصميم، سرعة الأداء، وسهولة الإدارة.": "أساعدك في تقديم خدماتك بوضوح من خلال موقع سريع، مريح على الهاتف، وسهل الإدارة. من تصميم الواجهة إلى تطوير WordPress وربط الأدوات التي يحتاجها عملك.",
    "من الفكرة إلى الإطلاق": "ما الذي تحصل عليه",
    "جاهز للإطلاق": "من الفكرة إلى موقعك",
    "أحوّل فكرة الموقع إلى تجربة واضحة، سريعة، وسهلة الإدارة.": "موقع يخدم عملك،\nوشريك يهتم بالتفاصيل.",
    "أتخصص في WordPress وتطوير المواقع المخصصة، مع عناية بتفاصيل الواجهة والاستجابة والأداء والبنية الجاهزة لـ SEO.": "أنا أحمد حاتم. أبدأ بفهم نشاطك وما يحتاجه عملاؤك، ثم أحوّل ذلك إلى موقع يناسب علامتك ويسهّل الوصول إلى خدماتك. أهتم بسرعة التصفح، وضوح المحتوى، وتسليمك موقعًا تستطيع إدارته بنفسك.",
    "WordPress / Website Development": "عن المطوّر وراء موقعك",
    "تجارب ويب صُمّمت لأعمال حقيقية.": "مواقع تساعد الأعمال على الظهور.",
    "نماذج مختارة تجمع بين هوية واضحة، تنفيذ متجاوب، وتجربة استخدام عملية.": "تعرّف على نماذج من عملي، وما تم تنفيذه في كل مشروع: من مواقع الشركات إلى المتاجر وتجارب الخدمات.",
    "شارك الفكرة والهدف ونطاق المشروع، وسأستخدم التفاصيل لفهم الخطوة الأنسب لبناء موقعك.": "احكِ لي عن نشاطك وما تريد تحقيقه من الموقع. سأراجع التفاصيل وأتواصل معك لمناقشة الحل المناسب ونطاق العمل.",
    "أو تواصل لاحقًا عبر بيانات الاتصال عند إضافتها": "أو تواصل معي مباشرة",
    "جهّز طلب المشروع": "أرسل تفاصيل مشروعك",
  },
  en: {
    "WordPress · Custom websites · Performance": "Web design & development for your business",
    "I design websites\nbuilt to perform and grow.": "Your business, online.\nBuilt around your clients.",
    "I build custom WordPress and web experiences that balance clear design, fast performance, and effortless content management.": "Help clients understand your services with a fast, mobile-friendly website you can manage yourself. I handle the design, WordPress development, and the integrations your business needs.",
    "From structure to launch": "What you get",
    "Ready to launch": "From your idea to your website",
    "I turn a website idea into an experience that is clear, fast, and easy to manage.": "A better website.\nA clear way forward.",
    "I specialize in WordPress and custom website development, with close attention to interface craft, responsive behavior, performance, and SEO-ready structure.": "I’m Ahmed Hatem. I start by understanding your business and your clients, then build a website that fits your brand and makes your services easy to find. Clear content, fast browsing, and a site you can manage yourself come first.",
    "WordPress / Website Development": "Meet the developer behind your website",
    "Web experiences built for real businesses.": "Websites that put businesses in focus.",
    "Selected projects combining clear identity, responsive execution, and practical user experience.": "Explore selected work and what went into each build, from company websites to online stores and service experiences.",
    "Share the idea, goals, and project scope. I’ll use the details to understand the right next step for your website.": "Tell me about your business and what you want your website to achieve. I’ll review your brief and get in touch to discuss the right approach and scope.",
    "Or use direct contact details when they are added": "Or contact me directly",
    "Prepare project request": "Send your project brief",
  },
};

function updateKnownCopy<T>(value: T, locale: Locale): T {
  if (typeof value === "string") return (revisions[locale][value] ?? value) as T;
  if (Array.isArray(value)) return value.map((item) => updateKnownCopy(item, locale)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, updateKnownCopy(item, locale)])) as T;
  return value;
}

const oldCapabilities: Record<Locale, readonly string[]> = {
  ar: ["WordPress", "تطوير مخصص", "Responsive", "Performance", "SEO"],
  en: ["WordPress", "Custom build", "Responsive", "Performance", "SEO"],
};
const benefits: Record<Locale, readonly string[]> = {
  ar: ["تصميم يناسب علامتك", "تجربة مريحة على الهاتف", "إدارة محتوى سهلة"],
  en: ["Design that fits your brand", "Made for mobile", "Easy content updates"],
};
const supportingServices: Record<Locale, readonly string[]> = {
  ar: ["تطوير مواقع مخصّصة", "ربط الخدمات", "أتمتة المهام"],
  en: ["Custom development", "Connected services", "Workflow automation"],
};

export function withHomepageCopyDefaults(homepage: Homepage): Homepage {
  return {
    ...homepage,
    translations: Object.fromEntries(Object.entries(homepage.translations).map(([key, original]) => {
      const locale = key as Locale;
      const copy = updateKnownCopy(original, locale);
      return [locale, {
        ...copy,
        hero: { ...copy.hero, capabilities: JSON.stringify(original.hero.capabilities) === JSON.stringify(oldCapabilities[locale]) ? benefits[locale] : copy.hero.capabilities },
        about: { ...copy.about, secondarySkills: JSON.stringify(original.about.secondarySkills) === JSON.stringify(["MERN", "API Integrations", "Automation"]) ? supportingServices[locale] : copy.about.secondarySkills },
      }];
    })),
    sections: homepage.sections.map((section) => ({ ...section, translations: Object.fromEntries(Object.entries(section.translations).map(([key, copy]) => [key, updateKnownCopy(copy, key as Locale)])) })),
  };
}
