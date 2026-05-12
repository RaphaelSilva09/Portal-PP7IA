import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import bcrypt from "bcrypt";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { resend, EMAIL_FROM } from "./email/resend";
import { renderResetPasswordOtpEmail } from "./email/templates/reset-password-otp";
import { renderEmailVerificationLinkEmail } from "./email/templates/email-verification-link";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  trustedOrigins: [
    "https://pp7ias-portal.com.br",
    "https://www.pp7ias-portal.com.br",
    "https://develop.pp7ias-portal.com.br",
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"]),
  ],

  user: {
    additionalFields: {
      nome: { type: "string", required: false },
      celular: { type: "string", required: false },
      accept_email_updates: { type: "boolean", defaultValue: false, required: false },
      accept_whatsapp_updates: { type: "boolean", defaultValue: false, required: false },
      role: { type: "string", defaultValue: "user", required: false, input: false },
    },
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
    minPasswordLength: 6,
    password: {
      hash: async (password) => argonHash(password),
      verify: async ({ password, hash }) => {
        if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
          return bcrypt.compare(password, hash);
        }
        try {
          return await argonVerify(hash, password);
        } catch {
          return false;
        }
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1h
    async sendVerificationEmail({ user, url }) {
      const tpl = renderEmailVerificationLinkEmail({ url });
      console.log("[Verify link send]", { to: user.email, subject: tpl.subject });
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: tpl.subject,
        html: tpl.html,
      });
      if (error) {
        console.error("[Resend verify link failed]", { email: user.email, error });
        throw new Error(`Falha ao enviar e-mail: ${error.message ?? error}`);
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/get-session": { window: 60, max: 240 },
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 10 },
      "/forget-password": { window: 60, max: 5 },
      "/reset-password": { window: 60, max: 10 },
      "/email-otp/send-verification-otp": { window: 60, max: 5 },
    },
  },

  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },

  plugins: [
    emailOTP({
      otpLength: 8,
      expiresIn: 60 * 10,
      // Signup verification handled by top-level emailVerification (magic link).
      // This plugin only fires for forget-password and any future OTP-based flows.
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") {
          console.warn("[OTP] unexpected type w/ link-based verification:", type);
          return;
        }
        const tpl = renderResetPasswordOtpEmail({ otp });
        console.log("[OTP send]", { type, to: email, subject: tpl.subject });

        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: tpl.subject,
          html: tpl.html,
        });
        if (error) {
          console.error("[Resend OTP send failed]", { type, email, error });
          throw new Error(`Falha ao enviar e-mail: ${error.message ?? error}`);
        }
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
