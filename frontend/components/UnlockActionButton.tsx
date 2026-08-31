"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface UnlockActionButtonProps {
    view: AccessRuleView;
    className?: string;
    /** Chamado depois de disparar a ação — ex.: o pop-up de bloqueio se fecha ao abrir o login. */
    onAction?: () => void;
}

const defaultClassName =
    "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background transition hover:bg-primary";

/**
 * Botão de "fácil acesso" para desbloquear um conteúdo — compartilhado entre
 * o pop-up de bloqueio (ContentLockedModal) e a página de acesso negado
 * (ContentLocked, em ViewContentFrame.tsx). Único ponto que sabe traduzir
 * `unlockAction.kind` numa ação de verdade — cada regra de acesso nova só
 * precisa declarar um `unlockAction` já suportado aqui, ou estender esta
 * função quando a ação for genuinamente nova.
 */
export default function UnlockActionButton({ view, className, onAction }: UnlockActionButtonProps) {
    const { openModal: openAuthModal } = useAuthModal();

    const handleClick = () => {
        switch (view.unlockAction.kind) {
            case "open-auth-modal":
                openAuthModal({}, view.unlockAction.mode);
                break;
            case "retry":
                window.location.reload();
                break;
        }
        onAction?.();
    };

    const Icon = view.unlockAction.kind === "retry" ? RotateCcw : undefined;

    return (
        <button type="button" onClick={handleClick} className={cn(defaultClassName, className)}>
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {view.unlockButtonLabel}
        </button>
    );
}
