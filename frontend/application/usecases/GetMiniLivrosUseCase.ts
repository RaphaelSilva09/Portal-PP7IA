/**
 * GetMiniLivrosUseCase (Application Layer)
 *
 * Caso de uso para obter lista de mini-livros.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por recuperar mini-livros
 * - Query Pattern: Operação de leitura sem efeitos colaterais
 */

import { MiniLivro } from "../../domain/entities/MiniLivro";
import { IMiniLivroRepository } from "../../domain/repositories/IMiniLivroRepository";

export interface GetMiniLivrosOutput {
    latest: MiniLivro | null;
    older: MiniLivro[];
}

export class GetMiniLivrosUseCase {
    constructor(private readonly miniLivroRepository: IMiniLivroRepository) {}

    /**
     * Obtém todos os mini-livros separados em mais recente e anteriores
     */
    async execute(): Promise<GetMiniLivrosOutput> {
        const all = await this.miniLivroRepository.getAll();

        if (all.length === 0) {
            return { latest: null, older: [] };
        }

        return {
            latest: all[0],
            older: all.slice(1),
        };
    }
}
