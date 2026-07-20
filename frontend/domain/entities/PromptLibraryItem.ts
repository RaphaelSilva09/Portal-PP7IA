/**
 * PromptLibraryItem Entity (Domain Layer)
 *
 * Prompt pronto para uma das 7 IAs do portal, com um caso de uso breve.
 * Corpo do prompt pode ser restrito a leitores cadastrados (isGated).
 */

export const AI_TOOLS = ["Claude", "ChatGPT", "Gemini", "Adapta", "Perplexity", "Grok", "Manus"] as const;
export type AiTool = (typeof AI_TOOLS)[number];

export interface PromptLibraryItemProps {
    id: number;
    createdAt: Date;
    updatedAt?: Date | null;
    aiTool: string;
    title: string;
    promptBody: string;
    useCase: string;
    isGated: boolean;
    sortOrder: number;
}

export class PromptLibraryItem {
    private constructor(private readonly props: PromptLibraryItemProps) {}

    static create(props: PromptLibraryItemProps): PromptLibraryItem {
        return new PromptLibraryItem(props);
    }

    get id(): number {
        return this.props.id;
    }

    get aiTool(): string {
        return this.props.aiTool?.trim() || "Outros";
    }

    get title(): string {
        return this.props.title?.trim() || "Prompt sem título";
    }

    get promptBody(): string {
        return this.props.promptBody ?? "";
    }

    get useCase(): string {
        return this.props.useCase?.trim() || "";
    }

    get isGated(): boolean {
        return this.props.isGated;
    }

    get sortOrder(): number {
        return this.props.sortOrder ?? 0;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | null {
        return this.props.updatedAt ?? null;
    }

    /** Versão sem o corpo do prompt — usada para leitores anônimos quando isGated. */
    toTeaser(): Omit<PromptLibraryItemProps, "promptBody"> & { promptBody: null } {
        return { ...this.props, promptBody: null };
    }

    toObject(): PromptLibraryItemProps {
        return { ...this.props };
    }
}
