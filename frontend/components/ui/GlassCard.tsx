"use client";

import { forwardRef, type HTMLAttributes } from "react";

/**
 * GlassCard Component
 *
 * Card reutilizável com efeito glassmorphism.
 * Substitui os glass-card duplicados no projeto.
 *
 * Princípios aplicados:
 * - DRY: Centraliza estilo de glass card
 * - OCP: Aberto para extensão via variants e props
 * - Clean Code: API simples e consistente
 */

export type GlassCardVariant = "default" | "elevated" | "bordered";
export type GlassCardPadding = "none" | "sm" | "md" | "lg";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Variante visual do card */
    variant?: GlassCardVariant;
    /** Padding interno */
    padding?: GlassCardPadding;
    /** Renderizar como outro elemento (polimorfismo) */
    as?: "div" | "section" | "article";
    /** Classes CSS adicionais */
    className?: string;
}

const variantStyles: Record<GlassCardVariant, string> = {
    default: "glass-card",
    elevated: "glass-card shadow-lg",
    bordered: "glass-card border-2 border-border",
};

const paddingStyles: Record<GlassCardPadding, string> = {
    none: "",
    sm: "p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
};

/**
 * Card com efeito glassmorphism
 *
 * @example
 * // Card padrão
 * <GlassCard padding="md">
 *   <h3>Título</h3>
 *   <p>Conteúdo</p>
 * </GlassCard>
 *
 * @example
 * // Card elevado
 * <GlassCard variant="elevated" padding="lg">
 *   Conteúdo destacado
 * </GlassCard>
 *
 * @example
 * // Como section semântica
 * <GlassCard as="section" padding="md">
 *   <h2>Seção</h2>
 * </GlassCard>
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ variant = "default", padding = "md", as: Component = "div", className = "", children, ...props }, ref) => {
        const baseStyles = [
            // Variant
            variantStyles[variant],
            // Padding
            paddingStyles[padding],
            // Border radius já vem do glass-card
            // Custom
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <Component ref={ref} className={baseStyles} {...props}>
                {children}
            </Component>
        );
    }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
