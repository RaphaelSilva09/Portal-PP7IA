"use client";

import { useEffect, useRef } from "react";

/**
 * Hook para travar scroll do body quando modal/overlay está aberto
 *
 * Implementação iOS-friendly que:
 * - Salva posição do scroll antes de travar
 * - Usa position: fixed para prevenir scroll
 * - Restaura posição exata ao destravar
 *
 * Princípios aplicados:
 * - DRY: Centraliza lógica duplicada em AuthModal e SearchModal
 * - Single Responsibility: Apenas gerencia scroll do body
 * - Clean Code: Nome descritivo, função focada
 *
 * @param isLocked - Se true, trava o scroll; se false, destrava
 *
 * @example
 * function Modal({ isOpen }) {
 *   useBodyScrollLock(isOpen);
 *   return isOpen ? <div>...</div> : null;
 * }
 */
export function useBodyScrollLock(isLocked: boolean): void {
    // Ref para guardar a posição do scroll
    const scrollPositionRef = useRef<number>(0);

    useEffect(() => {
        if (isLocked) {
            // Salva posição atual do scroll
            scrollPositionRef.current = window.scrollY;

            // Aplica estilos para travar o body
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollPositionRef.current}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";

            // Cleanup: restaura ao desmontar ou quando isLocked muda para false
            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                document.body.style.overflow = "";

                // Desativa scroll-behavior: smooth temporariamente para que a
                // restauração da posição seja instantânea (sem animação visível)
                const htmlEl = document.documentElement;
                const prevBehavior = htmlEl.style.scrollBehavior;
                htmlEl.style.scrollBehavior = "auto";
                window.scrollTo(0, scrollPositionRef.current);
                htmlEl.style.scrollBehavior = prevBehavior;
            };
        }
    }, [isLocked]);
}

export default useBodyScrollLock;
