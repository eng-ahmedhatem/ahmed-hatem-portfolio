"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { adminRequest } from "./admin-api";
import { AdminLogo } from "./admin-logo";
import styles from "./admin.module.css";

export function AdminRecovery() {
  const token = useRef("");
  const initialized = useRef(false);
  const [mode, setMode] = useState<"loading" | "request" | "reset" | "done">("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    token.current = new URLSearchParams(window.location.hash.slice(1)).get("token_hash") ?? "";
    window.history.replaceState(null, "", window.location.pathname);
    // Browser fragment is read once, kept in memory, never saved to storage.
    queueMicrotask(() => setMode(token.current ? "reset" : "request"));
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setError(""); setMessage("");
    if (mode === "reset" && data.get("password") !== data.get("confirm")) { setError("كلمتا المرور غير متطابقتين."); return; }
    setPending(true);
    try {
      await adminRequest(mode === "reset" ? "/auth/reset" : "/auth/recovery", { method: "POST", body: JSON.stringify(mode === "reset" ? { tokenHash: token.current, password: data.get("password") } : { email: data.get("email") }) });
      setMessage(mode === "reset" ? "تم تغيير كلمة المرور وإلغاء الجلسات السابقة. سجّل الدخول مجددًا." : "إذا كان البريد مرتبطًا بالمدير، ستصلك رسالة الاستعادة. راجع أيضًا البريد غير المرغوب فيه.");
      if (mode === "reset") { token.current = ""; setMode("done"); }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّرت العملية."); }
    finally { setPending(false); }
  }
  return <main className={styles.recoveryPage}><section className={styles.securityPanel}>
    <AdminLogo variant="login" preload /><h1>{mode === "reset" ? "كلمة مرور جديدة" : "استعادة دخول المدير"}</h1>
    {mode === "loading" ? <p>جارٍ تجهيز الاستعادة…</p> : mode !== "done" ? <form className={styles.loginForm} onSubmit={submit}>
      {mode === "reset" ? <><label>كلمة المرور الجديدة<input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" dir="ltr" required /></label><label>تأكيد كلمة المرور<input name="confirm" type="password" minLength={12} autoComplete="new-password" dir="ltr" required /></label></> : <label>بريد المدير<input name="email" type="email" autoComplete="email" dir="ltr" required /></label>}
      <button type="submit" className={styles.loginSubmit} disabled={pending}>{pending ? "جارٍ التنفيذ…" : mode === "reset" ? "حفظ كلمة المرور" : "إرسال رابط الاستعادة"}</button>
    </form> : null}
    {message ? <p role="status">{message}</p> : null}{error ? <p role="alert" className={styles.noticeError}>{error}</p> : null}
    <Link href="/admin/login">العودة لتسجيل الدخول</Link>
  </section></main>;
}
