"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";
import { useRouter } from "next/navigation";

import { AdminRequestError, adminRequest, type AdminContentRecord, type ContentKind } from "./admin-api";
import dynamic from "next/dynamic";
import { createContentRecord } from "@/domain/content/new-record";

const AdminContentEditor = dynamic(() => import("./admin-content-editor").then((m) => m.AdminContentEditor));
const AdminInbox = dynamic(() => import("./admin-inbox").then((m) => m.AdminInbox));
const AdminSecurity = dynamic(() => import("./admin-security").then((m) => m.AdminSecurity));
import { AdminLogo } from "./admin-logo";
import { AdminSeoSettings } from "./admin-seo-settings";
import styles from "./admin.module.css";

type View = "overview" | "content" | "messages" | "analytics" | "seo" | "security";
interface ContactItem { _id: string; name: string; email: string; phone?: string; service: string; details: string; locale: "ar" | "en"; status: "new" | "read" | "archived"; createdAt: string; }
interface AnalyticsData { rangeDays: number; views: number; uniqueVisitors: number; byDevice: { _id: string; value: number }[]; byDay: { _id: string; value: number }[]; topPages: { _id: string; value: number }[]; }
interface AuditItem { id: string; actorEmail?: string; action: string; entityKind?: string; entityId?: string; createdAt: string; }

const kindLabels: Record<ContentKind, string> = {
  "site-settings": "الهوية والملف الشخصي",
  homepage: "الصفحة الرئيسية",
  "static-page": "الصفحات",
  project: "المشاريع",
  post: "المقالات",
  category: "تصنيفات المدونة",
  testimonial: "آراء العملاء",
};

const viewLabels: Record<View, string> = {
  overview: "صباح الإبداع",
  content: "إدارة المحتوى",
  messages: "طلبات التواصل",
  analytics: "تحليلات الزيارات",
  seo: "الظهور في البحث",
  security: "الأمان والتشغيل",
};

function nestedString(source: Record<string, unknown>, path: string[]) {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : "";
}

function recordLabel(record: AdminContentRecord) {
  return nestedString(record.payload, ["translations", "ar", "title"])
    || nestedString(record.payload, ["translations", "ar", "name"])
    || nestedString(record.payload, ["translations", "ar", "brandName"])
    || kindLabels[record.kind];
}


function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function recordKey(record: Pick<AdminContentRecord, "kind" | "entityId">) {
  return `${record.kind}:${record.entityId}`;
}

function recordStatus(record: AdminContentRecord) {
  const status = record.payload.status;
  if (status === "draft") return "مسودة";
  if (record.kind === "project" && record.payload.featured) return "مميز";
  if (status === "published") return "منشور";
  return "مفعّل";
}

function recordPreviewHref(record: AdminContentRecord, locale: "ar" | "en") {
  if (["project", "post"].includes(record.kind)) return `/preview/${locale}/${record.kind}/${encodeURIComponent(record.entityId)}`;
  if (record.kind === "homepage" || record.kind === "site-settings") return `/${locale}`;
  if (record.kind === "static-page") return `/${locale}/${asString(record.payload.key)}`;
  const slug = nestedString(record.payload, ["translations", locale, "slug"]);
  if (!slug) return null;
  if (record.kind === "project") return `/${locale}/work/${encodeURIComponent(slug)}`;
  if (record.kind === "post") return `/${locale}/blog/${encodeURIComponent(slug)}`;
  if (record.kind === "category") return `/${locale}/blog/category/${encodeURIComponent(slug)}`;
  return null;
}

function recordValidationError(record: AdminContentRecord) {
  if (record.kind !== "project") return null;
  const filterKey = asString(record.payload.filterKey);
  if (!filterKey) {
    return "أضف مفتاح التصنيف بحروف إنجليزية قبل الحفظ.";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(filterKey)) {
    return "مفتاح التصنيف يقبل الحروف الإنجليزية والأرقام و- أو _ فقط.";
  }
  return null;
}

