/** ReaderQuestion Entity (Domain Layer) — pergunta enviada por leitor cadastrado. */

export type ReaderQuestionStatus = "pending" | "published" | "archived";

export interface ReaderQuestionProps {
    id: number;
    createdAt: Date;
    updatedAt?: Date | null;
    userId: string;
    userEmail?: string | null;
    question: string;
    status: ReaderQuestionStatus;
}

export class ReaderQuestion {
    private constructor(private readonly props: ReaderQuestionProps) {}

    static create(props: ReaderQuestionProps): ReaderQuestion {
        return new ReaderQuestion(props);
    }

    get id(): number {
        return this.props.id;
    }

    get userId(): string {
        return this.props.userId;
    }

    get userEmail(): string | null {
        return this.props.userEmail ?? null;
    }

    get question(): string {
        return this.props.question ?? "";
    }

    get status(): ReaderQuestionStatus {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | null {
        return this.props.updatedAt ?? null;
    }

    toObject(): ReaderQuestionProps {
        return { ...this.props };
    }
}
