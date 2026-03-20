import { Book } from "../../domain/entities/Book";
import { IBookRepository } from "../../domain/repositories/IBookRepository";

export class GetActiveBookUseCase {
    constructor(private readonly bookRepository: IBookRepository) {}

    async execute(): Promise<Book | null> {
        return this.bookRepository.getActiveBook();
    }
}
