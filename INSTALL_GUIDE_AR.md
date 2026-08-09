# دليل تركيب وتشغيل مشروع Portfolio مع Codex

## 1) أنشئ فولدر المشروع

مثال على Windows:

```powershell
mkdir developer-portfolio
cd developer-portfolio
```

يمكن أن يكون الفولدر فارغًا تمامًا.

## 2) فك ملفات Foundation Pack داخل Root المشروع

بعد فك الضغط يجب أن يكون الشكل:

```text
developer-portfolio/
├── AGENTS.md
├── I18N_DECISIONS.md
├── README.md
├── ROADMAP.md
├── START_HERE_CODEX_PROMPT.md
└── .agents/
    └── skills/
        ├── portfolio-design-system/
        ├── premium-ui-composition/
        ├── anti-generic-ai-design/
        ├── motion-animation/
        ├── scroll-experience/
        ├── advanced-scroll-scenes/
        ├── responsive-layout/
        ├── frontend-performance/
        ├── accessibility-motion/
        ├── seo-frontend-architecture/
        ├── content-data-contracts/
        ├── internationalization-bilingual/
        └── visual-qa/
```

مهم:
لا تضع المجلد `codex-portfolio-foundation` كاملًا داخل المشروع.
انسخ **محتويات المجلد** إلى Root المشروع.

## 3) افتح Root المشروع في VS Code / Codex

مثال:

```powershell
code .
```

شغّل Codex من نفس Root الذي يحتوي على `AGENTS.md`.

## 4) أول رسالة إلى Codex

انسخ له:

```text
Read AGENTS.md and inspect all available repository skills.

Do not make any code changes yet.

Summarize:
1. the product we are building,
2. the Phase 1 architecture,
3. the Arabic/English internationalization requirements,
4. RTL/LTR requirements,
5. the design system and fonts,
6. the motion and scroll rules,
7. the SEO architecture,
8. the available local skills you will use.

Then tell me whether the repository is ready for the first implementation task.
```

راجع الرد.

لا تطلب منه تصميم الموقع في نفس الخطوة.

## 5) أول تنفيذ

بعد أن يؤكد فهم التعليمات، قل له:

```text
Read START_HERE_CODEX_PROMPT.md and execute it completely.

Follow AGENTS.md and the relevant repository skills.

Do not build the full homepage or Hero yet.
Do not implement Phase 2 backend yet.

When finished:
- run lint
- run typecheck if configured
- run production build
- fix all errors
- summarize the architecture and files created
```

Codex سيقوم بإنشاء Foundation المشروع.

## 6) ما الذي يجب أن ينجزه في أول مرحلة؟

لا نريد شكل الموقع النهائي بعد.

نريد:

- Next.js
- TypeScript
- App Router
- Arabic + English locale routing
- RTL / LTR
- Browser language detection
- Language preference persistence
- IBM Plex Sans Arabic
- Manrope
- Design tokens
- Content interfaces
- Mock repository
- SEO utilities
- hreflang architecture
- Header shell
- Footer shell
- Route skeletons
- Motion/reduced-motion foundation

## 7) بعد انتهاء Codex

شغّل محليًا:

```powershell
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

اختبر:

```text
/
```

يجب أن يحول إلى `/ar` أو `/en` بناءً على اللغة.

واختبر يدويًا:

```text
/ar
/en
/ar/work
/en/work
/ar/blog
/en/blog
/ar/about
/en/about
/ar/contact
/en/contact
```

## 8) اختبارات مهمة قبل أن ننتقل للتصميم

تأكد أن:

- العربية RTL حقيقية وليست فقط text-align right.
- الإنجليزية LTR.
- IBM Plex Sans Arabic يظهر بالعربي.
- Manrope يظهر بالإنجليزي.
- تغيير اللغة يعمل.
- اختيار اللغة يتم حفظه.
- لا يوجد horizontal overflow.
- `lang` و `dir` صحيحان.
- المشروع يعمل Production Build بدون أخطاء.

## 9) لا تطلب من Codex هذه الأشياء الآن

لا تطلب في أول مرحلة:

- Admin dashboard
- MongoDB
- Express
- Node API
- Authentication
- Analytics dashboard
- CMS
- كامل الصفحة الرئيسية مرة واحدة

هذه Phase 2 أو مراحل لاحقة.

## 10) المرحلة التالية بعد Foundation

بعد نجاح Foundation نبدأ:

### Task 2
Header + Navigation + Language Switcher النهائي.

ثم:

### Task 3
Hero الاحترافي.

ثم:

### Task 4
Featured Projects.

ثم باقي Homepage Section by Section.

بهذه الطريقة يمكن مراجعة التصميم في كل مرحلة وعدم السماح لـCodex ببناء Landing Page عامة وغير متناسقة.

## Phase 2 لاحقًا

بعد اكتمال الواجهة العامة:

- Node.js
- Express
- MongoDB
- Authentication
- Admin Dashboard
- Homepage CMS
- Projects CMS
- Blog CMS
- Arabic/English editor
- SEO manager
- Media library
- Leads
- Site settings
- Redirect manager
- GA4 analytics integration
