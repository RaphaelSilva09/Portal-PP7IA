"use client";

import { type LucideIcon } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

/**
 * GradientButton Component
 *
 * Botão reutilizável com gradiente e efeitos de glow.
 * Substitui os ~20+ botões duplicados no projeto.
 *
 * Princípios aplicados:
 * - DRY: Centraliza estilo de botão gradiente
 * - OCP: Aberto para extensão via variants e props
 * - Clean Code: API clara com props bem definidas
 */

export type GradientButtonVariant = "primary" | "cta" | "secondary";
export type GradientButtonSize = "sm" | "md" | "lg";

export interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variante visual do botão */
    variant?: GradientButtonVariant;
    /** Tamanho do botão */
    size?: GradientButtonSize;
    /** Ícone opcional à esquerda */
    icon?: LucideIcon;
    /** Ícone opcional à direita */
    iconRight?: LucideIcon;
    /** Estado de loading */
    loading?: boolean;
    /** Texto durante loading */
    loadingText?: string;
    /** Classes CSS adicionais */
    className?: string;
}

const variantStyles: Record<GradientButtonVariant, string> = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-700 shadow-glow-blue-md hover:shadow-glow-blue-lg",
    cta: "bg-gradient-to-r from-green-600 to-emerald-700 shadow-glow-green-md hover:shadow-glow-green-lg",
    secondary: "bg-accent/80 border border-border hover:bg-accent hover:border-border/80",
};

const sizeStyles: Record<GradientButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
};

const iconSizes: Record<GradientButtonSize, string> = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
};

/**
 * Botão com gradiente e efeitos visuais consistentes
 *
 * @example
 * // Botão primário
 * <GradientButton>Inscrever-se</GradientButton>
 *
 * @example
 * // Botão CTA com ícone
 * <GradientButton variant="cta" icon={Send}>
 *   Enviar Convite
 * </GradientButton>
 *
 * @example
 * // Botão com loading
 * <GradientButton loading loadingText="Enviando...">
 *   Enviar
 * </GradientButton>
 */
const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            icon: Icon,
            iconRight: IconRight,
            loading = false,
            loadingText,
            disabled,
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        const baseStyles = [
            // Base
            "inline-flex items-center justify-center gap-2",
            "text-white font-semibold rounded-xl",
            "transition duration-200",
            // Interações
            "hover:scale-[1.02] active:scale-95",
            // Touch target (WCAG)
            "touch-target",
            // Whitespace
            "whitespace-nowrap",
            // Variant
            variantStyles[variant],
            // Size
            sizeStyles[size],
            // Disabled
            isDisabled && "opacity-50 cursor-not-allowed hover:scale-100",
            // Custom
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <button ref={ref} className={baseStyles} disabled={isDisabled} {...props}>
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {loadingText || children}
                    </>
                ) : (
                    <>
                        {Icon && <Icon className={iconSizes[size]} />}
                        {children}
                        {IconRight && <IconRight className={iconSizes[size]} />}
                    </>
                )}
            </button>
        );
    }
);

GradientButton.displayName = "GradientButton";

export default GradientButton;
