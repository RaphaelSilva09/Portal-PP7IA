import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { getLLMProvider, getEmbeddingProvider } from "@/infrastructure/chat/providers";
import type { EmbeddedChunk } from "@/domain/chat/Chunk";
import type { EmbeddingProvider } from "@/domain/chat/EmbeddingProvider";

export const runtime = "nodejs";
export const maxDuration = 300;

const ENTITY_INDEX_SOURCE_ID = "00000000-0000-4000-8001-000000000001";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

async function streamToString(
    llm: ReturnType<typeof getLLMProvider>,
    input: Parameters<ReturnType<typeof getLLMProvider>["streamGenerate"]>[0],
): Promise<string> {
    let result = "";
    for await (const token of llm.streamGenerate(input)) result += token;
    return result.trim();
}

export async function POST() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const startedAt = Date.now();
    try {
        const llm = getLLMProvider();
        const embedder = getEmbeddingProvider() as EmbeddingProvider & { embed: (t: string) => Promise<number[]> };
        const repo = new RagChunkRepository();

        const summaries = await repo.findAllContentBySourceType("meta_summary");
        if (summaries.length === 0) {
            return NextResponse.json({ error: "No meta_summary chunks found. Run reindex-meta first." }, { status: 400 });
        }

        const allText = summaries
            .map(s => `${s.title}:\n${s.content}`)
            .join("\n\n---\n\n")
            .slice(0, 16000);

        const prompt = `Você recebeu extrações de entidades de múltiplos conteúdos (mini-livros, newsletters, etc.).
Liste todas as pessoas e empresas mencionadas.
Para cada uma: em quais documentos aparece e em que contexto foi citada.

Formato:
[Nome da entidade]
- [Título do documento]: [contexto da citação]

Extrações:
${allText}`;

        const indexText = "[Índice global de entidades]\n" + await streamToString(llm, {
            system: "Você é um indexador. Liste entidades e onde aparecem, de forma concisa.",
            context: "",
            history: [],
            question: prompt,
        });

        const embedding = await embedder.embed(indexText);

        const chunk: EmbeddedChunk = {
            source_type: "meta_entity_index",
            source_id: ENTITY_INDEX_SOURCE_ID,
            chunk_index: 0,
            content: indexText,
            metadata: {
                heading_path: [],
                slug: "entity_index_global",
                title: "Índice global de entidades",
                char_start: 0,
                char_end: 0,
            },
            embedding,
        };

        const stored = await repo.replaceAllForSource({ sourceType: "meta_entity_index", chunks: [chunk] });

        const ms = Date.now() - startedAt;
        console.log(JSON.stringify({
            event: "chat.reindex-entity-index",
            summaries_used: summaries.length,
            chunks_stored: stored,
            ms,
            status: "ok",
        }));

        return NextResponse.json({
            summaries_used: summaries.length,
            chunks_stored: stored,
            duration_ms: ms,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error(JSON.stringify({ event: "chat.reindex-entity-index", status: "error", message }));
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
