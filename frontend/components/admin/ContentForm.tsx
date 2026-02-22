"use client";

/**
 * ContentForm Component (Presentation Layer)
 *
 * Formulário para criar e editar conteúdo.
 * Suporta upload de arquivos HTML e PDF.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo formulário de conteúdo
 * - Controlled Components: Estado gerenciado via React
 * - Composition: Recebe handlers via props
 */

import { GlassCard, GradientButton } from "@/components/ui";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { Upload } from "lucide-react";
import { useState } from "react";

interface ContentFormProps {
    type: ContentType;
    editItem?: ContentItem | null;
    onSubmit: (data: { title: string; readTime?: number; htmlFile?: File; pdfFile?: File }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ContentForm({ type, editItem, onSubmit, onCancel, isLoading }: ContentFormProps) {
    const [title, setTitle] = useState(editItem?.title || "");
    const [readTime, setReadTime] = useState(editItem?.readTime?.toString() || "");
    const [htmlFile, setHtmlFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const isEditing = Boolean(editItem);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await onSubmit({
            title,
            readTime: readTime ? parseInt(readTime, 10) : undefined,
            htmlFile: htmlFile || undefined,
            pdfFile: pdfFile || undefined,
        });
    };

    const typeLabel = {
        newsletter: "Newsletter",
        "mini-livro": "Mini-Livro",
        biblioteca: "Biblioteca",
        "especial-semana": "Especial da Semana",
    }[type];

    return (
        <GlassCard variant="elevated" padding="lg">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
                {isEditing ? `Editar ${typeLabel}` : `Nova ${typeLabel}`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Título *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg
                                   text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50
                                   focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50"
                        placeholder="Digite o título..."
                    />
                </div>

                {/* Tempo de Leitura */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Tempo de Leitura (minutos)
                    </label>
                    <input
                        type="number"
                        value={readTime}
                        onChange={e => setReadTime(e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg
                                   text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50
                                   focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50"
                        placeholder="Ex: 5"
                    />
                </div>

                {/* Upload HTML - apenas para criar */}
                {!isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Arquivo HTML
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".html"
                                onChange={e => setHtmlFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="html-upload"
                            />
                            <label
                                htmlFor="html-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3
                                           bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-glass)] rounded-lg
                                           text-[var(--text-secondary)] cursor-pointer hover:border-[var(--brand-blue)]/50 transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                {htmlFile ? htmlFile.name : "Selecionar arquivo HTML"}
                            </label>
                        </div>
                    </div>
                )}

                {/* Upload PDF - apenas para criar */}
                {!isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Arquivo PDF
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label
                                htmlFor="pdf-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3
                                           bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-glass)] rounded-lg
                                           text-[var(--text-secondary)] cursor-pointer hover:border-[var(--brand-orange)]/50 transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                {pdfFile ? pdfFile.name : "Selecionar arquivo PDF"}
                            </label>
                        </div>
                    </div>
                )}

                {/* Botões */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        Cancelar
                    </button>
                    <GradientButton type="submit" variant="cta" loading={isLoading} loadingText="Salvando...">
                        {isEditing ? "Salvar Alterações" : "Criar Material"}
                    </GradientButton>
                </div>
            </form>
        </GlassCard>
    );
}
