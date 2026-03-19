/**
 * SaveEditorialUseCase (Application Layer)
 *
 * Salva o conteúdo editorial via upsert (singleton id = 1).
 */

import { IEditorialRepository } from "../../domain/repositories/IEditorialRepository";

export class SaveEditorialUseCase {
    constructor(private readonly repo: IEditorialRepository) {}

    async execute(content: string): Promise<void> {
        return this.repo.save(content);
    }
}
