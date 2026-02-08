/**
 * IBibliotecaRepository Interface (Domain Layer)
 *
 * Define o contrato para o repositório da biblioteca.
 * Esta é uma abstração (DIP - Dependency Inversion Principle).
 *
 * Princípios aplicados:
 * - DIP: Camada de domínio define a interface, infraestrutura implementa
 * - ISP: Interface segregada com operações específicas da biblioteca
 * - Clean Architecture: Domínio não conhece detalhes de infraestrutura
 */

import { BibliotecaItem } from "../entities/BibliotecaItem";

/**
 * Repository Pattern: Abstração para acesso a itens da biblioteca
 */
export interface IBibliotecaRepository {
    /**
     * Obtém todos os itens da biblioteca ordenados por data (mais recentes primeiro)
     * @returns Array de itens ou array vazio em caso de erro
     */
    getAll(): Promise<BibliotecaItem[]>;

    /**
     * Obtém o item mais recente da biblioteca
     * @returns BibliotecaItem ou null se não houver
     */
    getLatest(): Promise<BibliotecaItem | null>;

    /**
     * Obtém um item da biblioteca pelo ID
     * @returns BibliotecaItem ou null se não encontrado
     */
    getById(id: number): Promise<BibliotecaItem | null>;
}
