"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * SearchModalContext
 * 
 * Gerencia o estado global do modal de pesquisa.
 * 
 * Princípios aplicados:
 * - SRP: Único responsável pelo estado do SearchModal
 * - Clean Architecture: Mantém lógica de UI separada da lógica de negócio
 * - Context Pattern: Evita prop drilling, facilita acesso global
 * 
 * @example
 * // Em qualquer componente filho do Provider:
 * const { isOpen, openModal, closeModal } = useSearchModal();
 * 
 * <button onClick={openModal}>Abrir Pesquisa</button>
 */

interface SearchModalContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined);

export function SearchModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <SearchModalContext.Provider value={{ isOpen, openModal, closeModal }}>
            {children}
        </SearchModalContext.Provider>
    );
}

/**
 * Hook customizado para acessar o contexto do SearchModal
 * 
 * @throws {Error} Se usado fora do SearchModalProvider
 * @returns {SearchModalContextType} Estado e métodos do modal
 */
export function useSearchModal() {
    const context = useContext(SearchModalContext);
    
    if (!context) {
        throw new Error("useSearchModal must be used within SearchModalProvider");
    }
    
    return context;
}
