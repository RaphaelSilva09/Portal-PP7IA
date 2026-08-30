"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";

/**
 * ContentLockedModalContext
 *
 * Estado global do pop-up de "conteúdo bloqueado" — aberto pelo card de um
 * item com `accessRule`, no lugar de navegar para o conteúdo. Mesmo padrão
 * de AuthModalContext.tsx.
 */

interface ContentLockedModalContextType {
    isOpen: boolean;
    view: AccessRuleView | null;
    openModal: (view: AccessRuleView) => void;
    closeModal: () => void;
}

const ContentLockedModalContext = createContext<ContentLockedModalContextType | undefined>(undefined);

export function ContentLockedModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<AccessRuleView | null>(null);

    const openModal = useCallback((nextView: AccessRuleView) => {
        setView(nextView);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(
        () => ({ isOpen, view, openModal, closeModal }),
        [isOpen, view, openModal, closeModal],
    );

    return <ContentLockedModalContext.Provider value={contextValue}>{children}</ContentLockedModalContext.Provider>;
}

export function useContentLockedModal() {
    const context = useContext(ContentLockedModalContext);

    if (!context) {
        throw new Error("useContentLockedModal must be used within ContentLockedModalProvider");
    }

    return context;
}
