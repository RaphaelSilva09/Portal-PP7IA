/**
 * Ingest all content sources into rag_chunks.
 *
 * Usage:
 *   pnpm exec tsx scripts/ingest-rag.ts             # all sources
 *   pnpm exec tsx scripts/ingest-rag.ts --source newsletter
 *
 * Required env: DATABASE_URL (or PG* vars), GEMINI_API_KEY
 * Optional env: STORAGE_ROOT (defaults to ./data)
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
    } catch { /* no .env.local — env vars must be set externally */ }
}
loadDotEnvLocal();

import { HtmlChunker } from "@/infrastructure/chat/HtmlChunker";
import { GeminiEmbeddingProvider } from "@/infrastructure/chat/GeminiEmbeddingProvider";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { MiniLivrosContentSource } from "@/infrastructure/chat/MiniLivrosContentSource";
import { NewsletterContentSource } from "@/infrastructure/chat/NewsletterContentSource";
import { RadarContentSource } from "@/infrastructure/chat/RadarContentSource";
import { EspecialSemanaContentSource } from "@/infrastructure/chat/EspecialSemanaContentSource";
import { BibliotecaContentSource } from "@/infrastructure/chat/BibliotecaContentSource";
import { EstudarContentSource } from "@/infrastructure/chat/EstudarContentSource";
import type { ContentSource } from "@/domain/chat/ContentSource";
import type { EmbeddedChunk } from "@/domain/chat/Chunk";

const ALL_SOURCES: ContentSource[] = [
    new MiniLivrosContentSource(),
    new NewsletterContentSource(),
    new RadarContentSource(),
    new EspecialSemanaContentSource(),
    new BibliotecaContentSource(),
    new EstudarContentSource(),
];

async function ingestSource(
    source: ContentSource,
    chunker: HtmlChunker,
    embedder: GeminiEmbeddingProvider,
    chunkRepo: RagChunkRepository,
): Promise<void> {
    console.log(`\n[${source.sourceType}] Fetching items...`);
    const items = await source.fetchAll();
    console.log(`[${source.sourceType}] ${items.length} items found`);

    const allChunks: EmbeddedChunk[] = [];

    for (const item of items) {
        const chunks = chunker.chunk(item.html, {
            source_type: source.sourceType,
            source_id: item.source_id,
            slug: item.slug,
            title: item.title,
        });

        for (const chunk of chunks) {
            const embedding = await embedder.embed(chunk.content);
            allChunks.push({ ...chunk, embedding });
        }
        process.stdout.write(`  ✓ "${item.title}" (${chunks.length} chunks)\n`);
    }

    const stored = await chunkRepo.replaceAllForSource({
        sourceType: source.sourceType,
        chunks: allChunks,
    });
    console.log(`[${source.sourceType}] Stored ${stored} chunks total`);
}

async function main() {
    const sourceFlag = process.argv.indexOf("--source");
    const targetSource = sourceFlag !== -1 ? process.argv[sourceFlag + 1] : null;

    const sources = targetSource
        ? ALL_SOURCES.filter(s => s.sourceType === targetSource)
        : ALL_SOURCES;

    if (targetSource && sources.length === 0) {
        console.error(`Unknown source type: ${targetSource}`);
        console.error(`Valid types: ${ALL_SOURCES.map(s => s.sourceType).join(", ")}`);
        process.exit(1);
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        console.error("GEMINI_API_KEY required");
        process.exit(1);
    }

    const chunker = new HtmlChunker();
    const embedder = new GeminiEmbeddingProvider(geminiKey, process.env.GEMINI_EMBEDDING_MODEL);
    const chunkRepo = new RagChunkRepository();

    let failed = false;
    for (const source of sources) {
        try {
            await ingestSource(source, chunker, embedder, chunkRepo);
        } catch (err) {
            console.error(`[${source.sourceType}] Ingest failed:`, err);
            failed = true;
        }
    }

    if (failed) {
        console.error("\nIngest completed with errors. Some sources may not have been updated.");
        process.exit(1);
    }
    console.log("\nIngest complete.");
    process.exit(0);
}

main().catch(err => {
    console.error("Ingest failed:", err);
    process.exit(1);
});
