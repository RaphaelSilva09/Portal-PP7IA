/**
 * GetBibliotecaUseCase (Application Layer)
 *
 * Caso de uso para obter lista de itens da biblioteca.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por recuperar itens da biblioteca
 * - Query Pattern: Operação de leitura sem efeitos colaterais
 */

import { BibliotecaItem } from "../../domain/entities/BibliotecaItem";
import { IBibliotecaRepository } from "../../domain/repositories/IBibliotecaRepository";

export interface GetBibliotecaOutput {
    latest: BibliotecaItem | null;
    older: BibliotecaItem[];
}

export class GetBibliotecaUseCase {
    constructor(private readonly bibliotecaRepository: IBibliotecaRepository) {}

    /**
     * Obtém todos os itens da biblioteca separados em mais recente e anteriores
     */
    async execute(): Promise<GetBibliotecaOutput> {
        const all = await this.bibliotecaRepository.getAll();

        if (all.length === 0) {
            return { latest: null, older: [] };
        }

        return {
            latest: all[0],
            older: all.slice(1),
        };
    }
}
