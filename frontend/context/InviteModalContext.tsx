"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * InviteModalContext
 *
 * Gerencia o estado global do modal de convites.
 *
 * Princípios aplicados:
 * - SRP: Único responsável pelo estado do InviteModal
 * - Context Pattern: Evita prop drilling, facilita acesso global
 */

interface InviteModalContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const InviteModalContext = createContext<InviteModalContextType | undefined>(undefined);

export function InviteModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <InviteModalContext.Provider value={{ isOpen, openModal, closeModal }}>
            {children}
        </InviteModalContext.Provider>
    );
}

/**
 * Hook customizado para acessar o contexto do InviteModal
 *
 * @throws {Error} Se usado fora do InviteModalProvider
 */
export function useInviteModal() {
    const context = useContext(InviteModalContext);

    if (!context) {
        throw new Error("useInviteModal must be used within InviteModalProvider");
    }

    return context;
}
