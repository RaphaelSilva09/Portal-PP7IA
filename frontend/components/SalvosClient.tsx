"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Lock, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { BLOCK_LABELS } from "@/domain/entities/BlockColors";
import type { ContentType } from "@/domain/entities/ContentItem";
import { blockIdForContentType } from "@/lib/explorarBlocks";

interface SavedContentItem {
    contentType: ContentType;
    contentId: string;
    title: string;
    href: string;
    createdAt: string;
}

export default function SalvosClient() {
    const { user } = useAuth();
    const { openModal } = useAuthModal();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["saved-content"],
        enabled: Boolean(user),
        queryFn: async () => {
            const res = await fetch("/api/saved-content");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return json.items as SavedContentItem[];
        },
    });

    if (!user) {
        return (
            <button
                type="button"
                onClick={() => openModal(undefined, "signup")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
            >
                <Lock className="size-3.5" aria-hidden="true" />
                Entrar para ver seus conteúdos salvos
            </button>
        );
    }

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Carregando…</p>;
    }

    if (error) {
        return <p className="text-sm text-muted-foreground">Não foi possível carregar seus conteúdos salvos. Tente novamente.</p>;
    }

    const items = data ?? [];

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <Bookmark className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Você ainda não salvou nada.</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                    Clique no ícone de marcador em qualquer conteúdo para lê-lo depois.
                </p>
            </div>
        );
    }

    const handleRemove = async (item: SavedContentItem) => {
        await fetch("/api/saved-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: item.contentType, contentId: item.contentId }),
        });
        queryClient.setQueryData<SavedContentItem[]>(["saved-content"], prev =>
            (prev ?? []).filter(i => !(i.contentType === item.contentType && i.contentId === item.contentId)));
    };

    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map(item => {
                const blockId = blockIdForContentType(item.contentType);
                return (
                    <li key={`${item.contentType}-${item.contentId}`}>
                        <article className="group relative flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-foreground/20 hover:shadow-[var(--shadow-card)]">
                            <div className="min-w-0 flex-1">
                                <span
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                                    style={{ backgroundColor: `var(--block-${blockId})`, color: `var(--block-${blockId}-on)` }}
                                >
                                    {BLOCK_LABELS[blockId]}
                                </span>
                                <Link href={item.href} className="mt-1.5 block after:absolute after:inset-0 after:rounded-2xl">
                                    <h3 className="line-clamp-2 font-serif text-base leading-[1.35] text-ink transition-colors group-hover:text-primary">
                                        {item.title}
                                    </h3>
                                </Link>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(item)}
                                aria-label="Remover dos salvos"
                                title="Remover dos salvos"
                                className="relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                            >
                                <X className="size-4" aria-hidden="true" />
                            </button>
                        </article>
                    </li>
                );
            })}
        </ul>
    );
}
