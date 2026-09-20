# نشر الموقع على Vercel من GitHub

المشروع يعمل كتطبيق Next.js واحد. صفحات الموقع ولوحة الإدارة وواجهات CMS كلها تعمل داخل Vercel Functions، بينما تُحفظ البيانات والمستخدم والصور في Supabase.

## 1. تجهيز Supabase

1. أنشئ مشروع Supabase.
2. افتح **SQL Editor** وشغّل ملفات `supabase/migrations` بالترتيب.
3. من **Settings → API Keys** انسخ Project URL وPublishable key وSecret key.

لا تضع Secret key في GitHub أو داخل أي متغير يبدأ بـ `NEXT_PUBLIC_`.

## 2. رفع المشروع إلى GitHub

أنشئ مستودعًا فارغًا بدون README أو `.gitignore` إضافي، ثم من مجلد المشروع:

```powershell
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git add .
git commit -m "feat: prepare portfolio for production"
git push -u origin master
```

ملف `.env.local` مستبعد من Git ولن يُرفع معه.

## 3. استيراد المشروع في Vercel

1. افتح Vercel ثم **Add New → Project**.
2. اختر مستودع GitHub.
3. اترك Framework Preset على **Next.js** وRoot Directory على `./`.
4. لا تغيّر Build Command أوOutput Directory.
5. أضف متغيرات البيئة التالية لكل من Production وPreview:

```text
CONTENT_REPOSITORY=api
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_STORAGE_BUCKET=portfolio-assets
SESSION_SECRET=...
ANALYTICS_SALT=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

بعد معرفة نطاق الإنتاج أضف:

```text
APP_ORIGIN=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

إذا لم يوجد نطاق مخصص بعد، استخدم نطاق الإنتاج الذي تمنحه Vercel ثم أعد النشر بعد إضافة المتغيرين.

## 4. فحص النسخة الحية

- `/` يحوّل إلى `/ar` أو `/en`.
- `/ar` و`/en` يعملان دون أخطاء.
- `/admin` يحوّل إلى `/admin/login` بدون جلسة.
- تسجيل الدخول يعمل ببيانات `ADMIN_EMAIL` و`ADMIN_PASSWORD`.
- رفع صورة أقل من 4MB يعمل ويظهر رابطها من Supabase Storage.
- `robots.txt` و`sitemap.xml` يستخدمان نطاق الإنتاج الصحيح.

## 5. ربط Google Search Console

1. افتح لوحة إدارة الموقع ثم اختر **SEO والربط**.
2. في Google Search Console أضف خاصية من نوع **URL-prefix** مستخدمًا نطاق الإنتاج النهائي.
3. اختر طريقة التحقق **HTML tag** والصق الوسم كاملًا أو قيمة `content` في لوحة الموقع.
4. احفظ الإعداد وانتظر اكتمال نشر Vercel، ثم اضغط **Verify** في Google.
5. أرسل الرابط `https://your-domain.com/sitemap.xml` من قسم Sitemaps في Search Console.

هذه الآلية لا تحتاج كلمة مرور Google أو مفاتيح OAuth؛ لوحة الموقع تخزن رمز التحقق العام فقط.

## ملاحظات أمان

- لا ترفع `.env.local` إلى GitHub.
- استخدم Secret key داخل Vercel فقط.
- غيّر كلمة مرور المدير المؤقتة بعد أول دخول.
- فعّل المصادقة الثنائية لحسابي GitHub وVercel.
# تحديث الإدارة والآراء — سبتمبر 2026

- قبل نشر هذه الحزمة طبّق `20260920000000_operational_hardening.sql` ثم `20260920010000_testimonials.sql` بعد migrations الأساسية. تم تطبيقهما على المشروع الحالي؛ لا تحذف أو تعيد تهيئة الجداول.
- لإرسال التنبيهات واستعادة كلمة المرور بالبريد: أضف `RESEND_API_KEY` و`MAIL_FROM` من نطاق موثق و`CONTACT_NOTIFICATION_EMAIL` إن أردت عنوانًا غير بريد المدير. هذه server-only. الطلبات تبقى محفوظة حتى عند فشل البريد.
- راجع `APP_ORIGIN` و`NEXT_PUBLIC_SITE_URL` على النطاق الدائم HTTPS قبل نشر recovery links وcanonical/sitemap.
- ادخل «الأمان والتشغيل» لتفعيل TOTP بنفسك، وتنزيل نسخة محتوى JSON. النسخة لا تتضمن ملفات الصور أو Auth/الرسائل؛ راجع دليل Supabase لحدود النسخ.
- إذا نسيت كلمة المرور قبل إعداد البريد، شغّل `npm run admin:password` محليًا وأدخل كلمة المرور الجديدة بنفسك في الطرفية (مخفية). لا ترسلها في الدردشة.
- آراء العملاء تُضاف من «إدارة المحتوى ← آراء العملاء»، ولا تظهر مسودات أو آراء بلا إذن. تعديل جهة العمل من الهوية لا يغيّر نسب المشاريع القديمة.
