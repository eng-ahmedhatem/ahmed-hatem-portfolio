import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/blog-article";
import { StructuredData } from "@/components/ui/structured-data";
import { contentRepository } from "@/data/content-repository";
import { SUPPORTED_LOCALES } from "@/domain/content/types";
import { getPostViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createBlogPostingStructuredData } from "@/lib/seo/structured-data";

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const localizedPosts = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => ({
      locale,
      posts: await contentRepository.getPosts(locale),
    })),
  );

  return localizedPosts.flatMap(({ locale, posts }) =>
    posts.map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const routeParams = await params;
  const locale = localeFromParam(routeParams.locale);
  const post = await getPostViewModel(locale, routeParams.slug);

  if (!post) {
    notFound();
  }

  return createLocalizedMetadata({
    locale,
    seo: post.intro.seo,
    alternatePaths: post.intro.alternatePaths,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const routeParams = await params;
  const locale = localeFromParam(routeParams.locale);
  const post = await getPostViewModel(locale, routeParams.slug);

  if (!post) {
    notFound();
  }

  const path =
    post.intro.alternatePaths[locale] ?? `/${locale}/blog/${routeParams.slug}`;

  return (
    <>
      <StructuredData
        data={createBlogPostingStructuredData(
          locale,
          post.intro.seo,
          path,
          post.publishedAt,
          post.updatedAt,
          post.cover.src,
        )}
      />
      <BlogArticle post={post} />
    </>
  );
}
