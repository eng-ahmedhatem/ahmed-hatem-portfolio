"use client";

import { useState, type ReactNode } from "react";

import { Testimonials } from "@/components/home/testimonials";
import type { ResolvedTestimonial } from "@/domain/content/types";
import type { ContentBlock } from "@/domain/content/types";

import { uploadAdminImage, type AdminContentRecord } from "./admin-api";
import styles from "./admin.module.css";

type JsonObject = Record<string, unknown>;
type Locale = "ar" | "en";

const pageTargets = [
  ["home", "الرئيسية"],
  ["work", "المشاريع"],
  ["blog", "المدونة"],
  ["about", "عني"],
  ["contact", "التواصل"],
] as const;

const blockTypeLabels: Record<ContentBlock["type"], string> = {
  paragraph: "فقرة",
  heading: "عنوان فرعي",
  list: "قائمة",
  quote: "اقتباس",
  code: "كود",
  image: "صورة",
  links: "روابط",
  table: "جدول",
};

function getAt(source: unknown, path: readonly string[]): unknown {
  let current = source;
  for (const segment of path) {
    if (Array.isArray(current)) current = current[Number(segment)];
    else if (current && typeof current === "object") current = (current as JsonObject)[segment];
    else return undefined;
  }
  return current;
}

function setAt(source: JsonObject, path: readonly string[], value: unknown): JsonObject {
  const clone = structuredClone(source);
  let current: unknown = clone;
  path.slice(0, -1).forEach((segment, index) => {
    const nextSegment = path[index + 1];
    if (Array.isArray(current)) {
      const key = Number(segment);
      if (current[key] === undefined) current[key] = /^\d+$/.test(nextSegment) ? [] : {};
      current = current[key];
    } else if (current && typeof current === "object") {
      const object = current as JsonObject;
      if (object[segment] === undefined) object[segment] = /^\d+$/.test(nextSegment) ? [] : {};
      current = object[segment];
    }
  });
  const final = path.at(-1);
  if (!final) return clone;
  if (Array.isArray(current)) current[Number(final)] = value;
  else if (current && typeof current === "object") (current as JsonObject)[final] = value;
  return clone;
}

function asString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function fieldDirection(locale?: Locale) {
  return locale === "ar" ? "rtl" as const : locale === "en" ? "ltr" as const : undefined;
}

function EditorSection({ eyebrow, title, summary, children }: { eyebrow: string; title: string; summary?: string; children: ReactNode }) {
  return (
    <section className={styles.editorSection}>
      <header><span>{eyebrow}</span><h3>{title}</h3>{summary ? <p>{summary}</p> : null}</header>
      <div className={styles.fieldsGrid}>{children}</div>
    </section>
  );
}

function TextField({
  payload,
  path,
  label,
  onChange,
  area = false,
  locale,
  type = "text",
  hint,
}: {
  payload: JsonObject;
  path: string[];
  label: string;
  onChange: (payload: JsonObject) => void;
  area?: boolean;
  locale?: Locale;
  type?: "text" | "email" | "url" | "date" | "datetime-local";
  hint?: string;
}) {
  const value = asString(getAt(payload, path));
  const dir = fieldDirection(locale) ?? (type === "url" || type === "email" ? "ltr" : undefined);
  return (
    <label className={area ? styles.wideField : undefined}>
      <span>{label}{hint ? <small>{hint}</small> : null}</span>
      {area ? (
        <textarea dir={dir} rows={4} value={value} onChange={(event) => onChange(setAt(payload, path, event.target.value))} />
      ) : (
        <input type={type} dir={dir} value={value} onChange={(event) => onChange(setAt(payload, path, event.target.value))} />
      )}
    </label>
  );
}

function normalizeMachineKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+/g, "");
}

function MachineKeyField({
  payload,
  path,
  label,
  onChange,
}: {
  payload: JsonObject;
  path: string[];
  label: string;
  onChange: (payload: JsonObject) => void;
}) {
  const value = asString(getAt(payload, path));
  const isValid = /^[a-zA-Z0-9_-]+$/.test(value);

  return (
    <label>
      <span>
        {label}
        <small>حروف إنجليزية وأرقام و- أو _ فقط</small>
      </span>
      <input
        type="text"
        dir="ltr"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        pattern="[A-Za-z0-9_-]+"
        aria-invalid={value.length > 0 && !isValid}
        value={value}
        onChange={(event) =>
          onChange(setAt(payload, path, normalizeMachineKey(event.target.value)))
        }
      />
    </label>
  );
}

function NumberField({ payload, path, label, onChange, min = 0 }: { payload: JsonObject; path: string[]; label: string; onChange: (payload: JsonObject) => void; min?: number }) {
  const value = getAt(payload, path);
  return <label><span>{label}</span><input type="number" min={min} value={typeof value === "number" ? value : ""} onChange={(event) => onChange(setAt(payload, path, event.target.value === "" ? undefined : Number(event.target.value)))} /></label>;
}

function SelectField({ payload, path, label, options, onChange }: { payload: JsonObject; path: string[]; label: string; options: readonly (readonly [string, string])[]; onChange: (payload: JsonObject) => void }) {
  return <label><span>{label}</span><select value={asString(getAt(payload, path))} onChange={(event) => onChange(setAt(payload, path, event.target.value))}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}

function ListField({ payload, path, label, onChange, locale, hint = "سطر لكل عنصر" }: { payload: JsonObject; path: string[]; label: string; onChange: (payload: JsonObject) => void; locale?: Locale; hint?: string }) {
  const current = getAt(payload, path);
  const value = Array.isArray(current) ? current.join("\n") : "";
  return (
    <label className={styles.wideField}>
      <span>{label} <small>{hint}</small></span>
      <textarea dir={fieldDirection(locale)} rows={4} value={value} onChange={(event) => onChange(setAt(payload, path, event.target.value.split("\n").map((item) => item.trim()).filter(Boolean)))} />
    </label>
  );
}

