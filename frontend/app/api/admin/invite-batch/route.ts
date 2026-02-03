import { NextResponse } from "next/server";

interface InviteResult {
    email: string;
    success: boolean;
    error?: string;
}

interface EdgeFunctionResponse {
    total: number;
    successful: number;
    failed: number;
    results: InviteResult[];
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { emails } = body;

        // Validação: array obrigatório
        if (!Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { error: "Lista de emails é obrigatória" },
                { status: 400 }
            );
        }

        // Validação: máximo 10 emails
        if (emails.length > 10) {
            return NextResponse.json(
                { error: "Máximo de 10 convites por vez" },
                { status: 400 }
            );
        }

        // Validação: formato dos emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter(
            (e: unknown) => typeof e !== "string" || !emailRegex.test(e.trim())
        );

        if (invalidEmails.length > 0) {
            return NextResponse.json(
                { error: `Emails inválidos: ${invalidEmails.join(", ")}` },
                { status: 400 }
            );
        }

        // Normalizar emails (trim + lowercase + remover duplicados)
        const normalizedEmails = [
            ...new Set(emails.map((e: string) => e.trim().toLowerCase())),
        ];

        // Verificar configuração
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Variáveis de ambiente Supabase não configuradas");
            return NextResponse.json(
                { error: "Configuração do servidor incompleta" },
                { status: 500 }
            );
        }

        // Chamar Edge Function
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-invite-email`;

        const response = await fetch(edgeFunctionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ emails: normalizedEmails }),
        });

        const data: EdgeFunctionResponse | { error: string } =
            await response.json();

        if (!response.ok) {
            const errorMessage =
                "error" in data ? data.error : "Erro ao enviar convites";
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            data: data as EdgeFunctionResponse,
        });
    } catch (error) {
        console.error("Erro na API invite-batch:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
