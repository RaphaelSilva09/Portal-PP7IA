/**
 * @deprecated Substituído por SearchContentUseCase + useSearch hook.
 * Este arquivo era usado pelo SearchModal para busca client-side com dados estáticos.
 * A busca agora é feita em tempo real via Supabase.
 * Mantido apenas como referência — não importar em novos componentes.
 *
 * @see frontend/application/usecases/SearchContentUseCase.ts
 * @see frontend/presentation/hooks/useSearch.ts
 */

export interface ContentItem {
    id: string;
    type: "newsletter" | "mini-livro" | "biblioteca";
    title: string;
    description?: string;
    htmlUrl?: string;
    pdfUrl?: string;
    date: string;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    tags: string[];
}

export const allContent: ContentItem[] = [
    // Newsletters
    {
        id: "newsletter-002",
        type: "newsletter",
        title: "PP-News #002 - IA Curada com Inteligência",
        description: "Notícias de IA e startups curadas semanalmente",
        htmlUrl: "/newsletters/002.html",
        pdfUrl: "/newsletters/002.pdf",
        date: "16/12/2025",
        htmlAvailable: true,
        pdfAvailable: true,
        tags: ["ia", "newsletter", "noticias", "startups", "curadoria"],
    },
    {
        id: "newsletter-001",
        type: "newsletter",
        title: "PP-News #001 - O Início de uma Nova Era",
        description: "Primeira edição da newsletter semanal",
        htmlUrl: "/newsletters/001.html",
        pdfUrl: "/newsletters/001.pdf",
        date: "09/12/2025",
        htmlAvailable: true,
        pdfAvailable: false,
        tags: ["ia", "newsletter", "noticias", "startups", "introducao"],
    },
    {
        id: "newsletter-000",
        type: "newsletter",
        title: "PP-News #000 - Edição Piloto",
        description: "Edição piloto da newsletter",
        htmlUrl: "/newsletters/000.html",
        pdfUrl: "/newsletters/000.pdf",
        date: "02/12/2025",
        htmlAvailable: true,
        pdfAvailable: false,
        tags: ["ia", "newsletter", "piloto", "introducao"],
    },

    // Mini-Livros
    {
        id: "mini-livro-002",
        type: "mini-livro",
        title: "Mini-livro #002-v2: Afinal, que talento é esse?",
        description: "Reflexões sobre talento e desenvolvimento pessoal",
        htmlUrl: "/mini-livros/002.html",
        pdfUrl: "/mini-livros/002.pdf",
        date: "13/10/2025",
        htmlAvailable: false,
        pdfAvailable: true,
        tags: ["mini-livro", "talento", "lideranca", "pessoas", "desenvolvimento"],
    },
    {
        id: "mini-livro-001",
        type: "mini-livro",
        title: "Mini-livro #001-v2: A Resposta é o Problema",
        description: "Reflexões sobre questionamento e pensamento crítico",
        htmlUrl: "/mini-livros/001.html",
        pdfUrl: "/mini-livros/001.pdf",
        date: "13/09/2025",
        htmlAvailable: true,
        pdfAvailable: false,
        tags: ["mini-livro", "pensamento", "critico", "lideranca", "pessoas"],
    },

    // Biblioteca
    {
        id: "biblioteca-001",
        type: "biblioteca",
        title: "Guia de Restaurantes de Lisboa",
        description: "Guia curado de restaurantes em Lisboa",
        htmlUrl: "/biblioteca/Guia_Restaurantes_Lisboa_Digital.html",
        pdfUrl: "/biblioteca/Guia_Restaurantes_Lisboa_Digital.pdf",
        date: "01/01/2026",
        htmlAvailable: false,
        pdfAvailable: true,
        tags: ["biblioteca", "guia", "restaurantes", "lisboa", "portugal", "viagem"],
    },
];

/**
 * Busca conteúdo por termo
 * @param query - Termo de busca (mínimo 3 caracteres)
 * @param filter - Filtro por tipo (opcional)
 * @returns Array de itens encontrados
 */
export function searchContent(
    query: string,
    filter?: "all" | "newsletter" | "mini-livro" | "biblioteca",
): ContentItem[] {
    if (query.length < 3) return [];

    const normalizedQuery = query.toLowerCase().trim();

    return allContent.filter(item => {
        // Filtrar por tipo se especificado
        if (filter && filter !== "all" && item.type !== filter) {
            return false;
        }

        // Buscar em título, descrição e tags
        const matchesTitle = item.title.toLowerCase().includes(normalizedQuery);
        const matchesDescription = item.description?.toLowerCase().includes(normalizedQuery);
        const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));

        return matchesTitle || matchesDescription || matchesTags;
    });
}
