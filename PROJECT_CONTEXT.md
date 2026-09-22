# Developer Portfolio — AI Project Context

> آخر تحديث موثّق: 2026-09-21
>
> الغرض: هذا الملف هو مرجع التسليم التقني والوظيفي لأي مطوّر أو نموذج AI يعمل على المستودع.

## 0. ابدأ من هنا

قبل تنفيذ أي تغيير:

1. اقرأ `AGENTS.md` كاملًا؛ فهو يحتوي قواعد العمل الإلزامية ومهارات المستودع.
2. اقرأ هذا الملف لفهم الحالة الفعلية الحالية، لا الحالة التي بدأ بها المشروع.
3. شغّل `git status --short` وافحص التغييرات الموجودة قبل التعديل؛ لا تفترض أن شجرة العمل نظيفة.
4. اعتبر الكود الحالي المصدر النهائي للحقيقة عندما تختلف وثيقة تاريخية مع التنفيذ.
5. لا تقرأ أو تطبع أو ترفع محتوى `.env.local`، ولا تضع أي secret أو password أو token في Git.
6. لا تعِد بناء المشروع من الصفر ولا تستبدل المعمارية الحالية من دون طلب صريح.

ترتيب مصادر الحقيقة:

```text
AGENTS.md (قواعد ملزمة)
    ↓
PROJECT_CONTEXT.md (الحالة والمعمارية الحالية)
    ↓
الكود + migrations (التفاصيل التنفيذية النهائية)
    ↓
ROADMAP / START_HERE / TASK_* (مستندات تاريخية أو تخطيطية)
```

## 1. المنتج

منصة Portfolio احترافية ثنائية اللغة للمطوّر أحمد حاتم، تركّز على:

- تطوير MERN.
- تطوير WordPress المتقدم والمخصص.
- ربط الأنظمة وواجهات API.
- أتمتة الأعمال.

التموضع الأساسي تاريخيًا هو `BUILD → CONNECT → AUTOMATE`، بينما النسخة البصرية الحالية تبرز خبرة WordPress والمواقع المخصصة والأداء. الهدف ليس Landing Page عامة، بل Portfolio تحريري تقني يعرض العمل الحقيقي ويحوّل الزائر إلى طلب مشروع.

## 2. الحالة الحالية باختصار

المشروع لم يعد Phase 1 frontend-only. هذه كانت نقطة البداية فقط. النظام الحالي يحتوي على:

- موقع عام كامل بالعربية والإنجليزية.
- Dark mode افتراضي مع Light mode يدوي محفوظ محليًا.
- Header وHero مخصصان، أقسام أعمال وعني وتواصل، ومدونة.
- صفحات أرشيف وتفاصيل للمشاريع والمقالات والتصنيفات.
- لوحة إدارة عربية محمية.
- Supabase PostgreSQL + Auth + Storage.
- إدارة محتوى ثنائية اللغة.
- استقبال طلبات التواصل.
- تحليلات زيارات تراعي الخصوصية.
- SEO محلي لكل لغة مع sitemap وrobots وstructured data.
- تكامل Google Search Console قيد تغييرات شجرة العمل الحالية.
- نشر عبر GitHub إلى Vercel.

آخر حزمة مكتملة قبل دمج حركة الهيرو الحالي:

```text
2a857da feat: refine bilingual homepage and strengthen portfolio CMS
```

المستودع البعيد:

```text
https://github.com/eng-ahmedhatem/ahmed-hatem-portfolio.git
```

حزمة الأداء وSEO وSearch Console رُفعت ضمن هذا commit. افحص `git status` و`git log` لمعرفة أي عمل أحدث قبل بدء مهمة جديدة.

## 3. التقنيات والإصدارات

| المجال | التقنية الحالية |
| --- | --- |
| Framework | Next.js App Router `16.3.0` |
| UI | React `19.2.8` + TypeScript |
| Motion | Motion for React `13` |
| Advanced animation | GSAP موجود كاعتماد، ويستخدم فقط عند الحاجة الفعلية |
| Validation | Zod `4` |
| Data/Auth/Storage | Supabase JS `2` |
| Primary deployed API | Next.js Route Handler داخل `/api/cms/[...path]` |
| Legacy/local API | Express runner موجود للتوافق والتشخيص فقط |
| Database | Supabase PostgreSQL |
| Hosting | Vercel، متصل بمستودع GitHub |
| Runtime | Node.js `22.x` |
| Package manager | npm `10.9.8` |

