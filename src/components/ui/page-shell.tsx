import Link from "next/link";
import type { ReactNode } from "react";

import type { ContentBlock } from "@/domain/content/types";
import type {
  ContentRowViewModel,
  PageIntroViewModel,
} from "@/features/site/view-models";

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
          <p className={styles.eyebrow}>{intro.eyebrow}</p>
          <h1>{intro.title}</h1>
          <p className={styles.summary}>{intro.summary}</p>
        </header>
        {children ? <div className={styles.content}>{children}</div> : null}
      </Container>
    </main>
  );
}

export function ContentRows({ rows }: { rows: readonly ContentRowViewModel[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.rows}>
      {rows.map((row) => (
        <article className={styles.row} key={row.id}>
          <div>
            <h2>
              <Link href={row.href}>{row.title}</Link>
            </h2>
            <p>{row.summary}</p>
          </div>
          {row.meta?.length ? (
            <ul className={styles.meta} aria-label={row.title}>
              {row.meta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
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
          return (
            <ul key={block.id}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return block.level === 2 ? (
          <h2 key={block.id}>{block.text}</h2>
        ) : (
          <h3 key={block.id}>{block.text}</h3>
        );
      })}
    </article>
  );
}
