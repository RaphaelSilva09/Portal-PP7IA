import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { MiniLivrosContentSource } from "@/infrastructure/chat/MiniLivrosContentSource";
import { NewsletterContentSource } from "@/infrastructure/chat/NewsletterContentSource";
import { RadarContentSource } from "@/infrastructure/chat/RadarContentSource";
import { EspecialSemanaContentSource } from "@/infrastructure/chat/EspecialSemanaContentSource";
import { BibliotecaContentSource } from "@/infrastructure/chat/BibliotecaContentSource";
import { EstudarContentSource } from "@/infrastructure/chat/EstudarContentSource";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { getLLMProvider, getEmbeddingProvider } from "@/infrastructure/chat/providers";
import type { ContentSource } from "@/domain/chat/ContentSource";
import type { EmbeddedChunk } from "@/domain/chat/Chunk";
import type { LLMProvider } from "@/domain/chat/LLMProvider";
import type { EmbeddingProvider } from "@/domain/chat/EmbeddingProvider";

export const runtime = "nodejs";
export const maxDuration = 300;

const GLOBAL_SOURCE_IDS: Record<string, string> = {
    mini_livro:          "00000000-0000-4000-8000-ffffffffffff",
    newsletter:          "00000000-0000-4000-8000-fffffffffffe",
    radar_oportunidades: "00000000-0000-4000-8000-fffffffffffd",
    especial_semana:     "00000000-0000-4000-8000-fffffffffffc",
    biblioteca:          "00000000-0000-4000-8000-fffffffffffb",
    estudar:             "00000000-0000-4000-8000-fffffffffffa",
};

const SOURCES: Record<string, ContentSource> = {
    mini_livro:          new MiniLivrosContentSource(),
    newsletter:          new NewsletterContentSource(),
    radar_oportunidades: new RadarContentSource(),
    especial_semana:     new EspecialSemanaContentSource(),
    biblioteca:          new BibliotecaContentSource(),
    estudar:             new EstudarContentSource(),
};

const EXTRACTION_PROMPT = (title: string, text: string) => `
Dado o seguinte conteúdo intitulado "${title}", extraia as informações abaixo.
Responda EXATAMENTE neste formato, sem texto adicional:

Pessoas mencionadas: [nomes separados por vírgula, ou "Nenhuma"]
Número de pessoas: [número inteiro]
Empresas / organizações: [nomes separados por vírgula, ou "Nenhuma"]
Referências citadas: [livros, artigos ou estudos separados por vírgula, ou "Nenhuma"]

Conteúdo:
${text.slice(0, 12000)}
`.trim();

async function streamToString(llm: LLMProvider, input: Parameters<LLMProvider["streamGenerate"]>[0]): Promise<string> {
    let result = "";
    for await (const token of llm.streamGenerate(input)) result += token;
    return result.trim();
}

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
    const globalSourceId = GLOBAL_SOURCE_IDS[sourceType];
    if (!globalSourceId) {
        return NextResponse.json({ error: `No global UUID for source: ${sourceType}` }, { status: 500 });
    }

    const startedAt = Date.now();
    try {
        const llm = getLLMProvider();
        const embedder = getEmbeddingProvider() as EmbeddingProvider & { embedBatch?: (texts: string[]) => Promise<number[][]> };
        const repo = new RagChunkRepository();

        const items = await source.fetchAll();

        // Phase 1: LLM extraction (sequential — rate-limited by Gemini)
        // Use already-indexed chunk text (HtmlChunker output) rather than re-stripping raw HTML,
        // which would waste the first 6000 chars on navigation boilerplate.
        const extractions: { item: typeof items[number]; text: string }[] = [];
        for (const item of items) {
            const existingChunks = await repo.findBySlug(sourceType, item.slug);
            const plainText = existingChunks.length > 0
                ? existingChunks.map(c => c.content).join("\n\n")
                : item.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            const extracted = await streamToString(llm, {
                system: "Você é um extrator de entidades. Siga o formato exato solicitado.",
                context: "",
                history: [],
                question: EXTRACTION_PROMPT(item.title, plainText),
            });
            extractions.push({ item, text: extracted });
        }

        // Phase 2: global aggregate
        const allExtractionTexts = extractions.map(e => `${e.item.title}:\n${e.text}`);
        const globalText = `[Resumo geral — ${sourceType}]\n` + await streamToString(llm, {
            system: "Você é um sumarizador. Liste as entidades mais citadas de forma concisa.",
            context: "",
            history: [],
            question: `Você recebeu extrações de entidades de ${items.length} conteúdos do tipo "${sourceType}". Resuma as entidades mais frequentes:\n\n${allExtractionTexts.join("\n\n---\n\n").slice(0, 8000)}`,
        });

        // Phase 3: batch embed all texts at once
        const summaryTexts = extractions.map(e => `[${e.item.title}]\n${e.text}`);
        const allTexts = [...summaryTexts, globalText];

        let allEmbeddings: number[][];
        const embedBatch = (embedder as { embedBatch?: (texts: string[]) => Promise<number[][]> }).embedBatch;
        if (typeof embedBatch === "function") {
            allEmbeddings = await embedBatch.call(embedder, allTexts);
        } else {
            allEmbeddings = await Promise.all(allTexts.map(t => (embedder as { embed: (t: string) => Promise<number[]> }).embed(t)));
        }

        // Phase 4: assemble chunks
        const chunks: EmbeddedChunk[] = extractions.map((e, i) => ({
            source_type: "meta_summary",
            source_id: e.item.source_id,
            chunk_index: 0,
            content: summaryTexts[i],
            metadata: {
                heading_path: [],
                slug: e.item.slug,
                title: e.item.title,
                char_start: 0,
                char_end: 0,
                parent_source_type: sourceType,
                parent_slug: e.item.slug,
                parent_title: e.item.title,
            },
            embedding: allEmbeddings[i],
        }));

        chunks.push({
            source_type: "meta_global",
            source_id: globalSourceId,
            chunk_index: 0,
            content: globalText,
            metadata: {
                heading_path: [],
                slug: `global_${sourceType}`,
                title: `Global — ${sourceType}`,
                char_start: 0,
                char_end: 0,
            },
            embedding: allEmbeddings[allEmbeddings.length - 1],
        });

        const stored = await repo.replaceMetaForParentSource(sourceType, chunks);

        const ms = Date.now() - startedAt;
        console.log(JSON.stringify({
            event: "chat.reindex-meta", source_type: sourceType,
            items: items.length, chunks: stored, ms, status: "ok",
        }));

        return NextResponse.json({
            source_type: sourceType,
            items_processed: items.length,
            chunks_stored: stored,
            duration_ms: ms,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error(JSON.stringify({ event: "chat.reindex-meta", source_type: sourceType, status: "error", message }));
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
