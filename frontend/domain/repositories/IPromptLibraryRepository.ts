import { PromptLibraryItem } from "../entities/PromptLibraryItem";

export interface CreatePromptLibraryItemInput {
    aiTool: string;
    title: string;
    promptBody: string;
    useCase: string;
    isGated: boolean;
    sortOrder?: number;
}

export interface UpdatePromptLibraryItemInput {
    aiTool?: string;
    title?: string;
    promptBody?: string;
    useCase?: string;
    isGated?: boolean;
    sortOrder?: number;
}

export interface IPromptLibraryRepository {
    getAll(): Promise<PromptLibraryItem[]>;
    getById(id: number): Promise<PromptLibraryItem | null>;
    create(input: CreatePromptLibraryItemInput): Promise<PromptLibraryItem>;
    update(id: number, input: UpdatePromptLibraryItemInput): Promise<PromptLibraryItem | null>;
    delete(id: number): Promise<boolean>;
}
