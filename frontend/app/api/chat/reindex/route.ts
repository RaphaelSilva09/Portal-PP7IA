import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { MiniLivrosContentSource } from "@/infrastructure/chat/MiniLivrosContentSource";
import { HtmlChunker } from "@/infrastructure/chat/HtmlChunker";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { getEmbeddingProvider } from "@/infrastructure/chat/providers";
import type { Chunk, EmbeddedChunk } from "@/domain/chat/Chunk";

export const runtime = "nodejs";
export const maxDuration = 60;

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function POST() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const startedAt = Date.now();
    try {
        const source = new MiniLivrosContentSource();
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
            event: "chat.reindex",
            books: items.length,
            chunks: inserted,
            skipped: skipped.length,
            ms,
            status: "ok",
        }));

        return NextResponse.json({
            chunks_indexed: inserted,
            books_processed: items.length,
            skipped,
            duration_ms: ms,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error(JSON.stringify({ event: "chat.reindex", status: "error", message }));
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
