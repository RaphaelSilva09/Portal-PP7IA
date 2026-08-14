"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import type { ContentType } from "@/domain/entities/ContentItem";
import { cardConfigForContentType, ItemCard, type Item } from "@/components/explorar/ContentCards";

interface SavedContentItem {
    contentType: ContentType;
    contentId: string;
    title: string;
    href: string;
    createdAt: string;
    id: number;
    formattedDate: string;
    formattedNumber: string;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    readTime: number;
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

    const handleUnsave = (removed: SavedContentItem) => {
        queryClient.setQueryData<SavedContentItem[]>(["saved-content"], prev =>
            (prev ?? []).filter(i => !(i.contentType === removed.contentType && i.contentId === removed.contentId)));
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(saved => {
                const item: Item = {
                    id: saved.id,
                    title: saved.title,
                    htmlPath: saved.href,
                    pdfPath: null,
                    htmlAvailable: saved.htmlAvailable,
                    pdfAvailable: saved.pdfAvailable,
                    formattedDate: saved.formattedDate,
                    formattedNumber: saved.formattedNumber,
                    readTime: saved.readTime,
                };
                return (
                    <ItemCard
                        key={`${saved.contentType}-${saved.contentId}`}
                        item={item}
                        block={cardConfigForContentType(saved.contentType)}
                        contentType={saved.contentType}
                        initialSaved
                        onToggleSaved={savedNow => { if (!savedNow) handleUnsave(saved); }}
                    />
                );
            })}
        </div>
    );
}
