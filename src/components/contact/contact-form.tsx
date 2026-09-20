"use client";

import { useRef, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";

import type { ContactFormTranslation, Locale } from "@/domain/content/types";
import { phaseOneContactAdapter, type ContactSubmission } from "@/lib/contact/submission";

import styles from "./contact-form.module.css";

type FieldName = "name" | "email" | "service" | "details";
type Errors = Partial<Record<FieldName, string>>;

export function ContactForm({ copy, locale }: { copy: ContactFormTranslation; locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const reduceMotion = useReducedMotion();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setMessage("");
    const data = new FormData(event.currentTarget);
    const submission: ContactSubmission = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      service: String(data.get("service") ?? "").trim(),
      budget: String(data.get("budget") ?? "").trim() || undefined,
      details: String(data.get("details") ?? "").trim(),
      preferredContact: String(data.get("preferredContact") ?? "").trim() || undefined,
      locale,
      pagePath: window.location.pathname,
      website: String(data.get("website") ?? ""),
    };
    const nextErrors: Errors = {};
    if (!submission.name) nextErrors.name = copy.requiredLabel;
    if (!submission.email) nextErrors.email = copy.requiredLabel;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) nextErrors.email = copy.invalidEmailLabel;
    if (!submission.service) nextErrors.service = copy.requiredLabel;
    if (!submission.details) nextErrors.details = copy.requiredLabel;
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0] as FieldName | undefined;
    if (firstError) {
      const field = formRef.current?.elements.namedItem(firstError);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    setPending(true);
    const result = await phaseOneContactAdapter.submit(submission);
    setPending(false);
    setMessage(result.delivered ? copy.deliverySuccessLabel : copy.deliveryUnavailableLabel);
    if (result.delivered) formRef.current?.reset();
  }

  const errorFor = (name: FieldName) => errors[name] ? `${name}-error` : undefined;
  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={handleSubmit}>
      <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className={styles.twoColumn}>
        <label><span>{copy.nameLabel}</span><input name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errorFor("name")} />{errors.name ? <small id="name-error">{errors.name}</small> : null}</label>
        <label><span>{copy.emailLabel}</span><input name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} aria-invalid={Boolean(errors.email)} aria-describedby={errorFor("email")} />{errors.email ? <small id="email-error">{errors.email}</small> : null}</label>
      </div>
      <div className={styles.twoColumn}>
        <label><span>{copy.phoneLabel} <i>{copy.phoneOptionalLabel}</i></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" /></label>
        <label><span>{copy.serviceLabel}</span><select name="service" defaultValue="" aria-invalid={Boolean(errors.service)} aria-describedby={errorFor("service")}><option value="" disabled>—</option>{copy.services.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{errors.service ? <small id="service-error">{errors.service}</small> : null}</label>
      </div>
      <div className={styles.twoColumn}>
        <label><span>{copy.budgetLabel} <i>{copy.budgetOptionalLabel}</i></span><select name="budget" defaultValue=""><option value="">—</option>{copy.budgets.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>{copy.contactMethodLabel} <i>{copy.contactMethodOptionalLabel}</i></span><select name="preferredContact" defaultValue=""><option value="">—</option>{copy.contactMethods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </div>
      <label><span>{copy.detailsLabel}</span><textarea name="details" rows={5} aria-invalid={Boolean(errors.details)} aria-describedby={errorFor("details")} />{errors.details ? <small id="details-error">{errors.details}</small> : null}</label>
      <div className={styles.submitRow}><motion.button type="submit" disabled={pending} whileTap={reduceMotion ? undefined : { scale: 0.99 }}><span>{copy.submitLabel}</span><b aria-hidden="true">↗</b></motion.button><AnimatePresence mode="wait" initial={false}>{message ? <motion.p key={message} role="status" aria-live="polite" initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}>{message}</motion.p> : null}</AnimatePresence></div>
    </form>
  );
}