function ToggleField({ payload, path, label, onChange, description }: { payload: JsonObject; path: string[]; label: string; onChange: (payload: JsonObject) => void; description?: string }) {
  return (
    <label className={styles.toggleField}>
      <input type="checkbox" checked={Boolean(getAt(payload, path))} onChange={(event) => onChange(setAt(payload, path, event.target.checked))} />
      <span>{label}{description ? <small>{description}</small> : null}</span>
    </label>
  );
}

function LocaleTabs({ value, onChange }: { value: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className={styles.localeToolbar}>
      <div><span>لغة التحرير</span><small>كل لغة تُنشر بشكل مستقل داخل نفس المحتوى.</small></div>
      <div className={styles.localeTabs} aria-label="لغة المحتوى">
        <button type="button" data-active={value === "ar"} onClick={() => onChange("ar")}>العربية</button>
        <button type="button" data-active={value === "en"} onClick={() => onChange("en")}>English</button>
      </div>
    </div>
  );
}

async function imageDimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return null;
  }
}

function ImageField({ payload, path, label, onChange, widthPath, heightPath }: { payload: JsonObject; path: string[]; label: string; onChange: (payload: JsonObject) => void; widthPath?: string[]; heightPath?: string[] }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const current = asString(getAt(payload, path));

  async function upload(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 4 ميجابايت للنشر على Vercel.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const [result, dimensions] = await Promise.all([uploadAdminImage(file), imageDimensions(file)]);
      let next = setAt(payload, path, result.asset.src);
      if (dimensions && widthPath) next = setAt(next, widthPath, dimensions.width);
      if (dimensions && heightPath) next = setAt(next, heightPath, dimensions.height);
      onChange(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر رفع الصورة.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`${styles.imageField} ${styles.wideField}`}>
      <span>{label}</span>
      <div className={styles.imageFieldBody}>
        {current ? <div className={styles.imagePreview} style={{ backgroundImage: `url(${current})` }} aria-label="معاينة الصورة" /> : <div className={styles.imagePlaceholder}>لا توجد صورة</div>}
        <div className={styles.imageActions}>
          <input value={current} dir="ltr" onChange={(event) => onChange(setAt(payload, path, event.target.value))} aria-label={`${label} URL`} />
          <label className={styles.uploadButton}><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={pending} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />{pending ? "جارٍ الرفع…" : "رفع صورة"}</label>
        </div>
      </div>
      {error ? <small className={styles.formError}>{error}</small> : null}
    </div>
  );
}

function SeoFields({ payload, base, locale, onChange }: { payload: JsonObject; base: string[]; locale: Locale; onChange: (payload: JsonObject) => void }) {
  return (
    <details className={styles.editorDetails}>
      <summary><span>إعدادات SEO</span><small>العنوان والوصف والمشاركة الاجتماعية والفهرسة</small></summary>
      <div className={styles.fieldsGrid}>
        <TextField payload={payload} path={[...base, "seo", "title"]} label="عنوان محركات البحث" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...base, "seo", "description"]} label="وصف محركات البحث" area locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...base, "seo", "openGraph", "title"]} label="عنوان المشاركة" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...base, "seo", "openGraph", "description"]} label="وصف المشاركة" area locale={locale} onChange={onChange} />
        <ToggleField payload={payload} path={[...base, "seo", "robots", "index"]} label="السماح بالفهرسة" onChange={onChange} />
        <ToggleField payload={payload} path={[...base, "seo", "robots", "follow"]} label="السماح بتتبع الروابط" onChange={onChange} />
      </div>
    </details>
  );
}

