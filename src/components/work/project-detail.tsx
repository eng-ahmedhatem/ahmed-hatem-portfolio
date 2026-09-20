import Image from "next/image";
import Link from "next/link";

import { ActionLink } from "@/components/ui/action-link";
import { Container } from "@/components/ui/container";
import { DirectionalArrow } from "@/components/ui/directional-arrow";
import { Reveal } from "@/components/motion/reveal";
import type { AwaitedReturn } from "@/lib/types";
import { getProjectViewModel } from "@/features/site/view-models";

import { ProjectGallery } from "./project-gallery";
import styles from "./project-detail.module.css";

type ProjectView = NonNullable<AwaitedReturn<typeof getProjectViewModel>>;

export function ProjectDetail({ view }: { view: ProjectView }) {
  const { project, labels } = view;
  const gallery = project.gallery.filter((image) => image.id !== project.cover.id);
  const story = [
    project.overview ? { id: "overview", number: "01", title: labels.overview, body: project.overview } : null,
    project.challenge ? { id: "challenge", number: "02", title: labels.challenge, body: project.challenge } : null,
    project.solution ? { id: "solution", number: "03", title: labels.solution, body: project.solution } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.hero} aria-labelledby="project-title">
        <Container>
          <Reveal distance={30}>
            <header className={styles.masthead}>
              <div className={styles.projectMark} aria-hidden="true"><span>01</span><i /></div>
              <div className={styles.intro}>
                <p className={styles.eyebrow}><span aria-hidden="true" />{labels.caseStudy} / {project.projectType}</p>
                <h1 id="project-title">{project.title}</h1>
                <p className={styles.summary}>{view.intro.summary}</p>
                {project.attribution ? <aside className={styles.attribution}>
                  {project.attribution.url ? <a href={project.attribution.url} target="_blank" rel="noopener noreferrer">{project.attribution.agencyName} ↗</a> : <strong>{project.attribution.agencyName}</strong>}
                  <p>{project.attribution.contribution}</p>
                  <small>{project.attribution.notice}</small>
                </aside> : null}
                {project.liveLink ? <ActionLink className={styles.liveLink} href={project.liveLink.url}>{labels.live}</ActionLink> : null}
              </div>
              <dl className={styles.meta}>
                {project.dateLabel ? <div><dt>{labels.date}</dt><dd>{project.dateLabel}</dd></div> : null}
                {project.role ? <div><dt>{labels.role}</dt><dd>{project.role}</dd></div> : null}
                <div><dt>{labels.type}</dt><dd>{project.projectType}</dd></div>
                {project.technologies.length ? <div><dt>{labels.technologies}</dt><dd>{project.technologies.join(" · ")}</dd></div> : null}
              </dl>
            </header>
          </Reveal>
          <Reveal delay={0.1} distance={36} amount={0.12}>
            <figure className={styles.cover}>
              <div className={styles.coverLabel} aria-hidden="true"><span>{labels.caseStudy}</span><b>01 / 04</b></div>
              <div className={styles.coverImage}>
                <Image src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt} sizes="(max-width: 1320px) 100vw, 1320px" preload />
                <i className={styles.cornerStart} aria-hidden="true" />
                <i className={styles.cornerEnd} aria-hidden="true" />
              </div>
            </figure>
          </Reveal>
        </Container>
      </section>
      <Container>
        <div className={styles.story}>
          <aside className={styles.storyIndex}>
            <p>{labels.story}</p>
            <nav aria-label={labels.story}>
              {story.map((item) => <a key={item.id} href={`#${item.id}`}><span>{item.number}</span>{item.title}</a>)}
            </nav>
          </aside>
          <div className={styles.storyContent}>
            {story.map((item, index) => (
              <Reveal key={item.id} amount={0.24}>
                <section id={item.id} className={styles.storyChapter}>
                  <div className={styles.chapterHeading}><span>{item.number}</span><h2>{item.title}</h2></div>
                  <p>{item.body}</p>
                  <i aria-hidden="true" style={{ "--chapter-progress": `${(index + 1) * 33.333}%` } as React.CSSProperties} />
                </section>
              </Reveal>
            ))}
          </div>
        </div>
        {gallery.length ? (
          <section className={styles.gallerySection} aria-labelledby="project-gallery-title">
            <Reveal amount={0.2}>
              <header><div><p>04</p><span>{labels.visualArchive}</span></div><h2 id="project-gallery-title">{labels.gallery}</h2></header>
            </Reveal>
            <ProjectGallery images={gallery} labels={labels} />
          </section>
        ) : null}
        <Reveal amount={0.4}>
          <nav className={styles.projectNavigation} aria-label={labels.projectNavigation}>
            {view.navigation.previous ? <Link className={styles.previousProject} href={view.navigation.previous.href}><span><DirectionalArrow />{labels.previousProject}</span><strong>{view.navigation.previous.title}</strong></Link> : <span />}
            {view.navigation.next ? <Link href={view.navigation.next.href}><span>{labels.nextProject}<DirectionalArrow /></span><strong>{view.navigation.next.title}</strong></Link> : null}
          </nav>
        </Reveal>
      </Container>
    </main>
  );
}
