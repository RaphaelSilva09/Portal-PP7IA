import { ReaderQuestion, ReaderQuestionStatus } from "../entities/ReaderQuestion";

export interface IReaderQuestionRepository {
    getAll(): Promise<ReaderQuestion[]>;
    getByUser(userId: string): Promise<ReaderQuestion[]>;
    create(userId: string, question: string): Promise<ReaderQuestion>;
    updateStatus(id: number, status: ReaderQuestionStatus): Promise<ReaderQuestion | null>;
}
