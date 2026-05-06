import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import bcrypt from "bcrypt";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { resend, EMAIL_FROM } from "./email/resend";
import { renderResetPasswordOtpEmail } from "./email/templates/reset-password-otp";
import { renderEmailVerificationOtpEmail } from "./email/templates/email-verification-otp";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

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

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
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
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        const tpl =
          type === "forget-password"
            ? renderResetPasswordOtpEmail({ otp })
            : renderEmailVerificationOtpEmail({ otp });

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
