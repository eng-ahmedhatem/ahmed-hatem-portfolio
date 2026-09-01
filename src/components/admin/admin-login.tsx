"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";

import { adminRequest } from "./admin-api";
import { AdminLogo } from "./admin-logo";
import styles from "./admin.module.css";

export function AdminLogin() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
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
      await adminRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر تسجيل الدخول.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <motion.section
        className={styles.loginCard}
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AdminLogo variant="login" preload />
        <p className={styles.kicker}>لوحة إدارة الموقع</p>
        <h1>مرحبًا بعودتك</h1>
        <p className={styles.loginIntro}>سجّل الدخول لإدارة المحتوى والمشاريع والمقالات والرسائل والتحليلات.</p>
        {configurationReady === false ? <p className={styles.setupWarning} role="status">يلزم تفعيل Supabase وإضافة مفاتيح المشروع وبيانات المدير في ملف البيئة قبل أول تسجيل دخول.</p> : null}
        <form onSubmit={submit} className={styles.loginForm}>
          <label><span>البريد الإلكتروني</span><input name="email" type="email" autoComplete="username" required /></label>
          <label><span>كلمة المرور</span><input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit" disabled={pending}>{pending ? "جارٍ التحقق…" : "دخول آمن"}<b aria-hidden="true">←</b></button>
          <p className={styles.formError} role="alert">{error}</p>
        </form>
      </motion.section>
    </main>
  );
}
