"use client";

import SearchModal from "./SearchModal";
import FirstVisitModal from "./FirstVisitModal";
import Portal from "./Portal";
import { useSearchModal } from "@/context/SearchModalContext";
import { useFirstVisitModal } from "@/context/FirstVisitModalContext";

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
 *
 * Benefícios:
 * - Todos os modais em um único lugar (fácil manutenção)
 * - Renderização via Portal evita problemas de z-index e positioning
 * - Facilita adição de novos modais no futuro
 *
 * @example
 * // No layout.tsx:
 * <SearchModalProvider>
 *   <FirstVisitModalProvider>
 *     {children}
 *     <ModalsProvider />
 *   </FirstVisitModalProvider>
 * </SearchModalProvider>
 */
export default function ModalsProvider() {
    const { isOpen: isSearchOpen, closeModal: closeSearchModal } = useSearchModal();
    const { isOpen: isFirstVisitOpen, closeModal: closeFirstVisitModal } = useFirstVisitModal();

    return (
        <Portal>
            <SearchModal isOpen={isSearchOpen} onClose={closeSearchModal} />
            <FirstVisitModal isOpen={isFirstVisitOpen} onClose={closeFirstVisitModal} />
            {/*
                Futuros modais podem ser adicionados aqui:
                <AuthModal />
                <NotificationModal />
                <ConfirmationModal />
            */}
        </Portal>
    );
}
