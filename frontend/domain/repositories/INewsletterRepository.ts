/**
 * INewsletterRepository Interface (Domain Layer)
 *
 * Define o contrato para o repositório de newsletters.
 * Esta é uma abstração (DIP - Dependency Inversion Principle).
 *
 * Princípios aplicados:
 * - DIP: Camada de domínio define a interface, infraestrutura implementa
 * - ISP: Interface segregada com operações específicas de newsletters
 * - Clean Architecture: Domínio não conhece detalhes de infraestrutura
 */

import { Newsletter } from "../entities/Newsletter";

/**
 * Repository Pattern: Abstração para acesso a newsletters
 */
export interface INewsletterRepository {
    /**
     * Obtém todas as newsletters ordenadas por data (mais recentes primeiro)
     * @returns Array de newsletters ou array vazio em caso de erro
     */
    getAll(): Promise<Newsletter[]>;

    /**
     * Obtém a newsletter mais recente
     * @returns Newsletter ou null se não houver
     */
    getLatest(): Promise<Newsletter | null>;

    /**
     * Obtém uma newsletter pelo ID
     * @returns Newsletter ou null se não encontrada
     */
    getById(id: number): Promise<Newsletter | null>;
}
