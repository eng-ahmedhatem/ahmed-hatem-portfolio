import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPublicSnapshot } from "@server/content";
import { getSupabaseAdmin } from "@server/supabase";
import { hasValidAdminSession } from "@/lib/admin/session";
import { MockContentRepository } from "@/data/repositories/mock-content-repository";
import { getPostViewModel, getProjectViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import type { BlogPost, Project } from "@/domain/content/types";
import { ProjectDetail } from "@/components/work/project-detail";
import { BlogArticle } from "@/components/blog/blog-article";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: Promise<{ locale: string; kind: string; id: string }> }) {
  if (!(await hasValidAdminSession())) redirect("/admin/login");
  const { locale: code, kind, id } = await params;
  const locale = localeFromParam(code);
  if (!["project", "post"].includes(kind) || !/^[a-zA-Z0-9_-]+$/.test(id)) notFound();
  const [{ data, error }, snapshot] = await Promise.all([
    getSupabaseAdmin().from("content_records").select("payload").eq("kind", kind).eq("entity_id", id).maybeSingle(),
    getPublicSnapshot(),
  ]);
  if (error) throw new Error("Preview content is unavailable.");
  if (!data) notFound();
  // This temporary, authenticated projection never writes or enters public caches.
  const payload = structuredClone(data.payload) as Project | BlogPost;
  const translation = payload.translations[locale];
  if (!translation) notFound();
  payload.status = "published";
  if (kind === "project") {
    const project = payload as Project;
    // Keep the credit in the preview while bypassing only the publication gate.
    if (project.attribution) project.attribution.permissionConfirmed = true;
    project.media = project.media.map((media) => ({ ...media, src: media.src || "/assets/preview-placeholder.svg" }));
    snapshot.projects = [...snapshot.projects.filter((item) => item.id !== id), project];
  } else {
    const post = payload as BlogPost;
    post.publishedAt = new Date().toISOString();
    post.featuredImage.src ||= "/assets/preview-placeholder.svg";
    snapshot.posts = [...snapshot.posts.filter((item) => item.id !== id), post];
  }
  const repository = new MockContentRepository(snapshot);
  const banner = <aside style={{ position: "sticky", top: 0, zIndex: 100, padding: "1rem", background: "#112c47", textAlign: "center", fontSize: "1rem" }}><strong>{locale === "ar" ? "معاينة خاصة — آخر نسخة محفوظة، ليست نشرًا" : "Private preview — last saved version, not published"}</strong>{" · "}<Link href="/admin">{locale === "ar" ? "العودة للإدارة" : "Back to admin"}</Link></aside>;
  if (kind === "project") {
    const view = await getProjectViewModel(locale, translation.slug, repository);
    if (!view) notFound();
    return <>{banner}<ProjectDetail view={view} /></>;
  }
  const post = await getPostViewModel(locale, translation.slug, repository);
  if (!post) notFound();
  return <>{banner}<BlogArticle post={post} /></>;
}
