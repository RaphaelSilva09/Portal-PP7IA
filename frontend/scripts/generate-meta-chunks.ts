/**
 * Generate meta-chunks (entity extraction) for all content sources.
 *
 * For each document: call LLM to extract people, companies, references.
 * Store as source_type="meta_summary" (citable, links to parent doc).
 *
 * After per-doc pass: generate one global aggregate per content type.
 * Store as source_type="meta_global" (uncited background context).
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-meta-chunks.ts
 *
 * Always runs all sources. replaceAllForSource is called once per meta type
 * at the end, so partial runs would overwrite all previous meta chunks.
 *
 * Required env: DATABASE_URL (or PG* vars), GEMINI_API_KEY
 * Optional env: STORAGE_ROOT, LLM_PROVIDER, GROQ_API_KEY
 */
import { readFileSync } from "node:fs";
import path from "node:path";

function loadDotEnvLocal() {
    try {
        const content = readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
        for (const rawLine of content.split("\n")) {
            const line = rawLine.trim();
            if (!line || line.startsWith("#")) continue;
            const eq = line.indexOf("=");
            if (eq === -1) continue;
            const key = line.slice(0, eq).trim();
            let value = line.slice(eq + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (process.env[key] === undefined) process.env[key] = value;
        }
    } catch { /* no .env.local */ }
}
loadDotEnvLocal();

import { GeminiEmbeddingProvider } from "@/infrastructure/chat/GeminiEmbeddingProvider";
import { GeminiProvider } from "@/infrastructure/chat/GeminiProvider";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { MiniLivrosContentSource } from "@/infrastructure/chat/MiniLivrosContentSource";
import { NewsletterContentSource } from "@/infrastructure/chat/NewsletterContentSource";
import { RadarContentSource } from "@/infrastructure/chat/RadarContentSource";
import { EspecialSemanaContentSource } from "@/infrastructure/chat/EspecialSemanaContentSource";
import { BibliotecaContentSource } from "@/infrastructure/chat/BibliotecaContentSource";
import { EstudarContentSource } from "@/infrastructure/chat/EstudarContentSource";
import type { ContentSource } from "@/domain/chat/ContentSource";
import type { EmbeddedChunk } from "@/domain/chat/Chunk";
import type { LLMProvider } from "@/domain/chat/LLMProvider";

// Fixed UUIDs for meta_global chunks (one per content type)
const GLOBAL_SOURCE_IDS: Record<string, string> = {
    mini_livro:          "00000000-0000-4000-8000-ffffffffffff",
    newsletter:          "00000000-0000-4000-8000-fffffffffffe",
    radar_oportunidades: "00000000-0000-4000-8000-fffffffffffd",
    especial_semana:     "00000000-0000-4000-8000-fffffffffffc",
    biblioteca:          "00000000-0000-4000-8000-fffffffffffb",
    estudar:             "00000000-0000-4000-8000-fffffffffffa",
};

const ALL_SOURCES: ContentSource[] = [
    new MiniLivrosContentSource(),
    new NewsletterContentSource(),
    new RadarContentSource(),
    new EspecialSemanaContentSource(),
    new BibliotecaContentSource(),
    new EstudarContentSource(),
];

const EXTRACTION_PROMPT = (title: string, text: string) => `
Dado o seguinte conteúdo intitulado "${title}", extraia as informações abaixo.
Responda EXATAMENTE neste formato, sem texto adicional:

Pessoas mencionadas: [nomes separados por vírgula, ou "Nenhuma"]
Número de pessoas: [número inteiro]
Empresas / organizações: [nomes separados por vírgula, ou "Nenhuma"]
Referências citadas: [livros, artigos ou estudos separados por vírgula, ou "Nenhuma"]

Conteúdo:
${text.slice(0, 6000)}
`.trim();

async function extractText(llm: LLMProvider, title: string, html: string): Promise<string> {
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const prompt = EXTRACTION_PROMPT(title, text);
    let result = "";
    const stream = llm.streamGenerate({
        system: "Você é um extrator de entidades. Siga o formato exato solicitado.",
        context: "",
        history: [],
        question: prompt,
    });
    for await (const token of stream) {
        result += token;
    }
    return result.trim();
}

interface SourceExtractionResult {
    summaryChunks: EmbeddedChunk[];
    globalChunk: EmbeddedChunk;
}

async function extractForSource(
    source: ContentSource,
    llm: LLMProvider,
    embedder: GeminiEmbeddingProvider,
): Promise<SourceExtractionResult> {
    console.log(`\n[${source.sourceType}] Fetching items...`);
    const items = await source.fetchAll();
    console.log(`[${source.sourceType}] ${items.length} items`);

    const summaryChunks: EmbeddedChunk[] = [];
    const allExtractions: string[] = [];

    for (const item of items) {
        process.stdout.write(`  Extracting "${item.title}"... `);
        const extracted = await extractText(llm, item.title, item.html);
        allExtractions.push(`${item.title}:\n${extracted}`);

        const summaryText = `[${item.title}]\n${extracted}`;
        const embedding = await embedder.embed(summaryText);

        summaryChunks.push({
            source_type: "meta_summary",
            source_id: item.source_id,
            chunk_index: 0,
            content: summaryText,
            metadata: {
                heading_path: [],
                slug: item.slug,
                title: item.title,
                char_start: 0,
                char_end: 0,
                parent_source_type: source.sourceType,
                parent_slug: item.slug,
                parent_title: item.title,
            },
            embedding,
        });
        process.stdout.write("done\n");
    }

    console.log(`[${source.sourceType}] Generating global aggregate...`);
    const globalPrompt = `Você recebeu extrações de entidades de ${items.length} conteúdos do tipo "${source.sourceType}". Resuma as entidades mais frequentes:\n\n${allExtractions.join("\n\n---\n\n").slice(0, 8000)}`;
    let globalText = `[Resumo geral — ${source.sourceType}]\n`;
    const globalStream = llm.streamGenerate({
        system: "Você é um sumarizador. Liste as entidades mais citadas de forma concisa.",
        context: "",
        history: [],
        question: globalPrompt,
    });
    for await (const token of globalStream) {
        globalText += token;
    }
    const globalEmbedding = await embedder.embed(globalText);
    const globalChunk: EmbeddedChunk = {
        source_type: "meta_global",
        source_id: GLOBAL_SOURCE_IDS[source.sourceType] ?? "00000000-0000-4000-8000-000000000000",
        chunk_index: 0,
        content: globalText,
        metadata: {
            heading_path: [],
            slug: `global_${source.sourceType}`,
            title: `Global — ${source.sourceType}`,
            char_start: 0,
            char_end: 0,
        },
        embedding: globalEmbedding,
    };

    return { summaryChunks, globalChunk };
}

async function main() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        console.error("GEMINI_API_KEY required");
        process.exit(1);
    }

    const llm: LLMProvider = new GeminiProvider(geminiKey, process.env.GEMINI_GENERATION_MODEL);
    const embedder = new GeminiEmbeddingProvider(geminiKey, process.env.GEMINI_EMBEDDING_MODEL);
    const chunkRepo = new RagChunkRepository();

    // Extract all sources first, accumulate into flat arrays.
    // replaceAllForSource is called ONCE per meta type at the end to avoid
    // each source overwriting the previous one (replaceAll deletes by source_type).
    const allSummaryChunks: EmbeddedChunk[] = [];
    const allGlobalChunks: EmbeddedChunk[] = [];

    for (const source of ALL_SOURCES) {
        const result = await extractForSource(source, llm, embedder);
        allSummaryChunks.push(...result.summaryChunks);
        allGlobalChunks.push(result.globalChunk);
    }

    console.log(`\nStoring ${allSummaryChunks.length} meta_summary chunks...`);
    await chunkRepo.replaceAllForSource({ sourceType: "meta_summary", chunks: allSummaryChunks });

    console.log(`Storing ${allGlobalChunks.length} meta_global chunks...`);
    await chunkRepo.replaceAllForSource({ sourceType: "meta_global", chunks: allGlobalChunks });

    console.log("\nMeta-chunk generation complete.");
    process.exit(0);
}

main().catch(err => {
    console.error("Meta-chunk generation failed:", err);
    process.exit(1);
});
