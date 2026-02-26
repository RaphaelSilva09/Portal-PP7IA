/**
 * GetEstudarUseCase (Application Layer)
 *
 * Obtém todos os itens do conteúdo Estudar.
 * Retorna lista completa com o item mais recente separado.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por obter conteúdo de estudo
 * - DIP: Depende de abstração (IEstudarRepository)
 */

import type { Estudar } from "@/domain/entities/Estudar";
import type { IEstudarRepository } from "@/domain/repositories/IEstudarRepository";

export interface GetEstudarResult {
    latest: Estudar | null;
    older: Estudar[];
}

export class GetEstudarUseCase {
    constructor(private readonly repository: IEstudarRepository) {}

    async execute(): Promise<GetEstudarResult> {
        const all = await this.repository.getAll();
        const [latest, ...older] = all;
        return { latest: latest ?? null, older };
    }
}
