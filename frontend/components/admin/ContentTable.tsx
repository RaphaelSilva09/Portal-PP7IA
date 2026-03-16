"use client";

/**
 * ContentTable Component (Presentation Layer)
 *
 * Tabela de conteúdos com ações de editar e deletar.
 * Exibe informações de forma clara e acessível.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por exibir tabela de conteúdos
 * - Composition: Recebe handlers via props
 * - Accessibility: Labels e aria-labels adequados
 */

import { GlassCard } from "@/components/ui";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { BIBLIOTECA_TEMAS } from "@/domain/entities/BibliotecaItem";
import { File, FileText, Pencil, Trash2 } from "lucide-react";

interface ContentTableProps {
    items: ContentItem[];
    onEdit: (item: ContentItem) => void;
    onDelete: (item: ContentItem) => void;
    lastUpdated?: Date | null;
    type?: ContentType;
}

export function ContentTable({ items, onEdit, onDelete, lastUpdated, type }: ContentTableProps) {
    const isBiblioteca = type === "biblioteca";

    const getTemaLabel = (tema: string | null | undefined): string => {
        if (!tema) return "-";
        return BIBLIOTECA_TEMAS.find(t => t.slug === tema)?.label ?? tema;
    };

    return (
        <GlassCard variant="bordered" padding="none">
            {lastUpdated && (
                <div className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-glass)]">
                    Última atualização:{" "}
                    {lastUpdated.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[var(--surface-glass)]">
                        <tr>
                            <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">ID</th>
                            <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                Título
                            </th>
                            <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                Leitura
                            </th>
                            {isBiblioteca && (
                                <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                    Tema
                                </th>
                            )}
                            <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium">
                                HTML
                            </th>
                            <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium">
                                PDF
                            </th>
                            <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-glass)]">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-[var(--surface-glass)]/50 transition-colors">
                                <td className="px-4 py-3 text-[var(--text-primary)] font-mono">
                                    {item.formattedNumber}
                                </td>
                                <td className="px-4 py-3 text-[var(--text-primary)]">{item.title}</td>
                                <td className="px-4 py-3 text-[var(--text-secondary)]">
                                    {item.readTime ? `${item.readTime} min` : "-"}
                                </td>
                                {isBiblioteca && (
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                                        {getTemaLabel(item.tema)}
                                    </td>
                                )}
                                <td className="px-4 py-3 text-center">
                                    {item.htmlAvailable ? (
                                        <FileText className="w-5 h-5 text-[var(--brand-green)] mx-auto" />
                                    ) : (
                                        <span className="text-[var(--text-secondary)]">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.pdfAvailable ? (
                                        <File className="w-5 h-5 text-[var(--brand-orange)] mx-auto" />
                                    ) : (
                                        <span className="text-[var(--text-secondary)]">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-2 rounded-lg hover:bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] transition-colors"
                                            aria-label="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                            aria-label="Deletar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
