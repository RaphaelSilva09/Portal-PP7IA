/**
 * Conteúdo do tour de onboarding (primeiro login). Curto de propósito — 6
 * passos contextuais, cada um mostrando uma seção/ferramenta central do
 * portal, com opção de pular a qualquer momento. Ver OnboardingModal.tsx.
 */

export interface OnboardingStep {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: "welcome",
        eyebrow: "Bem-vindo",
        title: "Vamos te mostrar o portal.",
        description: "Um tour rápido pelas seções principais e pelas ferramentas de leitura — leva menos de um minuto, e dá pra pular quando quiser.",
    },
    {
        id: "blocks",
        eyebrow: "Os 7 blocos",
        title: "Todo o conteúdo, organizado por cor.",
        description: "Newsletter, Inteligência Artificial, Editoriais e Artigos, Enquanto é Tempo, Biblioteca, Estudar e Ensinar — cada um com sua cor, sempre no mesmo lugar: o menu Explorar.",
    },
    {
        id: "reading",
        eyebrow: "Leitura sob medida",
        title: "Ajuste o texto do seu jeito.",
        description: "Nos artigos, o botão flutuante no canto da tela controla tamanho da fonte, peso e espaçamento entre linhas. No menu de perfil, dá pra ajustar a tipografia do portal inteiro — e ativar o tema sépia.",
    },
    {
        id: "assistant",
        eyebrow: "Assistente de IA",
        title: "Pergunte, em vez de procurar.",
        description: "O balão de conversa no canto da tela responde dúvidas sobre o conteúdo do portal e ajuda a encontrar o que você precisa, sem precisar navegar por tudo.",
    },
    {
        id: "community",
        eyebrow: "Continue de onde parou",
        title: "O portal lembra o que você já leu.",
        description: "Na home e em Explorar, um atalho leva direto ao último capítulo aberto do livro. E se conhece alguém que se beneficiaria do portal, dá pra indicar pelo seu perfil.",
    },
    {
        id: "finish",
        eyebrow: "Pronto",
        title: "Hora de explorar.",
        description: "Você pode repetir este tour quando quiser, pelo seu perfil. Bom proveito!",
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
