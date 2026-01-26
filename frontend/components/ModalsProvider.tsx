"use client";

import SearchModal from "./SearchModal";
import Portal from "./Portal";
import { useSearchModal } from "@/context/SearchModalContext";

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
 *   {children}
 *   <ModalsProvider />
 * </SearchModalProvider>
 */
export default function ModalsProvider() {
    const { isOpen, closeModal } = useSearchModal();
    
    return (
        <Portal>
            <SearchModal isOpen={isOpen} onClose={closeModal} />
            {/* 
                Futuros modais podem ser adicionados aqui:
                <AuthModal />
                <NotificationModal />
                <ConfirmationModal />
            */}
        </Portal>
    );
}
