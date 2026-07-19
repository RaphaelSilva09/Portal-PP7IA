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
    reportagem:  "Inteligência Artificial",
    radar:       "Editoriais e Artigos",
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
        { id: "newsletter",  title: "Newsletter",              description: "Sete notas curtas por semana sobre IA, liderança e tecnologia, com links para aprofundar."       },
        { id: "reportagem",  title: "Inteligência Artificial", description: "Notícias, análises e aplicações de IA com foco no que importa para o Brasil."                    },
        { id: "radar",       title: "Editoriais e Artigos",    description: "Textos curtos, opinião editorial e artigos selecionados para leitura objetiva."                  },
        { id: "livro",       title: "Enquanto é Tempo",     description: "Mini-livro publicado semana a semana — uma obra que nasce em capítulos. A cada sete, um e-book compilado." },
        { id: "biblioteca",  title: "Biblioteca",           description: "Acervo vivo de prompts, leituras e referências pessoais — atualizado toda semana."                },
        { id: "estudar",     title: "Estudar",              description: "Guias, tutoriais e aulas para aprofundar o conhecimento em IA e liderança."                       },
    ],
};
