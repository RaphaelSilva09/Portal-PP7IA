export type SectionId =
    | "hero"
    | "sete-cores"
    | "editorial"
    | "ias"
    | "manifesto"
    | "newsletter";

export interface SectionConfig {
    id: SectionId;
    order: number;
    visible: boolean;
    texts: Record<string, string>;
}

export interface SectionTextField {
    key: string;
    label: string;
    multiline?: boolean;
    hint?: string;
}

export interface HomepageConfig {
    sections: SectionConfig[];
}

export const SECTION_LABELS: Record<SectionId, string> = {
    hero: "Hero",
    "sete-cores": "Sete Cores (blocos)",
    editorial: "Editoriais e Artigos",
    ias: "Inteligência Artificial",
    manifesto: "Manifesto",
    newsletter: "Newsletter",
};

export const SECTION_TEXT_FIELDS: Record<SectionId, SectionTextField[]> = {
    hero: [
        { key: "line1", label: "Linha 1 do título" },
        { key: "line3", label: "Linha 3 do título (destaque)" },
        { key: "description", label: "Descrição", multiline: true },
        { key: "btn1", label: "Botão principal" },
        { key: "btn2", label: "Botão secundário" },
        { key: "bookCard_label", label: "Card do Livro — eyebrow (ex: O Livro)" },
        { key: "bookCard_cta", label: "Card do Livro — botão (ex: Ler →)" },
        { key: "newsletterCard_label", label: "Card de Newsletter — eyebrow (ex: Curadoria Semanal)" },
        { key: "newsletterCard_headline1", label: "Card de Newsletter — título linha 1 (ex: Toda quarta,)" },
        { key: "newsletterCard_headline2", label: "Card de Newsletter — título linha 2 (ex: no seu inbox.)" },
        { key: "newsletterCard_tagline", label: "Card de Newsletter — tagline inferior (ex: IA · Liderança · Semanal)" },
        { key: "newsletterCard_cta", label: "Card de Newsletter — botão (ex: Assinar →)" },
    ],
    "sete-cores": [
        { key: "label", label: "Label (eyebrow)" },
        { key: "title", label: "Título" },
        { key: "description", label: "Descrição", multiline: true },
        { key: "quote", label: "Citação" },
        { key: "quoteAuthor", label: "Autor da citação" },
        ...Array.from({ length: 7 }, (_, i) => [
            { key: `block${i + 1}_label`, label: `Bloco ${i + 1} · Nome` },
            { key: `block${i + 1}_desc`, label: `Bloco ${i + 1} · Descrição` },
            { key: `block${i + 1}_cadence`, label: `Bloco ${i + 1} · Cadência` },
            { key: `block${i + 1}_href`, label: `Bloco ${i + 1} · Link` },
        ]).flat(),
    ],
    editorial: [
        { key: "label", label: "Label (eyebrow)" },
        { key: "title_before", label: "Título — texto inicial" },
        { key: "title_em", label: "Título — palavra em destaque (itálico)" },
        { key: "description", label: "Descrição", multiline: true },
    ],
    ias: [
        { key: "label", label: "Label (eyebrow)" },
        { key: "title_before", label: "Título — texto inicial" },
        { key: "title_em", label: "Título — palavra em destaque (itálico)" },
        { key: "title_line2", label: "Título — segunda linha" },
        { key: "description", label: "Descrição", multiline: true },
        ...Array.from({ length: 7 }, (_, i) => [
            { key: `ia${i + 1}_name`, label: `IA ${i + 1} · Nome` },
            { key: `ia${i + 1}_role`, label: `IA ${i + 1} · Função` },
        ]).flat(),
    ],
    manifesto: [
        { key: "label", label: "Label (eyebrow)" },
        {
            key: "quote",
            label: "Citação",
            multiline: true,
            hint: 'Enter = quebra de linha. Use [palavra] para destacar em cor — ex: "[Liderar] é servir."',
        },
        { key: "author", label: "Autor" },
    ],
    newsletter: [
        { key: "label", label: "Label (eyebrow)" },
        { key: "title_before", label: "Título — texto inicial" },
        { key: "title_em", label: "Título — palavra em destaque (itálico)" },
        { key: "title_line2", label: "Título — segunda linha" },
        { key: "description", label: "Descrição", multiline: true },
    ],
};

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
    sections: [
        {
            id: "hero",
            order: 0,
            visible: true,
            texts: {
                line1: "Menos ruído.",
                line3: "Leia Enquanto é Tempo",
                description:
                    "Curadoria editorial independente sobre liderança, gestão de pessoas e IA — para quem quer decidir melhor com menos ruído.",
                btn1: "Explorar os 7 blocos",
                btn2: "Receber a newsletter",
                newsletterCard_label: "Curadoria Semanal",
                newsletterCard_headline1: "7 notícias de IA,",
                newsletterCard_headline2: "toda quarta.",
                newsletterCard_tagline: "Curto · com links · foco Brasil",
                newsletterCard_cta: "Assinar →",
            },
        },
        {
            id: "sete-cores",
            order: 1,
            visible: true,
            texts: {
                label: "Sistema cromático",
                title: "Cada cor é um caminho.",
                description:
                    "O portal é dividido em sete blocos editoriais. Cada um tem uma cor que o acompanha em todo lugar — para você reconhecer de onde vem cada peça de conteúdo antes mesmo de ler o título.",
                quote: "Suceder é o teste final da liderança.",
                quoteAuthor: "ML-20 · Enquanto é Tempo",
                block1_label: "Newsletter",
                block1_desc: "Notícias práticas de IA e startups",
                block1_cadence: "Toda quarta",
                block1_href: "/explorar?b=newsletter",
                block2_label: "Inteligência Artificial",
                block2_desc: "Notícias e análises de IA importantes para o Brasil",
                block2_cadence: "Atualização contínua",
                block2_href: "/explorar?b=inteligencia-artificial",
                block3_label: "Editoriais e Artigos",
                block3_desc: "Textos curtos e opinião editorial",
                block3_cadence: "3 a 4 por publicação",
                block3_href: "/explorar?b=editoriais-artigos",
                block4_label: "Enquanto é Tempo",
                block4_desc: "Mini-livro publicado a cada semana",
                block4_cadence: "20 de 21 publicados",
                block4_href: "/explorar?b=livro",
                block5_label: "Biblioteca",
                block5_desc: "Acervo vivo de prompts, leituras e referências",
                block5_cadence: "Atualizada toda semana",
                block5_href: "/explorar?b=biblioteca",
                block6_label: "Estudar",
                block6_desc: "Guias, tutoriais e aulas",
                block6_cadence: "Em curadoria",
                block6_href: "/explorar?b=estudar",
                block7_label: "Ensinar",
                block7_desc: "Espaço para multiplicar conhecimento",
                block7_cadence: "Em construção",
                block7_href: "/explorar?b=ensinar",
            },
        },
        {
            id: "editorial",
            order: 2,
            visible: true,
            texts: {
                label: "Editoriais e Artigos",
                title_before: "Por onde ",
                title_em: "começar",
                description: "Textos curtos para ler sem perder o fio do que importa.",
            },
        },
        {
            id: "ias",
            order: 3,
            visible: true,
            texts: {
                label: "Inteligência Artificial",
                title_before: "IA ",
                title_em: "em foco",
                title_line2: "Com critério brasileiro.",
                description:
                    "Curadoria sobre ferramentas, impactos e movimentos de IA que importam para quem decide no Brasil.",
                ia1_name: "Claude",
                ia1_role: "Raciocínio longo",
                ia2_name: "ChatGPT",
                ia2_role: "Síntese e edição",
                ia3_name: "Gemini",
                ia3_role: "Pesquisa multimodal",
                ia4_name: "Adapta",
                ia4_role: "Curadoria BR",
                ia5_name: "Perplexity",
                ia5_role: "Verificação de fatos",
                ia6_name: "Grok",
                ia6_role: "Pulso em tempo real",
                ia7_name: "Manus",
                ia7_role: "Execução em cadeia",
            },
        },
        {
            id: "manifesto",
            order: 4,
            visible: true,
            texts: {
                label: "Manifesto",
                quote: '"Liderar é servir. Formar pessoas. Deixar legado."',
                author: "Paulo Periquito · Editor",
            },
        },
        {
            id: "newsletter",
            order: 5,
            visible: true,
            texts: {
                label: "Newsletter PP7+IAS",
                title_before: "Toda ",
                title_em: "quarta",
                title_line2: "Direto no inbox.",
                description:
                    "Toda semana, sete notícias curtas sobre IA e tecnologia com links para quem quiser se aprofundar, priorizando o que importa para o Brasil.",
            },
        },
    ],
};