function moveItem<T>(items: readonly T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return [...items];
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function ContentBlocksEditor({ payload, path, onChange, locale }: { payload: JsonObject; path: string[]; onChange: (payload: JsonObject) => void; locale: Locale }) {
  const [newType, setNewType] = useState<ContentBlock["type"]>("paragraph");
  const blocks = (getAt(payload, path) as ContentBlock[] | undefined) ?? [];
  function update(index: number, next: ContentBlock) {
    const copy = [...blocks];
    copy[index] = next;
    onChange(setAt(payload, path, copy));
  }
  function addBlock() {
    const id = `block-${blocks.length + 1}-${blocks.reduce((total, block) => total + block.id.length, 0)}`;
    const templates: Record<ContentBlock["type"], ContentBlock> = {
      paragraph: { id, type: "paragraph", text: "" },
      heading: { id, type: "heading", level: 2, text: "" },
      list: { id, type: "list", items: [], ordered: false },
      quote: { id, type: "quote", text: "", attribution: "" },
      code: { id, type: "code", code: "", language: "text" },
      image: { id, type: "image", src: "", width: 1600, height: 1000, alt: "", caption: "" },
      links: { id, type: "links", links: [] },
      table: { id, type: "table", headers: [], rows: [] },
    };
    onChange(setAt(payload, path, [...blocks, templates[newType]]));
  }
  return (
    <div className={`${styles.blocksEditor} ${styles.wideField}`}>
      <div className={styles.blockHeading}><div><span>محتوى الصفحة</span><small>{blocks.length} بلوك</small></div><div><select value={newType} onChange={(event) => setNewType(event.target.value as ContentBlock["type"])}>{Object.entries(blockTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={addBlock}>+ إضافة</button></div></div>
      {blocks.length === 0 ? <div className={styles.inlineEmpty}>أضف أول فقرة أو عنوان لبناء المحتوى.</div> : null}
      {blocks.map((block, index) => (
        <article className={styles.blockRow} key={block.id}>
          <header><span>{String(index + 1).padStart(2, "0")}</span><b>{blockTypeLabels[block.type]}</b><div><button type="button" disabled={index === 0} onClick={() => onChange(setAt(payload, path, moveItem(blocks, index, -1)))} aria-label="تحريك لأعلى">↑</button><button type="button" disabled={index === blocks.length - 1} onClick={() => onChange(setAt(payload, path, moveItem(blocks, index, 1)))} aria-label="تحريك لأسفل">↓</button><button type="button" className={styles.removeButton} onClick={() => onChange(setAt(payload, path, blocks.filter((_, itemIndex) => itemIndex !== index)))}>حذف</button></div></header>
          {block.type === "list" ? <><label><span>العناصر</span><textarea dir={fieldDirection(locale)} rows={4} value={block.items.join("\n")} onChange={(event) => update(index, { ...block, items: event.target.value.split("\n").filter(Boolean) })} /></label><label className={styles.compactToggle}><input type="checkbox" checked={Boolean(block.ordered)} onChange={(event) => update(index, { ...block, ordered: event.target.checked })} /> قائمة مرقمة</label></> : null}
          {block.type === "paragraph" ? <textarea dir={fieldDirection(locale)} rows={4} value={block.text} onChange={(event) => update(index, { ...block, text: event.target.value })} /> : null}
          {block.type === "heading" ? <><select value={block.level} onChange={(event) => update(index, { ...block, level: Number(event.target.value) as 2 | 3 })}><option value="2">H2</option><option value="3">H3</option></select><textarea dir={fieldDirection(locale)} rows={2} value={block.text} onChange={(event) => update(index, { ...block, text: event.target.value })} /></> : null}
          {block.type === "quote" ? <><textarea dir={fieldDirection(locale)} rows={3} value={block.text} onChange={(event) => update(index, { ...block, text: event.target.value })} /><input dir={fieldDirection(locale)} value={block.attribution ?? ""} placeholder="صاحب الاقتباس" onChange={(event) => update(index, { ...block, attribution: event.target.value })} /></> : null}
          {block.type === "code" ? <><input dir="ltr" value={block.language ?? ""} placeholder="لغة الكود" onChange={(event) => update(index, { ...block, language: event.target.value })} /><textarea dir="ltr" rows={6} value={block.code} onChange={(event) => update(index, { ...block, code: event.target.value })} /></> : null}
          {block.type === "image" ? <><ImageField payload={payload} path={[...path, String(index), "src"]} label="صورة داخل المقال" widthPath={[...path, String(index), "width"]} heightPath={[...path, String(index), "height"]} onChange={onChange} /><input dir={fieldDirection(locale)} value={block.alt} placeholder="النص البديل" onChange={(event) => update(index, { ...block, alt: event.target.value })} /><input dir={fieldDirection(locale)} value={block.caption ?? ""} placeholder="تعليق الصورة" onChange={(event) => update(index, { ...block, caption: event.target.value })} /></> : null}
          {block.type === "links" ? <textarea dir={fieldDirection(locale)} rows={4} value={block.links.map((link) => `${link.label} | ${link.href}`).join("\n")} placeholder="النص | https://example.com" onChange={(event) => update(index, { ...block, links: event.target.value.split("\n").map((line) => { const [label, href] = line.split("|").map((part) => part.trim()); return { label, href }; }).filter((link) => link.label && link.href) })} /> : null}
          {block.type === "table" ? <><input dir={fieldDirection(locale)} value={block.headers.join(" | ")} placeholder="عنوان 1 | عنوان 2" onChange={(event) => update(index, { ...block, headers: event.target.value.split("|").map((item) => item.trim()).filter(Boolean) })} /><textarea dir={fieldDirection(locale)} rows={5} value={block.rows.map((row) => row.join(" | ")).join("\n")} placeholder="خلية 1 | خلية 2" onChange={(event) => update(index, { ...block, rows: event.target.value.split("\n").filter(Boolean).map((row) => row.split("|").map((item) => item.trim())) })} /></> : null}
        </article>
      ))}
    </div>
  );
}

function ProjectLinksEditor({ payload, onChange }: { payload: JsonObject; onChange: (payload: JsonObject) => void }) {
  const links = (getAt(payload, ["links"]) as { label: string; url: string }[] | undefined) ?? [];
  return <div className={`${styles.collectionEditor} ${styles.wideField}`}><header><div><span>روابط المشروع</span><small>الموقع المباشر أو المستودع أو دراسة الحالة</small></div><button type="button" onClick={() => onChange(setAt(payload, ["links"], [...links, { label: "", url: "" }]))}>+ رابط</button></header>{links.map((link, index) => <div className={styles.collectionRow} key={`${index}-${link.url}`}><input value={link.label} placeholder="اسم الرابط" onChange={(event) => onChange(setAt(payload, ["links", String(index), "label"], event.target.value))} /><input dir="ltr" value={link.url} placeholder="https://" onChange={(event) => onChange(setAt(payload, ["links", String(index), "url"], event.target.value))} /><button type="button" onClick={() => onChange(setAt(payload, ["links"], links.filter((_, itemIndex) => itemIndex !== index)))}>حذف</button></div>)}</div>;
}

function MediaGalleryEditor({ payload, locale, onChange }: { payload: JsonObject; locale: Locale; onChange: (payload: JsonObject) => void }) {
  const media = (getAt(payload, ["media"]) as JsonObject[] | undefined) ?? [];
  const coverId = asString(getAt(payload, ["coverMediaId"]));
  function addAsset() {
    const id = `media-${media.length + 1}-${media.reduce((total, asset) => total + asString(asset.id).length, 0)}`;
    const asset = { id, src: "", width: 1600, height: 1000, translations: { ar: { alt: "", caption: "" }, en: { alt: "", caption: "" } } };
    let next = setAt(payload, ["media"], [...media, asset]);
    if (!coverId) next = setAt(next, ["coverMediaId"], id);
    onChange(next);
  }
  function removeAsset(index: number) {
    if (media.length === 1) return;
    const removedId = asString(media[index]?.id);
    const nextMedia = media.filter((_, itemIndex) => itemIndex !== index);
    let next = setAt(payload, ["media"], nextMedia);
    if (removedId === coverId) next = setAt(next, ["coverMediaId"], asString(nextMedia[0]?.id));
    onChange(next);
  }
  return (
    <div className={`${styles.mediaEditor} ${styles.wideField}`}>
      <header><div><span>معرض المشروع</span><small>اختر الغلاف ورتّب الصور كما ستظهر في صفحة المشروع.</small></div><button type="button" onClick={addAsset}>+ إضافة صورة</button></header>
      {media.map((asset, index) => {
        const id = asString(asset.id);
        return <article key={id}><div className={styles.mediaCardHead}><label className={styles.coverChoice}><input type="radio" name="project-cover" checked={coverId === id} onChange={() => onChange(setAt(payload, ["coverMediaId"], id))} /> الغلاف</label><div><button type="button" disabled={index === 0} onClick={() => onChange(setAt(payload, ["media"], moveItem(media, index, -1)))}>↑</button><button type="button" disabled={index === media.length - 1} onClick={() => onChange(setAt(payload, ["media"], moveItem(media, index, 1)))}>↓</button><button type="button" disabled={media.length === 1} onClick={() => removeAsset(index)}>حذف</button></div></div><ImageField payload={payload} path={["media", String(index), "src"]} widthPath={["media", String(index), "width"]} heightPath={["media", String(index), "height"]} label={`الصورة ${index + 1}`} onChange={onChange} /><div className={styles.mediaMeta}><TextField payload={payload} path={["media", String(index), "translations", locale, "alt"]} label="النص البديل" locale={locale} onChange={onChange} /><TextField payload={payload} path={["media", String(index), "translations", locale, "caption"]} label="تعليق الصورة" locale={locale} onChange={onChange} /></div></article>;
      })}
    </div>
  );
}

function HomepageSectionsEditor({ payload, locale, onChange }: { payload: JsonObject; locale: Locale; onChange: (payload: JsonObject) => void }) {
  const sections = (getAt(payload, ["sections"]) as JsonObject[] | undefined) ?? [];
  return <div className={`${styles.collectionEditor} ${styles.wideField}`}><header><div><span>ترتيب أقسام الصفحة</span><small>يمكن إخفاء القسم أو تغيير موضعه دون حذف محتواه.</small></div></header>{sections.map((section, index) => <article className={styles.sectionControl} key={asString(section.id)}><div className={styles.sectionControlHead}><ToggleField payload={payload} path={["sections", String(index), "enabled"]} label={asString(section.type)} onChange={onChange} /><div><button type="button" disabled={index === 0} onClick={() => onChange(setAt(payload, ["sections"], moveItem(sections, index, -1).map((item, order) => ({ ...item, order: order + 1 }))))}>↑</button><button type="button" disabled={index === sections.length - 1} onClick={() => onChange(setAt(payload, ["sections"], moveItem(sections, index, 1).map((item, order) => ({ ...item, order: order + 1 }))))}>↓</button></div></div><div className={styles.fieldsGrid}><TextField payload={payload} path={["sections", String(index), "translations", locale, "eyebrow"]} label="السطر التمهيدي" locale={locale} onChange={onChange} /><TextField payload={payload} path={["sections", String(index), "translations", locale, "title"]} label="عنوان القسم" locale={locale} onChange={onChange} /><TextField payload={payload} path={["sections", String(index), "translations", locale, "summary"]} label="ملخص القسم" area locale={locale} onChange={onChange} /></div></article>)}</div>;
}

function ChoiceOptionsEditor({
  payload,
  path,
  label,
  locale,
  onChange,
}: {
  payload: JsonObject;
  path: string[];
  label: string;
  locale: Locale;
  onChange: (payload: JsonObject) => void;
}) {
  const options = (getAt(payload, path) as { value: string; label: string }[] | undefined) ?? [];

  return (
    <div className={`${styles.collectionEditor} ${styles.wideField}`}>
      <header>
        <div><span>{label}</span><small>القيمة ثابتة للنظام، والنص يظهر للزائر.</small></div>
        <button type="button" onClick={() => onChange(setAt(payload, path, [...options, { value: `option-${options.length + 1}`, label: "" }]))}>+ خيار</button>
      </header>
      {options.map((option, index) => (
        <div className={styles.collectionRow} key={`${path.join("-")}-${index}`}>
          <input dir="ltr" value={option.value} aria-label={`${label} — القيمة ${index + 1}`} onChange={(event) => onChange(setAt(payload, [...path, String(index), "value"], event.target.value))} />
          <input dir={fieldDirection(locale)} value={option.label} aria-label={`${label} — النص ${index + 1}`} onChange={(event) => onChange(setAt(payload, [...path, String(index), "label"], event.target.value))} />
          <button type="button" onClick={() => onChange(setAt(payload, path, options.filter((_, itemIndex) => itemIndex !== index)))}>حذف</button>
        </div>
      ))}
    </div>
  );
}

function HomepageContactEditor({ payload, locale, onChange }: { payload: JsonObject; locale: Locale; onChange: (payload: JsonObject) => void }) {
  const contactBase = ["translations", locale, "contact"];
  const formBase = [...contactBase, "form"];

  return (
    <>
      <EditorSection eyebrow="05" title="قسم التواصل" summary="كل نصوص الحقول ورسائل الحالة قابلة للتحرير لكل لغة.">
        <TextField payload={payload} path={[...contactBase, "title"]} label="العنوان" area locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...contactBase, "summary"]} label="الملخص" area locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...contactBase, "emailLabel"]} label="سطر البريد" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "nameLabel"]} label="حقل الاسم" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "emailLabel"]} label="حقل البريد" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "phoneLabel"]} label="حقل الهاتف" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "phoneOptionalLabel"]} label="وسم الهاتف الاختياري" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "serviceLabel"]} label="حقل نوع المشروع" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "budgetLabel"]} label="حقل الميزانية" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "budgetOptionalLabel"]} label="وسم الميزانية الاختياري" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "detailsLabel"]} label="حقل التفاصيل" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "contactMethodLabel"]} label="حقل طريقة التواصل" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "contactMethodOptionalLabel"]} label="وسم طريقة التواصل الاختيارية" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "submitLabel"]} label="زر الإرسال" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "requiredLabel"]} label="رسالة الحقل المطلوب" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "invalidEmailLabel"]} label="رسالة البريد غير الصحيح" locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "deliverySuccessLabel"]} label="رسالة نجاح الإرسال" area locale={locale} onChange={onChange} />
        <TextField payload={payload} path={[...formBase, "deliveryUnavailableLabel"]} label="رسالة تعذّر الإرسال" area locale={locale} onChange={onChange} />
      </EditorSection>
      <EditorSection eyebrow="05A" title="خيارات نموذج التواصل" summary="أضف أو احذف الخدمات والميزانيات وطرق التواصل.">
        <ChoiceOptionsEditor payload={payload} path={[...formBase, "services"]} label="أنواع المشاريع" locale={locale} onChange={onChange} />
        <ChoiceOptionsEditor payload={payload} path={[...formBase, "budgets"]} label="فئات الميزانية" locale={locale} onChange={onChange} />
        <ChoiceOptionsEditor payload={payload} path={[...formBase, "contactMethods"]} label="طرق التواصل" locale={locale} onChange={onChange} />
      </EditorSection>
    </>
  );
}

