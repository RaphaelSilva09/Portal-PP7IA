import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY ?? process.env.INVITE_EMAIL_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY (or legacy INVITE_EMAIL_API_KEY) not set in env");
}

export const resend = new Resend(apiKey);

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@pp7ias-portal.com.br";
