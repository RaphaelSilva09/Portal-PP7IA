/** FaqItem Entity (Domain Layer) — pergunta frequente pública do portal. */

export interface FaqItemProps {
    id: number;
    createdAt: Date;
    updatedAt?: Date | null;
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
}

export class FaqItem {
    private constructor(private readonly props: FaqItemProps) {}

    static create(props: FaqItemProps): FaqItem {
        return new FaqItem(props);
    }

    get id(): number {
        return this.props.id;
    }

    get question(): string {
        return this.props.question?.trim() || "Pergunta sem título";
    }

    get answer(): string {
        return this.props.answer ?? "";
    }

    get category(): string {
        return this.props.category?.trim() || "Geral";
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

    toObject(): FaqItemProps {
        return { ...this.props };
    }
}
