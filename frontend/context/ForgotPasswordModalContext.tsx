"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

/**
 * ForgotPasswordModalContext
 *
 * Gerencia o estado global do modal de recuperação de senha.
 * Permite abrir o modal em modo de solicitação ou reset com token.
 *
 * Princípios aplicados:
 * - SRP: Único responsável pelo estado do ForgotPasswordModal
 * - Clean Architecture: Mantém lógica de UI separada da lógica de negócio
 * - Context Pattern: Evita prop drilling, facilita acesso global
 */

type ForgotPasswordModalMode = "request" | "reset";

interface ForgotPasswordModalContextType {
    isOpen: boolean;
    mode: ForgotPasswordModalMode;
    email: string;
    openModal: (mode?: ForgotPasswordModalMode, email?: string) => void;
    closeModal: () => void;
}

const ForgotPasswordModalContext = createContext<ForgotPasswordModalContextType | undefined>(undefined);

export function ForgotPasswordModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<ForgotPasswordModalMode>("request");
    const [email, setEmail] = useState("");

    const openModal = useCallback((newMode: ForgotPasswordModalMode = "request", initialEmail = "") => {
        setMode(newMode);
        setEmail(initialEmail);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setEmail("");
        setMode("request");
    }, []);

    const contextValue = useMemo(
        () => ({ isOpen, mode, email, openModal, closeModal }),
        [isOpen, mode, email, openModal, closeModal],
    );

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
