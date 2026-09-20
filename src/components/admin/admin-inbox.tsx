"use client";

import { useEffect, useState } from "react";
import { adminRequest } from "./admin-api";
import styles from "./admin.module.css";

interface Contact { _id: string; name: string; email: string; phone?: string; service: string; budget?: string; preferredContact?: string; details: string; status: "new" | "read" | "archived"; createdAt: string; notificationStatus?: string }
interface Inbox { items: Contact[]; total: number; newCount: number; page: number; pages: number }

export function AdminInbox({ onUnreadChange }: { onUnreadChange: (count: number) => void }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<Inbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest<Inbox>(`/admin/contacts?page=${page}&status=${filter}`, { signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return;
      setData(result); onUnreadChange(result.newCount); setError("");
      if (page > result.pages) setPage(result.pages);
    }).catch((caught) => { if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : "تعذّر تحميل الرسائل."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, filter, revision, onUnreadChange]);
  function changePage(next: number) { setLoading(true); setPage(next); }
  async function retryNotification(item: Contact) {
    setBusy(item._id); setError("");
    try { await adminRequest(`/admin/contacts/${item._id}/notify`, { method: "POST" }); setRevision((value) => value + 1); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّر إرسال التنبيه."); }
    finally { setBusy(""); }
  }
  async function update(item: Contact, status: Contact["status"]) {
    setBusy(item._id); setError("");
    try { await adminRequest(`/admin/contacts/${item._id}`, { method: "PATCH", body: JSON.stringify({ status }) }); setRevision((value) => value + 1); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّر تحديث الرسالة."); }
    finally { setBusy(""); }
  }
  return <div className={styles.messageList} aria-busy={loading}>
    <div className={styles.inboxToolbar}>
      <label>حالة الرسائل<select value={filter} onChange={(event) => { setLoading(true); setFilter(event.target.value); setPage(1); }}><option value="">كل الرسائل</option><option value="new">الجديدة</option><option value="read">المقروءة</option><option value="archived">المؤرشفة</option></select></label>
      <span role="status">{loading ? "جارٍ التحميل…" : `${data?.total ?? 0} رسالة`}</span>
      <button type="button" onClick={() => { setLoading(true); setRevision((value) => value + 1); }}>تحديث</button>
    </div>
    {error ? <p className={styles.noticeError} role="alert">{error}</p> : null}
    {!loading && !error && !data?.items.length ? <p className={styles.emptyState}>لا توجد رسائل ضمن هذا الفلتر.</p> : null}
    {data?.items.map((item) => <article key={item._id} data-status={item.status}>
      <header><div><span>{{ new: "جديد", read: "تمت القراءة", archived: "مؤرشف" }[item.status]}</span><h2>{item.name}</h2></div><time>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></header>
      <div className={styles.messageMeta}><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? <a href={`tel:${item.phone}`}>{item.phone}</a> : null}<span>{item.service}</span>{item.budget ? <span>{item.budget}</span> : null}{item.preferredContact ? <span>{item.preferredContact}</span> : null}</div>
      <p style={{ whiteSpace: "pre-wrap" }}>{item.details}</p>
      {item.notificationStatus === "failed" ? <p role="status">حُفظ الطلب؛ تعذّر إرسال تنبيه البريد. <button type="button" disabled={busy === item._id} onClick={() => void retryNotification(item)}>إعادة إرسال التنبيه</button></p> : null}
      <footer>{(["new", "read", "archived"] as const).filter((status) => status !== item.status).map((status) => <button key={status} type="button" disabled={busy === item._id} onClick={() => void update(item, status)}>{{ new: "إعادة للجديد", read: "تمت القراءة", archived: "أرشفة" }[status]}</button>)}</footer>
    </article>)}
    {data && data.pages > 1 ? <nav className={styles.inboxToolbar} aria-label="صفحات الرسائل"><button type="button" disabled={loading || page <= 1} onClick={() => changePage(page - 1)}>السابق</button><span>صفحة {page} من {data.pages}</span><button type="button" disabled={loading || page >= data.pages} onClick={() => changePage(page + 1)}>التالي</button></nav> : null}
  </div>;
}
