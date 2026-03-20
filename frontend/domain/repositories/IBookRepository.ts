import { Book } from "../entities/Book";

export interface IBookRepository {
    getActiveBook(): Promise<Book | null>;
}
