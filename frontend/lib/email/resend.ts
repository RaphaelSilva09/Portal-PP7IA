import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim() || process.env.INVITE_EMAIL_API_KEY?.trim() || undefined;
const missingApiKeyMessage = "RESEND_API_KEY (or legacy INVITE_EMAIL_API_KEY) not set in env";

export function assertEmailConfigured() {
  if (!apiKey) {
    throw new Error(missingApiKeyMessage);
  }
}

export const resend = new Resend(apiKey ?? "re_missing_resend_api_key_for_dry_runs");

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@pp7ias-portal.com.br";
