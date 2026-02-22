/**
 * IEspecialSemanaRepository Interface (Domain Layer)
 *
 * Define o contrato para operações CRUD de Especial da Semana.
 *
 * Princípios aplicados:
 * - DIP: Abstração que permite inversão de dependência
 * - ISP: Interface segregada para operações específicas
 * - SRP: Responsável apenas por especiais da semana
 */

import { EspecialSemana } from "../entities/EspecialSemana";

export interface CreateEspecialSemanaInput {
    title: string;
    readTime: number;
    htmlPath?: string | null;
    pdfPath?: string | null;
}

export interface UpdateEspecialSemanaInput {
    title?: string;
    readTime?: number;
    htmlPath?: string | null;
    pdfPath?: string | null;
}

export interface IEspecialSemanaRepository {
    /**
     * Busca todos os especiais da semana
     * @returns Lista ordenada por ID decrescente (mais recente primeiro)
     */
    getAll(): Promise<EspecialSemana[]>;

    /**
     * Busca um especial específico por ID
     * @param id - ID do especial
     * @returns EspecialSemana ou null se não encontrado
     */
    getById(id: number): Promise<EspecialSemana | null>;

    /**
     * Busca o especial mais recente
     * @returns EspecialSemana mais recente ou null se nenhum existir
     */
    getLatest(): Promise<EspecialSemana | null>;

    /**
     * Cria um novo especial da semana
     * @param input - Dados do novo especial
     * @returns EspecialSemana criado com ID gerado
     */
    create(input: CreateEspecialSemanaInput): Promise<EspecialSemana>;

    /**
     * Atualiza um especial existente
     * @param id - ID do especial a atualizar
     * @param input - Dados a atualizar
     * @returns EspecialSemana atualizado ou null se não encontrado
     */
    update(id: number, input: UpdateEspecialSemanaInput): Promise<EspecialSemana | null>;

    /**
     * Deleta um especial por ID
     * @param id - ID do especial a deletar
     * @returns true se deletado, false se não encontrado
     */
    delete(id: number): Promise<boolean>;

    /**
     * Conta total de especiais cadastrados
     * @returns Quantidade total
     */
    count(): Promise<number>;
}
