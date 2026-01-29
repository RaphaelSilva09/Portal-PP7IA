"use client";

import SearchModal from "./SearchModal";
import FirstVisitModal from "./FirstVisitModal";
import AuthModal from "./AuthModal";
import Portal from "./Portal";
import { useSearchModal } from "@/context/SearchModalContext";
import { useFirstVisitModal } from "@/context/FirstVisitModalContext";
import { useAuthModal } from "@/context/AuthModalContext";

/**
 * ModalsProvider Component
 *
 * Centraliza a renderização de todos os modais da aplicação.
 * Utiliza Portal para renderizar modais diretamente no body, escapando
 * do contexto de stacking do layout principal.
 *
 * Princípios aplicados:
 * - SRP: Única responsabilidade é renderizar modais
 * - OCP: Aberto para extensão (novos modais), fechado para modificação
 * - Clean Architecture: Camada de apresentação independente
 */
export default function ModalsProvider() {
    const { isOpen: isSearchOpen, closeModal: closeSearchModal } = useSearchModal();
    const { isOpen: isFirstVisitOpen, closeModal: closeFirstVisitModal } = useFirstVisitModal();
    const { isOpen: isAuthOpen, initialData, initialMode, closeModal: closeAuthModal } = useAuthModal();

    return (
        <Portal>
            <SearchModal isOpen={isSearchOpen} onClose={closeSearchModal} />
            <FirstVisitModal isOpen={isFirstVisitOpen} onClose={closeFirstVisitModal} />
            <AuthModal
                isOpen={isAuthOpen}
                onClose={closeAuthModal}
                initialMode={initialMode}
                initialData={initialData}
            />
        </Portal>
    );
}