لا تُحدّث Next.js أو React أو أي dependency تلقائيًا. اقرأ دليل الإصدار المثبّت داخل `node_modules/next/dist/docs/` قبل تعديل conventions خاصة بـNext.js.

## 4. المعمارية

### 4.1 تدفق المحتوى العام

```text
Server page/layout
    ↓
feature view model: src/features/site/view-models.ts
    ↓
ContentRepository interface: src/domain/content/repositories.ts
    ↓
ApiContentRepository أو MockContentRepository
    ↓
Supabase content_records أو bundled mock fallback
    ↓
presentation components
```

قاعدة ثابتة: presentation components لا تستورد mock content مباشرة. كل النصوص التحريرية تصل عبر repository/view-model layer.

`ApiContentRepository` اسمه تاريخي؛ في نشر Vercel لا يجري HTTP داخليًا، بل يستدعي طبقة الخادم مباشرة ثم يستخدم `unstable_cache`. عند تعذّر Supabase، الموقع العام يرجع إلى bundled mock snapshot بدل إسقاط الموقع. لوحة الإدارة لا تعمل في وضع fallback لأنها تحتاج قاعدة البيانات والمصادقة الحقيقية.

### 4.2 تدفق لوحة الإدارة

```text
/admin (Server Component session guard)
    ↓
AdminPortal (client UI)
    ↓
/api/cms/[...path] (Node.js Route Handler)
    ↓
server/cms-handler.ts
    ↓
Supabase Auth / PostgreSQL / Storage
```

بعد تعديل أو حذف محتوى، Route Handler يمسح content cache ويعيد التحقق من الصفحات المحلية و`/sitemap.xml`.

### 4.3 اختيار repository

- `CONTENT_REPOSITORY=api`: محتوى Supabase مع fallback محلي للموقع العام.
- أي قيمة أخرى أو غياب المتغير: `MockContentRepository` فقط.

## 5. خريطة المستودع

```text
src/app/                         App Router routes, layouts, metadata routes
src/components/home/             Hero, projects, about preview
src/components/layout/           Header, footer, language/theme switchers, contact dock
src/components/work/             Work archive, project details, gallery/lightbox
src/components/blog/             Blog archive and article presentation
src/components/contact/          Contact page and form
src/components/admin/            Login, CMS portal, editors, SEO settings
src/components/motion/           LazyMotion foundation and reusable reveals/transitions
src/domain/content/              TypeScript content contracts and repository interface
src/data/                        Repository selection, caching, mocks, implementations
src/features/site/               Page/view models between data and UI
src/lib/i18n/                    Locale resolution and direction helpers
src/lib/seo/                     Metadata, URLs, JSON-LD builders
server/                          Auth, CMS handler, validation, Supabase access
supabase/migrations/             Database/storage/security schema
public/assets/                   Logo, profile, project and blog media
.agents/skills/                  Repository-local implementation guidance
```

## 6. المسارات وi18n

اللغات المدعومة فقط:

- `ar`: `dir="rtl"`، محتوى عربي حقيقي.
- `en`: `dir="ltr"`، محتوى إنجليزي حقيقي.

المسارات العامة القابلة للفهرسة:

```text
/[locale]
/[locale]/work
/[locale]/work/[slug]
/[locale]/blog
/[locale]/blog/[slug]
/[locale]/blog/category/[slug]
/[locale]/contact
/[locale]/about        (تحويل مقصود إلى قسم عني في الصفحة الرئيسية)
```

`/` ليس صفحة محتوى؛ `src/proxy.ts` يحدد اللغة ثم يحوّل إلى `/ar` أو `/en` بهذا الترتيب:

1. cookie صحيح لاختيار صريح سابق.
2. `Accept-Language` من المتصفح.
3. الإنجليزية fallback.

Language switcher يجب أن يحفظ الاختيار ويحافظ على المسار المقابل المترجم قدر الإمكان. لا تعرض نصًا إنجليزيًا داخل صفحة عربية بصمت. استخدم CSS logical properties، ولا تعتمد على `left/right` في layout جديد إلا لسبب بصري موثق.

## 7. الخطوط والهوية البصرية

الخطوط محلية عبر `next/font/local`:

- العربية — العناوين: El Messiri، variable `--font-ar-display`.
- العربية — النصوص والأزرار والتنقل: Almarai، variable `--font-ar-body`.
- الإنجليزية: Manrope، variable `--font-en`.

النظام البصري الحالي Dark-first:

