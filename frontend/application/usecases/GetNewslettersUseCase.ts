/**
 * GetNewslettersUseCase (Application Layer)
 *
 * Caso de uso para obter lista de newsletters.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por recuperar newsletters
 * - Query Pattern: Operação de leitura sem efeitos colaterais
 */

import { Newsletter } from "../../domain/entities/Newsletter";
import { INewsletterRepository } from "../../domain/repositories/INewsletterRepository";

export interface GetNewslettersOutput {
    latest: Newsletter | null;
    older: Newsletter[];
}

export class GetNewslettersUseCase {
    constructor(private readonly newsletterRepository: INewsletterRepository) {}

    /**
     * Obtém todas as newsletters separadas em mais recente e anteriores
     */
    async execute(): Promise<GetNewslettersOutput> {
        const all = await this.newsletterRepository.getAll();

        if (all.length === 0) {
            return { latest: null, older: [] };
        }

        return {
            latest: all[0],
            older: all.slice(1),
        };
    }
}
