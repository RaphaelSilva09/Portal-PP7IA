/**
 * GetPortalNewsUseCase (Application Layer)
 *
 * Caso de uso para obter novidades ativas do portal.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por recuperar novidades ativas
 * - Query Pattern: Operação de leitura sem efeitos colaterais
 */

import { PortalNewsItem } from "../../domain/entities/PortalNewsItem";
import { IPortalNewsRepository } from "../../domain/repositories/IPortalNewsRepository";

export class GetPortalNewsUseCase {
    constructor(private readonly repo: IPortalNewsRepository) {}

    /**
     * Obtém todos os itens de novidade ativos, ordenados por display_order
     */
    async execute(): Promise<PortalNewsItem[]> {
        return this.repo.getActive();
    }
}
