export type TeamMemberKind = "creator" | "tech" | "arts" | "review";

export interface TeamMember {
    role: string;
    name: string;
    description?: string;
    kind: TeamMemberKind;
}

export const TEAM_MEMBERS: TeamMember[] = [
    {
        role: "Criador",
        name: "Paulo Periquito",
        description: "Mentor, investidor-anjo e advisor com 40+ anos de liderança executiva.",
        kind: "creator",
    },
    {
        role: "Assistência Técnica",
        name: "Raphael Silva",
        description: "Aluno de Ciência da Computação. Desenvolvimento técnico.",
        kind: "tech",
    },
    {
        role: "Assistência Técnica",
        name: "Lucas Periquito Costa",
        description: "Aluno de Engenharia da Computação. Suporte técnico.",
        kind: "tech",
    },
    {
        role: "Assistência Técnica",
        name: "Luiza Santana",
        description: "Aluna de Sistemas de Informação. Curadoria de conteúdo.",
        kind: "tech",
    },
    {
        role: "Assistência Técnica",
        name: "Davi Ferreira",
        description: "Aluno de Engenharia da Computação. Apoio técnico.",
        kind: "tech",
    },
    {
        role: "Artes da página",
        name: "Gustavo Colombini",
        kind: "arts",
    },
    {
        role: "Artes da página",
        name: "Sabrina Ai Kato",
        kind: "arts",
    },
    {
        role: "Apoio técnico e revisão",
        name: "Cristiano Benite",
        kind: "review",
    },
];
