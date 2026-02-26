/**
 * GetEbookUseCase (Application Layer)
 *
 * Obtém todos os e-books cadastrados.
 * Retorna lista completa com o e-book mais recente separado.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por obter e-books
 * - DIP: Depende de abstração (IEbookRepository)
 */

import type { Ebook } from "@/domain/entities/Ebook";
import type { IEbookRepository } from "@/domain/repositories/IEbookRepository";

export interface GetEbookResult {
    latest: Ebook | null;
    all: Ebook[];
}

export class GetEbookUseCase {
    constructor(private readonly repository: IEbookRepository) {}

    async execute(): Promise<GetEbookResult> {
        const all = await this.repository.getAll();
        const latest = all[0] ?? null;
        return { latest, all };
    }
}
