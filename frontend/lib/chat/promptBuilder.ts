import type { Message } from "@/domain/chat/Message";
import type { RetrievedChunk } from "@/domain/chat/Chunk";

const MAX_HISTORY = 5;

const SOURCE_TYPE_LABELS: Record<string, string> = {
    mini_livro:          "Mini-Livro",
    newsletter:          "Newsletter",
    radar_oportunidades: "Editoriais e Artigos",
    especial_semana:     "Inteligência Artificial",
    biblioteca:          "Biblioteca",
    estudar:             "Estudar",
    meta_summary:        "Resumo",
};

function sourceLabel(chunk: RetrievedChunk): string {
    const type = chunk.source_type === "meta_summary" && chunk.metadata.parent_source_type
        ? chunk.metadata.parent_source_type
        : chunk.source_type;
    return SOURCE_TYPE_LABELS[type] ?? type;
}

export const SYSTEM_PROMPT = `Você é assistente do Portal-PP7IA. Responda APENAS com base nos trechos fornecidos do portal (mini-livros, newsletters, editoriais, artigos e outros conteúdos). Se a resposta não estiver nos trechos, diga que não encontrou. Responda em português brasileiro.

ESTILO de resposta:
- SEJA CONCISO. Responda em 1-3 frases curtas sempre que possível.
- Aponte o conteúdo relevante (ex: "Veja o MiniLivro 03 — O Valor que a Máquina Não Tem"). Não enumere capítulos a menos que perguntado explicitamente.
- Não copie trechos longos. Resuma com palavras suas.
- Liste itens só se a pergunta pedir lista (ex: "quais", "liste", "todos").
- Se a pergunta for genérica ("o que tem em X"), dê resumo breve + sugestão de leitura, não inventário completo.

REGRAS de exatidão (quando precisar citar títulos):
- Use os títulos completos que aparecem no corpo dos trechos.
- IGNORE listas curtas de navegação truncadas — são menus visuais.
- Não invente seções que não estão nos trechos.

REGRAS de citação:
- Toda afirmação factual deve ser seguida por marcador [N] referindo a "Fonte N" do contexto.
- Múltiplas fontes para a mesma afirmação: [1][2] (não [1, 2]).
- Use apenas N existentes em "Fonte 1..M" do contexto. Não invente.
- Não emita [Fonte N], apenas [N].
- O bloco [Contexto adicional] é conhecimento de fundo — use a informação livremente mas não cite com [N] e NUNCA reproduza o texto "[Contexto adicional]" na resposta.`;

export function buildContext(
    chunks: RetrievedChunk[],
    chunkToCitationIdx: number[],
    uncitedChunks: RetrievedChunk[] = [],
): string {
    if (chunks.length !== chunkToCitationIdx.length) {
        throw new Error("buildContext: chunkToCitationIdx length must match chunks length");
    }
    const cited = chunks.map((c, i) => {
        const label = sourceLabel(c);
        const heading = c.metadata.heading_path.join(" — ");
        const subLabel = heading || c.metadata.parent_title || c.metadata.title || "Sem título";
        return `[Fonte ${chunkToCitationIdx[i]} — ${label}: ${subLabel}]\n${c.content}`;
    }).join("\n---\n");

    if (uncitedChunks.length === 0) return cited;
    const extra = uncitedChunks.map(c => c.content).join("\n\n");
    return `${cited}\n\n[Contexto adicional]\n${extra}`;
}

export interface PromptInputs {
    messages: Message[];
    chunks: RetrievedChunk[];
    chunkToCitationIdx: number[];
    uncitedChunks?: RetrievedChunk[];
}

export interface BuiltPrompt {
    system: string;
    context: string;
    history: Message[];
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
        context: buildContext(input.chunks, input.chunkToCitationIdx, input.uncitedChunks ?? []),
        history,
        question: last.content,
    };
}
