import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import type { ContentBlock } from "@/domain/content/types";
import type { PageIntroViewModel } from "@/features/site/view-models";

import { Container } from "./container";
import { StructuredData } from "./structured-data";
import styles from "./page-shell.module.css";

interface PageShellProps {
  intro: PageIntroViewModel;
  structuredData: Record<string, unknown>;
  children?: ReactNode;
}

export function PageShell({ intro, structuredData, children }: PageShellProps) {
  return (
    <main id="main-content" className={styles.main}>
      <StructuredData data={structuredData} />
      <Container>
        <header className={styles.intro}>
          <Reveal distance={14}>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.06} distance={22}>
            <h1>{intro.title}</h1>
          </Reveal>
          <Reveal delay={0.12} distance={18}>
            <p className={styles.summary}>{intro.summary}</p>
          </Reveal>
        </header>
        {children ? <div className={styles.content}>{children}</div> : null}
      </Container>
    </main>
  );
}

export function ArticleBody({ blocks }: { blocks: readonly ContentBlock[] }) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <article className={styles.prose}>
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return <p key={block.id}>{block.text}</p>;
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={block.id}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          );
        }
        if (block.type === "heading") return block.level === 2 ? <h2 id={block.id} key={block.id}>{block.text}</h2> : <h3 id={block.id} key={block.id}>{block.text}</h3>;
        if (block.type === "quote") return <blockquote key={block.id}><p>{block.text}</p>{block.attribution ? <cite>{block.attribution}</cite> : null}</blockquote>;
        if (block.type === "code") return <pre key={block.id} dir="ltr"><code data-language={block.language}>{block.code}</code></pre>;
        if (block.type === "image") return <figure key={block.id}><Image src={block.src} width={block.width} height={block.height} alt={block.alt} sizes="(max-width: 768px) 100vw, 720px" />{block.caption ? <figcaption>{block.caption}</figcaption> : null}</figure>;
        if (block.type === "links") return <p key={block.id} className={styles.linkList}>{block.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</p>;
        return <div className={styles.tableWrap} key={block.id}><table><thead><tr>{block.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={`${block.id}-${index}`}>{row.map((cell, cellIndex) => <td key={`${block.id}-${index}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
      })}
    </article>
  );
}
