/**
 * Identidade visual compartilhada dos e-mails transacionais (confirmação de
 * cadastro, recuperação de senha, convite) — mesma paleta sépia/editorial e
 * tipografia (serif/mono/sans) já usadas no resumo semanal
 * (frontend/lib/email/weekly-digest.ts).
 *
 * Não importa nada de weekly-digest.ts nem é importado por ele, de
 * propósito: aquele template já está em produção e testado, então evita
 * qualquer acoplamento que pudesse arriscar uma regressão nele. A paleta é
 * duplicada aqui como constantes, não abstraída num terceiro módulo comum —
 * o custo de duplicar alguns valores de cor é menor que o risco de tocar
 * num template que já roda no envio real do digest semanal.
 */

export const EMAIL_COLORS = {
    pageBg: "#E9DAB0",
    panelBg: "#F7EDC9",
    ink: "#31260F",
    heading: "#8B4A0F",
    body: "#605021",
    muted: "#AA955E",
    mutedBar: "#D9C793",
    footerText: "#6F5E31",
    ctaBg: "#31260F",
    ctaText: "#F8EDC0",
    wordmarkPP7Underline: "#DE9500",
    wordmarkIASUnderline: "#BE6C18",
    wordmarkPlus: "#8E6F33",
} as const;

export function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderWordmark(): string {
    return `<span style="border-bottom:2px solid ${EMAIL_COLORS.wordmarkPP7Underline}; padding-bottom:3px;">PP7</span><span style="color:${EMAIL_COLORS.wordmarkPlus}; padding:0 4px;">+</span><span style="border-bottom:2px solid ${EMAIL_COLORS.wordmarkIASUnderline}; padding-bottom:3px;">IAS</span>`;
}

/** Botão de ação principal — mesmo tratamento visual do CTA de bloco do resumo semanal. */
export function renderEmailCta(href: string, label: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${EMAIL_COLORS.ctaBg}" style="background-color:${EMAIL_COLORS.ctaBg}; border-radius:2px; padding:15px 30px;">
    <a href="${escapeHtml(href)}" style="display:block; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:1.4px; text-transform:uppercase; font-weight:bold; color:${EMAIL_COLORS.ctaText}; text-decoration:none;">${escapeHtml(label)} &nbsp;&rarr;</a>
   </td></tr></table>`;
}

/** Caixa de código/OTP em destaque — mesma paleta, no lugar do azul neon do template antigo. */
export function renderCodeBox(code: string, label = "SEU CÓDIGO"): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${EMAIL_COLORS.pageBg}" style="background-color:${EMAIL_COLORS.pageBg}; border:2px solid ${EMAIL_COLORS.heading}; border-radius:4px; padding:20px 36px;">
   <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:1.6px; text-transform:uppercase; color:${EMAIL_COLORS.heading}; font-weight:bold; text-align:center; padding-bottom:8px;">${escapeHtml(label)}</div>
   <div style="font-family:'Courier New',Courier,monospace; font-size:34px; line-height:38px; mso-line-height-rule:exactly; letter-spacing:8px; color:${EMAIL_COLORS.ink}; font-weight:bold; text-align:center;">${escapeHtml(code)}</div>
  </td></tr></table>`;
}

export interface TransactionalEmailInput {
    /** <title> da página — não aparece no corpo do e-mail. */
    title: string;
    /** Texto de preview (preheader), oculto, mostrado pelo cliente de e-mail ao lado do assunto. */
    preheader: string;
    /** Rótulo pequeno acima do título (ex.: "Confirmação de cadastro"). */
    kicker: string;
    heading: string;
    /** HTML já pronto do corpo (parágrafos) — chamador controla a cópia exata. */
    bodyHtml: string;
    cta?: { href: string; label: string };
    /** Conteúdo extra entre o corpo e o CTA (ex.: a caixa de código do OTP). */
    extraHtml?: string;
    /** HTML menor/mais discreto depois do CTA (aviso de segurança, assinatura). */
    footnoteHtml?: string;
}

