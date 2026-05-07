export type HomeBlockSlug =
    | "newsletter"
    | "especial-semana"
    | "radar"
    | "mini-livros"
    | "biblioteca"
    | "estudar"
    | "ensinar";

export interface HomeBlockDefinition {
    slug: HomeBlockSlug;
    label: string;
    defaultDescription: string;
}

export const HOME_BLOCKS: HomeBlockDefinition[] = [
    {
        slug: "newsletter",
        label: "Newsletter",
        defaultDescription: "Publicacao semanal com 7 itens\nNoticias de IA e startups. O que realmente importa.",
    },
    {
        slug: "especial-semana",
        label: "Reportagem da Semana",
        defaultDescription: "Reportagem curada da semana\nAnalises e destaques editoriais.",
    },
    {
        slug: "radar",
        label: "Radar",
        defaultDescription: "7 itens mensais\nFerramentas, startups e tendencias.",
    },
    {
        slug: "mini-livros",
        label: "Enquanto é Tempo",
        defaultDescription: "1 Livro, 3 Ebooks, 21 Mini-livros\nLeitura de 7 a 21 minutos.",
    },
    {
        slug: "biblioteca",
        label: "Biblioteca",
        defaultDescription: "7 categorias com 7 itens cada\nPrompts, ferramentas, guias e dicas.",
    },
    {
        slug: "estudar",
        label: "Estudar",
        defaultDescription: "Guias, tutoriais e aulas\nIA, tech, saude, startups, financas.",
    },
    {
        slug: "ensinar",
        label: "Ensinar",
        defaultDescription: "A ser implementado\nEstamos construindo este bloco com cuidado para lançar em breve.",
    },
];

export const HOME_BLOCK_DEFAULTS: Record<HomeBlockSlug, string> = HOME_BLOCKS.reduce((acc, block) => {
    acc[block.slug] = block.defaultDescription;
    return acc;
}, {} as Record<HomeBlockSlug, string>);
