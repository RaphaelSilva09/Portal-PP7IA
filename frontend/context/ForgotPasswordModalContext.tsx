"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

/**
 * ForgotPasswordModalContext
 *
 * Gerencia o estado global do modal de recuperação de senha.
 * O fluxo de recuperação (email → OTP → password) é gerenciado
 * internamente pelo hook usePasswordRecovery.
 *
 * Princípios aplicados:
 * - SRP: Único responsável pelo estado de abertura/fechamento do modal
 * - Clean Architecture: Mantém lógica de UI separada da lógica de negócio
 * - Context Pattern: Evita prop drilling, facilita acesso global
 */

interface ForgotPasswordModalContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const ForgotPasswordModalContext = createContext<ForgotPasswordModalContextType | undefined>(undefined);

export function ForgotPasswordModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(() => ({ isOpen, openModal, closeModal }), [isOpen, openModal, closeModal]);

    return <ForgotPasswordModalContext.Provider value={contextValue}>{children}</ForgotPasswordModalContext.Provider>;
}

/**
 * Hook customizado para acessar o contexto do ForgotPasswordModal
 *
 * @throws {Error} Se usado fora do ForgotPasswordModalProvider
 * @returns {ForgotPasswordModalContextType} Estado e métodos do modal
 */
export function useForgotPasswordModal() {
    const context = useContext(ForgotPasswordModalContext);

    if (!context) {
        throw new Error("useForgotPasswordModal must be used within ForgotPasswordModalProvider");
    }

    return context;
}