/**
 * Shell de e-mail transacional: cabeçalho com o wordmark PP7+IAS, corpo,
 * CTA opcional e rodapé simples — deliberadamente mais enxuto que o rodapé
 * do resumo semanal (sem links de navegação nem descadastro, que não fazem
 * sentido para confirmação de cadastro, recuperação de senha ou convite).
 */
export function renderTransactionalEmail({ title, preheader, kicker, heading, bodyHtml, cta, extraHtml, footnoteHtml }: TransactionalEmailInput): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(title)}</title>
<style>
@media only screen and (max-width:620px){
 .wrap{width:100%!important}
 .stack2{padding-left:22px!important;padding-right:22px!important}
}
</style>
</head>
<body style="margin:0; padding:0; background-color:${EMAIL_COLORS.pageBg};">
<span style="display:none; font-size:1px; color:${EMAIL_COLORS.pageBg}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_COLORS.pageBg};">
<tr><td align="center" style="padding:28px 0 46px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrap" style="width:600px; max-width:600px;">

 <tr><td bgcolor="${EMAIL_COLORS.panelBg}" class="stack2" style="background-color:${EMAIL_COLORS.panelBg}; padding:38px 40px 8px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
   <tr><td align="left" style="font-family:Georgia,'Times New Roman',serif; font-size:22px; line-height:26px; mso-line-height-rule:exactly; color:${EMAIL_COLORS.ink}; letter-spacing:-0.5px;">${renderWordmark()}</td></tr>
   <tr><td height="30" style="height:30px; line-height:30px; font-size:0;">&nbsp;</td></tr>
   <tr><td style="font-family:Arial,Helvetica,sans-serif; font-size:10px; line-height:14px; mso-line-height-rule:exactly; letter-spacing:1.6px; text-transform:uppercase; color:${EMAIL_COLORS.muted};">${escapeHtml(kicker)}</td></tr>
   <tr><td height="10" style="height:10px; line-height:10px; font-size:0;">&nbsp;</td></tr>
   <tr><td style="font-family:Georgia,'Times New Roman',serif; font-size:28px; line-height:34px; mso-line-height-rule:exactly; color:${EMAIL_COLORS.ink}; letter-spacing:-0.5px;">${escapeHtml(heading)}</td></tr>
  </table></td></tr>

 <tr><td bgcolor="${EMAIL_COLORS.panelBg}" class="stack2" style="background-color:${EMAIL_COLORS.panelBg}; padding:18px 40px 38px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
   <tr><td style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:25px; mso-line-height-rule:exactly; color:${EMAIL_COLORS.body};">${bodyHtml}</td></tr>
   ${extraHtml ? `<tr><td height="20" style="height:20px; line-height:20px; font-size:0;">&nbsp;</td></tr><tr><td align="center">${extraHtml}</td></tr>` : ""}
   ${cta ? `<tr><td height="24" style="height:24px; line-height:24px; font-size:0;">&nbsp;</td></tr><tr><td>${renderEmailCta(cta.href, cta.label)}</td></tr>` : ""}
   ${footnoteHtml ? `<tr><td height="22" style="height:22px; line-height:22px; font-size:0;">&nbsp;</td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:20px; mso-line-height-rule:exactly; color:${EMAIL_COLORS.muted};">${footnoteHtml}</td></tr>` : ""}
  </table></td></tr>

 <tr><td bgcolor="${EMAIL_COLORS.pageBg}" class="stack2" style="background-color:${EMAIL_COLORS.pageBg}; padding:22px 40px 30px 40px; border-top:1px solid ${EMAIL_COLORS.mutedBar};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
   <tr><td style="font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:20px; mso-line-height-rule:exactly; color:${EMAIL_COLORS.footerText};">Portal PP7+IAS &nbsp;·&nbsp; <span style="color:${EMAIL_COLORS.muted};">Menos ruído. Mais clareza.</span></td></tr>
  </table></td></tr>

</table>
</td></tr></table>
</body>
</html>`;
}
