import { renderCodeBox, renderTransactionalEmail } from "../emailTheme";

/**
 * Password reset OTP email — 8-digit code (matches existing UI's 3-step flow).
 */
export function renderResetPasswordOtpEmail({
  otp,
}: {
  otp: string;
}): { subject: string; html: string } {
  const subject = "Código de recuperação – PP7+IAS";
  return {
    subject,
    html: renderTransactionalEmail({
      title: subject,
      preheader: "Use o código abaixo para redefinir a senha da sua conta na Comunidade PP7+IAS.",
      kicker: "Recuperação de senha",
      heading: "Código de recuperação",
      bodyHtml: `
        <p style="margin:0 0 16px 0;">Olá!</p>
        <p style="margin:0;">
          Recebemos uma solicitação para redefinir a senha da sua conta
          na Comunidade PP7+IAS. Use o código abaixo para continuar:
        </p>
      `,
      extraHtml: renderCodeBox(otp),
      footnoteHtml: `
        Este código expira em breve por motivos de segurança.
        Se você não solicitou a redefinição de senha, pode ignorar este e-mail —
        sua conta continua protegida.
      `,
    }),
  };
}
