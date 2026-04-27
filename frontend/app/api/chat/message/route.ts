// frontend/app/api/chat/message/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getUser } from "@/infrastructure/auth/getUser";
import { RateLimitRepository } from "@/infrastructure/chat/RateLimitRepository";
import { RagChunkRepository } from "@/infrastructure/chat/RagChunkRepository";
import { getEmbeddingProvider, getLLMProvider } from "@/infrastructure/chat/providers";
import { encodeSseEvent, sseResponse } from "@/lib/chat/sse";
import { buildPrompt } from "@/lib/chat/promptBuilder";
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

    // 3. Embed + 4. Retrieve
    const embedder = getEmbeddingProvider();
    const queryEmbedding = await embedder.embed(lastUser.content);
    const chunkRepo = new RagChunkRepository();
    const allChunks = await chunkRepo.searchSimilar({
        sourceType: "mini_livro",
        queryEmbedding,
        topK: RAG_TOP_K,
    });
    const relevant = allChunks.filter(c => c.similarity >= RAG_MIN_SIMILARITY);

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

    // 5. Build prompt
    const prompt = buildPrompt({ messages: body.messages, chunks: relevant });

    // 6. Stream
    const provider = getLLMProvider();
    const startedAt = Date.now();
    const citations = relevant.map(c => citationFromMetadata(c.metadata, c.similarity));

    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const token of provider.streamGenerate({
                    system: prompt.system,
                    context: prompt.context,
                    history: prompt.history,
                    question: prompt.question,
                })) {
                    controller.enqueue(encodeSseEvent({ type: "token", content: token }));
                }
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
                    min_sim: relevant[relevant.length - 1].similarity,
                    status: "ok",
                }));
            }
        },
    });

    return sseResponse(stream);
}
