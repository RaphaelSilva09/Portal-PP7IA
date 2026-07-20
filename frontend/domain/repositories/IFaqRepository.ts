import { FaqItem } from "../entities/FaqItem";

export interface CreateFaqItemInput {
    question: string;
    answer: string;
    category?: string;
    sortOrder?: number;
}

export interface UpdateFaqItemInput {
    question?: string;
    answer?: string;
    category?: string;
    sortOrder?: number;
}

export interface IFaqRepository {
    getAll(): Promise<FaqItem[]>;
    getById(id: number): Promise<FaqItem | null>;
    create(input: CreateFaqItemInput): Promise<FaqItem>;
    update(id: number, input: UpdateFaqItemInput): Promise<FaqItem | null>;
    delete(id: number): Promise<boolean>;
}
