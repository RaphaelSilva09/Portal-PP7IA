"use client";

import { listAccessRuleStrategies } from "@/domain/access-rules/registry";
import { ContentItem } from "@/domain/entities/ContentItem";
import { extractSlugFromStoragePath } from "@/lib/contentSlug";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ContentAccessRuleModalProps {
    isOpen: boolean;
    item: ContentItem | null;
    /** Tipo de conteúdo da aba atual do admin (ex.: "newsletter") — não vem do item, que usa a entidade genérica. */
    contentType: string;
    onCancel: () => void;
    onSaved: () => void;
}

/**
 * Configura (ou remove) a regra de bloqueio de um conteúdo — mesmo padrão
 * visual de MoveContentModal.tsx. O seletor de tipo de regra lista o que o
 * registry de domínio expõe (`listAccessRuleStrategies`); um tipo novo
 * aparece aqui automaticamente, sem precisar tocar este componente.
 */
export function ContentAccessRuleModal({ isOpen, item, contentType, onCancel, onSaved }: ContentAccessRuleModalProps) {
    const strategies = listAccessRuleStrategies();
    const [ruleType, setRuleType] = useState<string>(strategies[0]?.type ?? "");
    const [currentRuleType, setCurrentRuleType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slug = item ? extractSlugFromStoragePath(item.toObject().htmlPath) : null;

    useEffect(() => {
        if (!isOpen || !slug) {
            setCurrentRuleType(null);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        fetch(`/api/admin/content-access-rules/${encodeURIComponent(contentType)}/${encodeURIComponent(slug)}`)
            .then(res => res.json())
            .then((data: { rule: { ruleType: string } | null }) => {
                setCurrentRuleType(data.rule?.ruleType ?? null);
                setRuleType(data.rule?.ruleType ?? strategies[0]?.type ?? "");
            })
            .catch(() => setError("Não foi possível carregar a regra atual."))
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, slug, contentType]);

    if (!isOpen || !item) return null;

    const request = async (init: RequestInit) => {
        if (!slug) return;
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/admin/content-access-rules/${encodeURIComponent(contentType)}/${encodeURIComponent(slug)}`,
                init,
            );
            if (!res.ok) throw new Error();
            onSaved();
        } catch {
            setError("Não foi possível salvar. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = () => {
        if (!ruleType) return;
        void request({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ruleType, params: {} }),
        });
    };

    const handleRemove = () => {
        void request({ method: "DELETE" });
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-rule-modal-title"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-md rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between px-6 pb-0 pt-6">
                    <h2 id="access-rule-modal-title" className="pr-8 font-serif text-2xl tracking-tight text-ink">
                        Acesso a &quot;{item.title}&quot;
                    </h2>
                    <button
                        onClick={onCancel}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Fechar"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mx-6 mt-4 h-px bg-border" />

                <div className="space-y-4 px-6 py-5">
                    {!slug ? (
                        <p className="text-sm text-muted-foreground">
                            Este item ainda não tem um arquivo HTML publicado — não é possível configurar acesso antes disso.
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            <label
                                htmlFor="access-rule-type"
                                className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
                            >
                                Tipo de bloqueio
                            </label>
                            <select
                                id="access-rule-type"
                                value={ruleType}
                                onChange={e => setRuleType(e.target.value)}
                                disabled={isLoading}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30"
                            >
                                {strategies.map(strategy => (
                                    <option key={strategy.type} value={strategy.type}>
                                        {strategy.adminLabel}
                                    </option>
                                ))}
                            </select>
                            {currentRuleType && (
                                <p className="text-xs text-muted-foreground">Este conteúdo está bloqueado hoje.</p>
                            )}
                        </div>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
                    >
                        Cancelar
                    </button>
                    {currentRuleType && (
                        <button
                            onClick={handleRemove}
                            disabled={isSaving}
                            className="flex-1 rounded-full border border-red-300 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Remover bloqueio
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!slug || !ruleType || isSaving}
                        className="flex-1 rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSaving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
