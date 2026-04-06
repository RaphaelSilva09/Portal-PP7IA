"use client";

import { ReactNode } from "react";

/**
 * NumberedList Component
 *
 * Lista numerada com estilo consistente para diferentes contextos visuais.
 * Segue SRP: responsável apenas por renderizar listas numeradas estilizadas.
 *
 * Princípios aplicados:
 * - SRP: Uma responsabilidade - renderizar lista com numeração
 * - DRY: Evita duplicação de estilos de lista
 * - Variant Pattern: Adapta cores ao contexto (dark/light background)
 */

export interface NumberedListItem {
    /** Conteúdo do item - pode ser string ou JSX com <strong> */
    content: ReactNode;
}

export interface NumberedListProps {
    /** Array de itens a serem renderizados */
    items: NumberedListItem[];
    /** Variante de cor baseada no background do container */
    variant: "light" | "dark";
    /** Número inicial (padrão: 1) */
    startNumber?: number;
}

/**
 * Mapeamento de estilos por variante
 */
const variantStyles = {
    dark: {
        item: "text-foreground/90 border-border/40",
        number: "text-blue-500",
        strong: "text-foreground",
    },
    light: {
        item: "text-foreground/90 border-border/35",
        number: "text-blue-600",
        strong: "text-foreground",
    },
};

/**
 * Gera círculo numerado (①②③...) ou número simples
 */
const getNumberDisplay = (index: number): string => {
    // Círculos numerados de 1-20 (Unicode U+2460 to U+2473)
    const circledNumbers = [
        "①",
        "②",
        "③",
        "④",
        "⑤",
        "⑥",
        "⑦",
        "⑧",
        "⑨",
        "⑩",
        "⑪",
        "⑫",
        "⑬",
        "⑭",
        "⑮",
        "⑯",
        "⑰",
        "⑱",
        "⑲",
        "⑳",
    ];

    return index < circledNumbers.length ? circledNumbers[index] : `${index + 1}.`;
};

export function NumberedList({ items, variant, startNumber = 1 }: NumberedListProps) {
    const styles = variantStyles[variant];

    return (
        <ul className="space-y-0">
            {items.map((item, index) => (
                <li
                    key={index}
                    className={`
                        ${styles.item}
                        flex items-start gap-3
                        py-3 text-sm leading-relaxed
                        border-b last:border-b-0
                        ${styles.item}
                    `}
                >
                    {/* Número/Círculo */}
                    <span
                        className={`
                            ${styles.number}
                            font-bold text-sm min-w-6 shrink-0
                        `}
                    >
                        {getNumberDisplay(startNumber - 1 + index)}
                    </span>

                    {/* Conteúdo */}
                    <span className="flex-1">
                        {typeof item.content === "string" ? (
                            // Parse string para permitir <strong> inline
                            <span dangerouslySetInnerHTML={{ __html: item.content }} />
                        ) : (
                            item.content
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}
