import type { Message } from "@/domain/chat/Message";

const DEFAULT_BATCH_CHAR_LIMIT = 12000;
const SEPARATOR = "\n\n---\n\n";

export interface EntityIndexSummary {
    title: string;
    content: string;
}

interface GenerateInput {
    system: string;
    context: string;
    history: Message[];
    question: string;
}

type GenerateText = (input: GenerateInput) => Promise<string>;

interface BuildEntityIndexTextOptions {
    summaries: EntityIndexSummary[];
    generate: GenerateText;
    batchCharLimit?: number;
}

function splitEntry(entry: string, maxChars: number): string[] {
    if (entry.length <= maxChars) return [entry];

    const parts: string[] = [];
    for (let start = 0; start < entry.length; start += maxChars) {
        parts.push(entry.slice(start, start + maxChars));
    }
    return parts;
}

export function packTextBatches(entries: string[], maxChars = DEFAULT_BATCH_CHAR_LIMIT): string[] {
    if (maxChars <= 0) throw new Error("packTextBatches: maxChars must be positive");

    const batches: string[] = [];
    let current = "";

    for (const entry of entries.flatMap(e => splitEntry(e.trim(), maxChars)).filter(Boolean)) {
        const next = current ? `${current}${SEPARATOR}${entry}` : entry;
        if (current && next.length > maxChars) {
            batches.push(current);
            current = entry;
        } else {
            current = next;
        }
    }

    if (current) batches.push(current);
    return batches;
}

function extractionPrompt(batch: string): string {
    return `Você recebeu extrações de entidades de múltiplos conteúdos (mini-livros, newsletters, etc.).
Liste todas as pessoas e empresas mencionadas.
Para cada uma: em quais documentos aparece e em que contexto foi citada.

Formato:
[Nome da entidade]
- [Título do documento]: [contexto da citação]

Extrações:
${batch}`;
}

function consolidationPrompt(batch: string): string {
    return `Consolide os índices parciais abaixo em um único índice de entidades.
Não descarte entidades; una duplicatas e preserve os documentos/contextos citados.

Formato:
[Nome da entidade]
- [Título do documento]: [contexto da citação]

Índices parciais:
${batch}`;
}

async function generateBatches(
    batches: string[],
    generate: GenerateText,
    promptForBatch: (batch: string) => string,
): Promise<string[]> {
    const generated: string[] = [];
    for (const batch of batches) {
        const text = await generate({
            system: "Você é um indexador. Liste entidades e onde aparecem, de forma concisa.",
            context: "",
            history: [],
            question: promptForBatch(batch),
        });
        generated.push(text.trim());
    }
    return generated;
}

export async function buildEntityIndexText({
    summaries,
    generate,
    batchCharLimit = DEFAULT_BATCH_CHAR_LIMIT,
}: BuildEntityIndexTextOptions): Promise<string> {
    const entries = summaries.map(s => `${s.title}:\n${s.content}`);
    let partialIndexes = await generateBatches(
        packTextBatches(entries, batchCharLimit),
        generate,
        extractionPrompt,
    );

    while (partialIndexes.length > 1) {
        const reduceEntries = partialIndexes.map((text, index) => `Índice parcial ${index + 1}:\n${text}`);
        partialIndexes = await generateBatches(
            packTextBatches(reduceEntries, batchCharLimit),
            generate,
            consolidationPrompt,
        );
    }

    return `[Índice global de entidades]\n${partialIndexes[0] ?? ""}`.trim();
}