| Token | Dark | Light |
| --- | --- | --- |
| background | `#07101c` | `#f3f6fa` |
| surface | `#0b1624` | `#ffffff` |
| primary | `#0b6edc` | `#0a72e8` |
| accent | `#31b4ff` | `#169ff0` |
| text | `#f1f6fc` | `#071426` |

المصدر الكامل للتوكنز هو `src/app/globals.css`. الشعار الحالي موجود في `public/assets/logo/`، وصورة الملف الشخصي الأساسية في `public/assets/profile/profile-cutout.png`.

تجنب العودة إلى: قوالب SaaS العامة، كثرة البطاقات المتشابهة، blobs، gradients بلا معنى، glassmorphism مفرط، أو حركات زخرفية لا تدعم التسلسل أو الحالة.

## 8. التجربة العامة المنفذة

- Header ثابت/متجاوب مع تنقل، تبديل لغة، تبديل ألوان، CTA، وقائمة هاتف مع إدارة focus.
- Hero تحريري متحرك يحتوي اسم أحمد، positioning واضح، صورة شخصية بدون خلفية، ورسم SVG متفاعل مع الظهور والتمرير.
- الصفحة الرئيسية تعرض أربعة مشاريع مختارة، قسمًا بسيطًا لعني داخل الصفحة، وقسم تواصل.
- صفحة المشاريع: filters، أربع بطاقات في الصف على المقاسات الواسعة، pagination، وحركات ظهور.
- صفحة المشروع: case study، بيانات المشروع، معرض صور، lightbox، أسهم تنقل وإغلاق.
- المدونة: صور للمقالات، filters، pagination، صفحات مقال وتصنيف.
- صفحة التواصل: نموذج ثنائي اللغة محفوظ في Supabase.
- Footer حالي مختصر بسطر واحد، ونصه قابل للتعديل من إعدادات الموقع.
- WhatsApp وFacebook موجودان في Contact Dock.
- شاشة loading عامة وشاشة loading منفصلة للوحة الإدارة.

## 9. نموذج المحتوى

المصدر: `src/domain/content/types.ts`. أنواع السجلات في `content_records`:

| kind | الوظيفة |
| --- | --- |
| `site-settings` | الهوية، الشعار، الصورة، الروابط، التنقل، Footer، SEO العام، تكاملات الموقع |
| `homepage` | Hero وأقسام الصفحة الرئيسية وترتيبها |
| `static-page` | صفحات ثابتة مثل contact/about data |
| `project` | المشاريع، الحالة، featured، التقنيات، الروابط، media، SEO والترجمات |
| `post` | المقالات، الصور، blocks، التصنيفات، tags، SEO والترجمات |
| `category` | تصنيفات المدونة وترجماتها وSEO |
| `testimonial` | آراء العملاء، إذن العرض، الحالة، الاختيار للهوم، الترتيب، الصورة، والنص باللغتين |

القاعدة التصميمية للبيانات:

- machine/shared fields خارج `translations`: IDs، الحالة، التواريخ، media IDs، technologies، flags.
- editorial/localized fields داخل `translations.ar` و`translations.en`: title، slug، excerpt، body، alt، CTA، SEO.
- لا تنشر draft في route manifest أو sitemap.
- slugs يجب أن تكون فريدة بين السجلات من النوع نفسه عبر اللغتين.
- `entityId` و`filterKey` يقبلان فقط الحروف الإنجليزية والأرقام و`-` و`_` عندما يفرض schema ذلك.

Bundled seed data موجود في `src/data/mock/`. لا تستورده presentation components.

## 10. لوحة الإدارة

المسارات:

```text
/admin/login
/admin
```

الواجهات الموجودة:

- Overview: أعداد المحتوى والرسائل والزيارات والنشاط.
- Content: تحرير هوية الموقع والصفحة الرئيسية والصفحات والمشاريع والمقالات والتصنيفات.
- Messages: فلتر الحالة، pagination، إجمالي الرسائل غير المقروءة، تغيير الحالة، وإعادة محاولة تنبيه البريد الفاشل.
- الأمان والتشغيل: إعداد TOTP، حالة الحماية المشتركة والبريد والنطاق، تنزيل نسخة JSON من المحتوى وفحصها دون الاستعادة.
- Analytics: views، unique visitor estimate، device breakdown، days، top pages.
- SEO والربط: إعداد Search Console ومراجعة sitemap/robots — موجود ضمن تغييرات العمل الحالية.

