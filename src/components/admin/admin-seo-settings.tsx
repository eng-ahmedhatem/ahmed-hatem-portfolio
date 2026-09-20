import type { AdminContentRecord } from "./admin-api";
import styles from "./admin.module.css";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function extractGoogleToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed.includes("<meta")) return trimmed;

  const tag = trimmed.match(/<meta\b[^>]*name=["']google-site-verification["'][^>]*>/i)?.[0];
  return tag?.match(/content=["']([^"']+)["']/i)?.[1]?.trim() ?? trimmed;
}

export function AdminSeoSettings({
  record,
  dirty,
  saving,
  onChange,
  onSave,
}: {
  record?: AdminContentRecord;
  dirty: boolean;
  saving: boolean;
  onChange: (record: AdminContentRecord) => void;
  onSave: () => void;
}) {
  if (!record) {
    return <div className={styles.emptyState}>تعذّر تحميل إعدادات الموقع.</div>;
  }

  const activeRecord = record;
  const identity = asObject(activeRecord.payload.identity);
  const searchConsole = asObject(identity.searchConsole);
  const propertyUrl = asString(searchConsole.propertyUrl);
  const verificationToken = asString(searchConsole.verificationToken);
  const isReady = Boolean(propertyUrl && verificationToken && !dirty);

  function update(field: "propertyUrl" | "verificationToken", value: string) {
    const payload = structuredClone(activeRecord.payload);
    const nextIdentity = asObject(payload.identity);
    const nextSearchConsole = asObject(nextIdentity.searchConsole);
    nextSearchConsole[field] = field === "verificationToken" ? extractGoogleToken(value) : value;
    nextIdentity.searchConsole = nextSearchConsole;
    payload.identity = nextIdentity;
    onChange({ ...activeRecord, payload });
  }

  return (
    <div className={styles.seoHub}>
      <section className={styles.seoIntro}>
        <div>
          <span>SEARCH / VISIBILITY</span>
          <h2>مركز الظهور في محركات البحث</h2>
          <p>إعداد مركزي للتحقق من ملكية الموقع ومراجعة البنية التي يقرأها Google.</p>
        </div>
        <div className={styles.seoReadiness} data-ready={isReady}>
          <i aria-hidden="true" />
          <span>{dirty ? "تغييرات غير محفوظة" : isReady ? "الوسم محفوظ — أكمل التحقق في Google" : "بانتظار الإعداد"}</span>
        </div>
      </section>

      <div className={styles.seoStatusGrid}>
        <article>
          <span>01</span>
          <div><b>الصفحات المحلية</b><small>Canonical + ar/en + x-default</small></div>
          <i data-ok="true">مفعّل</i>
        </article>
        <article>
          <span>02</span>
          <div><b>الفهرسة</b><small>Sitemap و Robots ديناميكيان</small></div>
          <i data-ok="true">مفعّل</i>
        </article>
        <article>
          <span>03</span>
          <div><b>Google Search Console</b><small>تحقق HTML آمن من الخادم</small></div>
          <i data-ok={isReady}>{isReady ? "جاهز" : "غير مكتمل"}</i>
        </article>
      </div>

      <section className={styles.searchConsolePanel}>
        <header>
          <div>
            <span>GOOGLE SEARCH CONSOLE</span>
            <h3>إثبات ملكية الموقع</h3>
          </div>
          <a href="https://search.google.com/search-console/welcome" target="_blank" rel="noreferrer">فتح Search Console ↗</a>
        </header>

        <div className={styles.searchConsoleLayout}>
          <div className={styles.searchConsoleForm}>
            <label>
              <span>رابط خاصية URL-prefix</span>
              <input
                dir="ltr"
                type="url"
                value={propertyUrl}
                placeholder="https://example.com/"
                onChange={(event) => update("propertyUrl", event.target.value)}
                autoComplete="url"
              />
              <small>استخدم الرابط النهائي للموقع مع https وبالشرطة المائلة الأخيرة.</small>
            </label>
            <label>
              <span>رمز التحقق</span>
              <input
                dir="ltr"
                type="text"
                value={verificationToken}
                placeholder="google-site-verification token"
                onChange={(event) => update("verificationToken", event.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <small>يمكنك لصق قيمة content فقط أو وسم meta كاملًا، وسنستخرج الرمز تلقائيًا.</small>
            </label>
            <div className={styles.searchConsoleActions}>
              <button type="button" onClick={onSave} disabled={saving || !dirty}>
                {saving ? "جارٍ الحفظ…" : dirty ? "حفظ ونشر وسم التحقق" : "الإعدادات محفوظة"}
              </button>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer">معاينة Sitemap</a>
              <a href="/robots.txt" target="_blank" rel="noreferrer">معاينة Robots</a>
            </div>
          </div>

          <ol className={styles.searchConsoleSteps}>
            <li><span>1</span><div><b>أضف خاصية جديدة</b><p>اختر نوع URL-prefix في Google واكتب رابط الموقع النهائي.</p></div></li>
            <li><span>2</span><div><b>اختر HTML tag</b><p>انسخ الوسم والصقه هنا ثم احفظ الإعدادات.</p></div></li>
            <li><span>3</span><div><b>أكمل التحقق</b><p>بعد الحفظ يظهر الوسم في الموقع مباشرة. ارجع إلى Google واضغط Verify ثم أرسل sitemap.xml. الحفظ هنا لا يؤكد نجاح التحقق لدى Google.</p></div></li>
          </ol>
        </div>

        <p className={styles.searchConsolePrivacy}>لا نخزن كلمة مرور Google أو مفاتيح OAuth؛ رمز إثبات الملكية عام ويظهر فقط داخل وسم metadata المطلوب.</p>
      </section>
    </div>
  );
}
