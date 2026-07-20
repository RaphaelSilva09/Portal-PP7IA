"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Lock, Sparkles, ThumbsDown, Wrench } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { emptyReactionCounts, REACTION_LABEL, REACTION_TYPES, ReactionCounts, ReactionType } from "@/domain/entities/ContentReaction";

interface ContentReactionsProps {
    contentType: string;
    contentId: string;
}

const REACTION_ICON: Record<ReactionType, typeof Lightbulb> = {
    fez_pensar: Lightbulb,
    apliquei: Wrench,
    quero_mais: Sparkles,
    nao_esperava: ThumbsDown,
};

export default function ContentReactions({ contentType, contentId }: ContentReactionsProps) {
    const { user } = useAuth();
    const { openModal } = useAuthModal();
    const [counts, setCounts] = useState<ReactionCounts>(emptyReactionCounts());
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/reactions/${contentType}/${contentId}`)
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (cancelled || !data) return;
                setCounts(data.counts ?? emptyReactionCounts());
                setUserReaction(data.userReaction ?? null);
            })
            .catch(() => {})
            .finally(() => !cancelled && setIsLoading(false));
        return () => { cancelled = true; };
    }, [contentType, contentId]);

    const handleClick = async (reaction: ReactionType) => {
        if (!user) {
            openModal(undefined, "signup");
            return;
        }
        // Otimista: aplica o toggle localmente antes da resposta do servidor
        const wasSelected = userReaction === reaction;
        setUserReaction(wasSelected ? null : reaction);
        setCounts(prev => {
            const next = { ...prev };
            if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
            if (!wasSelected) next[reaction] = next[reaction] + 1;
            return next;
        });

        try {
            const res = await fetch("/api/reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentType, contentId, reaction }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCounts(data.counts ?? emptyReactionCounts());
            setUserReaction(data.reaction ?? null);
        } catch {
            // Reverte em caso de falha
            setUserReaction(wasSelected ? reaction : null);
        }
    };

    if (isLoading) return null;

    return (
        <div className="border-t border-border/60 py-8">
            <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">O que você achou deste conteúdo?</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {REACTION_TYPES.map(reaction => {
                    const Icon = REACTION_ICON[reaction];
                    const isSelected = userReaction === reaction;
                    const count = counts[reaction];
                    return (
                        <button
                            key={reaction}
                            type="button"
                            onClick={() => handleClick(reaction)}
                            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                                isSelected
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                            }`}
                        >
                            {!user ? <Lock className="size-3.5" aria-hidden="true" /> : <Icon className="size-3.5" aria-hidden="true" />}
                            {REACTION_LABEL[reaction]}
                            {count > 0 && <span className="text-[10px] opacity-70">{count}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
