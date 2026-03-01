/**
 * IContentRepository Interface (Domain Layer)
 *
 * Define o contrato para operações CRUD de conteúdo.
 * Suporta múltiplos tipos: newsletter, mini-livro, biblioteca.
 *
 * Princípios aplicados:
 * - DIP: Abstração que permite inversão de dependência
 * - ISP: Interface segregada para operações de conteúdo
 * - DRY: Uma interface para múltiplos tipos de conteúdo
 */

import { ContentItem, ContentType } from "../entities/ContentItem";

export interface CreateContentInput {
    title: string;
    readTime?: number;
    // Campos específicos de ebook
    subtitle?: string | null;
    description?: string | null;
    badgeText?: string | null;
    coverImagePath?: string | null;
    coverPdfPath?: string | null;
}

export interface UpdateContentInput {
    title?: string;
    readTime?: number;
    htmlPath?: string | null;
    pdfPath?: string | null;
    // Campos específicos de ebook
    subtitle?: string | null;
    description?: string | null;
    badgeText?: string | null;
    coverImagePath?: string | null;
    coverPdfPath?: string | null;
}

export interface IContentRepository {
    /**
     * Busca todos os itens de um tipo de conteúdo
     * @param type - Tipo de conteúdo
     * @returns Lista de ContentItem ordenada por ID decrescente
     */
    getAll(type: ContentType): Promise<ContentItem[]>;

    /**
     * Busca um item específico por ID
     * @param type - Tipo de conteúdo
     * @param id - ID do item
     * @returns ContentItem ou null se não encontrado
     */
    getById(type: ContentType, id: number): Promise<ContentItem | null>;

    /**
     * Cria um novo item de conteúdo
     * @param type - Tipo de conteúdo
     * @param input - Dados do novo item
     * @returns ContentItem criado com ID gerado
     */
    create(type: ContentType, input: CreateContentInput): Promise<ContentItem>;

    /**
     * Atualiza um item existente
     * @param type - Tipo de conteúdo
     * @param id - ID do item
     * @param input - Dados a atualizar
     * @returns ContentItem atualizado
     */
    update(type: ContentType, id: number, input: UpdateContentInput): Promise<ContentItem>;

    /**
     * Remove um item
     * @param type - Tipo de conteúdo
     * @param id - ID do item
     */
    delete(type: ContentType, id: number): Promise<void>;

    /**
     * Retorna a data da última atualização de qualquer item do tipo
     * @param type - Tipo de conteúdo
     * @returns Date da última atualização, ou null se não houver itens
     */
    getLastUpdated(type: ContentType): Promise<Date | null>;
}
