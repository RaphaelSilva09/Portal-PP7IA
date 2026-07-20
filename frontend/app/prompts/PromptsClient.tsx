"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { AI_TOOLS } from "@/domain/entities/PromptLibraryItem";

interface PromptItem {
    id: number;
    aiTool: string;
    title: string;
    promptBody: string | null;
    useCase: string;
    isGated: boolean;
}

function PromptCard({ item }: { item: PromptItem }) {
    const { openModal } = useAuthModal();
    const isTeaser = item.promptBody === null;

    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{item.aiTool}</p>
            <p className="mt-1.5 text-sm font-medium text-foreground">{item.title}</p>
            {item.useCase && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.useCase}</p>}

            {isTeaser ? (
                <button
                    type="button"
                    onClick={() => openModal(undefined, "signup")}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
                >
                    <Lock className="size-3" aria-hidden="true" />
                    Entrar para ver o prompt completo
                </button>
            ) : (
                <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-accent/50 p-3 text-xs leading-relaxed text-foreground">
                    {item.promptBody}
                </pre>
            )}
        </div>
    );
}

export default function PromptsClient() {
    const { user } = useAuth();
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["prompt-library"],
        queryFn: async () => {
            const res = await fetch("/api/content/prompt-library");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as PromptItem[];
        },
    });

    // Sessão muda depois do fetch inicial (ex.: usuário loga no modal) — refaz
    // a consulta pra trocar teaser por corpo completo sem precisar recarregar.
    useEffect(() => {
        refetch();
    }, [user, refetch]);

    const items = data ?? [];
    const filtered = activeTool ? items.filter(item => item.aiTool === activeTool) : items;

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Carregando prompts…</p>;
    }

    if (error) {
        return <p className="text-sm text-muted-foreground">Não foi possível carregar os prompts. Tente novamente.</p>;
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Nenhum prompt publicado ainda.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTool(null)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeTool === null
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Todos
                </button>
                {AI_TOOLS.map(tool => (
                    <button
                        key={tool}
                        type="button"
                        onClick={() => setActiveTool(tool)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTool === tool
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {tool}
                    </button>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(item => (
                    <PromptCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
