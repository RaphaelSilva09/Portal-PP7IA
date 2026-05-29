import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { MiniLivrosContentSource } from "@/infrastructure/chat/MiniLivrosContentSource";
import { NewsletterContentSource } from "@/infrastructure/chat/NewsletterContentSource";
import { RadarContentSource } from "@/infrastructure/chat/RadarContentSource";
import { EspecialSemanaContentSource } from "@/infrastructure/chat/EspecialSemanaContentSource";
import { BibliotecaContentSource } from "@/infrastructure/chat/BibliotecaContentSource";
import { EstudarContentSource } from "@/infrastructure/chat/EstudarContentSource";
import { HtmlChunker } from "@/infrastructure/chat/HtmlChunker";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { getEmbeddingProvider } from "@/infrastructure/chat/providers";
import type { ContentSource } from "@/domain/chat/ContentSource";
import type { Chunk, EmbeddedChunk } from "@/domain/chat/Chunk";

export const runtime = "nodejs";
export const maxDuration = 60;

const SOURCES: Record<string, ContentSource> = {
    mini_livro:          new MiniLivrosContentSource(),
    newsletter:          new NewsletterContentSource(),
    radar_oportunidades: new RadarContentSource(),
    especial_semana:     new EspecialSemanaContentSource(),
    biblioteca:          new BibliotecaContentSource(),
    estudar:             new EstudarContentSource(),
};

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("source");

    if (!sourceType) {
        return NextResponse.json(
            { error: "Param ?source= required", valid: Object.keys(SOURCES) },
            { status: 400 },
        );
    }

    const source = SOURCES[sourceType];
    if (!source) {
        return NextResponse.json(
            { error: `Unknown source: ${sourceType}`, valid: Object.keys(SOURCES) },
            { status: 400 },
        );
    }

    const startedAt = Date.now();
    try {
        const chunker = new HtmlChunker();
        const embeddings = getEmbeddingProvider();
        const repo = new RagChunkRepository();

        const items = await source.fetchAll();
        const skipped: { source_id: string; reason: string }[] = [];
        const allChunks: Chunk[] = [];

        for (const item of items) {
            try {
                const chunks = chunker.chunk(item.html, {
                    source_type: source.sourceType,
                    source_id: item.source_id,
                    slug: item.slug,
                    title: item.title,
                });
                if (chunks.length === 0) {
                    skipped.push({ source_id: item.source_id, reason: "empty after chunking" });
                    continue;
                }
                allChunks.push(...chunks);
            } catch (err) {
                skipped.push({ source_id: item.source_id, reason: (err as Error).message });
            }
        }

        const embeddingsList = await embeddings.embedBatch(allChunks.map(c => c.content));
        const embedded: EmbeddedChunk[] = allChunks.map((c, i) => ({
            ...c,
            embedding: embeddingsList[i],
        }));

        const inserted = await repo.replaceAllForSource({
            sourceType: source.sourceType,
            chunks: embedded,
        });

        const ms = Date.now() - startedAt;
        console.log(JSON.stringify({
            event: "chat.reindex", source_type: sourceType,
            items: items.length, chunks: inserted, skipped: skipped.length, ms, status: "ok",
        }));

        return NextResponse.json({
            source_type: sourceType,
            items_processed: items.length,
            chunks_indexed: inserted,
            skipped,
            duration_ms: ms,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error(JSON.stringify({ event: "chat.reindex", source_type: sourceType, status: "error", message }));
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