function SocialLinksEditor({ payload, onChange }: { payload: JsonObject; onChange: (payload: JsonObject) => void }) {
  const path = ["identity", "socialLinks"];
  const links = (getAt(payload, path) as { id: string; label: string; url: string }[] | undefined) ?? [];

  return (
    <div className={`${styles.collectionEditor} ${styles.wideField}`}>
      <header>
        <div><span>روابط التواصل</span><small>واتساب وفيسبوك وأي قناة جديدة.</small></div>
        <button type="button" onClick={() => onChange(setAt(payload, path, [...links, { id: `social-${links.length + 1}`, label: "", url: "" }]))}>+ رابط</button>
      </header>
      {links.map((link, index) => (
        <div className={styles.collectionRow} key={`${link.id}-${index}`}>
          <input dir="ltr" value={link.label} aria-label={`اسم رابط التواصل ${index + 1}`} onChange={(event) => onChange(setAt(payload, [...path, String(index), "label"], event.target.value))} />
          <input dir="ltr" type="url" value={link.url} aria-label={`عنوان رابط التواصل ${index + 1}`} onChange={(event) => onChange(setAt(payload, [...path, String(index), "url"], event.target.value))} />
          <button type="button" onClick={() => onChange(setAt(payload, path, links.filter((_, itemIndex) => itemIndex !== index)))}>حذف</button>
        </div>
      ))}
    </div>
  );
}

