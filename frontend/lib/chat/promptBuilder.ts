// frontend/lib/chat/promptBuilder.ts
import type { Message } from "@/domain/chat/Message";
import type { RetrievedChunk } from "@/domain/chat/Chunk";

const MAX_HISTORY = 5;

export const SYSTEM_PROMPT = `Você é assistente do Portal-PP7IA. Responda APENAS com base nos trechos fornecidos do livro 'Enquanto é Tempo'. Se a resposta não estiver nos trechos, diga que não encontrou. Sempre cite o capítulo. Responda em português brasileiro.`;

export function buildContext(chunks: RetrievedChunk[]): string {
    return chunks.map((c, i) => {
        const heading = c.metadata.heading_path.join(" — ");
        return `[Trecho ${i + 1} — ${heading || "Sem título"}]\n${c.content}`;
    }).join("\n---\n");
}

export interface PromptInputs {
    messages: Message[];           // includes the latest user message at the end
    chunks: RetrievedChunk[];
}

export interface BuiltPrompt {
    system: string;
    context: string;
    history: Message[];           // truncated to MAX_HISTORY messages, excluding the latest
    question: string;
}

export function buildPrompt(input: PromptInputs): BuiltPrompt {
    const messages = input.messages;
    if (messages.length === 0) throw new Error("buildPrompt: messages cannot be empty");
    const last = messages[messages.length - 1];
    if (last.role !== "user") throw new Error("buildPrompt: last message must be from user");
    const history = messages.slice(0, -1).slice(-MAX_HISTORY);
    return {
        system: SYSTEM_PROMPT,
        context: buildContext(input.chunks),
        history,
        question: last.content,
    };
}
