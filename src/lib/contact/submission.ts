import type { Locale } from "@/domain/content/types";

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  details: string;
  preferredContact?: string;
  locale: Locale;
  pagePath: string;
  website?: string;
}

export interface ContactSubmissionAdapter {
  submit(submission: ContactSubmission): Promise<{ delivered: boolean }>;
}

export const phaseOneContactAdapter: ContactSubmissionAdapter = {
  async submit(submission) {
    try {
      const response = await fetch("/api/cms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      return { delivered: response.ok };
    } catch {
      return { delivered: false };
    }
  },
};