function CategoryPicker({ payload, records, onChange }: { payload: JsonObject; records: AdminContentRecord[]; onChange: (payload: JsonObject) => void }) {
  const selected = new Set((getAt(payload, ["categoryIds"]) as string[] | undefined) ?? []);
  const categories = records.filter((record) => record.kind === "category");
  return <fieldset className={`${styles.choiceGrid} ${styles.wideField}`}><legend>تصنيفات المقال</legend>{categories.map((category) => { const name = asString(getAt(category.payload, ["translations", "ar", "name"])) || category.entityId; return <label key={category.entityId}><input type="checkbox" checked={selected.has(category.entityId)} onChange={(event) => { const next = new Set(selected); if (event.target.checked) next.add(category.entityId); else next.delete(category.entityId); onChange(setAt(payload, ["categoryIds"], [...next])); }} />{name}</label>; })}</fieldset>;
}

function ProjectAttributionEditor({ payload, locale, onChange, employer }: { payload: JsonObject; locale: Locale; onChange: (payload: JsonObject) => void; employer: unknown }) {
  const agency = getAt(payload, ["attribution", "kind"]) === "agency";
  return <EditorSection eyebrow="CREDITS" title="جهة التنفيذ وحقوق العرض" summary="تُحفظ جهة التنفيذ لهذا المشروع مستقلة عن عملك الحالي، ولا تتغير عند انتقالك لشركة أخرى. عرّف مساهمتك بدقة. ذكر الشركة لا يحل محل موافقتها أو موافقة العميل على نشر الصور والتفاصيل.">
    <label className={styles.field}><span>سياق المشروع</span><select value={agency ? "agency" : "independent"} onChange={(event) => {
      const next = event.target.value;
      if (getAt(payload, ["attribution"])) onChange(setAt(payload, ["attribution", "kind"], next));
      else onChange(setAt(payload, ["attribution"], { kind: next, agencyUrl: asString(getAt(employer, ["url"])), permissionConfirmed: false, translations: {
        ar: { agencyName: asString(getAt(employer, ["translations", "ar", "company"])), contribution: "", notice: "عمل نُفّذ ضمن فريق الشركة المذكورة. الحقوق محفوظة للشركة وأصحاب المشروع؛ يوضّح هذا العرض مساهمتي في التطوير." },
        en: { agencyName: asString(getAt(employer, ["translations", "en", "company"])), contribution: "", notice: "Completed as part of the credited company’s team. Rights remain with the company and project owners; this presentation documents my development contribution." },
      } }));
    }}><option value="independent">عمل مستقل / شخصي</option><option value="agency">ضمن شركة / فريق</option></select></label>
    {agency ? <>
      <TextField payload={payload} path={["attribution", "agencyUrl"]} label="رابط جهة التنفيذ" type="url" onChange={onChange} />
      <TextField payload={payload} path={["attribution", "translations", locale, "agencyName"]} label={`جهة التنفيذ — ${locale.toUpperCase()}`} locale={locale} onChange={onChange} />
      <TextField payload={payload} path={["attribution", "translations", locale, "contribution"]} label={`مساهمتي بالتحديد — ${locale.toUpperCase()}`} area locale={locale} onChange={onChange} />
      <TextField payload={payload} path={["attribution", "translations", locale, "notice"]} label={`نص نسبة العمل والحقوق — ${locale.toUpperCase()}`} area locale={locale} onChange={onChange} />
      <ToggleField payload={payload} path={["attribution", "permissionConfirmed"]} label="تأكدت من السماح بعرض هذا المشروع" description="يشمل الصور والتفاصيل وحقوق الشركة والعميل. يظل المشروع مسودة دون هذا التأكيد." onChange={onChange} />
    </> : null}
  </EditorSection>;
}

