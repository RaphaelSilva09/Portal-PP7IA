import { NextRequest, NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";
import { buildWeeklyDigest, type DigestItem } from "@/lib/email/weeklyDigest";
import { assertEmailConfigured, EMAIL_FROM, resend } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ContentEntityLike {
    title: string;
    htmlPath: string | null;
    createdAt: Date;
}

async function collectItems(): Promise<DigestItem[]> {
    const sources: Array<{ section: string; getAll: () => Promise<ContentEntityLike[]> }> = [
        { section: "Newsletter", getAll: () => DIContainer.getNewsletterRepository().getAll() },
        { section: "Inteligência Artificial", getAll: () => DIContainer.getEspecialSemanaRepository().getAll() },
        { section: "Editoriais e Artigos", getAll: () => DIContainer.getRadarOportunidadesRepository().getAll() },
        { section: "Enquanto é Tempo", getAll: () => DIContainer.getMiniLivroRepository().getAll() },
        { section: "Biblioteca", getAll: () => DIContainer.getBibliotecaRepository().getAll() },
        { section: "Estudar", getAll: () => DIContainer.getEstudarRepository().getAll() },
    ];

    const results = await Promise.all(
        sources.map(async ({ section, getAll }) => {
            const entities = await getAll().catch(() => [] as ContentEntityLike[]);
            return entities.map(entity => ({
                section,
                title: entity.title,
                url: entity.htmlPath,
                createdAt: entity.createdAt,
            }));
        }),
    );

    return results.flat();
}

export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET?.trim();
    if (!cronSecret) {
        return NextResponse.json(
            { error: "CRON_SECRET não configurado — digest inativo" },
            { status: 503 },
        );
    }

    if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://portal-pp7ia.vercel.app";

    const items = await collectItems();
    const digest = buildWeeklyDigest(items, new Date(), baseUrl);

    if (!digest) {
        return NextResponse.json({ sent: false, reason: "empty" });
    }

    const recipients = (process.env.WEEKLY_DIGEST_RECIPIENTS ?? "")
        .split(",")
        .map(value => value.trim())
        .filter(Boolean);

    if (recipients.length === 0) {
        // Dry-run: sem destinatários configurados, devolve o digest para validação.
        return NextResponse.json({
            sent: false,
            reason: "no-recipients",
            subject: digest.subject,
            itemCount: digest.itemCount,
            html: digest.html,
        });
    }

    try {
        assertEmailConfigured();
        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: recipients,
            subject: digest.subject,
            html: digest.html,
        });

        if (error) {
            console.error("[weekly-digest] falha no envio:", error);
            return NextResponse.json({ sent: false, reason: "send-error" }, { status: 502 });
        }

        return NextResponse.json({ sent: true, recipients: recipients.length, itemCount: digest.itemCount });
    } catch (err) {
        console.error("[weekly-digest] e-mail não configurado:", err);
        return NextResponse.json({ sent: false, reason: "email-not-configured" }, { status: 503 });
    }
}
