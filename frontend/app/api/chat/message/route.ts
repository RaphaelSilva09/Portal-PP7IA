// frontend/app/api/chat/message/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getUser } from "@/infrastructure/auth/getUser";
import { RateLimitRepository } from "@/infrastructure/chat/RateLimitRepository";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { getEmbeddingProvider, getLLMProvider } from "@/infrastructure/chat/providers";
import { encodeSseEvent, sseResponse } from "@/lib/chat/sse";
import { buildPrompt } from "@/lib/chat/promptBuilder";
import { answerWithMarkers } from "@/lib/chat/answerWithMarkers";
import { citationFromMetadata } from "@/domain/chat/RagAnswer";
import type { Message } from "@/domain/chat/Message";
import type { SseEvent } from "@/domain/chat/RagAnswer";

export const runtime = "nodejs";
export const maxDuration = 30;

const RAG_TOP_K = parseInt(process.env.RAG_TOP_K ?? "6", 10);
const RAG_MIN_SIMILARITY = parseFloat(process.env.RAG_MIN_SIMILARITY ?? "0.55");
const RAG_DAILY_LIMIT = parseInt(process.env.RAG_DAILY_LIMIT ?? "30", 10);
const NO_MATCH_TEXT = "Não encontrei isso nos mini-livros. Tente reformular ou explore a biblioteca completa.";

const MessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
});
const BodySchema = z.object({
    messages: z.array(MessageSchema).min(1).max(20),
});

function singleEventStream(event: SseEvent): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(encodeSseEvent(event));
            controller.close();
        },
    });
}

