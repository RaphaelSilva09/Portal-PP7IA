import { renderTransactionalEmail } from "../emailTheme";

/**
 * Email verification — magic-link variant (used on signup).
 * User clicks the button → hits better-auth's verify endpoint → marked
 * verified + auto-signed-in (per autoSignInAfterVerification config).
 */
export function renderEmailVerificationLinkEmail({
  url,
}: {
  url: string;
}): { subject: string; html: string } {
  const subject = "Confirme seu e-mail – PP7+IAS";
  return {
    subject,
    html: renderTransactionalEmail({
      title: subject,
      preheader: "Confirme seu e-mail para ativar sua participação na Comunidade PP7+IAS.",
      kicker: "Confirmação de cadastro",
      heading: "Confirme seu e-mail",
      bodyHtml: `
        <p style="margin:0 0 16px 0;">Olá!</p>
        <p style="margin:0 0 16px 0;">
          Recebemos uma solicitação para confirmar este endereço de e-mail
          e ativar sua participação na Comunidade PP7+IAS.
        </p>
        <p style="margin:0;">
          Para concluir o processo, basta clicar no botão abaixo.
        </p>
      `,
      cta: { href: url, label: "Confirmar e-mail" },
      footnoteHtml: `
        Se você não solicitou este cadastro, pode ignorar este e-mail com segurança.
        Este link é pessoal e expira em breve por motivos de segurança.
      `,
    }),
  };
}
