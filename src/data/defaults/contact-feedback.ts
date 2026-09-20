import type { ContactFormTranslation, Locale } from "../../domain/content/types";

const legacyUnavailable: Record<Locale, string> = {
  ar: "طلبك جاهز، لكن هذه النسخة التجريبية لا ترسله بعد. احتفظ بنسخة من التفاصيل لحين تفعيل التواصل المباشر.",
  en: "Your request is ready, but this preview cannot send it yet. Please keep a copy of the details until direct contact is enabled.",
};
const unavailable: Record<Locale, string> = {
  ar: "تعذّر إرسال الطلب الآن. لم نفقد النص الذي كتبته؛ انتظر قليلًا وأعد المحاولة أو تواصل معي مباشرة.",
  en: "Your request could not be sent right now. Your details are still here; wait a moment and try again, or contact me directly.",
};

// Upgrade only the obsolete bundled copy, never override a CMS-authored message.
export function contactFeedback(copy: ContactFormTranslation, locale: Locale): ContactFormTranslation {
  return copy.deliveryUnavailableLabel === legacyUnavailable[locale]
    ? { ...copy, deliveryUnavailableLabel: unavailable[locale] }
    : copy;
}
