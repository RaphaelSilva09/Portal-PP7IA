/**
 * Data for "Por Que o 7?" page
 *
 * Conteúdo organizado seguindo a estrutura hierárquica 7×7 do exemplo.html
 * Separação de dados/apresentação facilita manutenção e futuras traduções
 */

import { NumberedListItem } from "@/components/ui/NumberedList";

/**
 * Seção de introdução (hero)
 */
export const heroData = {
    title: "Por que o 7?",
    subtitle: "Conexões pessoais, familiares e método editorial",
    badge: "PP7 não é estética. É sistema.",
};

/**
 * Parágrafos introdutórios
 */
export const introParagraphs = [
    'O 7 aparece nas datas-chave da minha família: nasci em <strong class="text-blue-400">07/09/1946</strong>, meu neto nasceu no mesmo dia décadas depois (<strong class="text-blue-400">07/09/2022</strong>), casamentos e nascimentos caem em semanas múltiplas de 7.',
    'Em janeiro de 2025, visitei Abu Dhabi — a <strong class="text-blue-400">Abrahamic Family House</strong> tem 7 arcos na mesquita. Os rituais islâmicos celebram o 7 em voltas, dias e pedras. Judaísmo e cristianismo fazem o mesmo há milênios.',
    "Coincidência não é causalidade — mas quando um padrão se repete no pessoal, no cultural e no prático, ele vira método.",
];

/**
 * Nível 1: Conexões Familiares (7 itens)
 */
export const conexoesFamiliares: NumberedListItem[] = [
    { content: "Nasci em 07/09/1946 — dia 7, ano = 7×278" },
    { content: "Casamento 1 (17/02/1971) — semana ISO 7" },
    { content: "Filho nasceu (06/12/1971) — semana ISO 49 = 7²" },
    { content: "Casamento 2 (21/09/2008) — 21 = 3×7" },
    { content: "Neto nasceu em 07/09/2022 — mesma data que eu" },
    { content: "Esposa (1947) + filha (1974): soma dígitos = 21" },
    { content: "Intervalos em múltiplos de 7 dias entre eventos-chave" },
];

/**
 * Nível 1: Método Editorial (7 itens)
 */
export const metodoEditorial: NumberedListItem[] = [
    { content: "<strong>7 IAs:</strong> ChatGPT, Claude, Perplexity, Manus, Grok, Gemini, Adapta" },
    { content: "<strong>MiniLivros:</strong> 7 títulos (coleção fechada e memorável)" },
    { content: "<strong>Portal:</strong> 7 pilares fixos (colunas editoriais)" },
    { content: '<strong>Regra:</strong> listas longas viram "7 essenciais + bônus"' },
    { content: "<strong>Formato:</strong> 1 ideia por tela, leitura rápida" },
    { content: "<strong>Ritmo:</strong> publicação em ciclos de 7 dias" },
    { content: "<strong>Qualidade:</strong> 7 testes antes de publicar" },
];

/**
 * Nível 2: Resumo Executivo (7 itens)
 */
export const resumoExecutivo: NumberedListItem[] = [
    { content: "<strong>Semana:</strong> 7 dias = sistema operacional do tempo humano" },
    { content: "<strong>Fé:</strong> ciclo completo — fecha e recomeça" },
    { content: "<strong>Sono:</strong> 7h = multiplicador invisível de saúde" },
    { content: "<strong>Coração:</strong> 7 fatores salvam vidas (Life's Simple 7)" },
    { content: "<strong>Mente:</strong> 7±2 = limite da memória de curto prazo" },
    { content: "<strong>Tech:</strong> 7 camadas movem a internet (OSI)" },
    { content: "<strong>Mercados:</strong> 7 ações dominam o mundo (Magnificent Seven)" },
];

/**
 * Nível 3: Grupo 1 - Pessoal e Família (7 itens)
 */
export const grupo1PessoalFamilia: NumberedListItem[] = [
    { content: "Nascimento 07/09/1946 — dia 7, ano = 7×278" },
    { content: "Casamento 1 — semana ISO 7" },
    { content: "Filho — semana ISO 49 (7²)" },
    { content: "Casamento 2 — 21 = 3×7" },
    { content: "Neto — 07/09/2022" },
    { content: "Esposa + filha: soma = 21" },
    { content: 'O 7 virou "checkpoint" familiar' },
];

/**
 * Nível 3: Grupo 2 - Fé Abraâmica (7 itens)
 */
export const grupo2FeAbraamica: NumberedListItem[] = [
    { content: "Shabat — 7º dia sagrado" },
    { content: "Menorá — 7 braços" },
    { content: "7 dias da Criação + 70×7 perdão" },
    { content: "7 sacramentos e 7 dons" },
    { content: "Ṭawāf — 7 voltas na Kaaba" },
    { content: "Saʿī — 7 percursos + 7 céus" },
    { content: "Abu Dhabi — 7 arcos" },
];

/**
 * Nível 3: Grupo 3 - Tradições Mundiais (7 itens)
 */
export const grupo3TradicoesMundiais: NumberedListItem[] = [
    { content: "Sapta Padi — 7 passos do casamento" },
    { content: "Saptarishi (7 sábios) + 7 chakras" },
    { content: "7 fatores do despertar (Budismo)" },
    { content: "7 entidades divinas (Zoroastrismo)" },
    { content: "7 Anjos (Yazidismo)" },
    { content: "Qixi — 7º dia do 7º mês" },
    { content: "7 Deuses da Sorte (Japão)" },
];

/**
 * Nível 3: Grupo 4 - Ciência e Saúde (7 itens)
 */
export const grupo4CienciaSaude: NumberedListItem[] = [
    { content: "Sono: 7h piso para adultos" },
    { content: "Diabetes: perder 5-7% do peso" },
    { content: "Life's Simple 7 (AHA)" },
    { content: "7+ porções vegetais/dia" },
    { content: "Treino de 7 minutos" },
    { content: "Melanoma: 7 pontos" },
    { content: "Ritmos de ~7 dias" },
];

/**
 * Nível 3: Grupo 5 - Tecnologia e Educação (7 itens)
 */
export const grupo5TecnologiaEducacao: NumberedListItem[] = [
    { content: "Modelo OSI: 7 camadas" },
    { content: "ASCII: 7 bits" },
    { content: "Display 7 seg + Wi-Fi 7 + 7 nm" },
    { content: "Windows 7 e 7-Zip" },
    { content: "7 princípios do bom ensino" },
    { content: "7±2: limite da memória" },
    { content: "Design Universal: 7 princípios" },
];

/**
 * Nível 3: Grupo 6 - Negócios e Mercados (7 itens)
 */
export const grupo6NegociosMercados: NumberedListItem[] = [
    { content: "G7: 7 economias globais" },
    { content: "Magnificent Seven: 7 megaações" },
    { content: "7-Eleven: varejo global" },
    { content: "Series 7: licença financeira" },
    { content: "SBA 7(a): crédito PME" },
    { content: "Treasury 7 anos" },
    { content: "~7% retorno histórico" },
];

/**
 * Nível 3: Grupo 7 - Cultura e Método PP7 (7 itens)
 */
export const grupo7CulturaMetodoPP7: NumberedListItem[] = [
    { content: "Semana de 7 dias" },
    { content: "7 continentes, mares, cores, notas" },
    { content: "7 maravilhas + 7 Cumes" },
    { content: "7 IAs no processo" },
    { content: "7 pilares + 7 MiniLivros" },
    { content: 'Regra: "7 essenciais + bônus"' },
    { content: "Ritmo semanal + 7 testes" },
];
