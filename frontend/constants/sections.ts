/**
 * Definições estáticas das 7 seções e subseções do portal.
 * Usado pelo modal de pesquisa (Estado A — modo navegação por abas).
 */

export type SectionType =
    | "newsletter"
    | "especial-semana"
    | "radar"
    | "mini-livro"
    | "biblioteca"
    | "estudar"
    | "ias";

export interface Subsection {
    id: string;
    label: string;
    /** Usado somente na seção biblioteca para filtrar por tema */
    tema?: string;
    /** Link direto — ignora preview de materiais (ex: seção IAs) */
    directUrl?: string;
}

export interface Section {
    id: SectionType;
    label: string;
    subsections: Subsection[];
    comingSoon?: boolean;
}

export const SECTIONS: Section[] = [
    {
        id: "newsletter",
        label: "Newsletter",
        subsections: [{ id: "newsletter-all", label: "Todas as edições" }],
    },
    {
        id: "especial-semana",
        label: "Inteligência Artificial",
        subsections: [{ id: "especial-all", label: "IA no Brasil" }],
    },
    {
        id: "radar",
        label: "Editoriais e Artigos",
        subsections: [{ id: "radar-all", label: "Textos curtos" }],
    },
    {
        id: "mini-livro",
        label: "Mini-livros",
        subsections: [{ id: "mini-all", label: "Guias e tutoriais" }],
    },
    {
        id: "biblioteca",
        label: "Biblioteca",
        subsections: [
            { id: "bib-7",           label: "Biblioteca dos 7",    tema: "biblioteca-dos-7" },
            { id: "bib-saude",       label: "Saúde",               tema: "saude" },
            { id: "bib-invest",      label: "Investimentos",       tema: "investimentos-financas" },
            { id: "bib-viagens",     label: "Viagens",             tema: "viagens-restaurantes" },
            { id: "bib-tech",        label: "Tecnologia",          tema: "tecnologia" },
            { id: "bib-prompts",     label: "Prompts",             tema: "prompts" },
            { id: "bib-diversos",    label: "Diversos",            tema: "diversos" },
        ],
    },
    {
        id: "estudar",
        label: "Estudar",
        subsections: [{ id: "estudar-all", label: "Materiais de estudo" }],
    },
    {
        id: "ias",
        label: "As 7 IAs",
        subsections: [
            { id: "ias-claude",     label: "Claude",     directUrl: "/view/biblioteca/009" },
            { id: "ias-chatgpt",    label: "ChatGPT",    directUrl: "/view/biblioteca/009" },
            { id: "ias-gemini",     label: "Gemini",     directUrl: "/view/biblioteca/009" },
            { id: "ias-adapta",     label: "Adapta",     directUrl: "/view/biblioteca/009" },
            { id: "ias-perplexity", label: "Perplexity", directUrl: "/view/biblioteca/009" },
            { id: "ias-grok",       label: "Grok",       directUrl: "/view/biblioteca/009" },
            { id: "ias-manus",      label: "Manus",      directUrl: "/view/biblioteca/009" },
        ],
    },
];
