export type ExplorarBlockId =
    | "newsletter"
    | "reportagem"
    | "radar"
    | "livro"
    | "biblioteca"
    | "estudar";

export interface ExplorarBlockConfig {
    id: ExplorarBlockId;
    title: string;
    description: string;
}

export interface ExplorarHeroConfig {
    eyebrow: string;
    titleBefore: string;
    titleEm: string;
    description: string;
}

export interface ExplorarConfig {
    hero: ExplorarHeroConfig;
    blocks: ExplorarBlockConfig[];
}

export const EXPLORAR_BLOCK_LABELS: Record<ExplorarBlockId, string> = {
    newsletter:  "Newsletter",
    reportagem:  "Reportagem da Semana",
    radar:       "Radar",
    livro:       "Enquanto é Tempo",
    biblioteca:  "Biblioteca",
    estudar:     "Estudar",
};

export const DEFAULT_EXPLORAR_CONFIG: ExplorarConfig = {
    hero: {
        eyebrow:      "Explorar · um portal, sete blocos",
        titleBefore:  "Tudo o que o portal",
        titleEm:      "publicou até hoje",
        description:  "Sete blocos editoriais reunidos num só lugar. Navegue pelos temas ou filtre pelo formato.",
    },
    blocks: [
        { id: "newsletter",  title: "Newsletter",           description: "Notícias práticas sobre IA, liderança e gestão — toda quarta-feira."                             },
        { id: "reportagem",  title: "Reportagem da Semana", description: "Análises e destaques editoriais: artigos, apps, tutoriais e pontos de atenção especial."          },
        { id: "radar",       title: "Radar",                description: "Ferramentas, startups e tendências em inteligência artificial — em curadoria contínua."           },
        { id: "livro",       title: "Enquanto é Tempo",     description: "Mini-livro publicado semana a semana — uma obra que nasce em capítulos. A cada sete, um e-book compilado." },
        { id: "biblioteca",  title: "Biblioteca",           description: "Acervo vivo de prompts, leituras e referências pessoais — atualizado toda semana."                },
        { id: "estudar",     title: "Estudar",              description: "Guias, tutoriais e aulas para aprofundar o conhecimento em IA e liderança."                       },
    ],
};
