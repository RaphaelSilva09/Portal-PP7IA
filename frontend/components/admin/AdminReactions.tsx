"use client";

/**
 * AdminReactions Component (Presentation Layer)
 *
 * Visão agregada (v1 minimalista) das reações rápidas pós-leitura (PDF 6.4).
 */

import { REACTION_LABEL, REACTION_TYPES, ReactionCounts } from "@/domain/entities/ContentReaction";
import { useCallback, useEffect, useState } from "react";

interface TopReactedRow {
    contentType: string;
    contentId: string;
    counts: ReactionCounts;
    total: number;
}

export default function AdminReactions() {
    const [rows, setRows] = useState<TopReactedRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/reactions");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRows((await res.json()) as TopReactedRow[]);
        } catch (err) {
            console.error("Erro ao carregar reações:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-serif text-2xl tracking-tight text-ink">Reações por Conteúdo</h2>
                <p className="mt-1 text-sm text-muted-foreground">Conteúdos ordenados pelo total de reações recebidas.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Nenhuma reação registrada ainda.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Conteúdo</th>
                                    {REACTION_TYPES.map(r => (
                                        <th key={r} className="px-4 py-3 text-center text-muted-foreground text-sm font-medium">{REACTION_LABEL[r]}</th>
                                    ))}
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map(row => (
                                    <tr key={`${row.contentType}-${row.contentId}`} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-foreground">
                                            {row.contentType} <span className="text-muted-foreground">#{row.contentId}</span>
                                        </td>
                                        {REACTION_TYPES.map(r => (
                                            <td key={r} className="px-4 py-3 text-center text-sm text-muted-foreground">{row.counts[r]}</td>
                                        ))}
                                        <td className="px-4 py-3 text-center text-sm font-semibold text-foreground">{row.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
