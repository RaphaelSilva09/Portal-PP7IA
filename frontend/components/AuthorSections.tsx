import { GraduationCap, Briefcase, Building2, Sparkles, Heart, LucideIcon } from "lucide-react";

export interface AuthorSection {
    id: string;
    title: string;
    icon: LucideIcon;
    color: "blue" | "orange" | "green" | "purple";
    content: React.ReactNode;
}

export const authorSections: AuthorSection[] = [
    {
        id: "formacao",
        title: "Formação e Início",
        icon: GraduationCap,
        color: "blue",
        content: (
            <div className="space-y-4">
                <p className="text-base leading-relaxed text-text-secondary">
                    <span className="text-white font-medium">Origem:</span> Recife (1946). Base em disciplina e
                    esforço.
                </p>
                <p className="text-base leading-relaxed text-text-secondary">
                    <span className="text-white font-medium">Formação:</span> Engenheiro Mecânico (UFPE). Pioneiro em
                    tecnologia desde os cartões perfurados.
                </p>
            </div>
        ),
    },
    {
        id: "asa-alcoa",
        title: "ASA / ALCOA",
        icon: Briefcase,
        color: "orange",
        content: (
            <div className="space-y-4">
                <p className="text-sm text-text-secondary/70 font-medium">1972 – 1996</p>
                <p className="text-base leading-relaxed text-text-secondary">
                    Evoluiu de analista a COO da América Latina. Liderou 11 unidades de negócios e presidiu a operação
                    no México.
                </p>
            </div>
        ),
    },
    {
        id: "whirlpool",
        title: "Whirlpool",
        icon: Building2,
        color: "blue",
        content: (
            <div className="space-y-4">
                <p className="text-sm text-text-secondary/70 font-medium">1996 – 2010</p>
                <p className="text-base leading-relaxed text-text-secondary">
                    Presidente da Whirlpool América Latina e, posteriormente, Presidente da Whirlpool International,
                    comandando operações na América Latina, Ásia e Europa.
                </p>
            </div>
        ),
    },
    {
        id: "portal-pp-ias",
        title: "Portal PP+IAs",
        icon: Sparkles,
        color: "green",
        content: (
            <div className="space-y-4">
                <p className="text-base leading-relaxed text-text-secondary mb-3">
                    Focado em compartilhar conhecimento através da newsletter PP-NEWS e do portal PP+IAs. O objetivo vai
                    além da tecnologia:
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-text-secondary">
                        <span className="text-brand-green text-xl leading-none">•</span>
                        <span className="text-base">
                            <span className="text-white font-medium">Transmissão de Saberes:</span> Divulgação de
                            aprendizados em Liderança, Talento e Gestão.
                        </span>
                    </li>
                    <li className="flex items-start gap-3 text-text-secondary">
                        <span className="text-brand-green text-xl leading-none">•</span>
                        <span className="text-base">
                            <span className="text-white font-medium">Mentoria:</span> Apoio direto a novas gerações de
                            empreendedores e executivos.
                        </span>
                    </li>
                </ul>
            </div>
        ),
    },
    {
        id: "filosofia",
        title: "Filosofia e Valores",
        icon: Heart,
        color: "purple",
        content: (
            <div className="space-y-5">
                <blockquote className="text-lg text-white font-medium italic border-l-4 border-brand-purple pl-5 py-1">
                    &ldquo;A tecnologia é apenas ferramenta. O foco é, e sempre será, GENTE.&rdquo;
                </blockquote>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-text-secondary">
                        <span className="text-brand-purple text-xl leading-none">•</span>
                        <span className="text-base">
                            <span className="text-white font-medium">Liderar é servir:</span> Foco em desenvolver
                            pessoas e formar novos líderes.
                        </span>
                    </li>
                    <li className="flex items-start gap-3 text-text-secondary">
                        <span className="text-brand-purple text-xl leading-none">•</span>
                        <span className="text-base">
                            <span className="text-white font-medium">Resiliência:</span> Ver erros como degraus para o
                            acerto. Desistir, nunca!
                        </span>
                    </li>
                    <li className="flex items-start gap-3 text-text-secondary">
                        <span className="text-brand-purple text-xl leading-none">•</span>
                        <span className="text-base">
                            <span className="text-white font-medium">Propósito:</span> Deixar um legado de conhecimento
                            para filhos, netos, novas gerações e quem mais tiver interesse.
                        </span>
                    </li>
                </ul>
            </div>
        ),
    },
];

