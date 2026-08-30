import { renderTransactionalEmail } from "../emailTheme";

/** Convite para a plataforma — fundação de rastreamento de indicação (PDF 6.4). */
export function renderInviteEmail({
  platformUrl,
}: {
  platformUrl: string;
}): { subject: string; html: string } {
  const subject = "Você foi convidado para o Portal PP7+IAS";
  return {
    subject,
    html: renderTransactionalEmail({
      title: subject,
      preheader: "Você foi indicado para a Comunidade PP7+IAS — curadoria semanal de conteúdos relevantes.",
      kicker: "Convite",
      heading: "Você foi convidado",
      bodyHtml: `
        <p style="margin:0 0 16px 0;">Olá!</p>
        <p style="margin:0 0 16px 0;">
          Você foi indicado por um amigo para fazer parte da Comunidade PP7+IAS,
          onde compartilhamos curadoria semanal de conteúdos relevantes.
        </p>
        <p style="margin:0;">
          Para confirmar sua participação e escolher como deseja receber
          nossos conteúdos, clique no botão abaixo.
        </p>
      `,
      cta: { href: platformUrl, label: "Quero participar" },
      footnoteHtml: `
        Ao clicar, você será direcionado para nossa página, onde poderá
        criar sua conta e definir suas preferências de recebimento.
      `,
    }),
  };
}