function MiniBars({ data }: { data: { _id: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <div className={styles.miniBars}>{data.map((item) => <div key={item._id} title={`${item._id}: ${item.value}`}><i style={{ blockSize: `${Math.max(8, item.value / max * 100)}%` }} /><span>{item._id.slice(5)}</span></div>)}</div>;
}

export function AdminPortal() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState<View>("overview");
  const [records, setRecords] = useState<AdminContentRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeKind, setActiveKind] = useState<ContentKind>("homepage");
  const [newContactCount, setNewContactCount] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activity, setActivity] = useState<AuditItem[]>([]);
  const [dirtyRecords, setDirtyRecords] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      const secondaryRequests = Promise.allSettled([
        adminRequest<{ items: ContactItem[]; newCount: number }>("/admin/contacts"),
        adminRequest<AnalyticsData>("/admin/analytics"),
        adminRequest<{ items: AuditItem[] }>("/admin/activity"),
      ]);

      try {
        const content = await adminRequest<{ records: AdminContentRecord[] }>("/admin/content");
        if (!mounted) return;
        setRecords(content.records);
        const first = content.records.find((record) => record.kind === "homepage");
        if (first) setSelectedId(first.entityId);
        setLoading(false);

        const [inboxResult, metricsResult, activityResult] = await secondaryRequests;
        if (!mounted) return;
        if (inboxResult.status === "fulfilled") setNewContactCount(inboxResult.value.newCount);
        if (metricsResult.status === "fulfilled") setAnalytics(metricsResult.value);
        if (activityResult.status === "fulfilled") setActivity(activityResult.value.items);
        setBackgroundLoading(false);
      } catch (caught) {
        if (caught instanceof AdminRequestError && caught.status === 401) router.replace("/admin/login");
        else { setError("تعذّر تحميل لوحة الإدارة. أعد تحميل الصفحة للمحاولة."); setLoading(false); setBackgroundLoading(false); }
      }
    }
    void bootstrap();
    return () => { mounted = false; };
  }, [router]);

  useEffect(() => {
    if (!dirtyRecords.size) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyRecords.size]);

  const selected = records.find((record) => record.entityId === selectedId && record.kind === activeKind);
  const selectedIsDirty = selected ? dirtyRecords.has(recordKey(selected)) : false;
  const siteSettingsRecord = records.find((record) => record.kind === "site-settings");
  const siteSettingsIsDirty = siteSettingsRecord ? dirtyRecords.has(recordKey(siteSettingsRecord)) : false;
  const previewLinks = selected && !selectedIsDirty
    ? (["ar", "en"] as const).flatMap((locale) => {
        const href = recordPreviewHref(selected, locale);
        return href ? [{ href, locale }] : [];
      })
    : [];
  const kindRecords = useMemo(() => records.filter((record) => record.kind === activeKind), [activeKind, records]);
  const counts = useMemo(() => ({
    projects: records.filter((item) => item.kind === "project").length,
    posts: records.filter((item) => item.kind === "post").length,
    messages: newContactCount,
  }), [newContactCount, records]);

  function chooseKind(kind: ContentKind) {
    setActiveKind(kind);
    setSelectedId(records.find((record) => record.kind === kind)?.entityId ?? "");
  }

  async function saveRecord(record: AdminContentRecord, successMessage?: string) {
    const validationError = recordValidationError(record);
    if (validationError) {
      setError(validationError);
      setNotice("");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await adminRequest<{ record: AdminContentRecord }>(`/admin/content/${record.kind}/${record.entityId}`, {
        method: "PUT",
        body: JSON.stringify({ payload: record.payload, version: record.updatedAt }),
      });
      setRecords((current) => current.map((item) => item.kind === record.kind && item.entityId === record.entityId ? result.record : item));
      setDirtyRecords((current) => { const next = new Set(current); next.delete(recordKey(record)); return next; });
      setNotice(successMessage ?? (result.record.payload.status === "draft" ? "تم حفظ المسودة بنجاح." : "تم الحفظ والنشر. أصبحت معاينة العربية والإنجليزية جاهزة."));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر حفظ المحتوى.");
    } finally { setSaving(false); }
  }

  async function save() {
    if (selected) await saveRecord(selected);
  }

  function create(kind: "project" | "post" | "category" | "testimonial") {
    const record = createContentRecord(kind, `${kind}-${crypto.randomUUID()}`);
    if (!record) return;
    setRecords((current) => [record, ...current]);
    setDirtyRecords((current) => new Set(current).add(recordKey(record)));
    setActiveKind(kind);
    setSelectedId(record.entityId);
    setNotice("عنصر جديد جاهز. أكمل بياناته ثم اضغط حفظ ونشر.");
  }

  async function remove() {
    if (!selected || !["project", "post", "category", "testimonial"].includes(selected.kind)) return;
    if (!window.confirm(`حذف «${recordLabel(selected)}» نهائيًا؟`)) return;
    try {
    if (selected._id) await adminRequest(`/admin/content/${selected.kind}/${selected.entityId}`, { method: "DELETE" });
    setRecords((current) => current.filter((item) => !(item.kind === selected.kind && item.entityId === selected.entityId)));
    setSelectedId("");
    setDirtyRecords((current) => { const next = new Set(current); next.delete(recordKey(selected)); return next; });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّر الحذف."); }
  }

  async function logout() {
    try {
      await adminRequest("/auth/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّر الخروج."); }
  }

  if (loading) return (
    <motion.main
      className={styles.adminLoading}
      aria-live="polite"
      aria-busy="true"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className={styles.loaderShell}>
        <div className={styles.loaderIdentity}>
          <AdminLogo variant="loader" preload />
          <span>AH / CONTENT STUDIO</span>
        </div>
        <div className={styles.loaderCopy}>
          <h1>نجهّز مساحة عملك</h1>
          <p>يتم الآن تحميل المحتوى المؤمّن.</p>
        </div>
        <div className={styles.loaderRail} role="progressbar" aria-label="جارٍ تحميل لوحة الإدارة"><i /></div>
      </div>
    </motion.main>
  );

  return (
    <main className={styles.portal}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}><AdminLogo variant="sidebar" preload /><div><b>Ahmed Hatem</b><small>Content Studio</small></div></div>
        <nav aria-label="التنقل في لوحة الإدارة">
          {([[
            "overview", "نظرة عامة", "⌁"], ["content", "إدارة المحتوى", "◇"], ["messages", "طلبات التواصل", "✉"], ["analytics", "التحليلات", "↗"], ["seo", "SEO والربط", "◎"], ["security", "الأمان والتشغيل", "⊙"]] as [View, string, string][]).map(([key, label, icon]) => (
            <button type="button" key={key} data-active={view === key} onClick={() => setView(key)}><span aria-hidden="true">{icon}</span>{label}{key === "messages" && counts.messages ? <em>{counts.messages}</em> : null}</button>
          ))}
        </nav>
        <div className={styles.sidebarFoot}><a href="/ar" target="_blank">عرض الموقع <span>↗</span></a><button type="button" onClick={() => void logout()}>تسجيل الخروج</button></div>
      </aside>

      <section className={styles.workspace}>
        {error && view !== "content" && view !== "seo" ? <p className={styles.noticeError} role="alert">{error}</p> : null}
        <header className={styles.workspaceHeader}><div><p>AH / ADMIN</p><h1>{viewLabels[view]}</h1></div><span className={styles.liveState}><i /> النظام متصل</span></header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} className={styles.view} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.24 }}>
            {view === "overview" ? (
              <>
                <div className={styles.metricGrid}>
                  <article><span>المشاريع</span><strong>{counts.projects}</strong><small>داخل معرض الأعمال</small></article>
                  <article><span>المقالات</span><strong>{counts.posts}</strong><small>منشور ومسودة</small></article>
                  <article><span>رسائل جديدة</span><strong>{backgroundLoading ? "—" : counts.messages}</strong><small>بانتظار المراجعة</small></article>
                  <article><span>زيارات 30 يومًا</span><strong>{analytics?.views ?? "—"}</strong><small>{analytics ? `${analytics.uniqueVisitors} متصفح فريد تقريبيًا` : "جارٍ تحميل التحليلات"}</small></article>
                </div>
                <div className={styles.overviewGrid}>
                  <article className={styles.overviewPanel}><header><div><span>نشاط الزيارات</span><h2>آخر 30 يومًا</h2></div><button type="button" onClick={() => setView("analytics")}>كل التحليلات</button></header><MiniBars data={analytics?.byDay ?? []} /></article>
                  <article className={styles.quickPanel}><span>إجراء سريع</span><h2>ما الذي تريد إضافته؟</h2><button type="button" onClick={() => { create("project"); setView("content"); }}>مشروع جديد <b>＋</b></button><button type="button" onClick={() => { create("post"); setView("content"); }}>مقال جديد <b>＋</b></button></article>
                </div>
                <article className={styles.activityPanel}><header><div><span>سجل الإدارة</span><h2>آخر التغييرات المؤمنة</h2></div></header><div>{activity.length ? activity.slice(0, 8).map((item) => <div key={item.id}><time>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time><p><b>{item.action}</b><span>{item.entityKind} / {item.entityId}</span></p><small>{item.actorEmail}</small></div>) : <p className={styles.inlineEmpty}>{backgroundLoading ? "جارٍ تحميل سجل الإدارة…" : "سيظهر النشاط هنا بعد أول عملية حفظ."}</p>}</div></article>
              </>
            ) : null}

            {view === "content" ? (
              <div className={styles.contentWorkspace}>
                <div className={styles.kindRail}>
                  {(Object.keys(kindLabels) as ContentKind[]).map((kind) => <button type="button" key={kind} data-active={activeKind === kind} onClick={() => chooseKind(kind)}>{kindLabels[kind]}<span>{records.filter((item) => item.kind === kind).length}</span></button>)}
                  <div className={styles.createButtons}><button type="button" onClick={() => create("project")}>+ مشروع</button><button type="button" onClick={() => create("post")}>+ مقال</button><button type="button" onClick={() => create("category")}>+ تصنيف</button><button type="button" onClick={() => create("testimonial")}>+ رأي عميل</button></div>
                </div>
                <div className={styles.recordRail}>
                  <p>{kindLabels[activeKind]}</p>
                  {kindRecords.map((record) => <button type="button" key={record.entityId} data-active={selectedId === record.entityId} onClick={() => setSelectedId(record.entityId)}><b>{recordLabel(record)}</b><small>{record.entityId}</small><em data-dirty={dirtyRecords.has(recordKey(record))}>{dirtyRecords.has(recordKey(record)) ? "غير محفوظ" : recordStatus(record)}</em></button>)}
                </div>
                <div className={styles.editorWorkspace}>
                  {selected ? <><div className={styles.editorToolbar}><div><small>{kindLabels[selected.kind]} · {recordStatus(selected)}{selectedIsDirty ? " · تغييرات غير محفوظة" : ""}</small><h2>{recordLabel(selected)}</h2></div><div>{selectedIsDirty ? <span className={styles.previewPending}>احفظ للمعاينة</span> : previewLinks.map((preview) => <a key={preview.locale} className={styles.previewButton} href={preview.href} target="_blank" rel="noreferrer">معاينة {preview.locale.toUpperCase()} ↗</a>)}{["project", "post", "category", "testimonial"].includes(selected.kind) ? <button type="button" className={styles.dangerButton} onClick={() => void remove()}>حذف</button> : null}<button type="button" className={styles.saveButton} onClick={() => void save()} disabled={saving || !selectedIsDirty}>{saving ? "جارٍ الحفظ…" : selected.payload.status === "draft" ? "حفظ المسودة" : "حفظ ونشر"}</button></div></div><AdminContentEditor record={selected} records={records} onChange={(next) => { setRecords((current) => current.map((item) => item.kind === next.kind && item.entityId === next.entityId ? next : item)); setDirtyRecords((current) => new Set(current).add(recordKey(next))); setNotice(""); setError(""); }} /></> : <div className={styles.emptyState}>اختر عنصرًا لتحريره.</div>}
                  <AnimatePresence>{notice || error ? <motion.p className={error ? styles.noticeError : styles.notice} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{error || notice}</motion.p> : null}</AnimatePresence>
                </div>
              </div>
            ) : null}

            {view === "messages" ? (
              <AdminInbox onUnreadChange={setNewContactCount} />
            ) : null}

            {view === "analytics" ? (
              <div className={styles.analyticsView}>
                <div className={styles.metricGrid}><article><span>إجمالي المشاهدات</span><strong>{analytics?.views ?? "—"}</strong><small>آخر {analytics?.rangeDays ?? 30} يومًا</small></article><article><span>المتصفحات الفريدة</span><strong>{analytics?.uniqueVisitors ?? "—"}</strong><small>تقدير يحترم الخصوصية ولا يخزن IP</small></article>{analytics?.byDevice.map((item) => <article key={item._id}><span>{item._id === "mobile" ? "الهاتف" : item._id === "tablet" ? "الجهاز اللوحي" : "الكمبيوتر"}</span><strong>{item.value}</strong><small>مشاهدة</small></article>)}</div>
                <div className={styles.analyticsGrid}><article className={styles.overviewPanel}><header><div><span>التوزيع اليومي</span><h2>حركة الزيارات</h2></div></header><MiniBars data={analytics?.byDay ?? []} /></article><article className={styles.topPages}><span>أكثر الصفحات زيارة</span>{analytics?.topPages.map((item, index) => <div key={item._id}><b>{String(index + 1).padStart(2, "0")}</b><p>{item._id}</p><strong>{item.value}</strong></div>)}</article></div>
              </div>
            ) : null}

            {view === "security" ? <AdminSecurity /> : null}
            {view === "seo" ? (
              <>
                <AdminSeoSettings
                  record={siteSettingsRecord}
                  dirty={siteSettingsIsDirty}
                  saving={saving}
                  onChange={(next) => {
                    setRecords((current) => current.map((item) => item.kind === next.kind && item.entityId === next.entityId ? next : item));
                    setDirtyRecords((current) => new Set(current).add(recordKey(next)));
                    setNotice("");
                    setError("");
                  }}
                  onSave={() => {
                    if (siteSettingsRecord) void saveRecord(siteSettingsRecord, "تم حفظ وسم التحقق. افتح الموقع ثم اضغط Verify في Google؛ لا يلزم نشر جديد.");
                  }}
                />
                <AnimatePresence>{notice || error ? <motion.p className={error ? styles.noticeError : styles.notice} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{error || notice}</motion.p> : null}</AnimatePresence>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
