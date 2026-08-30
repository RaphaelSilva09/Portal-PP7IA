"use client";

import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { BIBLIOTECA_TEMAS } from "@/domain/entities/BibliotecaItem";
import { ArrowRightLeft, FileText, Lock, LockOpen, Pencil, Trash2 } from "lucide-react";

/** Selo "Bloqueado"/"Livre" — mesma leitura rápida em ContentTable e SortableContentTable. */
export function AccessStatusBadge({ item }: { item: ContentItem }) {
    if (item.accessRule) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Lock className="size-3" aria-hidden="true" />
                Bloqueado
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-muted-foreground/70">
            <LockOpen className="size-3" aria-hidden="true" />
            Livre
        </span>
    );
}

interface ContentTableProps {
    items: ContentItem[];
    onEdit: (item: ContentItem) => void;
    onMove?: (item: ContentItem) => void;
    onConfigureAccess?: (item: ContentItem) => void;
    onDelete: (item: ContentItem) => void;
    lastUpdated?: Date | null;
    type?: ContentType;
}

export function ContentTable({ items, onEdit, onMove, onConfigureAccess, onDelete, lastUpdated, type }: ContentTableProps) {
    const isBiblioteca = type === "biblioteca";

    const getTemaLabel = (tema: string | null | undefined): string => {
        if (!tema) return "—";
        return BIBLIOTECA_TEMAS.find(t => t.slug === tema)?.label ?? tema;
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {lastUpdated && (
                <div className="border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
                    Atualizado em{" "}
                    {lastUpdated.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-accent">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Título</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leitura</th>
                            {isBiblioteca && (
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tema</th>
                            )}
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">HTML</th>
                            {onConfigureAccess && (
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acesso</th>
                            )}
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map(item => (
                            <tr key={item.id} className="transition-colors hover:bg-accent/50">
                                <td className="px-4 py-3 font-mono text-muted-foreground">{item.formattedNumber}</td>
                                <td className="px-4 py-3 text-foreground">{item.title}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {item.readTime ? `${item.readTime} min` : "—"}
                                </td>
                                {isBiblioteca && (
                                    <td className="px-4 py-3 text-muted-foreground">{getTemaLabel(item.tema)}</td>
                                )}
                                <td className="px-4 py-3 text-center">
                                    {item.htmlAvailable ? (
                                        <FileText className="mx-auto size-4 text-green-500" />
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </td>
                                {onConfigureAccess && (
                                    <td className="px-4 py-3">
                                        <AccessStatusBadge item={item} />
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                            aria-label="Editar"
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                        {onMove && (
                                            <button
                                                onClick={() => onMove(item)}
                                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                                aria-label="Mover para outro bloco"
                                            >
                                                <ArrowRightLeft className="size-3.5" />
                                            </button>
                                        )}
                                        {onConfigureAccess && (
                                            <button
                                                onClick={() => onConfigureAccess(item)}
                                                className={
                                                    item.accessRule
                                                        ? "rounded-lg p-2 text-amber-500 transition-colors hover:bg-amber-500/10"
                                                        : "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                                }
                                                aria-label="Configurar acesso"
                                            >
                                                <Lock className="size-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                                            aria-label="Deletar"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