المحرر يدعم العربية والإنجليزية، رفع الصور، preview لكل لغة، draft/published، featured projects، وترتيب المحتوى. الحفظ يستخدم optimistic concurrency عبر `updatedAt` ويرفض الكتابة فوق نسخة أحدث برسالة `409`.

## 11. Supabase

طبّق migrations بهذا الترتيب فقط:

```text
supabase/migrations/20260901000000_portfolio_core.sql
supabase/migrations/20260901010000_admin_security.sql
supabase/migrations/20260920000000_operational_hardening.sql
supabase/migrations/20260920010000_testimonials.sql
```

الجداول:

- `content_records`: JSONB CMS records.
- `contact_submissions`: رسائل نموذج التواصل وحالتها.
- `page_views`: analytics events بvisitor hash وليس IP خامًا.
- `admin_audit_log`: سجل append-only لتغييرات المدير وتسجيل الدخول.
- `request_limits`: حدود الطلبات المشتركة، مفاتيح HMAC لا تحتوي عناوين IP الخام، وتُستهلك ذريًا عبر `portfolio_consume_limit`.
- أعمدة `notification_status` و`notification_sent_at` و`notification_error` ضمن جدول طلبات التواصل لتتبع التنبيه فقط.

التخزين:

- bucket: `portfolio-assets`.
- public read للصور فقط.
- حد الرفع 4 MB.
- الصيغ: JPEG، PNG، WebP، AVIF.
- الخادم يفحص MIME المعلن وmagic bytes ويولد UUID للملف.

RLS مفعّل والجداول محجوبة عن `anon` و`authenticated`. الوصول التطبيقي للبيانات الحساسة يتم عبر server-only secret key.

## 12. API الحالية

المسار المجمع: `/api/cms/[...path]`.

أهم العمليات:

```text
GET    /api/cms/health
GET    /api/cms/public/snapshot
POST   /api/cms/auth/login
POST   /api/cms/auth/logout
GET    /api/cms/auth/me
GET    /api/cms/admin/content
PUT    /api/cms/admin/content/:kind/:entityId
DELETE /api/cms/admin/content/:kind/:entityId
POST   /api/cms/admin/assets
GET    /api/cms/admin/contacts
PATCH  /api/cms/admin/contacts/:id
GET    /api/cms/admin/analytics
GET    /api/cms/admin/activity
POST   /api/cms/contact
POST   /api/cms/analytics
```

`server/index.ts` وExpress runner موجودان للاستخدام المحلي/القديم، لكن Vercel يعتمد Next Route Handler السابق. لا تنشئ API ثانية موازية من دون داعٍ.

## 13. المصادقة والأمان

- المستخدم المدير يُنشأ/يُجهز عبر Supabase Auth عند نجاح تهيئة backend أول مرة.
- يجب أن يحمل `app_metadata.role = "admin"`.
- بيانات الجلسة JWT موقعة بـHS256 وتتحقق أيضًا من المستخدم الحالي في Supabase.
- عمر الجلسة 8 ساعات.
- cookie: `HttpOnly`، `SameSite=Strict`، `Priority=High`، و`Secure` في production.
- اسم cookie في production يبدأ بـ`__Host-`.
- عمليات mutation ترفض cross-site origin/referer.
- admin requests تحتاج header داخلي `X-Portfolio-Admin: 1` إضافة إلى session صالحة.
- login rate limit موزع عبر Supabase RPC: 8 محاولات لكل عنوان شبكة خلال 15 دقيقة، مع حدود منفصلة لـMFA والاستعادة والتواصل والتحليلات؛ فشل مخزن الحماية يرفض الطلب بدل تعطيل الحماية.
- يوجد تأخير ثابت جزئي عند فشل تسجيل الدخول لتقليل timing leakage.
- security headers موجودة في `next.config.ts`: CSP frame/object/base/form restrictions، HSTS في production، nosniff، referrer policy، permissions policy.
- `/admin` و`/api/` ممنوعان في `robots.txt`، وadmin metadata هي `noindex, nofollow, nocache`.

التحقق بخطوتين TOTP متاح من تبويب «الأمان والتشغيل» ويتطلب كلمة المرور الحالية ثم رمز التطبيق. تسجيل الدخول لا ينشئ جلسة مدير قبل تحقق الرمز إذا كان العامل مفعّلًا. cookie خطوة MFA مشفر، مدته 5 دقائق، ولا يصل إلى JavaScript. فحص الجلسة يرفض الحساب الموقوف وتغيير `session_version`؛ تسجيل الخروج وإعادة تعيين كلمة المرور وتفعيل MFA تلغي الجلسات السابقة.

