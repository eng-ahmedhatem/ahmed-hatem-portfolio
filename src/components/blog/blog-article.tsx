import Link from "next/link";
import Image from "next/image";

import { ArticleBody } from "@/components/ui/page-shell";
import { Container } from "@/components/ui/container";
import { DirectionalArrow } from "@/components/ui/directional-arrow";
import { Reveal } from "@/components/motion/reveal";
import type { AwaitedReturn } from "@/lib/types";
import { getPostViewModel } from "@/features/site/view-models";

import styles from "./blog-article.module.css";

type PostView = NonNullable<AwaitedReturn<typeof getPostViewModel>>;

export function BlogArticle({ post }: { post: PostView }) {
  return (
    <main id="main-content" className={styles.main}>
      <Container>
        <Reveal distance={28}>
          <header className={styles.header}>
            <div className={styles.issue} aria-hidden="true"><span>01</span><i /></div>
            <div className={styles.titleBlock}>
              <div className={styles.meta}><span>{post.labels.article}</span>{post.categories.map((category) => <Link key={category.href} href={category.href}>{category.name}</Link>)}</div>
              <h1>{post.intro.title}</h1>
            </div>
            <div className={styles.deck}>
              <p>{post.intro.summary}</p>
              <dl><dt>{post.labels.published}</dt><dd><time dateTime={post.publishedAt}>{post.dateLabel}</time></dd></dl>
            </div>
          </header>
        </Reveal>
        <Reveal delay={0.1} distance={34} amount={0.12}>
          <div className={styles.coverGrid}>
            <figure className={styles.cover}>
              <Image
                src={post.cover.src}
                width={post.cover.width}
                height={post.cover.height}
                alt={post.cover.alt}
                sizes="(max-width: 1320px) 100vw, 1100px"
                preload
              />
            </figure>
            <div className={styles.coverIndex} aria-hidden="true"><span>{post.labels.article}</span><b>01 / 01</b><i /></div>
          </div>
        </Reveal>
        <Reveal amount={0.08}>
          <div className={styles.articleLayout}>
            {post.toc.length > 1 ? <aside className={styles.toc}><p>{post.labels.contents}</p><nav>{post.toc.map((item, index) => <a key={item.id} href={`#${item.id}`} data-level={item.level}><span>{String(index + 1).padStart(2, "0")}</span>{item.text}</a>)}</nav></aside> : <div />}
            <ArticleBody blocks={post.body} />
            <div className={styles.readingRail} aria-hidden="true"><span>AH</span><i /></div>
          </div>
        </Reveal>
        {post.related.length ? <Reveal amount={0.15}><section className={styles.related} aria-labelledby="related-title"><header><span>02</span><h2 id="related-title">{post.labels.related}</h2></header><div>{post.related.map((item, index) => <article key={item.href}><span>{String(index + 1).padStart(2, "0")}</span><div><h3><Link href={item.href}>{item.title}</Link></h3><p>{item.excerpt}</p></div><Link className={styles.readLink} href={item.href} aria-label={`${post.labels.read}: ${item.title}`}><span>{post.labels.read}</span><DirectionalArrow /></Link></article>)}</div></section></Reveal> : null}
      </Container>
    </main>
  );
}
