"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

/**
 * Accordion Component
 *
 * Componente de accordion reutilizável com 3 variantes visuais.
 * Segue SRP: responsável apenas por expand/collapse com estilo específico.
 *
 * Princípios aplicados:
 * - SRP: Uma responsabilidade - renderizar accordion com variante visual
 * - OCP: Aberto para extensão via variants, fechado para modificação
 * - Composition over Inheritance: Variantes via props, não subclasses
 */

export interface AccordionProps {
    /** Variante visual baseada no nível hierárquico */
    variant: "level1" | "level2" | "level3";
    /** Título exibido no header */
    title: string;
    /** ID único para controle de estado */
    id: string;
    /** Estado de abertura/fechamento */
    isOpen: boolean;
    /** Callback quando usuário clica para toggle */
    onToggle: (id: string) => void;
    /** Conteúdo renderizado quando expandido */
    children: ReactNode;
}

/**
 * Mapeamento de classes CSS por variante
 * Segue o pattern de design tokens para consistência visual
 */
const variantStyles = {
    level1: {
        container: "bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] border-blue-500/30",
        header: "px-6 py-5",
        title: "text-base md:text-lg font-semibold text-white",
        content: "px-6 pb-5 pt-4 border-t border-white/10 text-white",
        arrow: "text-white/70",
    },
    level2: {
        container: "bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] border-blue-500/25",
        header: "px-5 py-4",
        title: "text-sm md:text-base font-semibold text-white",
        content: "px-5 pb-4 pt-3 border-t border-white/10 text-white",
        arrow: "text-white/70",
    },
    level3: {
        container: "bg-gradient-to-br from-[#dbeafe] to-[#eff6ff] border-blue-500/20",
        header: "px-4 py-3.5",
        title: "text-sm font-semibold text-[#1e3a5f]",
        content: "px-4 pb-3.5 pt-3 border-t border-[#1e3a5f]/10 text-[#1e3a5f]",
        arrow: "text-[#2563eb]",
    },
};

export function Accordion({ variant, title, id, isOpen, onToggle, children }: AccordionProps) {
    const styles = variantStyles[variant];

    return (
        <div
            className={`
                ${styles.container}
                border rounded-xl md:rounded-2xl overflow-hidden
                transition-all duration-200
                ${variant === "level1" ? "hover:-translate-y-0.5 hover:shadow-glow-blue-md mb-4" : "mb-3"}
            `}
        >
            {/* Header - Clicável */}
            <button
                onClick={() => onToggle(id)}
                className={`
                    ${styles.header}
                    w-full flex items-center justify-between
                    cursor-pointer hover:bg-white/5 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                `}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${id}`}
            >
                <h3 className={styles.title}>{title}</h3>

                {/* Seta com rotação */}
                <ChevronDown
                    className={`
                        ${styles.arrow}
                        w-4 h-4 md:w-5 md:h-5 shrink-0 ml-3
                        transition-transform duration-300
                        ${isOpen ? "rotate-180" : ""}
                    `}
                    aria-hidden="true"
                />
            </button>

            {/* Content - Colapsável */}
            <div
                id={`accordion-content-${id}`}
                className={`
                    grid transition-all duration-300 ease-in-out
                    ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                `}
                aria-hidden={!isOpen}
            >
                <div className="overflow-hidden">
                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </div>
    );
}