`/admin/recover` يستخدم رمز Supabase أحادي الاستخدام في URL fragment بدل query لتجنب access logs. إرسال رابط الاستعادة يتطلب إعداد Resend. لا تُفعّل MFA للحساب نيابة عن صاحبه؛ يجب أن يسجل تطبيق المصادقة بنفسه.

قبل إعداد البريد يمكن للمالك تشغيل `npm run admin:password` في terminal تفاعلي. يسأل عن كلمة مرور مخفية وتأكيدها، ويعدّل فقط حساب `ADMIN_EMAIL` الموجود ذي دور admin، ويغيّر `session_version` دون إزالة MFA أو حفظ/طباعة كلمة المرور. لا ينفذه المساعد نيابة عن المستخدم ولا يستخرج الأسرار من `.env.local`.

## 14. التحليلات

- tracker يتأخر حتى idle/بعد مهلة قصيرة ولا يعطل rendering.
- لا يسجل في localhost/development.
- يحترم Do Not Track.
- يستبعد bots المعروفة وLighthouse/headless previews.
- visitor ID من المتصفح يُحوّل على الخادم إلى HMAC-SHA256 باستخدام `ANALYTICS_SALT`؛ لا يُخزن IP خام.
- device classification: mobile / tablet / desktop من User-Agent.
- لوحة الإدارة تعرض آخر 30 يومًا افتراضيًا، ويمكن API قبول 7–90 يومًا.
- unique visitors قيمة تقريبية حسب visitor hash، وليست بديلًا كاملًا لـGA4 أو Search Console.

## 15. SEO

كل صفحة عامة مترجمة يجب أن تملك:

- title وdescription محليين.
- self canonical مستقل لكل لغة.
- `hreflang="ar"` و`hreflang="en"` و`x-default`.
- Open Graph وTwitter metadata محليين.
- JSON-LD مناسب: WebSite، WebPage/ProfilePage، CreativeWork، BlogPosting.
- H1 حقيقي server-rendered.

الملفات المركزية:

```text
src/lib/seo/metadata.ts
src/lib/seo/structured-data.ts
src/lib/seo/site.ts
src/app/sitemap.ts
src/app/robots.ts
```

`sitemap.xml` يُبنى من repository route manifest، ويستبعد drafts والترجمات المفقودة، ويضيف alternates لكل زوج مترجم. لا تجعل canonical العربية يشير إلى الإنجليزية أو العكس.

`NEXT_PUBLIC_SITE_URL` يجب أن يكون نطاق production النهائي؛ وإلا ستخرج canonical وsitemap بعنوان localhost أو نطاق مؤقت.

### Google Search Console

التكامل الحالي يستخدم طريقة HTML tag الآمنة لخاصية URL-prefix:

- المدير يضيف property URL وverification token في تبويب `SEO والربط`.
- يمكن لصق قيمة `content` أو وسم meta كامل.
- الخادم يخرج `google-site-verification` عبر Next Metadata API.
- لا يتم تخزين password أو OAuth credentials لـGoogle.
- بعد النشر يضغط المستخدم Verify داخل Google ثم يرسل `/sitemap.xml` يدويًا.

هذا التكامل يثبت الملكية ولا يستورد تقارير Search Console إلى لوحة الإدارة. استيراد clicks/impressions/CTR/position سيكون مهمة مستقلة تحتاج OAuth/Google API وتصميم صلاحيات واضح.

## 16. الأداء

القرارات الحالية:

- Server Components هي الافتراضية؛ client boundaries فقط للتفاعل والحركة.
- محتوى Supabase مخزن عبر `unstable_cache` لمدة ساعة مع tag invalidation عند حفظ CMS.
- Next Image مستخدم للصور مع `sizes`؛ صورة الهيرو تستخدم `loading="eager"` و`fetchPriority="high"`، وصور الأقسام التالية lazy-loaded.
- صيغ الصور الناتجة AVIF/WebP ومدة cache طويلة للأصول ذات الأسماء الفريدة.
- صور الأقسام أسفل fold lazy-loaded. لا تستخدم `content-visibility` على أقسام الهوم التي تتغير أبعادها وتؤثر في انتقال الروابط الداخلية وحسابات Motion.
- Motion features تُحمّل عبر `LazyMotion`.
- animations تعتمد transform/opacity وتحترم `prefers-reduced-motion`.
- الخطوط عربية محلية non-preloaded لتجنب تحميل أربعة ملفات غير مستخدمة في الصفحة الإنجليزية؛ Manrope يبقى preload الأساسي.
- Analytics مؤجلة ولا تعمل على local.