export function AdminContentEditor({ record, records, onChange }: { record: AdminContentRecord; records: AdminContentRecord[]; onChange: (record: AdminContentRecord) => void }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const payload = record.payload;
  const updatePayload = (next: JsonObject) => onChange({ ...record, payload: next });
  const translationBase = ["translations", locale];


  if (record.kind === "testimonial") {
    const translation = getAt(payload, translationBase) as Record<string, string>;
    const homepage = records.find((item) => item.kind === "homepage");
    const intro = (getAt(homepage?.payload, ["testimonials", "translations", locale]) as Record<string, string> | undefined);
    return <div className={styles.editorPanel}>
      <EditorSection eyebrow="PUBLISHING" title="رأي يستحق الظهور" summary="انقل رأي العميل بأمانة. احفظه كمسودة حتى تكتمل ترجمته وتحصل على إذن عرضه.">
        <SelectField payload={payload} path={["status"]} label="حالة الرأي" options={[["draft", "مسودة"], ["published", "منشور"]]} onChange={updatePayload} />
        <NumberField payload={payload} path={["featuredOrder"]} label="ترتيب الظهور — الأصغر أولًا" min={1} onChange={updatePayload} />
        <ToggleField payload={payload} path={["featured"]} label="اختياره للصفحة الرئيسية" description="تعرض الصفحة أول 6 آراء منشورة حسب الترتيب." onChange={updatePayload} />
        <ToggleField payload={payload} path={["consentConfirmed"]} label="لدي إذن بعرض هذا الرأي وبيانات صاحبه" description="يشمل الاسم والنص والصورة إن أضفتها." onChange={updatePayload} />
        <TextField payload={payload} path={["sourceUrl"]} label="رابط الرأي الأصلي (اختياري)" type="url" onChange={updatePayload} />
        <ImageField payload={payload} path={["avatar", "src"]} widthPath={["avatar", "width"]} heightPath={["avatar", "height"]} label="صورة صاحب الرأي (اختيارية)" onChange={updatePayload} />
      </EditorSection>
      <LocaleTabs value={locale} onChange={setLocale} />
      <EditorSection eyebrow="WORDS" title="صاحب الرأي وتجربته">
        <TextField payload={payload} path={[...translationBase, "name"]} label="الاسم" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "role"]} label="المسمى (اختياري)" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "company"]} label="الشركة (اختياري)" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "quote"]} label="نص الرأي — حتى 1600 حرف" area locale={locale} onChange={updatePayload} />
      </EditorSection>
      <div className={styles.testimonialPreview} dir={fieldDirection(locale)} lang={locale}>
        <p className={styles.previewCaption}>معاينة مباشرة — لا تعني النشر</p>
        {translation?.name && translation?.quote ? <Testimonials view={{ locale, enabled: true, eyebrow: intro?.eyebrow ?? "", title: intro?.title ?? (locale === "ar" ? "معاينة الرأي" : "Testimonial preview"), summary: intro?.summary ?? "", sourceLabel: intro?.sourceLabel ?? (locale === "ar" ? "المصدر" : "Source"), items: [{ ...payload, ...translation, locale } as unknown as ResolvedTestimonial] }} /> : <p className={styles.emptyState}>أضف الاسم ونص الرأي لتظهر المعاينة هنا.</p>}
      </div>
    </div>;
  }

  if (record.kind === "site-settings") return (
    <div className={styles.editorPanel}>
      <LocaleTabs value={locale} onChange={setLocale} />
      <EditorSection eyebrow="01" title="الهوية والاتصال">
        <TextField payload={payload} path={["identity", "email"]} label="البريد العام" type="email" onChange={updatePayload} />
        <ImageField payload={payload} path={["identity", "profileSrc"]} widthPath={["identity", "profileWidth"]} heightPath={["identity", "profileHeight"]} label="الصورة الشخصية" onChange={updatePayload} />
        <ImageField payload={payload} path={["identity", "logoSrc"]} widthPath={["identity", "logoWidth"]} heightPath={["identity", "logoHeight"]} label="الشعار" onChange={updatePayload} />
        <SocialLinksEditor payload={payload} onChange={updatePayload} />
      </EditorSection>
      <EditorSection eyebrow="WORK" title="جهة العمل الحالية" summary="عدّل الشركة والمسمى عند انتقالك إلى عمل جديد، أو أخفِهما. تبقى مشاريعك القديمة منسوبة لجهاتها الأصلية. التعريف بالعمل لا يمنح إذنًا لنشر المشاريع.">
        <ToggleField payload={payload} path={["identity", "employment", "enabled"]} label="إظهار جهة العمل" description="يمكن إخفاؤها دون حذف البيانات" onChange={updatePayload} />
        <TextField payload={payload} path={["identity", "employment", "url"]} label="موقع الشركة" type="url" onChange={updatePayload} />
        {(["label", "company", "role", "description"] as const).map((field) => <TextField key={field} payload={payload} path={["identity", "employment", "translations", locale, field]} label={{ label: "السطر التمهيدي", company: "اسم الشركة", role: "المسمى الوظيفي", description: "وصف العلاقة المهنية" }[field]} area={field === "description"} locale={locale} onChange={updatePayload} />)}
      </EditorSection>
      <EditorSection eyebrow="02" title="النصوص العامة">
        <TextField payload={payload} path={[...translationBase, "brandName"]} label="الاسم" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "brandDescriptor"]} label="الوصف المهني" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "primaryCtaLabel"]} label="زر التواصل" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "contactDockLabel"]} label="عنوان التواصل السريع" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "whatsappLabel"]} label="وصف واتساب" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "facebookLabel"]} label="وصف فيسبوك" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "footerText"]} label="نص الفوتر الكامل" locale={locale} onChange={updatePayload} />
      </EditorSection>
      <EditorSection eyebrow="02A" title="نصوص الواجهة وإتاحة الاستخدام" summary="أسماء التحكم التي يستخدمها الزائر وقارئ الشاشة.">
        <TextField payload={payload} path={[...translationBase, "navigationLabel"]} label="وصف التنقل الرئيسي" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "skipToContentLabel"]} label="تخطي إلى المحتوى" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "languageSwitcherLabel"]} label="وصف مبدّل اللغة" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "themeSwitcherLabel"]} label="وصف مبدّل الألوان" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "lightThemeLabel"]} label="اسم الوضع الفاتح" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "darkThemeLabel"]} label="اسم الوضع الداكن" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "mobileMenuOpenLabel"]} label="فتح قائمة الموبايل" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "mobileMenuCloseLabel"]} label="غلق قائمة الموبايل" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "mobileMenuLabel"]} label="اسم زر القائمة" locale={locale} onChange={updatePayload} />
        <TextField payload={payload} path={[...translationBase, "mobileMenuTitle"]} label="عنوان قائمة الموبايل" locale={locale} onChange={updatePayload} />
      </EditorSection>
      <EditorSection eyebrow="03" title="التنقل">
        {((getAt(payload, [...translationBase, "navigation"]) as JsonObject[] | undefined) ?? []).map((item, index) => (
          <div className={styles.pairedFields} key={asString(item.key)}>
            <TextField payload={payload} path={[...translationBase, "navigation", String(index), "label"]} label={`اسم رابط ${index + 1}`} locale={locale} onChange={updatePayload} />
            <TextField payload={payload} path={[...translationBase, "navigation", String(index), "href"]} label="المسار" type="url" onChange={updatePayload} />
          </div>
        ))}
      </EditorSection>
      <SeoFields payload={payload} base={translationBase} locale={locale} onChange={updatePayload} />
    </div>
  );

  if (record.kind === "homepage") return <div className={styles.editorPanel}><LocaleTabs value={locale} onChange={setLocale} /><EditorSection eyebrow="01" title="الهيرو" summary="النصوص الأساسية التي تظهر في أول شاشة"><TextField payload={payload} path={[...translationBase, "hero", "name"]} label="الاسم" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "role"]} label="التخصص" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "eyebrow"]} label="السطر التمهيدي" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "title"]} label="العنوان الرئيسي" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "summary"]} label="الملخص" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "primaryActionLabel"]} label="الزر الرئيسي" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "secondaryActionLabel"]} label="الزر الثانوي" locale={locale} onChange={updatePayload} /><SelectField payload={payload} path={["actions", "primaryTarget"]} label="وجهة الزر الرئيسي" options={pageTargets} onChange={updatePayload} /><SelectField payload={payload} path={["actions", "secondaryTarget"]} label="وجهة الزر الثانوي" options={pageTargets} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "capabilityLabel"]} label="عنوان القدرات" locale={locale} onChange={updatePayload} /><ListField payload={payload} path={[...translationBase, "hero", "capabilities"]} label="القدرات" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "hero", "blueprint", "liveLabel"]} label="النص أسفل صورة الهيرو" locale={locale} onChange={updatePayload} /></EditorSection><EditorSection eyebrow="02" title="المشاريع المختارة"><TextField payload={payload} path={[...translationBase, "projects", "viewProjectLabel"]} label="زر المشروع" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "projects", "viewAllLabel"]} label="زر كل المشاريع" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "projects", "projectLabel"]} label="تسمية المشروع" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "projects", "progressLabel"]} label="وصف تقدم المشاريع" locale={locale} onChange={updatePayload} /></EditorSection><EditorSection eyebrow="03" title="قسم عني"><TextField payload={payload} path={[...translationBase, "about", "title"]} label="العنوان" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "about", "summary"]} label="الملخص" area locale={locale} onChange={updatePayload} /><ListField payload={payload} path={[...translationBase, "about", "details"]} label="الفقرات" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "about", "profileAlt"]} label="وصف الصورة" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "about", "experienceNumber"]} label="عدد سنوات الخبرة" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "about", "experienceUnit"]} label="وصف الخبرة" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "about", "primarySkill"]} label="التخصص الأساسي" locale={locale} onChange={updatePayload} /><ListField payload={payload} path={[...translationBase, "about", "secondarySkills"]} label="التخصصات المساندة" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "about", "actionLabel"]} label="زر قسم عني" locale={locale} onChange={updatePayload} /></EditorSection><EditorSection eyebrow="VOICES" title="عنوان قسم آراء العملاء" summary="لا يظهر القسم للزوار حتى تضيف رأيًا حقيقيًا منشورًا ومختارًا للهوم."><ToggleField payload={payload} path={["testimonials", "enabled"]} label="إظهار قسم الآراء" onChange={updatePayload} />{(["eyebrow", "title", "summary", "sourceLabel"] as const).map((field) => <TextField key={field} payload={payload} path={["testimonials", "translations", locale, field]} label={{ eyebrow: "السطر التمهيدي", title: "العنوان", summary: "الوصف", sourceLabel: "نص رابط المصدر" }[field]} locale={locale} area={field === "summary"} onChange={updatePayload} />)}</EditorSection><HomepageContactEditor payload={payload} locale={locale} onChange={updatePayload} /><HomepageSectionsEditor payload={payload} locale={locale} onChange={updatePayload} /><SeoFields payload={payload} base={translationBase} locale={locale} onChange={updatePayload} /></div>;

  if (record.kind === "static-page") return <div className={styles.editorPanel}><LocaleTabs value={locale} onChange={setLocale} /><EditorSection eyebrow="PAGE" title="محتوى الصفحة"><TextField payload={payload} path={[...translationBase, "eyebrow"]} label="العنوان التمهيدي" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "title"]} label="عنوان الصفحة" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "summary"]} label="ملخص الصفحة" area locale={locale} onChange={updatePayload} /><ContentBlocksEditor payload={payload} path={[...translationBase, "body"]} locale={locale} onChange={updatePayload} /></EditorSection><SeoFields payload={payload} base={translationBase} locale={locale} onChange={updatePayload} /></div>;

  if (record.kind === "project") return <div className={styles.editorPanel}><ProjectAttributionEditor payload={payload} locale={locale} onChange={updatePayload} employer={getAt(records.find((item) => item.kind === "site-settings")?.payload, ["identity", "employment"])} /><EditorSection eyebrow="STATUS" title="النشر والظهور"><SelectField payload={payload} path={["status"]} label="حالة المشروع" options={[["draft", "مسودة"], ["published", "منشور"]]} onChange={updatePayload} /><ToggleField payload={payload} path={["featured"]} label="عرض في الصفحة الرئيسية" description="يظهر فقط عندما يكون المشروع منشورًا" onChange={updatePayload} /><NumberField payload={payload} path={["featuredOrder"]} label="ترتيب الظهور في الهوم" min={1} onChange={updatePayload} /><TextField payload={payload} path={["implementationDate"]} label="تاريخ التنفيذ" type="date" onChange={updatePayload} /><MachineKeyField payload={payload} path={["filterKey"]} label="مفتاح التصنيف" onChange={updatePayload} /><ListField payload={payload} path={["technologies"]} label="التقنيات" onChange={updatePayload} /><ProjectLinksEditor payload={payload} onChange={updatePayload} /></EditorSection><LocaleTabs value={locale} onChange={setLocale} /><EditorSection eyebrow="CONTENT" title="بيانات المشروع"><TextField payload={payload} path={[...translationBase, "title"]} label="اسم المشروع" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "slug"]} label="الرابط المختصر" locale="en" onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "projectType"]} label="نوع المشروع" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "filterLabel"]} label="اسم التصنيف" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "role"]} label="دوري في المشروع" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "excerpt"]} label="الوصف المختصر" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "overview"]} label="نظرة عامة" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "challenge"]} label="التحدي" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "solution"]} label="الحل" area locale={locale} onChange={updatePayload} /></EditorSection><MediaGalleryEditor payload={payload} locale={locale} onChange={updatePayload} /><SeoFields payload={payload} base={translationBase} locale={locale} onChange={updatePayload} /></div>;

  if (record.kind === "post") return <div className={styles.editorPanel}><EditorSection eyebrow="STATUS" title="النشر والتصنيف"><SelectField payload={payload} path={["status"]} label="حالة المقال" options={[["draft", "مسودة"], ["published", "منشور"]]} onChange={updatePayload} /><ToggleField payload={payload} path={["featured"]} label="مقال مميز" onChange={updatePayload} /><TextField payload={payload} path={["publishedAt"]} label="تاريخ النشر بصيغة ISO" hint="مثال: 2026-09-01T12:00:00.000Z" onChange={updatePayload} /><ListField payload={payload} path={["tags"]} label="الوسوم" onChange={updatePayload} /><CategoryPicker payload={payload} records={records} onChange={updatePayload} /><ImageField payload={payload} path={["featuredImage", "src"]} widthPath={["featuredImage", "width"]} heightPath={["featuredImage", "height"]} label="صورة المقال" onChange={updatePayload} /></EditorSection><LocaleTabs value={locale} onChange={setLocale} /><EditorSection eyebrow="ARTICLE" title="محتوى المقال"><TextField payload={payload} path={[...translationBase, "title"]} label="عنوان المقال" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "slug"]} label="الرابط المختصر" locale="en" onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "excerpt"]} label="مقتطف المقال" area locale={locale} onChange={updatePayload} /><TextField payload={payload} path={["featuredImage", "translations", locale, "alt"]} label="النص البديل لصورة المقال" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={["featuredImage", "translations", locale, "caption"]} label="تعليق الصورة" locale={locale} onChange={updatePayload} /><ContentBlocksEditor payload={payload} path={[...translationBase, "content"]} locale={locale} onChange={updatePayload} /></EditorSection><SeoFields payload={payload} base={translationBase} locale={locale} onChange={updatePayload} /></div>;

  return <div className={styles.editorPanel}><LocaleTabs value={locale} onChange={setLocale} /><EditorSection eyebrow="CATEGORY" title={record.kind === "category" ? "تصنيف المدونة" : "المحتوى"}><TextField payload={payload} path={[...translationBase, "name"]} label="اسم التصنيف" locale={locale} onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "slug"]} label="الرابط المختصر" locale="en" onChange={updatePayload} /><TextField payload={payload} path={[...translationBase, "description"]} label="الوصف" area locale={locale} onChange={updatePayload} /></EditorSection><SeoFields payload={payload} base={translationBase} locale={locale} onChange={updatePayload} /></div>;
}
