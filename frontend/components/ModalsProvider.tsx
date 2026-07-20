"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSearchModal } from "@/context/SearchModalContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import AuthModal from "./AuthModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import InviteModal from "./InviteModal";
import Portal from "./Portal";
import SearchModal from "./SearchModal";

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
    const {
        isOpen: isAuthOpen,
        initialData,
        initialMode,
        openModal: openAuthModal,
        closeModal: closeAuthModal,
    } = useAuthModal();
    const { isOpen: isInviteOpen, closeModal: closeInviteModal } = useInviteModal();

    // Ref para evitar processar os mesmos params múltiplas vezes
    const processedParams = useRef<Set<string>>(new Set());

    useEffect(() => {
        const authModalParam = searchParams.get("authModal");
        const accessToken = searchParams.get("access_token");
        const type = searchParams.get("type");

        // Cria uma chave única para os params atuais
        const paramsKey = `${authModalParam}-${accessToken}-${type}`;

        // Se já processamos esses params, não processa novamente
        if (processedParams.current.has(paramsKey)) {
            return;
        }

        if (authModalParam === "login") {
            // Rota protegida redirecionou (proxy.ts): guarda o destino para
            // o AuthModal retornar à página que o usuário tentou abrir.
            const next = searchParams.get("next");
            if (next?.startsWith("/")) {
                try { sessionStorage.setItem("pp7ias.auth-next", next); } catch { /* storage indisponível */ }
            }
            openAuthModal({}, "login");
            router.replace("/", { scroll: false });
            processedParams.current.add(paramsKey);
        }

        // LEGACY: Links de reset token antigos não são mais suportados
        // O fluxo agora é OTP-based (código de 8 dígitos)
        // Detecção de links antigos é feita em app/reset-password/page.tsx

        // Limpa params processados após um tempo para permitir novas ações
        const timeout = setTimeout(() => {
            processedParams.current.clear();
        }, 5000);

        return () => clearTimeout(timeout);
    }, [searchParams, openAuthModal, router]);

    return (
        <Portal>
            <SearchModal isOpen={isSearchOpen} onClose={closeSearchModal} />
            <ForgotPasswordModal />
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
