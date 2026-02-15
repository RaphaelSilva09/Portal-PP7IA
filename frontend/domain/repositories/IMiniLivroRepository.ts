/**
 * IMiniLivroRepository Interface (Domain Layer)
 *
 * Define o contrato para o repositório de mini-livros.
 * Esta é uma abstração (DIP - Dependency Inversion Principle).
 *
 * Princípios aplicados:
 * - DIP: Camada de domínio define a interface, infraestrutura implementa
 * - ISP: Interface segregada com operações específicas de mini-livros
 * - Clean Architecture: Domínio não conhece detalhes de infraestrutura
 */

import { MiniLivro } from "../entities/MiniLivro";

/**
 * Repository Pattern: Abstração para acesso a mini-livros
 */
export interface IMiniLivroRepository {
    /**
     * Obtém todos os mini-livros ordenados por data (mais recentes primeiro)
     * @returns Array de mini-livros ou array vazio em caso de erro
     */
    getAll(): Promise<MiniLivro[]>;

    /**
     * Obtém o mini-livro mais recente
     * @returns MiniLivro ou null se não houver
     */
    getLatest(): Promise<MiniLivro | null>;

    /**
     * Obtém um mini-livro pelo ID
     * @returns MiniLivro ou null se não encontrado
     */
    getById(id: number): Promise<MiniLivro | null>;
}
