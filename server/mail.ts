import { serverConfig } from "./config";
import { getSupabaseAdmin } from "./supabase";

export function mailReady() { return Boolean(serverConfig.resendApiKey && serverConfig.mailFrom); }

export async function sendMail(to: string, subject: string, text: string, idempotencyKey: string) {
  if (!mailReady()) throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${serverConfig.resendApiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from: serverConfig.mailFrom, to: [to], subject, text }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Mail delivery failed (${response.status}).`);
}

export async function notifyContact(id: string) {
  const db = getSupabaseAdmin();
  if (!mailReady() || !serverConfig.notificationEmail) {
    await db.from("contact_submissions").update({ notification_status: "disabled" }).eq("id", id);
    return "disabled" as const;
  }
  const { data, error } = await db.from("contact_submissions").select("id,notification_status").eq("id", id).maybeSingle();
  if (error || !data) return "failed" as const;
  if (data.notification_status === "sent") return "sent" as const;
  try {
    // Do not send customer personal data to the email provider. Read it in the protected inbox.
    await sendMail(serverConfig.notificationEmail, "طلب تواصل جديد — Ahmed Hatem Portfolio", `وصل طلب جديد عبر الموقع. راجعه بأمان من لوحة الإدارة:\n${serverConfig.appOrigin}/admin\n\nReference: ${id}`, `contact-${id}`);
    const saved = await db.from("contact_submissions").update({ notification_status: "sent", notification_sent_at: new Date().toISOString(), notification_error: null }).eq("id", id);
    if (saved.error) console.error("Unable to record notification delivery.");
    return "sent" as const;
  } catch {
    await db.from("contact_submissions").update({ notification_status: "failed", notification_error: "Email provider unavailable. Retry from admin." }).eq("id", id);
    console.error("Contact notification failed; submission remains saved.");
    return "failed" as const;
  }
}
