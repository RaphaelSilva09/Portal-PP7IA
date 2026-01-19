import { RefObject } from "react";
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
                    "A tecnologia é apenas ferramenta. O foco é, e sempre será, GENTE."
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
                            para filhos, netos e novos talentos.
                        </span>
                    </li>
                </ul>
            </div>
        ),
    },
];

interface AuthorSectionsProps {
    sections: AuthorSection[];
    activeSectionIndex: number;
    sectionRefs: RefObject<(HTMLElement | null)[]>;
    sectionOpacities: number[];
}

const colorConfig = {
    blue: {
        bg: "rgba(59, 130, 246, 0.1)",
        border: "rgba(59, 130, 246, 0.2)",
        borderActive: "#3b82f6",
        shadow: "0 0 20px rgba(59, 130, 246, 0.3)",
        shadowSubtle: "0 0 30px rgba(59, 130, 246, 0.1)",
        icon: "#3b82f6",
    },
    orange: {
        bg: "rgba(251, 146, 60, 0.1)",
        border: "rgba(251, 146, 60, 0.2)",
        borderActive: "#fb923c",
        shadow: "0 0 20px rgba(251, 146, 60, 0.3)",
        shadowSubtle: "0 0 30px rgba(251, 146, 60, 0.1)",
        icon: "#fb923c",
    },
    green: {
        bg: "rgba(34, 197, 94, 0.1)",
        border: "rgba(34, 197, 94, 0.2)",
        borderActive: "#22c55e",
        shadow: "0 0 20px rgba(34, 197, 94, 0.3)",
        shadowSubtle: "0 0 30px rgba(34, 197, 94, 0.1)",
        icon: "#22c55e",
    },
    purple: {
        bg: "rgba(168, 85, 247, 0.1)",
        border: "rgba(168, 85, 247, 0.2)",
        borderActive: "#a855f7",
        shadow: "0 0 20px rgba(168, 85, 247, 0.3)",
        shadowSubtle: "0 0 30px rgba(168, 85, 247, 0.1)",
        icon: "#a855f7",
    },
};

export default function AuthorSections({ sections, activeSectionIndex, sectionRefs, sectionOpacities }: AuthorSectionsProps) {
    return (
        <div className="space-y-12 lg:space-y-20">
            {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSectionIndex === index;
                const colors = colorConfig[section.color];

                return (
                    <article
                        key={section.id}
                        id={section.id}
                        ref={(el) => {
                            if (sectionRefs.current) {
                                sectionRefs.current[index] = el;
                            }
                        }}
                        className="group transition-all duration-500"
                        style={{
                            opacity: sectionOpacities[index] ?? 1,
                            transitionDelay: `${index * 50}ms`,
                            transitionProperty: "opacity, transform",
                        }}
                    >
                        {/* Section Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    isActive ? "scale-110" : ""
                                }`}
                                style={{
                                    backgroundColor: colors.bg,
                                    borderWidth: "1px",
                                    borderColor: colors.border,
                                    boxShadow: isActive ? colors.shadow : "none",
                                }}
                            >
                                <Icon
                                    className={`w-6 h-6 transition-transform duration-300 ${
                                        isActive ? "scale-110" : ""
                                    }`}
                                    style={{ color: colors.icon }}
                                />
                            </div>
                            <h3
                                className={`text-2xl font-bold transition-colors duration-300 ${
                                    isActive ? "text-white" : "text-text-secondary"
                                }`}
                            >
                                {section.title}
                            </h3>
                        </div>

                        {/* Section Content */}
                        <div
                            className="glass-card p-6 sm:p-8 border-l-4 transition-all duration-300"
                            style={{
                                borderLeftColor: isActive ? colors.borderActive : colors.border,
                                boxShadow: isActive ? colors.shadowSubtle : "none",
                            }}
                        >
                            {section.content}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
