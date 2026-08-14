"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

interface SaveForLaterButtonProps {
    contentType: string;
    contentId: string;
    /** Quando já se sabe o estado salvo (ex.: renderizado a partir de /api/saved-content), pula a checagem no mount. */
    initialSaved?: boolean;
    /** Chamado após um toggle bem-sucedido — usado em /salvos para remover o card da lista ao desmarcar. */
    onToggle?: (saved: boolean) => void;
}

export default function SaveForLaterButton({ contentType, contentId, initialSaved, onToggle }: SaveForLaterButtonProps) {
    const { user } = useAuth();
    const { openModal } = useAuthModal();
    const [isSaved, setIsSaved] = useState(initialSaved ?? false);
    const [isLoading, setIsLoading] = useState(initialSaved === undefined);

    useEffect(() => {
        if (initialSaved !== undefined) return;
        if (!user) {
            setIsLoading(false);
            return;
        }
        let cancelled = false;
        fetch(`/api/saved-content/${contentType}/${contentId}`)
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (cancelled || !data) return;
                setIsSaved(Boolean(data.saved));
            })
            .catch(() => {})
            .finally(() => !cancelled && setIsLoading(false));
        return () => { cancelled = true; };
    }, [contentType, contentId, user, initialSaved]);

    const handleClick = async () => {
        if (!user) {
            openModal(undefined, "signup");
            return;
        }
        const wasSaved = isSaved;
        setIsSaved(!wasSaved);

        try {
            const res = await fetch("/api/saved-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentType, contentId }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const saved = Boolean(data.saved);
            setIsSaved(saved);
            onToggle?.(saved);
        } catch {
            setIsSaved(wasSaved);
        }
    };

    if (isLoading) return null;

    const Icon = isSaved ? BookmarkCheck : Bookmark;

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remover de ler depois" : "Marcar para ler depois"}
            title={isSaved ? "Remover de ler depois" : "Marcar para ler depois"}
            className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
            <Icon className="size-4" aria-hidden="true" />
        </button>
    );
}
