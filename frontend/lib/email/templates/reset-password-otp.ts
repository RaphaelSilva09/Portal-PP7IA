/**
 * Password reset OTP email — 8-digit code (matches existing UI's 3-step flow).
 */
export function renderResetPasswordOtpEmail({
  otp,
}: {
  otp: string;
}): { subject: string; html: string } {
  return {
    subject: "Código de recuperação – PP7+IAS",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Código de recuperação – PP7+IAS</title>
</head>
<body style="margin:0; padding:0; background-color:#111111; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background-color:#1a1a1a; border-radius:10px; padding:28px;">

          <tr>
            <td style="color:#dadada; font-size:20px; font-weight:bold; padding-bottom:12px;">
              Código de recuperação de senha
            </td>
          </tr>

          <tr>
            <td style="color:#dadada; font-size:16px; line-height:1.6;">
              <p style="margin-top:0;">
                Olá!
              </p>

              <p>
                Recebemos uma solicitação para redefinir a senha da sua conta
                na <strong>Comunidade PP7+IAS</strong>.
              </p>

              <p>
                Use o código abaixo para continuar com a recuperação:
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 0;">
              <div style="
                background-color:#2a2a2a;
                border: 2px solid #3b9eff;
                border-radius:12px;
                padding:20px 40px;
                display:inline-block;
              ">
                <div style="
                  color:#3b9eff;
                  font-size:14px;
                  font-weight:bold;
                  text-transform:uppercase;
                  letter-spacing:1px;
                  margin-bottom:8px;
                ">
                  SEU CÓDIGO
                </div>
                <div style="
                  color:#ffffff;
                  font-size:36px;
                  font-weight:bold;
                  letter-spacing:8px;
                  font-family: 'Courier New', monospace;
                ">
                  ${otp}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="color:#dadada; font-size:16px; line-height:1.6; text-align:center;">
              <p>
                Digite este código na tela de recuperação de senha.
              </p>
            </td>
          </tr>

          <tr>
            <td style="color:#acacac; font-size:14px; line-height:1.6; padding-top:20px;">
              <p>
                <strong>⏱️ Importante:</strong> Este código expira em breve por motivos de segurança.
              </p>

              <p>
                Se você não solicitou a redefinição de senha, pode ignorar
                este e-mail com segurança. Sua conta continuará protegida.
              </p>

              <p style="margin-top:28px; color:#dadada;">
                Até já!<br>
                <strong>— Equipe PP7+IAS</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
