"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamentos de diálogo acessível para overlays custom (WCAG / WAI-ARIA APG):
 * - Esc fecha
 * - foco inicial dentro do painel e trap de Tab
 * - devolução do foco ao elemento que abriu o diálogo
 *
 * O componente continua responsável pela semântica estática
 * (role="dialog", aria-modal="true", aria-labelledby).
 */
export function useDialogA11y(
    isOpen: boolean,
    onClose: () => void,
    panelRef: RefObject<HTMLElement | null>,
): void {
    // Mantém a referência mais recente de onClose sem forçar o efeito abaixo a
    // re-rodar a cada render — callers costumam passar uma closure inline (não
    // memoizada), e recriar o efeito a cada render rouba o foco do campo ativo
    // (ex.: usuário digitando) de volta para o primeiro elemento focável.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;

        const getFocusable = (): HTMLElement[] =>
            panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

        // Foco inicial: primeiro campo/controle do diálogo
        const focusables = getFocusable();
        (focusables[0] ?? panel)?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (event.key !== "Tab") return;

            const items = getFocusable();
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || !panel?.contains(active))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [isOpen, panelRef]);
}