لا تضف third-party scripts في `<head>` أو مكتبة UI/animation كبيرة من دون قياس سببها. لا تستخدم `preload` لأكثر من مرشح LCP واحد في الصفحة.

## 17. متغيرات البيئة

الأسماء فقط — لا تضع القيم هنا:

### Public/origin

```text
APP_ORIGIN
NEXT_PUBLIC_SITE_URL
CONTENT_REPOSITORY
```

### Supabase

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_STORAGE_BUCKET
```

Legacy aliases مقبولة حاليًا:

```text
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Security/admin

```text
SESSION_SECRET       # 32+ chars
ANALYTICS_SALT       # 16+ chars, منفصل عن session secret
ADMIN_EMAIL
ADMIN_PASSWORD       # 12+ chars
RESEND_API_KEY       # optional, server-only
MAIL_FROM            # optional, verified sending email
CONTACT_NOTIFICATION_EMAIL # optional, defaults to ADMIN_EMAIL
```

`SUPABASE_SECRET_KEY` و`SESSION_SECRET` و`ANALYTICS_SALT` و`ADMIN_PASSWORD` server-only. لا يبدأ أي منها بـ`NEXT_PUBLIC_`. ملف `.env.example` هو القالب، و`.env.local` مستبعد من Git.

## 18. أوامر التشغيل والتحقق

```powershell
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

فحص الصحة محليًا:

```text
http://localhost:3000/api/cms/health
```

قبل تسليم أي تغيير وظيفي مهم:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. Visual QA للعربية والإنجليزية على 1440، 1280، 1024، 768، 430، 390.
5. افحص console errors، overflow، keyboard/focus، reduced motion، light/dark.
6. افحص canonical/hreflang/JSON-LD/robots/sitemap إذا مس التغيير routing أو content أو SEO.

## 19. النشر

- المصدر: GitHub remote المذكور أعلاه.
- المنصة: Vercel.
- قاعدة البيانات والملفات والمصادقة: Supabase.
- دليل النشر التفصيلي: `DEPLOY_VERCEL_AR.md`.

قبل production deployment:

- تأكد من تطبيق migrations.
- اضبط جميع env vars في Vercel للـProduction والـPreview حسب الحاجة.
- اضبط `APP_ORIGIN` و`NEXT_PUBLIC_SITE_URL` على النطاق النهائي نفسه.
- لا تستخدم deployment URL مؤقتًا كcanonical دائم.
- افحص أن Deployment Protection لا يمنع الزوار أو Google إن كان الموقع عامًا.
- اختبر `/`, `/ar`, `/en`, `/admin`, رفع الصور، contact form، `robots.txt`, `sitemap.xml`.

## 20. حالة العمل النشطة

حزمة العمل الحالية تشمل تحسينات الأداء وSEO السابقة، وجهة العمل، نسبة المشاريع، آراء العملاء، ومعاينات المسودات وتقوية الإدارة.

- **جهة العمل**: `identity.employment` قابل للإخفاء والتعديل باللغتين. القيمة الافتراضية بطلب صاحب الموقع هي عربي سيو و`https://www.arbiseo.com/`. تغيير جهة العمل لا يغيّر مشاريع الماضي.
- **نسبة المشروع**: `project.attribution` لقطة مستقلة باسم جهة التنفيذ ورابطها ومساهمتك ونص الحقوق. نشر أعمال الفريق يتطلب `permissionConfirmed` ونصوصًا مكتملة. لا تُنسب المشاريع السابقة تلقائيًا للشركة، ولا يعني ذكر اسمها وجود تصريح قانوني.
- **الآراء**: من إدارة المحتوى ← آراء العملاء ← + رأي عميل. مسودة/منشور، الاسم والمسمى والشركة والنص باللغتين، صورة ومصدر اختياريان، إذن العرض، اختيار الهوم وترتيبه. الهوم يعرض أول 6 فقط ويخفي القسم إن لم توجد آراء صالحة. لم تُزرع أي توصيات وهمية.
- **عنوان الآراء**: قابل للتحرير والإخفاء من إعدادات الصفحة الرئيسية. Defaults في طبقة البيانات، لا داخل presentation.
- **المعاينات**: `/preview/[locale]/[kind]/[id]` للمشروع/المقال. جلسة مدير مطلوبة، noindex/no-store، ولا تُعدّل حالة السجل أو تضعه في cache العام.
- **النشر العام**: يمنع المسودات، المقالات المستقبلية، ومشاريع الشركة غير المصرّح بعرضها في الصفحات وroute manifest وsitemap.
- **التهيئة**: seed للمحتوى في قاعدة فارغة فقط؛ لا يعيد إنشاء سجل حذفه المدير.
- **النسخ**: JSON للمحتوى فقط، يتضمن روابط الصور لا ملفاتها. الفحص لا ينفذ restore. نسخ قاعدة البيانات/Storage دوريًا واستعادة disaster recovery ما زالت خطوات تشغيل منفصلة.
- **البريد**: تنبيه عام برقم الطلب ورابط لوحة الإدارة؛ لا يرسل بيانات العميل إلى مزوّد البريد. يفشل التنبيه دون فقد الطلب. يحتاج مفاتيح إرسال فعلية واختبار التسليم.