export async function POST(request: NextRequest) {
    // Parse and validate body
    let body: { messages: Message[] };
    try {
        const json = await request.json();
        body = BodySchema.parse(json);
    } catch {
        return sseResponse(singleEventStream({
            type: "error", code: "server_error", message: "Corpo da requisição inválido.",
        }));
    }

    // 1. Auth gate — zero downstream calls if missing
    const user = await getUser();
    if (!user) {
        return sseResponse(singleEventStream({
            type: "error", code: "auth_required", message: "Por favor, faça login para utilizar o chat.",
        }));
    }

    // 2. Rate limit
    const rateRepo = new RateLimitRepository();
    const used = await rateRepo.currentCount(user.id);
    if (used >= RAG_DAILY_LIMIT) {
        return sseResponse(singleEventStream({
            type: "error", code: "rate_limit",
            message: `Limite diário atingido (${RAG_DAILY_LIMIT} mensagens). Volte amanhã.`,
        }));
    }

    const lastUser = body.messages[body.messages.length - 1];
    if (lastUser.role !== "user") {
        return sseResponse(singleEventStream({
            type: "error", code: "server_error", message: "Última mensagem precisa ser do usuário.",
        }));
    }

    // 3. Embed + 4. Retrieve (semantic + hybrid by mini-livro number)
    const embedder = getEmbeddingProvider();
    const queryEmbedding = await embedder.embed(lastUser.content);
    const chunkRepo = new RagChunkRepository();

    // Hybrid: detect "mini[ -]livro N" / "ML-N" / "MLNN" → fetch all chunks for that source
    // so broad questions like "o que tem no minilivro 3" get the whole chapter list.
    // When a hybrid hit fires, skip the cross-source semantic search to keep the citation
    // list focused on the explicitly-asked mini-livro.
    const directMatch = lastUser.content.match(/\b(?:mini[\s-]?livro|ml)[\s-]?0*(\d{1,2})\b/i);
    const directChunks = directMatch
        ? await chunkRepo.findBySlug("mini_livro", String(directMatch[1]).padStart(3, "0"))
        : [];

    let relevant: typeof directChunks;
    if (directChunks.length > 0) {
        // Targeted query — only this mini-livro's chunks
        relevant = directChunks;
    } else {
        const semanticChunks = await chunkRepo.searchSimilar({
            sourceType: "mini_livro",
            queryEmbedding,
            topK: RAG_TOP_K,
        });
        relevant = semanticChunks.filter(c => c.similarity >= RAG_MIN_SIMILARITY);
    }

    if (relevant.length === 0) {
        // Stream the no-match answer; bump usage but don't call LLM.
        const startedAt = Date.now();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encodeSseEvent({ type: "token", content: NO_MATCH_TEXT }));
                controller.enqueue(encodeSseEvent({ type: "done", citations: [] }));
                controller.close();
            },
        });
        rateRepo.increment(user.id).catch(err => console.error("rateRepo.increment failed", err));
        console.log(JSON.stringify({
            event: "chat.message", user_id: user.id, ms: Date.now() - startedAt,
            top_k: 0, min_sim: RAG_MIN_SIMILARITY, status: "no_match",
        }));
        return sseResponse(stream);
    }

    // 5. Dedupe citations: one per (slug, chapter). Keep highest similarity per group.
    // "Chapter" = first 2 levels of heading_path (book → chapter). Cap at 8.
    const CITATION_CAP = 8;
    type Cit = ReturnType<typeof citationFromMetadata>;
    const chapterKeyOf = (c: typeof relevant[number]) =>
        `${c.metadata.slug}|${(c.metadata.heading_path ?? []).slice(0, 2).join("|")}`;

    const bestPerKey = new Map<string, Cit>();
    for (const c of relevant) {
        const key = chapterKeyOf(c);
        const cit = citationFromMetadata(c.metadata, c.similarity);
        const existing = bestPerKey.get(key);
        if (!existing || cit.similarity > existing.similarity) {
            bestPerKey.set(key, { ...cit, heading_path: cit.heading_path.slice(0, 2) });
        }
    }
    const orderedKeys = Array.from(bestPerKey.entries())
        .sort((a, b) => b[1].similarity - a[1].similarity)
        .slice(0, CITATION_CAP)
        .map(([k]) => k);
    const citations = orderedKeys.map(k => bestPerKey.get(k)!);
    const keyToCitationIdx = new Map(orderedKeys.map((k, i) => [k, i + 1]));
    // Chunks whose chapter dropped past CITATION_CAP map to 0 (won't appear in context).
    const chunkToCitationIdx = relevant.map(c => keyToCitationIdx.get(chapterKeyOf(c)) ?? 0);
    const usedChunks = relevant.filter((_, i) => chunkToCitationIdx[i] > 0);
    const usedIdx = chunkToCitationIdx.filter(n => n > 0);

    // 6. Build prompt
    const prompt = buildPrompt({
        messages: body.messages,
        chunks: usedChunks,
        chunkToCitationIdx: usedIdx,
    });

    // 7. Generate (with 1-retry on missing [N] markers)
    const provider = getLLMProvider();
    const startedAt = Date.now();

    const stream = new ReadableStream({
        async start(controller) {
            let retried = false;
            let markersOk = false;
            try {
                const result = await answerWithMarkers(provider, {
                    system: prompt.system,
                    context: prompt.context,
                    history: prompt.history,
                    question: prompt.question,
                }, citations.length);
                retried = result.retried;
                markersOk = result.markersOk;
                if (retried) {
                    console.log(JSON.stringify({
                        event: "chat.retry", reason: "missing_markers", user_id: user.id,
                    }));
                }
                controller.enqueue(encodeSseEvent({ type: "token", content: result.answer }));
                controller.enqueue(encodeSseEvent({ type: "done", citations }));
            } catch (err) {
                const message = err instanceof Error ? err.message : "Erro desconhecido.";
                controller.enqueue(encodeSseEvent({ type: "error", code: "server_error", message }));
            } finally {
                controller.close();
                rateRepo.increment(user.id).catch(e => console.error("rateRepo.increment failed", e));
                console.log(JSON.stringify({
                    event: "chat.message", user_id: user.id, ms: Date.now() - startedAt,
                    top_k: relevant.length,
                    chunks_used: usedChunks.length,
                    min_sim: relevant[relevant.length - 1].similarity,
                    status: "ok", retried, markers_ok: markersOk,
                }));
            }
        },
    });

    return sseResponse(stream);
}
