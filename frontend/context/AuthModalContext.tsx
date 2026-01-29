"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * AuthModalContext
 *
 * Gerencia o estado global do modal de autenticação.
 * Permite abrir o modal com dados pré-preenchidos de qualquer componente.
 *
 * Princípios aplicados:
 * - SRP: Único responsável pelo estado do AuthModal
 * - Clean Architecture: Mantém lógica de UI separada da lógica de negócio
 * - Context Pattern: Evita prop drilling, facilita acesso global
 */

interface AuthModalInitialData {
    email?: string;
    celular?: string;
}

interface AuthModalContextType {
    isOpen: boolean;
    initialData: AuthModalInitialData;
    initialMode: "login" | "signup";
    openModal: (data?: AuthModalInitialData, mode?: "login" | "signup") => void;
    closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialData, setInitialData] = useState<AuthModalInitialData>({});
    const [initialMode, setInitialMode] = useState<"login" | "signup">("signup");

    const openModal = (data?: AuthModalInitialData, mode?: "login" | "signup") => {
        setInitialData(data || {});
        setInitialMode(mode || "signup");
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setInitialData({});
    };

    return (
        <AuthModalContext.Provider value={{ isOpen, initialData, initialMode, openModal, closeModal }}>
            {children}
        </AuthModalContext.Provider>
    );
}

/**
 * Hook customizado para acessar o contexto do AuthModal
 *
 * @throws {Error} Se usado fora do AuthModalProvider
 * @returns {AuthModalContextType} Estado e métodos do modal
 */
export function useAuthModal() {
    const context = useContext(AuthModalContext);

    if (!context) {
        throw new Error("useAuthModal must be used within AuthModalProvider");
    }

    return context;
}
