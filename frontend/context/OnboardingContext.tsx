"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * Estado do tour de onboarding do portal — distinto do FirstVisitModalContext
 * (nudge de cadastro para visitantes anônimos). Dispara automaticamente uma
 * única vez, no primeiro login (gate server-side via /api/user/onboarding),
 * e pode ser repetido manualmente a qualquer momento pelo perfil.
 */
interface OnboardingContextType {
    isOpen: boolean;
    openOnboarding: () => void;
    closeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (isLoading || !user || hasChecked.current) return;
        hasChecked.current = true;
        fetch("/api/user/onboarding")
            .then(res => (res.ok ? res.json() : { completed: true }))
            .then((data: { completed: boolean }) => {
                if (!data.completed) setIsOpen(true);
            })
            .catch(() => {
                // Falha ao checar o status não deve travar a navegação — só não mostra o tour.
            });
    }, [user, isLoading]);

    const openOnboarding = useCallback(() => setIsOpen(true), []);

    const closeOnboarding = useCallback(() => {
        setIsOpen(false);
        fetch("/api/user/onboarding", { method: "POST" }).catch(() => {});
    }, []);

    return (
        <OnboardingContext.Provider value={{ isOpen, openOnboarding, closeOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding(): OnboardingContextType {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding deve ser usado dentro de um OnboardingProvider");
    }
    return context;
}
