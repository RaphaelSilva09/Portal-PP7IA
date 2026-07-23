/**
 * Conteúdo do tour de onboarding (primeiro login). Visual antes de textual:
 * cada passo é ancorado por um ícone grande (ver ICON_BY_STEP em
 * OnboardingModal.tsx), com só uma frase curta de apoio — parte do público
 * do portal é mais idoso, então prioriza reconhecimento visual e textos
 * curtos sobre parágrafos explicativos. 7 passos, sempre com opção de pular.
 */

export interface OnboardingStep {
    id: string;
    eyebrow: string;
    title: string;
    /** Uma frase curta — não um parágrafo. O ícone carrega o resto do significado. */
    caption: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: "welcome",
        eyebrow: "Bem-vindo",
        title: "Vamos te mostrar o portal.",
        caption: "Poucos passos. Pule quando quiser.",
    },
    {
        id: "blocks",
        eyebrow: "Os 7 blocos",
        title: "Todo o conteúdo, por cor.",
        caption: "Clique em \"7 Blocos\", fixo no topo da tela.",
    },
    {
        id: "reading",
        eyebrow: "Leitura sob medida",
        title: "Aumente a letra à vontade.",
        caption: "No artigo, o botão flutuante. No perfil, o mesmo ajuste para o portal todo.",
    },
    {
        id: "assistant",
        eyebrow: "Assistente de IA",
        title: "Pergunte, em vez de procurar.",
        caption: "Só na página principal, no canto da tela.",
    },
    {
        id: "community",
        eyebrow: "Continue de onde parou",
        title: "O portal lembra sua leitura do livro.",
        caption: "Na página principal e em Enquanto é Tempo.",
    },
    {
        id: "theme",
        eyebrow: "Tema do portal",
        title: "Claro, sépia ou escuro.",
        caption: "Alterne quando quiser, no cabeçalho.",
    },
    {
        id: "finish",
        eyebrow: "Pronto",
        title: "Hora de explorar.",
        caption: "Seu perfil fica no canto superior direito — repita o tour quando quiser.",
    },
];

/** Blocos exibidos na etapa "Os 7 blocos" — mesmas cores usadas em todo o portal. */
export const ONBOARDING_BLOCKS: { label: string; color: string }[] = [
    { label: "Newsletter",              color: "var(--block-newsletter)" },
    { label: "Inteligência Artificial", color: "var(--block-reportagem)" },
    { label: "Editoriais e Artigos",    color: "var(--block-radar)"      },
    { label: "Enquanto é Tempo",        color: "var(--block-livro)"      },
    { label: "Biblioteca",              color: "var(--block-biblioteca)" },
    { label: "Estudar",                 color: "var(--block-estudar)"    },
    { label: "Ensinar",                 color: "var(--block-ensinar)"    },
];