التحقق المحلي الأخير: نجحت lint/typecheck/build والاختبارات الآلية الـ14 للمحتوى والحماية. مراجعة بصرية للآراء AR/EN عند 1440،1280،1024،768،430،390 ببيانات اختبار محلية فقط، وتمت إزالة صفحات الاختبار المؤقتة. جرى تطبيق migrations بتاريخ 20260920 على مشروع Supabase والتحقق من قيد testimonial. لا تفترض نشر Vercel أو إكمال Google verification من هذا الملف؛ افحص الحالة الحية.

نقطة التسليم الحالية: نسي المالك كلمة المرور، فتم تجهيز أمر `npm run admin:password` وتوضيح تشغيله له. لم يغيّر المساعد كلمة المرور. اختبار الحفظ والمعاينة من حساب المدير الحقيقي لم يكتمل بعد؛ يحتاج دخول المالك. طلب المالك صراحة رفع الحزمة إلى GitHub بعد الاختبار؛ افحص `git log` وحالة remote لمعرفة commit الرفع.

تحديث الهوم الأخير: تركيب تحريري أوضح، صورة محددة المساحة ورسم SVG هادئ خلفها، عنوانا Hero/About في سطرين على المقاسات الستة باللغتين، وحركة ظهور/تمرير مخففة. النصوص الافتراضية أصبحت موجهة لفوائد العميل عبر `src/data/defaults/homepage-copy.ts`؛ تستبدل القيم القديمة المطابقة فقط في repository ومحرر الإدارة دون الكتابة فوق نصوص CMS المخصصة. إصلاح إعادة الانتقال إلى `#about` بعد إغلاق قائمة الهاتف، مع نقل focus واحترام reduced motion.

دمج الهيرو (2026-09-21): استُعيد رسم AH من الهوية المتحركة القديمة ضمن مساحة الصورة فقط، مع الإبقاء على النصوص والأزرار والتكوين المقروء الحالي. رسم تدريجي عند دخول المشهد، عمق خفيف للصورة والرسم مع الماوس والتمرير، وإشارة تتحرك على مسار SVG منحني بالتمرير دون loop دائم. مشهد الصورة يتتبع viewport الخاص به لتوقيت صحيح على الهاتف، ويعطّل الحركة عند reduced motion. لا تغييرات في عقود CMS أو المحتوى أو routing. نجحت lint/typecheck و14 اختبارًا وبناء الإنتاج باتصال Supabase الفعلي؛ تمت مراجعة AR/EN على المقاسات الستة والتمرير والوضع الفاتح. reduced motion راجعناه في الكود وCSS، دون محاكاة إعداد النظام. تأكيد الرفع من Git لا يعني تأكيد اكتمال نشر Vercel.

متابعة الهيرو: تكبير مساحة الصورة/AH من 4 إلى 5 أعمدة على الكمبيوتر وزيادتها على الهاتف. ارتفاع الهيرو الأدنى هو `100svh` ناقص ارتفاع الهيدر وحدوده، مع تمدد طبيعي على الهاتف أو عند زيادة المحتوى بدل قصّه. مجموعة النصوص متوسطة رأسيًا. استُبدل الكشف السريع بتأثير كتابة حرفية فعلي في `hero-typed-line.tsx`: MotionValue يعرض graphemes بالتتابع بعد تحميل الخط وظهور العنوان؛ نص عربي متصل في عقدة واحدة ومؤشر يتبع الكتابة، ثم يبدأ السطر الثاني. النص الكامل يبقى في H1 المرسل من الخادم والطبقة المتحركة aria-hidden؛ reduced motion يعرض النص كاملًا. جرى التحقق بصريًا من الكتابة في منتصف الحركة باللغتين، وثبات السطرين وعدم overflow بالمقاسات الستة.

