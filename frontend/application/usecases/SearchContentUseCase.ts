/**
 * SearchContentUseCase (Application Layer)
 *
 * Orquestra busca de conteúdo em paralelo entre as 4 fontes de dados.
 * Filtro antecipado por tipo evita requests desnecessários quando o
 * usuário seleciona um tipo específico (1 request ao invés de 4).
 *
 * Princípios aplicados:
 * - SRP: Única responsabilidade — buscar e filtrar conteúdo por texto
 * - DIP: Depende de abstrações (interfaces de repositório), não de implementações
 * - KISS: Filtro client-side suficiente para o volume atual do portal
 * - OCP: Extensível para novos tipos sem alterar interfaces de repositório
 */

import type { BibliotecaItem } from "../../domain/entities/BibliotecaItem";
import type { EspecialSemana } from "../../domain/entities/EspecialSemana";
import type { MiniLivro } from "../../domain/entities/MiniLivro";
import type { Newsletter } from "../../domain/entities/Newsletter";
import type { IBibliotecaRepository } from "../../domain/repositories/IBibliotecaRepository";
import type { IEspecialSemanaRepository } from "../../domain/repositories/IEspecialSemanaRepository";
import type { IMiniLivroRepository } from "../../domain/repositories/IMiniLivroRepository";
import type { INewsletterRepository } from "../../domain/repositories/INewsletterRepository";

export type SearchFilter = "all" | "newsletter" | "mini-livro" | "biblioteca" | "especial-semana";

export interface SearchResultItem {
    id: number;
    type: "newsletter" | "mini-livro" | "biblioteca" | "especial-semana";
    title: string;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    /** Rota /view/{type}/{slug} — null se HTML não disponível */
    viewUrl: string | null;
    /** Data formatada em pt-BR via getter da entity */
    date: string;
}

export interface SearchContentInput {
    query: string;
    filter: SearchFilter;
}

export class SearchContentUseCase {
    constructor(
        private readonly newsletterRepository: INewsletterRepository,
        private readonly miniLivroRepository: IMiniLivroRepository,
        private readonly bibliotecaRepository: IBibliotecaRepository,
        private readonly especialSemanaRepository: IEspecialSemanaRepository,
    ) {}

    async execute(input: SearchContentInput): Promise<SearchResultItem[]> {
        const { query, filter } = input;

        // Guard: requisito mínimo de 2 chars — sem chamar o banco
        if (query.trim().length < 2) return [];

        const normalizedQuery = query.toLowerCase().trim();

        // Busca condicional: se filtro específico, apenas 1 request ao invés de 4
        const fetches: Promise<SearchResultItem[]>[] = [];

        if (filter === "all" || filter === "newsletter") {
            fetches.push(this.newsletterRepository.getAll().then(items => items.map(item => this.mapNewsletter(item))));
        }

        if (filter === "all" || filter === "mini-livro") {
            fetches.push(this.miniLivroRepository.getAll().then(items => items.map(item => this.mapMiniLivro(item))));
        }

        if (filter === "all" || filter === "biblioteca") {
            fetches.push(this.bibliotecaRepository.getAll().then(items => items.map(item => this.mapBiblioteca(item))));
        }

        if (filter === "all" || filter === "especial-semana") {
            fetches.push(
                this.especialSemanaRepository.getAll().then(items => items.map(item => this.mapEspecialSemana(item))),
            );
        }

        const grouped = await Promise.all(fetches);
        const all = grouped.flat();

        return all.filter(item => item.title.toLowerCase().includes(normalizedQuery));
    }

    private mapNewsletter(item: Newsletter): SearchResultItem {
        return {
            id: item.id,
            type: "newsletter",
            title: item.title,
            htmlAvailable: item.htmlAvailable,
            pdfAvailable: item.pdfAvailable,
            viewUrl: item.htmlPath,
            date: item.formattedDate,
        };
    }

    private mapMiniLivro(item: MiniLivro): SearchResultItem {
        return {
            id: item.id,
            type: "mini-livro",
            title: item.title,
            htmlAvailable: item.htmlAvailable,
            pdfAvailable: item.pdfAvailable,
            viewUrl: item.htmlPath,
            date: item.formattedDate,
        };
    }

    private mapBiblioteca(item: BibliotecaItem): SearchResultItem {
        return {
            id: item.id,
            type: "biblioteca",
            title: item.title,
            htmlAvailable: item.htmlAvailable,
            pdfAvailable: item.pdfAvailable,
            viewUrl: item.htmlPath,
            date: item.formattedDate,
        };
    }

    private mapEspecialSemana(item: EspecialSemana): SearchResultItem {
        return {
            id: item.id,
            type: "especial-semana",
            title: item.title,
            htmlAvailable: item.htmlAvailable,
            pdfAvailable: item.pdfAvailable,
            viewUrl: item.htmlPath,
            date: item.formattedDate,
        };
    }
}
