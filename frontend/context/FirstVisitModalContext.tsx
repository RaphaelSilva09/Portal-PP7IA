"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * FirstVisitModalContext
 *
 * Gerencia o estado do modal de primeiro acesso para inscrição.
 * Utiliza localStorage para detectar se é a primeira visita do usuário.
 *
 * Princípios aplicados:
 * - SRP: Único responsável pelo estado do modal de primeiro acesso
 * - Clean Architecture: Mantém lógica de UI separada da lógica de negócio
 * - Context Pattern: Evita prop drilling, facilita acesso global
 */

const STORAGE_KEY = "pp7ia_has_visited";

interface FirstVisitModalContextType {
    isOpen: boolean;
    closeModal: () => void;
}

const FirstVisitModalContext = createContext<FirstVisitModalContextType | undefined>(undefined);

export function FirstVisitModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Verifica se é a primeira visita após a montagem do componente
        const hasVisited = localStorage.getItem(STORAGE_KEY);

        if (!hasVisited) {
            // Pequeno delay para melhor UX - deixa a página carregar primeiro
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1500);

            return () => clearTimeout(timer);
        }

        setHasChecked(true);
    }, []);

    const closeModal = () => {
        setIsOpen(false);
        // Marca como visitado no localStorage
        localStorage.setItem(STORAGE_KEY, "true");
    };

    return (
        <FirstVisitModalContext.Provider value={{ isOpen, closeModal }}>
            {children}
        </FirstVisitModalContext.Provider>
    );
}

/**
 * Hook customizado para acessar o contexto do FirstVisitModal
 *
 * @throws {Error} Se usado fora do FirstVisitModalProvider
 * @returns {FirstVisitModalContextType} Estado e métodos do modal
 */
export function useFirstVisitModal() {
    const context = useContext(FirstVisitModalContext);

    if (!context) {
        throw new Error("useFirstVisitModal must be used within FirstVisitModalProvider");
    }

    return context;
}
