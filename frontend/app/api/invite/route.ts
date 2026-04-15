import { Resend } from "resend";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function resolveBaseUrl(request: Request): string {
    const candidates = [
        process.env.NEXT_PUBLIC_SITE_URL?.trim(),
        process.env.NEXT_PUBLIC_APP_URL?.trim(),
    ];
    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return new URL(candidate).origin;
        } catch {
            continue;
        }
    }
    return new URL(request.url).origin;
}

export async function POST(request: Request) {
    try {
        // 1. Autenticação — qualquer usuário logado pode convidar
        const cookieStore = await cookies();

        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll() {
                        // Read-only em contexto de API route
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabaseAuth.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Autenticação necessária" },
                { status: 401 }
            );
        }

        // 2. Validação de input
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email é obrigatório" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            );
        }

        // 3. Verificar configuração do Resend
        const resendKey = process.env.INVITE_EMAIL_API_KEY;
        const emailFrom = process.env.EMAIL_FROM;

        if (!resendKey || !emailFrom) {
            return NextResponse.json(
                { error: "Configuração do servidor incompleta" },
                { status: 500 }
            );
        }

        // 4. Enviar email com link para a plataforma (sem criar usuário no banco)
        const platformUrl = resolveBaseUrl(request);
        const resend = new Resend(resendKey);

        const { error } = await resend.emails.send({
            from: emailFrom,
            to: email,
            subject: "Você foi convidado para o Portal PP7+IAS",
            html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Convite – Comunidade PP7+IAS</title>
</head>
<body style="margin:0; padding:0; background-color:#111111; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background-color:#1a1a1a; border-radius:10px; padding:28px;">

          <tr>
            <td style="color:#dadada; font-size:16px; line-height:1.6;">
              <p style="margin-top:0;">Olá!</p>
              <p>
                Você foi indicado por um amigo para fazer parte da
                <strong>Comunidade PP7+IAS</strong>, onde compartilhamos
                curadoria semanal de conteúdos relevantes.
              </p>
              <p>
                Para confirmar sua participação e escolher como deseja receber
                nossos conteúdos, clique no botão abaixo:
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 0;">
              <a href="${platformUrl}"
                 style="background-color:#3b9eff; color:#111111; text-decoration:none;
                        padding:14px 30px; border-radius:8px; font-size:16px;
                        font-weight:bold; display:inline-block;">
                QUERO PARTICIPAR
              </a>
            </td>
          </tr>

          <tr>
            <td style="color:#acacac; font-size:15px; line-height:1.6;">
              <p>
                Ao clicar, você será redirecionado para nossa página onde poderá
                se cadastrar e definir suas duas preferências de recebimento.
              </p>
              <p style="margin-top:28px; color:#dadada;">
                Seja bem-vindo(a)!<br>
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
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
