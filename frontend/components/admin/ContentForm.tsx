"use client";

/**
 * ContentForm Component (Presentation Layer)
 *
 * Formulário para criar e editar conteúdo.
 * Suporta upload de arquivos HTML e PDF (criar e editar).
 *
 * Regras de negócio:
 * - Criar: Título + ReadTime + Pelo menos 1 formato (HTML ou PDF ou ambos)
 * - Editar: Título + ReadTime + Formatos opcionais (mantém existentes se não enviar novos)
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo formulário de conteúdo
 * - Controlled Components: Estado gerenciado via React
 * - Validation: Cliente-side antes de submit
 */

import { GlassCard, GradientButton } from "@/components/ui";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { AlertCircle, Upload } from "lucide-react";
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
    const [formatError, setFormatError] = useState("");

    const isEditing = Boolean(editItem);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormatError("");

        // Validação: Ao criar, pelo menos um formato é obrigatório
        if (!isEditing && !htmlFile && !pdfFile) {
            setFormatError("Envie pelo menos um formato (HTML ou PDF)");
            return;
        }

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
        ebook: "E-book",
        radar_oportunidades: "Radar de Oportunidades",
        estudar: "Estudar",
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

                {/* Upload HTML */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {isEditing ? "Upload Novo HTML (opcional)" : "Arquivo HTML"}
                    </label>

                    {/* Mostrar arquivo atual ao editar */}
                    {isEditing && editItem?.htmlPath && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-[var(--brand-green)]">
                            <AlertCircle className="w-4 h-4" />
                            <span>Arquivo HTML atual: {editItem.htmlPath.split("/").pop()}</span>
                        </div>
                    )}

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
                            {htmlFile
                                ? htmlFile.name
                                : isEditing
                                  ? "Escolher novo HTML (substitui o atual)"
                                  : "Selecionar arquivo HTML"}
                        </label>
                    </div>
                </div>

                {/* Upload PDF */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {isEditing ? "Upload Novo PDF (opcional)" : "Arquivo PDF"}
                    </label>

                    {/* Mostrar arquivo atual ao editar */}
                    {isEditing && editItem?.pdfPath && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-[var(--brand-green)]">
                            <AlertCircle className="w-4 h-4" />
                            <span>Arquivo PDF atual: {editItem.pdfPath.split("/").pop()}</span>
                        </div>
                    )}

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
                            {pdfFile
                                ? pdfFile.name
                                : isEditing
                                  ? "Escolher novo PDF (substitui o atual)"
                                  : "Selecionar arquivo PDF"}
                        </label>
                    </div>
                </div>

                {/* Mensagem de erro de validação */}
                {formatError && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-lg text-red-400 font-medium">{formatError}</p>
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
