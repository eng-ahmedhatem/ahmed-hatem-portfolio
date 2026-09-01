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

## ملاحظات أمان

- لا ترفع `.env.local` إلى GitHub.
- استخدم Secret key داخل Vercel فقط.
- غيّر كلمة مرور المدير المؤقتة بعد أول دخول.
- فعّل المصادقة الثنائية لحسابي GitHub وVercel.
