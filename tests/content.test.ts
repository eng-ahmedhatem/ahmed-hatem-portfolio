import assert from "node:assert/strict";
import { test } from "node:test";
import { createContentRecord } from "../src/domain/content/new-record";
import { isPublicPost, isPublicProject } from "../src/domain/content/publication";
import { MockContentRepository } from "../src/data/repositories/mock-content-repository";
import { getBundledSnapshot, validateContentPayload } from "../server/content";
import { withEmploymentDefaults } from "../src/data/defaults/employment";
import { withHomepageCopyDefaults } from "../src/data/defaults/homepage-copy";
import type { Project, Testimonial } from "../src/domain/content/types";
import { createLocalizedMetadata } from "../src/lib/seo/metadata";

test("new content is valid without needing an existing project/article to clone", () => {
  for (const kind of ["project", "post", "category", "testimonial"] as const) {
    const record = createContentRecord(kind, `new-${kind}`);
    const parsed = validateContentPayload(kind, record.payload);
    assert.equal(parsed.success, true, JSON.stringify(parsed.error));
    if (kind !== "category") assert.equal(record.payload.status, "draft");
  }
});

test("company project requires permission and complete credits before publishing", () => {
  const project = structuredClone(getBundledSnapshot().projects[0]) as Project;
  project.status = "published";
  project.attribution = { kind: "agency", permissionConfirmed: false, translations: { ar: { agencyName: "شركة", contribution: "تطوير", notice: "حقوق الشركة" }, en: { agencyName: "Company", contribution: "Development", notice: "Company rights" } } };
  assert.equal(validateContentPayload("project", project).success, false);
  assert.equal(isPublicProject(project), false);
  project.attribution.permissionConfirmed = true;
  assert.equal(validateContentPayload("project", project).success, true);
  assert.equal(isPublicProject(project), true);
});

test("changing employer does not rewrite historical project attribution", () => {
  const settings = withEmploymentDefaults(getBundledSnapshot().siteSettings);
  const updated = structuredClone(settings);
  updated.identity.employment!.translations.ar!.company = "شركة أخرى";
  assert.notEqual(withEmploymentDefaults(updated).identity.employment?.translations.ar?.company, settings.identity.employment?.translations.ar?.company);
});

test("draft, future articles and unapproved projects stay out of routes", async () => {
  const snapshot = structuredClone(getBundledSnapshot());
  snapshot.projects = snapshot.projects.map((project) => ({ ...project, status: "draft" }));
  snapshot.posts = snapshot.posts.map((post) => ({ ...post, publishedAt: "2099-01-01T00:00:00.000Z" }));
  const repo = new MockContentRepository(snapshot);
  assert.equal((await repo.getProjects("ar")).length, 0);
  assert.equal((await repo.getPosts("en")).length, 0);
  assert.equal((await repo.getRouteManifest()).some((route) => ["project", "post"].includes(route.kind)), false);
  assert.equal(isPublicPost(snapshot.posts[0]), false);
});

test("testimonials require permission and both translations; public list is ordered and capped", async () => {
  const item = createContentRecord("testimonial", "review-1").payload as unknown as Testimonial;
  item.status = "published";
  assert.equal(validateContentPayload("testimonial", item).success, false);
  item.consentConfirmed = true;
  item.translations = { ar: { name: "بيانات اختبار فقط", role: "", company: "", quote: "نص لا ينشر" }, en: { name: "Test fixture only", role: "", company: "", quote: "Not a real endorsement" } };
  assert.equal(validateContentPayload("testimonial", item).success, true);
  const snapshot = { ...getBundledSnapshot(), testimonials: [
    { ...item, id: "hidden", consentConfirmed: false },
    { ...item, id: "draft", status: "draft" as const },
    { ...item, id: "not-featured", featured: false },
    ...Array.from({ length: 8 }, (_, i) => ({ ...item, id: `item-${i}`, featuredOrder: 8 - i })),
  ] };
  const result = await new MockContentRepository(snapshot).getTestimonials("ar");
  assert.equal(result.length, 6);
  assert.equal(result[0].id, "item-7");
  assert.equal(result.some((row) => ["hidden", "draft", "not-featured"].includes(row.id)), false);
});

test("bilingual metadata keeps self canonical and alternate URLs", () => {
  const paths = { ar: "/ar/work/example", en: "/en/work/example" };
  for (const locale of ["ar", "en"] as const) {
    const seo = getBundledSnapshot().homepage.translations[locale]!.seo;
    const metadata = createLocalizedMetadata({ locale, seo: { ...seo, canonicalUrl: undefined }, alternatePaths: paths });
    assert.equal(metadata.alternates?.canonical, `https://portfolio.example${paths[locale]}`);
    assert.equal(metadata.alternates?.languages?.["x-default"], "https://portfolio.example/en/work/example");
  }
});

test("homepage copy upgrades legacy text, preserves CMS edits and is idempotent", () => {
  const homepage = structuredClone(getBundledSnapshot().homepage);
  const upgraded = withHomepageCopyDefaults(homepage);
  assert.equal(upgraded.translations.ar!.about.title.split("\n").length, 2);
  assert.equal(upgraded.translations.en!.hero.capabilities.length, 3);
  assert.deepEqual(withHomepageCopyDefaults(upgraded), upgraded);
  homepage.translations.ar!.hero.title = "عنوان خاص من لوحة الإدارة";
  homepage.translations.en!.about.summary = "Owner-authored content";
  const custom = withHomepageCopyDefaults(homepage);
  assert.equal(custom.translations.ar!.hero.title, "عنوان خاص من لوحة الإدارة");
  assert.equal(custom.translations.en!.about.summary, "Owner-authored content");
  assert.notEqual(homepage.translations.ar!.about.title, upgraded.translations.ar!.about.title);
});
