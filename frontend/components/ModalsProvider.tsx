"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchModal from "./SearchModal";
import FirstVisitModal from "./FirstVisitModal";
import AuthModal from "./AuthModal";
import InviteModal from "./InviteModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import Portal from "./Portal";
import { useSearchModal } from "@/context/SearchModalContext";
import { useFirstVisitModal } from "@/context/FirstVisitModalContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useForgotPasswordModal } from "@/context/ForgotPasswordModalContext";

/**
 * ModalsProvider Component
 *
 * Centraliza a renderização de todos os modais da aplicação.
 * Utiliza Portal para renderizar modais diretamente no body, escapando
 * do contexto de stacking do layout principal.
 *
 * Detecta query param ?authModal=login para abrir o modal de login
 * automaticamente (usado pelo middleware ao redirecionar rotas protegidas).
 *
 * Princípios aplicados:
 * - SRP: Única responsabilidade é renderizar modais
 * - OCP: Aberto para extensão (novos modais), fechado para modificação
 * - Clean Architecture: Camada de apresentação independente
 */
export default function ModalsProvider() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isOpen: isSearchOpen, closeModal: closeSearchModal } = useSearchModal();
    const { isOpen: isFirstVisitOpen, closeModal: closeFirstVisitModal } = useFirstVisitModal();
    const { isOpen: isAuthOpen, initialData, initialMode, openModal: openAuthModal, closeModal: closeAuthModal } = useAuthModal();
    const { isOpen: isInviteOpen, closeModal: closeInviteModal } = useInviteModal();
    const { isOpen: isForgotPasswordOpen, mode: forgotPasswordMode, openModal: openForgotPasswordModal } = useForgotPasswordModal();

    useEffect(() => {
        const authModalParam = searchParams.get("authModal");
        const resetTokenParam = searchParams.get("resetToken");
        
        if (authModalParam === "login") {
            openAuthModal({}, "login");
            router.replace("/", { scroll: false });
        }
        
        if (resetTokenParam) {
            openForgotPasswordModal("reset");
            router.replace("/", { scroll: false });
        }
    }, [searchParams, openAuthModal, openForgotPasswordModal, router]);

    return (
        <Portal>
            <SearchModal isOpen={isSearchOpen} onClose={closeSearchModal} />
            <ForgotPasswordModal />
            <FirstVisitModal isOpen={isFirstVisitOpen} onClose={closeFirstVisitModal} />
            <AuthModal
                isOpen={isAuthOpen}
                onClose={closeAuthModal}
                initialMode={initialMode}
                initialData={initialData}
            />
            <InviteModal isOpen={isInviteOpen} onClose={closeInviteModal} />
        </Portal>
    );
}
