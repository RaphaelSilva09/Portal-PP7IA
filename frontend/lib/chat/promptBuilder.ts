// frontend/lib/chat/promptBuilder.ts
import type { Message } from "@/domain/chat/Message";
import type { RetrievedChunk } from "@/domain/chat/Chunk";

const MAX_HISTORY = 5;

export const SYSTEM_PROMPT = `Você é assistente do Portal-PP7IA. Responda APENAS com base nos trechos fornecidos do livro 'Enquanto é Tempo'. Se a resposta não estiver nos trechos, diga que não encontrou. Responda em português brasileiro.

ESTILO de resposta:
- SEJA CONCISO. Responda em 1-3 frases curtas sempre que possível.
- Aponte o mini-livro relevante (ex: "Veja o MiniLivro 03 — O Valor que a Máquina Não Tem"). Não enumere capítulos a menos que perguntado explicitamente.
- Não copie trechos longos. Resuma com palavras suas.
- Liste itens só se a pergunta pedir lista (ex: "quais", "liste", "todos").
- Se a pergunta for genérica ("o que tem em X"), dê resumo breve + sugestão de leitura, não inventário completo.

REGRAS de exatidão (quando precisar citar títulos):
- Use os títulos completos que aparecem no formato "Capítulo I A Ilusão da Competência" no corpo dos trechos.
- IGNORE listas curtas de navegação truncadas (ex: "A Ilusão da", "Os 4 Pilares") — são menus visuais.
- Não invente seções que não estão nos trechos.

REGRAS de citação:
- Toda afirmação factual deve ser seguida por marcador [N] referindo a "Fonte N" do contexto.
- Múltiplas fontes para a mesma afirmação: [1][2] (não [1, 2]).
- Use apenas N existentes em "Fonte 1..M" do contexto. Não invente.
- Não emita [Fonte N], apenas [N].`;

export function buildContext(
    chunks: RetrievedChunk[],
    chunkToCitationIdx: number[],
): string {
    if (chunks.length !== chunkToCitationIdx.length) {
        throw new Error("buildContext: chunkToCitationIdx length must match chunks length");
    }
    return chunks.map((c, i) => {
        const heading = c.metadata.heading_path.join(" — ");
        return `[Fonte ${chunkToCitationIdx[i]} — ${heading || "Sem título"}]\n${c.content}`;
    }).join("\n---\n");
}

export interface PromptInputs {
    messages: Message[];           // includes the latest user message at the end
    chunks: RetrievedChunk[];
    chunkToCitationIdx: number[];  // 1-based citation index for each chunk; length must equal chunks.length
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
        context: buildContext(input.chunks, input.chunkToCitationIdx),
        history,
        question: last.content,
    };
}
