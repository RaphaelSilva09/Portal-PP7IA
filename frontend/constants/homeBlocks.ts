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
        defaultDescription: "2 edições por semana, 7 notícias cada\nSegundas: as 7 IAs. Quartas: startups.",
    },
    {
        slug: "especial-semana",
        label: "Inteligência Artificial",
        defaultDescription: "Notícias e análises de IA\nPrioridade para o que importa ao Brasil.",
    },
    {
        slug: "radar",
        label: "Editoriais e Artigos",
        defaultDescription: "3 a 4 textos por publicação\nLeitura curta e opinião editorial.",
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
        defaultDescription: "Guias, tutoriais e aulas\nIA, tech, saúde, startups, finanças.",
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
