/**
 * Axioma Prompts (Infrastructure Layer)
 *
 * Construção dos prompts enviados ao provedor de IA (Gemini) para as
 * duas operações do Axioma: análise de respostas e geração de prova.
 *
 * Funções puras — sem I/O — para facilitar testes.
 */

import type { AnalyzeInput, ChallengeInput } from "@/domain/axioma/Axioma";

export function buildAnalyzePrompt(input: AnalyzeInput): string {
    const respostas = input.answers
        .map((a) => {
            if (a.type === "choice") {
                return `- [${a.questionId}] ${a.prompt}\n  Resposta: (${a.answer}) ${a.optionLabel ?? ""}`;
            }
            return `- [${a.questionId}] ${a.prompt}\n  Resposta aberta: ${a.answer}`;
        })
        .join("\n\n");

    const scoreInfo =
        input.tipo === "tecnico" && input.technicalScore
            ? `\nPontuação objetiva: ${input.technicalScore.correct}/${input.technicalScore.total} corretas.`
            : "";

    const tipoLabel =
        input.tipo === "perfil"
            ? "perfil comportamental sobre uso de Inteligência Artificial"
            : "avaliação técnica de conhecimento em Inteligência Artificial";

    return `Você é um especialista em educação em IA. Analise as respostas abaixo de uma pessoa em um questionário diagnóstico de ${tipoLabel} e gere um relatório personalizado em português brasileiro.

IMPORTANTE: Escreva o relatório SEMPRE na SEGUNDA PESSOA, falando diretamente com a pessoa (use "você", "seu", "sua"). NUNCA use "o aluno", "a aluna", "o usuário" ou terceira pessoa. O tom deve ser direto, pessoal e acolhedor.

Nome da pessoa: ${input.studentName || "Anônimo"}${scoreInfo}

Respostas:
${respostas}

Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto extra) no formato:
{
  "profileTitle": "Nome curto e marcante do perfil (2-4 palavras)",
  "summary": "Parágrafo de 3-4 linhas falando DIRETAMENTE com a pessoa (use 'você')",
  "strengths": ["3 pontos fortes em segunda pessoa (ex: 'Você demonstra...')"],
  "gaps": ["3 lacunas em segunda pessoa (ex: 'Você ainda precisa...')"],
  "recommendations": [
    {"title": "Título curto", "description": "Recomendação em segunda pessoa (ex: 'Comece por...', 'Pratique...')"},
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."}
  ],
  "competencies": [
    {"label": "Nome da competência", "value": 0-100},
    {"label": "...", "value": 0-100},
    {"label": "...", "value": 0-100},
    {"label": "...", "value": 0-100}
  ],
  "scoreLabel": "Rótulo do score principal (ex: 'Maturidade em IA' ou 'Score Técnico')",
  "scoreValue": "Valor do score (ex: '78/100' ou 'Intermediário')"
}`;
}

export function buildChallengePrompt(input: ChallengeInput): string {
    const respostas = input.triageAnswers
        .map(
            (a) =>
                `- [${a.questionId}] ${a.prompt}\n  Resposta: ${
                    a.type === "choice" ? `(${a.answer}) ${a.optionLabel ?? ""}` : a.answer
                }`,
        )
        .join("\n\n");

    return `Você é um especialista em educação em IA. Com base nas respostas da TRIAGEM abaixo, gere uma PROVA DESAFIO totalmente personalizada e calibrada ao nível real da pessoa.

IMPORTANTE: Em enunciados, introdução e qualquer texto voltado à pessoa, fale SEMPRE em SEGUNDA PESSOA ("você", "seu", "sua"). NUNCA use "o aluno" ou terceira pessoa.

Nome: ${input.studentName || "Anônimo"}
Perfil identificado: ${input.profileTitle ?? "n/d"}
Resumo do perfil: ${input.profileSummary ?? "n/d"}

Respostas da triagem:
${respostas}

REGRAS DA PROVA:
- Exatamente 10 questões.
- 7 questões de múltipla escolha (4 alternativas A-D, com UMA correta) + 3 questões abertas.
- Calibre a dificuldade ao nível da pessoa: iniciantes recebem fundamentos (o que é IA, prompt, alucinação); intermediários recebem ML/LLMs/uso prático; avançados recebem engenharia de prompt, limites técnicos, casos de uso reais.
- Cubra os tópicos onde a pessoa demonstrou MAIS LACUNAS na triagem.
- Português brasileiro, linguagem clara e direta, em SEGUNDA PESSOA ("você").
- Não copie literalmente perguntas da triagem.

Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto extra) no formato:
{
  "title": "Título curto da prova personalizada",
  "introduction": "1-2 frases em segunda pessoa explicando por que essa prova foi calibrada para você",
  "level": "iniciante | intermediário | avançado",
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "section": "Nome do tema",
      "prompt": "Enunciado da pergunta",
      "options": [
        {"key": "A", "label": "..."},
        {"key": "B", "label": "..."},
        {"key": "C", "label": "..."},
        {"key": "D", "label": "..."}
      ],
      "correct": "A"
    },
    {
      "id": "q8",
      "type": "open",
      "section": "Nome do tema",
      "prompt": "Pergunta aberta",
      "placeholder": "Texto guia opcional"
    }
  ]
}

Gere os ids como q1..q10. As 7 primeiras devem ser type "choice" e as 3 últimas type "open".`;
}
