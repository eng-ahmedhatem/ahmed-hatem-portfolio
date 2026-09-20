import type { BlogPost, Project, Testimonial } from "./types";

export function isPublicTestimonial(item: Testimonial) {
  return item.status === "published" && item.consentConfirmed === true;
}

export function isPublicProject(project: Project) {
  return project.status !== "draft"
    && (project.attribution?.kind !== "agency" || project.attribution.permissionConfirmed === true);
}

export function isPublicPost(post: BlogPost) {
  return post.status === "published" && Boolean(post.publishedAt)
    && Date.parse(post.publishedAt!) <= Date.now();
}
