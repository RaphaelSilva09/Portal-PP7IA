export type TeamMemberKind = "creator" | "tech" | "arts" | "review";

/**
 * Todos os campos são opcionais — nem todo integrante disponibiliza (ou quer
 * publicar) cada rede/canal. A UI só deve renderizar os que estiverem presentes.
 */
export interface TeamMemberContact {
    email?: string;
    /** Handle sem "@", ex.: "tofu.42" */
    instagram?: string;
    /** Apenas dígitos, com DDI, ex.: "5511999999999" */
    whatsapp?: string;
    /** URL completa do perfil */
    linkedin?: string;
    /** Handle sem "@", ex.: "octocat" */
    github?: string;
}

export interface TeamMember {
    role: string;
    name: string;
    description?: string;
    kind: TeamMemberKind;
    contact?: TeamMemberContact;
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
        contact: { linkedin: "https://www.linkedin.com/in/raphaelfelipesilva/" },
    },
    {
        role: "Assistência Técnica",
        name: "Lucas Periquito Costa",
        description: "Aluno de Engenharia da Computação. Suporte técnico.",
        kind: "tech",
        contact: { linkedin: "https://www.linkedin.com/in/lucas-periquito-costa/" },
    },
    {
        role: "Assistência Técnica",
        name: "Luiza Santana",
        description: "Aluna de Sistemas de Informação. Curadoria de conteúdo.",
        kind: "tech",
        contact: { linkedin: "https://www.linkedin.com/in/luizarsantana/" },
    },
    {
        role: "Assistência Técnica",
        name: "Davi Ferreira",
        description: "Aluno de Engenharia da Computação. Apoio técnico.",
        kind: "tech",
        contact: { linkedin: "https://www.linkedin.com/in/davioliveiraferreira/" },
    },
    {
        role: "Artes das capas",
        name: "Gustavo Colombini",
        description: "Artista responsável pela criação das capas presentes nos minilivros.",
        kind: "arts",
        contact: { linkedin: "https://www.linkedin.com/in/gucolombini/" },
    },
    {
        role: "Artes das capas",
        name: "Sabrina Ai Kato",
        description: "Artista responsável pela criação das capas presentes nos minilivros.",
        kind: "arts",
        contact: { instagram: "tofu.42" },
    },
    // Dados complementares podem ser adicionados quando forem confirmados.
    {
        role: "Consultoria",
        name: "Cristiano Benite",
        description: "Consultor de tecnologia, fornecendo apoio ao time de desenvolvimento técnico.",
        kind: "review",
        contact: { linkedin: "https://www.linkedin.com/in/cristiano-benites-ph-d-687647a8/" },
    },
];

export type TeamContactKind = "email" | "instagram" | "whatsapp" | "linkedin" | "github";

export interface TeamContactLink {
    kind: TeamContactKind;
    href: string;
    label: string;
}

/** Converte o `contact` bruto de um integrante nos links prontos para renderizar. */
export function getTeamMemberContactLinks(contact?: TeamMemberContact): TeamContactLink[] {
    if (!contact) return [];
    const links: TeamContactLink[] = [];

    if (contact.email) {
        links.push({ kind: "email", href: `mailto:${contact.email}`, label: `E-mail: ${contact.email}` });
    }
    if (contact.instagram) {
        const handle = contact.instagram.replace(/^@/, "");
        links.push({ kind: "instagram", href: `https://instagram.com/${handle}`, label: `Instagram: @${handle}` });
    }
    if (contact.whatsapp) {
        const digits = contact.whatsapp.replace(/\D/g, "");
        links.push({ kind: "whatsapp", href: `https://wa.me/${digits}`, label: "WhatsApp" });
    }
    if (contact.linkedin) {
        links.push({ kind: "linkedin", href: contact.linkedin, label: "LinkedIn" });
    }
    if (contact.github) {
        const handle = contact.github.replace(/^@/, "");
        links.push({ kind: "github", href: `https://github.com/${handle}`, label: `GitHub: @${handle}` });
    }

    return links;
}
