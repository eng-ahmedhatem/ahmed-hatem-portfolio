"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";
import { useRouter } from "next/navigation";

import { adminRequest } from "./admin-api";
import { AdminLogo } from "./admin-logo";
import styles from "./admin.module.css";

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4.75 6.75h14.5v10.5H4.75zM5.5 7.5l6.5 5 6.5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7.5 10V8a4.5 4.5 0 0 1 9 0v2M5.5 10h13v9h-13z" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
      <circle cx="12" cy="12" r="2.25" />
      {hidden ? <path d="m5 4 14 16" /> : null}
    </svg>
  );
}

export function AdminLogin() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [configurationReady, setConfigurationReady] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/cms/health")
      .then((response) => response.json())
      .then((health: { database?: boolean; administration?: boolean }) => {
        if (mounted) setConfigurationReady(Boolean(health.database && health.administration));
      })
      .catch(() => { if (mounted) setConfigurationReady(false); });
    return () => { mounted = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await adminRequest<{ mfaRequired?: boolean }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      if (result.mfaRequired) { setMfaRequired(true); return; }
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر تسجيل الدخول.");
    } finally {
      setPending(false);
    }
  }

  async function verifyMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    try { await adminRequest("/auth/mfa", { method: "POST", body: JSON.stringify({ code: data.get("code") }) }); router.replace("/admin"); router.refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّر التحقق."); }
    finally { setPending(false); }
  }

  const status = configurationReady === null
    ? "جارٍ فحص الاتصال"
    : configurationReady
      ? "النظام جاهز"
      : "يلزم إكمال الإعداد";

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginShell}>
        <motion.section
          className={styles.loginIdentity}
          initial={reduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          aria-labelledby="admin-gateway-title"
        >
          <svg className={styles.loginConstellation} aria-hidden="true" viewBox="0 0 620 620">
            <path d="M560 58C398 122 466 255 307 301S74 388 61 565" />
            <path d="M604 187C432 203 430 397 244 405S110 513 99 602" />
            <circle cx="465" cy="178" r="7" />
            <circle cx="306" cy="301" r="5" />
            <circle cx="244" cy="405" r="8" />
          </svg>

          <div className={styles.loginBrandRow}>
            <AdminLogo variant="login" preload />
            <span>ADMIN / 01</span>
          </div>

          <div className={styles.loginStatement}>
            <p>PORTFOLIO CONTROL CENTER</p>
            <h2 id="admin-gateway-title">إدارة حضورك الرقمي<br />من مكان واحد.</h2>
            <span>مساحة مخصصة لتنظيم المحتوى، نشر الأعمال، ومتابعة أداء الموقع بوضوح.</span>
          </div>

          <div className={styles.loginCapabilities} aria-label="أقسام لوحة الإدارة">
            <span><i />المحتوى</span>
            <span><i />المشاريع</span>
            <span><i />التحليلات</span>
          </div>
        </motion.section>

        <motion.section
          className={styles.loginPanel}
          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
          aria-labelledby="admin-login-title"
        >
          <div className={styles.loginPanelTop}>
            <div className={styles.loginSystemState} data-state={configurationReady === null ? "loading" : configurationReady ? "ready" : "warning"} role="status">
              <i aria-hidden="true" />
              <span>{status}</span>
            </div>
            <Link href="/ar">العودة للموقع <b aria-hidden="true">↗</b></Link>
          </div>

          <div className={styles.mobileLoginBrand} aria-hidden="true">
            <AdminLogo variant="login" />
          </div>

          <div className={styles.loginHeading}>
            <p>دخول المدير</p>
            <h1 id="admin-login-title">مرحبًا بعودتك</h1>
            <span>أدخل بياناتك للوصول إلى لوحة التحكم الآمنة.</span>
          </div>

          {configurationReady === false ? (
            <p className={styles.setupWarning} role="status">يلزم تفعيل Supabase وإضافة مفاتيح المشروع وبيانات المدير في ملف البيئة قبل أول تسجيل دخول.</p>
          ) : null}

          {mfaRequired ? <form onSubmit={verifyMfa} className={styles.loginForm}>
            <label className={styles.loginField}>رمز تطبيق المصادقة<input name="code" autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} dir="ltr" required /></label>
            <button className={styles.loginSubmit} type="submit" disabled={pending}>{pending ? "جارٍ التحقق…" : "تأكيد الدخول"}</button>
            <button type="button" onClick={() => { setMfaRequired(false); setError(""); }}>العودة لبيانات الدخول</button>
            <p className={styles.formError} role="alert">{error}</p>
          </form> : <form onSubmit={submit} className={styles.loginForm}>
            <div className={styles.loginField}>
              <label htmlFor="admin-email">البريد الإلكتروني</label>
              <div className={styles.loginInputFrame}>
                <MailIcon />
                <input id="admin-email" name="email" type="email" inputMode="email" autoComplete="username" placeholder="name@example.com" dir="ltr" required />
              </div>
            </div>

            <div className={styles.loginField}>
              <label htmlFor="admin-password">كلمة المرور</label>
              <div className={styles.loginInputFrame}>
                <LockIcon />
                <input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••••" dir="ltr" required />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <EyeIcon hidden={!showPassword} />
                </button>
              </div>
            </div>

            <button className={styles.loginSubmit} type="submit" disabled={pending}>
              <span>{pending ? "جارٍ التحقق…" : "الدخول إلى لوحة التحكم"}</span>
              <b aria-hidden="true">←</b>
            </button>
            <p className={styles.formError} role="alert" aria-live="polite">{error}</p>
            <Link href="/admin/recover">نسيت كلمة المرور؟</Link>
          </form>}

          <p className={styles.loginSecurityNote}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 5.5 5.7v5.7c0 4.1 2.7 7.7 6.5 9.6 3.8-1.9 6.5-5.5 6.5-9.6V5.7L12 3Z" /><path d="m9.5 12 1.7 1.7 3.5-4" /></svg>
              جلسة محمية ومخصصة لمدير الموقع فقط
          </p>
        </motion.section>
      </div>
    </main>
  );
}
