/**
 * Email verification OTP — 8-digit code sent on signup or email change.
 * Replace HTML w/ your branded version.
 */
export function renderEmailVerificationOtpEmail({
  otp,
  name,
}: {
  otp: string;
  name?: string | null;
}): { subject: string; html: string } {
  const greeting = name ? `Olá, ${name}!` : "Olá!";
  return {
    subject: "Confirme seu e-mail – PP7+IAS",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Confirme seu e-mail – PP7+IAS</title></head>
<body style="margin:0;padding:0;background-color:#111;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:10px;padding:28px;">
        <tr><td style="color:#dadada;font-size:20px;font-weight:bold;padding-bottom:12px;">
          Confirme seu e-mail
        </td></tr>
        <tr><td style="color:#dadada;font-size:16px;line-height:1.6;">
          <p style="margin-top:0;">${greeting}</p>
          <p>Recebemos uma solicitação para confirmar este endereço de e-mail e ativar sua participação na <strong>Comunidade PP7+IAS</strong>.</p>
          <p>Use o código abaixo para concluir o processo:</p>
        </td></tr>
        <tr><td align="center" style="padding:28px 0;">
          <div style="background:#3b9eff;color:#111;padding:18px 32px;border-radius:8px;font-size:28px;font-weight:bold;letter-spacing:6px;display:inline-block;font-family:'Courier New',monospace;">
            ${otp}
          </div>
        </td></tr>
        <tr><td style="color:#acacac;font-size:14px;line-height:1.6;">
          <p>Se você não solicitou este cadastro, pode ignorar este e-mail com segurança.</p>
          <p>Este código expira em 10 minutos por motivos de segurança.</p>
          <p style="margin-top:28px;color:#dadada;">Até já!<br><strong>— Equipe PP7+IAS</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}
