/**
 * IPortalNewsRepository Interface (Domain Layer)
 *
 * Define o contrato para o repositório de novidades do portal.
 *
 * Princípios aplicados:
 * - DIP: Camada de domínio define a interface, infraestrutura implementa
 * - ISP: Interface segregada com operações específicas de portal_news
 * - Clean Architecture: Domínio não conhece detalhes de infraestrutura
 */

import { PortalNewsItem } from "../entities/PortalNewsItem";

/**
 * Repository Pattern: Abstração para acesso às novidades do portal
 */
export interface IPortalNewsRepository {
    /**
     * Obtém todos os itens ativos, ordenados por display_order ASC
     * @returns Array de PortalNewsItem ou array vazio em caso de erro
     */
    getActive(): Promise<PortalNewsItem[]>;
}
