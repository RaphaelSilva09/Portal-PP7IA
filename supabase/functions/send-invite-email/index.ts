// Edge Function: send-invite-email
// Envia convites por email usando Resend com template customizado

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "PP7+IAS <convites@pp7ias.com.br>";

interface InviteRequest {
    emails: string[];
    inviterId?: string;
    inviterEmail?: string;
}

interface InviteResult {
    email: string;
    success: boolean;
    error?: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Método não permitido" }),
            { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    try {
        const { emails, inviterId, inviterEmail }: InviteRequest = await req.json();

        // Validações
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return new Response(
                JSON.stringify({ error: "Lista de emails é obrigatória" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (emails.length > 10) {
            return new Response(
                JSON.stringify({ error: "Máximo de 10 convites por vez" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verificar configuração
        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY não configurada");
            return new Response(
                JSON.stringify({ error: "Serviço de email não configurado" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Variáveis Supabase não configuradas");
            return new Response(
                JSON.stringify({ error: "Configuração do servidor incompleta" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const results: InviteResult[] = [];

        for (const email of emails) {
            const normalizedEmail = email.trim().toLowerCase();

            try {
                // 1. Gerar link de convite via Supabase Auth
                const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                    type: "invite",
                    email: normalizedEmail,
                    options: {
                        redirectTo: `${SITE_URL}/?invited=true`,
                    },
                });

                if (linkError) {
                    console.error(`Erro ao gerar link para ${normalizedEmail}:`, linkError);
                    results.push({
                        email: normalizedEmail,
                        success: false,
                        error: mapSupabaseError(linkError.message),
                    });
                    continue;
                }

                const confirmationUrl = linkData.properties?.action_link;
                const hashedToken = linkData.properties?.hashed_token;

                if (!confirmationUrl) {
                    results.push({
                        email: normalizedEmail,
                        success: false,
                        error: "Falha ao gerar link de convite",
                    });
                    continue;
                }

                // 2. Registrar convite na tabela
                const { error: insertError } = await supabase.from("invites").insert({
                    inviter_id: inviterId || null,
                    inviter_email: inviterEmail || null,
                    invitee_email: normalizedEmail,
                    status: "pending",
                    invite_token: hashedToken,
                });

                // Ignorar erro de duplicata (já existe convite pendente)
                if (insertError && !insertError.message.includes("duplicate")) {
                    console.error(`Erro ao inserir convite para ${normalizedEmail}:`, insertError);
                }

                // 3. Enviar email via Resend
                const emailResponse = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: FROM_EMAIL,
                        to: normalizedEmail,
                        subject: "Você foi convidado para a Comunidade PP7+IAS!",
                        html: generateEmailHtml(confirmationUrl),
                    }),
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json();
                    console.error(`Erro Resend para ${normalizedEmail}:`, errorData);

                    // Atualizar status como falha
                    await supabase
                        .from("invites")
                        .update({
                            status: "failed",
                            error_message: errorData.message || "Erro ao enviar email",
                        })
                        .eq("invitee_email", normalizedEmail)
                        .eq("status", "pending");

                    results.push({
                        email: normalizedEmail,
                        success: false,
                        error: mapResendError(errorData.message),
                    });
                    continue;
                }

                // 4. Atualizar status como enviado
                await supabase
                    .from("invites")
                    .update({
                        status: "sent",
                        sent_at: new Date().toISOString(),
                    })
                    .eq("invitee_email", normalizedEmail)
                    .eq("status", "pending");

                results.push({ email: normalizedEmail, success: true });

                // Delay de 500ms entre envios (rate limit Resend: 2 req/s)
                if (emails.indexOf(email) < emails.length - 1) {
                    await delay(500);
                }
            } catch (err) {
                console.error(`Erro inesperado para ${normalizedEmail}:`, err);
                results.push({
                    email: normalizedEmail,
                    success: false,
                    error: "Erro interno ao processar convite",
                });
            }
        }

        const response = {
            total: emails.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
            results,
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Erro na Edge Function:", err);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapSupabaseError(message: string): string {
    if (message.includes("already registered") || message.includes("already exists")) {
        return "Este email já está cadastrado";
    }
    if (message.includes("rate limit")) {
        return "Limite de envios excedido. Tente novamente mais tarde";
    }
    if (message.includes("invalid email")) {
        return "Email inválido";
    }
    return "Erro ao gerar convite";
}

function mapResendError(message: string): string {
    if (message?.includes("rate limit")) {
        return "Limite de envios excedido";
    }
    if (message?.includes("invalid")) {
        return "Email inválido ou não pode receber mensagens";
    }
    if (message?.includes("domain")) {
        return "Domínio de email não verificado";
    }
    return "Erro ao enviar email";
}

function generateEmailHtml(confirmationUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convite PP7+IAS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #1a1a2e;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #4a4a4a;
            font-size: 16px;
            margin-bottom: 16px;
        }
        .highlight {
            color: #3b82f6;
            font-weight: 600;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: #ffffff !important;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 14px;
        }
        .footer p {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <h1>Você foi convidado!</h1>

            <p>Olá!</p>

            <p>
                Você foi indicado por um amigo para fazer parte da
                <span class="highlight">Comunidade PP7+IAS</span>, onde compartilhamos
                curadoria semanal de conteúdos relevantes.
            </p>

            <p>
                Para confirmar sua participação e escolher como deseja receber nossos
                conteúdos, clique no botão abaixo:
            </p>

            <div class="button-container">
                <a href="${confirmationUrl}" class="button">QUERO PARTICIPAR</a>
            </div>

            <p>
                Ao clicar, você será direcionado para nossa página onde poderá definir
                suas preferências de recebimento.
            </p>

            <div class="footer">
                <p>Seja bem-vindo(a)!</p>
                <p><strong>— Equipe PP7+IAS</strong></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}
