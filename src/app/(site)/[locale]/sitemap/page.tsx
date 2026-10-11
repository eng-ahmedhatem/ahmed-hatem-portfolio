import type { Metadata } from "next";

import type { Locale } from "@/domain/content/types";
import { getSitemapViewModel } from "@/features/site/sitemap-view";
import { getLocaleSitemapPath } from "@/lib/i18n/config";
import { localeFromParam } from "@/lib/i18n/locale-param";

import styles from "./sitemap.module.css";

interface Props {
  params: Promise<{ locale: string }>;
}

const copy = {
  ar: {
    eyebrow: "دليل الموقع / SITE DIRECTORY",
    title: "خريطة الموقع",
    intro: "كل ما نُشر هنا، مرتب لتصل إلى ما تبحث عنه مباشرة.",
    count: "رابط منشور",
    xml: "ملف XML لمحركات البحث",
    visit: "زيارة الصفحة",
    updated: "آخر تحديث",
    sections: { pages: "البداية", work: "الأعمال", blog: "المدونة", categories: "التصنيفات", contact: "التواصل" },
    kinds: { project: "مشروع", post: "مقال", category: "تصنيف" },
  },
  en: {
    eyebrow: "SITE DIRECTORY / خريطة الموقع",
    title: "Site map",
    intro: "Everything published here, arranged so you can find it at a glance.",
    count: "published links",
    xml: "XML file for search engines",
    visit: "Visit page",
    updated: "Updated",
    sections: { pages: "Start here", work: "Selected work", blog: "Journal", categories: "Topics", contact: "Get in touch" },
    kinds: { project: "Project", post: "Article", category: "Category" },
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeFromParam((await params).locale);
  return {
    title: `${copy[locale].title} | Ahmed Hatem`,
    description: copy[locale].intro,
    robots: { index: false, follow: true },
  };
}

export default async function SitemapPage({ params }: Props) {
  const locale = localeFromParam((await params).locale);
  const text = copy[locale];
  const { sections, total } = await getSitemapViewModel(locale);
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.container}>
        <div className={styles.topline}>
          <span>{text.eyebrow}</span>
          <div className={styles.topActions}>
            <a href={getLocaleSitemapPath(otherLocale)} hrefLang={otherLocale} lang={otherLocale}>
              {otherLocale === "ar" ? "العربية" : "English"}
            </a>
            <a href="/sitemap.xml">{text.xml}</a>
          </div>
        </div>

        <header className={styles.intro}>
          <div>
            <h1>{text.title}</h1>
            <p>{text.intro}</p>
          </div>
          <div className={styles.total} aria-label={`${total} ${text.count}`}>
            <strong>{String(total).padStart(2, "0")}</strong>
            <span>{text.count}</span>
          </div>
        </header>

        <div className={styles.sections}>
          {sections.map((section, sectionIndex) => (
            <section className={styles.section} key={section.id} aria-labelledby={`sitemap-${section.id}`}>
              <div className={styles.sectionHeading}>
                <span className={styles.sectionIndex}>{String(sectionIndex + 1).padStart(2, "0")}</span>
                <h2 id={`sitemap-${section.id}`}>{text.sections[section.id]}</h2>
                <span className={styles.sectionCount}>{String(section.items.length).padStart(2, "0")}</span>
              </div>
              <ol className={styles.linkList}>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <a className={styles.link} href={item.href}>
                      <span className={styles.linkMain}>
                        <span className={styles.linkTitle}>{item.title}</span>
                        <span className={styles.linkPath} dir="ltr">{item.href}</span>
                      </span>
                      <span className={styles.linkMeta}>
                        {item.kind in text.kinds && (
                          <span className={styles.kind}>
                            {text.kinds[item.kind as keyof typeof text.kinds]}
                          </span>
                        )}
                        {item.lastModified && (
                          <span className={styles.date}>
                            <span className={styles.srOnly}>{text.updated}: </span>
                            {new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(new Date(item.lastModified))}
                          </span>
                        )}
                        <svg className={styles.arrow} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                          <path d="M3.5 9h11m-4.5-4.5L14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className={styles.srOnly}>{text.visit}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
