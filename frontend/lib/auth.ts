import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import bcrypt from "bcrypt";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { assertEmailConfigured, resend, EMAIL_FROM } from "./email/resend";
import { renderResetPasswordOtpEmail } from "./email/templates/reset-password-otp";
import { renderEmailVerificationLinkEmail } from "./email/templates/email-verification-link";
import { createPostgresRecoveryAttemptStore, passwordRecoveryThrottlePlugin } from "./passwordRecoveryThrottle";

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
      assertEmailConfigured();
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
      // Per-challenge attempt counter, stored per email+type in the `verification` row (not
      // per-IP) — survives client refresh/localStorage tampering, but is scoped to a single
      // OTP challenge, not cumulative across the whole recovery process. Frontend mirrors this
      // count for UX only; see MAX_OTP_ATTEMPTS in hooks/usePasswordRecovery.ts.
      allowedAttempts: 10,
      // "reuse" keeps the same OTP (and its accumulated attempt count) alive across a resend
      // WHILE that challenge hasn't hit allowedAttempts yet. It does NOT close the loophole
      // where a challenge that already hit allowedAttempts (but was never redeemed with the
      // one extra call that crosses TOO_MANY_ATTEMPTS and deletes the row) gets a fresh
      // 0-attempt budget on resend — proven empirically in
      // __tests__/integration/passwordRecoverySecurity.test.ts (Contract 1, Scenario B). The
      // actual cross-challenge cap lives in the password-recovery-throttle plugin below, keyed
      // by email and independent of any single OTP's lifecycle.
      resendStrategy: "reuse",
      // The plugin also registers its own per-IP rate limit for every OTP endpoint (default
      // 3 req/60s). Raised to match allowedAttempts so a legitimate user can actually use all
      // 10 attempts inside one window instead of being IP-throttled after 3 typos.
      rateLimit: { window: 60, max: 10 },
      // storeOTP defaults to "plain" when unset — proven via integration test to persist the
      // literal OTP digits in the `verification` row. "encrypted" uses better-auth's own
      // symmetricEncrypt/decrypt (AES via ctx.context.secretConfig, derived from
      // BETTER_AUTH_SECRET) so the code is never at rest in plaintext, while staying
      // "recoverable" — required for resendStrategy:"reuse" to keep working (a "hashed" OTP
      // can't be re-sent as itself, so reuse would silently fall back to "rotate", making
      // EVERY resend mint a fresh 0-attempt challenge).
      storeOTP: "encrypted",
      // Signup verification handled by top-level emailVerification (magic link).
      // This plugin only fires for forget-password and any future OTP-based flows.
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") {
          console.warn("[OTP] unexpected type w/ link-based verification:", type);
          return;
        }
        assertEmailConfigured();
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
    // Cross-challenge brute-force throttle — see lib/passwordRecoveryThrottle.ts. Must be
    // registered as its own plugin (not folded into emailOTP's own options) because it needs
    // `hooks.before`/`hooks.after`, which built-in plugins don't expose for external
    // configuration; this is the officially-supported extension point for adding cross-cutting
    // request gating without forking the library.
    passwordRecoveryThrottlePlugin(createPostgresRecoveryAttemptStore(pool)),
  ],
});

export type Session = typeof auth.$Infer.Session;
