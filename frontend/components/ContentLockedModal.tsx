"use client";

import { useContentLockedModal } from "@/context/ContentLockedModalContext";
import { Lock, X } from "lucide-react";
import UnlockActionButton from "./UnlockActionButton";

/**
 * Pop-up disparado ao clicar num card de conteúdo bloqueado — nunca navega
 * para o conteúdo. Mesmo padrão visual de MoveContentModal.tsx.
 */
export default function ContentLockedModal() {
    const { isOpen, view, closeModal } = useContentLockedModal();

    if (!isOpen || !view) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="content-locked-modal-title"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-md rounded-t-3xl border border-border bg-background p-6 text-center shadow-2xl sm:rounded-3xl"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={closeModal}
                    className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Fechar"
                >
                    <X className="size-5" />
                </button>

                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent">
                    <Lock className="size-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <h2 id="content-locked-modal-title" className="mt-5 font-serif text-2xl tracking-tight text-ink">
                    {view.modalTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{view.modalMessage}</p>

                <div className="mt-6">
                    <UnlockActionButton view={view} className="w-full justify-center" onAction={closeModal} />
                </div>
            </div>
        </div>
    );
}