تحسين صورة «عني»: إزالة الرقم 05 الضخم والظل الأزرق المكرر وبطاقة الخبرة المتداخلة مع الجسم؛ إطار خفيف بزوايا منطقية وشريط خبرة مستقل أسفل الصورة، مع ظهور transform/opacity وعمق تمرير هادئ. المحتوى والصورة ما زالا من CMS، ولا تغييرات في العقود أو المسارات. نجحت lint/typecheck/build والاختبارات الـ14؛ مراجعة بصرية للكمبيوتر والهاتف. reduced motion راجعناه في الكود وCSS، دون محاكاة إعداد النظام.

## 21. قواعد التغيير الآمن

إصلاح تشغيل (2026-09-22): حركة العناصر العائمة تستخدم MotionValues مباشرة ومؤقّتًا قابلًا للإلغاء في `ambient-loop.ts`، وليس حلقة `while/await controls.start()`؛ الأخيرة قد تتكرر فورًا قبل اشتراك ميزات LazyMotion فتحتكر microtask queue وتعلّق ظهور المحتوى. الحركة تتوقف عند إخفاء التبويب أو خروج العنصر أو reduced motion. أضيف اختباران لمنع التكرار الفوري والتحقق من إلغاء المؤقّت. نجحت الاختبارات الـ16 وlint/typecheck/build؛ اختُبرت نسخة `next start` محليًا بالعربية على الهاتف والإنجليزية على الكمبيوتر مع إعادة التحميل وفتح القائمة والتنقل للمشاريع والعودة، دون أخطاء JavaScript. لا يعني ذلك تأكيد نشر Vercel.

- افهم request الحالي ثم استخدم أصغر مجموعة skills مناسبة من `.agents/skills`.
- لا تعدّل foundation أو routes أو content contracts لمجرد تنظيف شكلي.
- حافظ على repository boundary؛ لا تجعل component يستدعي Supabase أو mock مباشرة.
- حافظ على bilingual completeness في النصوص والـalt والـSEO والـslugs.
- حافظ على RTL/LTR intentional composition وCSS logical properties.
- لا تضع أسرارًا في client components أو logs أو Markdown.
- لا تحذف fallback content؛ هو مسار استمرارية للموقع العام.
- لا توسع صلاحيات Supabase anon/authenticated لتسهيل التطوير.
- لا تتجاوز session guard أو origin checks في لوحة الإدارة.
- لا تغيّر أو تحذف migrations مطبقة؛ أضف migration جديدة لأي schema change لاحق.
- لا تفترض أن نجاح build يعني جودة الواجهة؛ Visual QA إلزامي للتغييرات المرئية.

## 22. أمور غير منفذة أو تحتاج قرارًا مستقلًا

- لا يوجد استيراد فعلي لبيانات Google Search Console داخل لوحة الإدارة؛ الموجود هو ownership verification فقط.
- اختبارات معزولة عبر `npm test` تغطي عقود المحتوى، بوابات النشر، metadata، المصادقة، MFA، حدود الطلبات، parsing، وخصوصية التحليلات. لا توجد حزمة E2E شاملة لكل العمليات.
- إرسال البريد واستعادته يحتاج `RESEND_API_KEY` و`MAIL_FROM` من نطاق موثّق. وجود الكود لا يعني أن وصول البريد اختُبر.
- النطاق العام النهائي لا يُحفظ في المستودع؛ يجب التحقق منه من Vercel env قبل SEO launch.
- Express المحلي أصبح adapter إلى `handleCmsRequest` نفسه، وليس تطبيق صلاحيات موازٍ. نشر Vercel يستخدم Next Route Handler مع إبطال cache و`after()` للتنبيهات.

## 23. قالب تحديث هذا الملف

بعد أي تغيير معماري كبير، حدّث فقط الأقسام المتأثرة وأضف في حالة العمل:

```text
Date:
Commit:
Implemented:
Verified with:
Known follow-up:
```

لا تحول هذا الملف إلى سجل يومي طويل؛ احتفظ به كصورة دقيقة للحالة الحالية، وانقل التفاصيل التاريخية إلى Git history.
