"use client";

import { BIBLIOTECA_TEMAS, BibliotecaTema } from "@/domain/entities/BibliotecaItem";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { AlertCircle, Upload } from "lucide-react";
import { useState } from "react";

interface ContentFormProps {
    type: ContentType;
    editItem?: ContentItem | null;
    onSubmit: (data: { title: string; readTime?: number; htmlFile?: File; pdfFile?: File; tema?: string; ebookId?: number | null }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    ebookId?: number | null;
}

export function ContentForm({ type, editItem, onSubmit, onCancel, isLoading, ebookId }: ContentFormProps) {
    const [title, setTitle] = useState(editItem?.title || "");
    const [readTime, setReadTime] = useState(editItem?.readTime?.toString() || "");
    const [tema, setTema] = useState<BibliotecaTema>((editItem?.tema as BibliotecaTema) || "diversos");
    const [htmlFile, setHtmlFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [formatError, setFormatError] = useState("");

    const isEditing = Boolean(editItem);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormatError("");
        if (!isEditing && !htmlFile && !pdfFile) {
            setFormatError("Envie pelo menos um formato (HTML ou PDF)");
            return;
        }
        await onSubmit({
            title,
            readTime: readTime ? parseInt(readTime, 10) : undefined,
            htmlFile: htmlFile || undefined,
            pdfFile: pdfFile || undefined,
            tema: type === "biblioteca" ? tema : undefined,
            ebookId: type === "mini-livro" ? (ebookId ?? null) : undefined,
        });
    };

    const typeLabel: Record<ContentType, string> = {
        newsletter: "Newsletter",
        "mini-livro": "Mini-livros",
        biblioteca: "Biblioteca",
        "especial-semana": "Especial da Semana",
        ebook: "E-book",
        radar_oportunidades: "Radar de Oportunidades",
        estudar: "Estudar",
    };

    const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-foreground/30";

    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {isEditing ? "Editar" : "Novo"}
            </p>
            <h2 className="mb-6 font-serif text-2xl tracking-tight text-ink">
                {typeLabel[type] ?? type}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Título */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Título *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Digite o título…"
                    />
                </div>

                {/* Tempo de Leitura */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Tempo de Leitura (minutos)
                    </label>
                    <input
                        type="number"
                        value={readTime}
                        onChange={e => setReadTime(e.target.value)}
                        min="1"
                        className={inputClass}
                        placeholder="Ex: 5"
                    />
                </div>

                {/* Tema (Biblioteca only) */}
                {type === "biblioteca" && (
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            Tema *
                        </label>
                        <select
                            value={tema}
                            onChange={e => setTema(e.target.value as BibliotecaTema)}
                            required
                            className={inputClass}
                        >
                            {BIBLIOTECA_TEMAS.map(({ slug, label }) => (
                                <option key={slug} value={slug}>{label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Upload HTML */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        {isEditing ? "Novo HTML (opcional)" : "Arquivo HTML"}
                    </label>
                    {isEditing && editItem?.htmlPath && (
                        <p className="text-[11px] text-muted-foreground">
                            Atual: {editItem.htmlPath.split("/").pop()}
                        </p>
                    )}
                    <input type="file" accept=".html" onChange={e => setHtmlFile(e.target.files?.[0] || null)} className="hidden" id="html-upload" />
                    <label
                        htmlFor="html-upload"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <Upload className="size-4" />
                        {htmlFile ? htmlFile.name : isEditing ? "Substituir HTML" : "Selecionar HTML"}
                    </label>
                </div>

                {/* Upload PDF */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        {isEditing ? "Novo PDF (opcional)" : "Arquivo PDF"}
                    </label>
                    {isEditing && editItem?.pdfPath && (
                        <p className="text-[11px] text-muted-foreground">
                            Atual: {editItem.pdfPath.split("/").pop()}
                        </p>
                    )}
                    <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="hidden" id="pdf-upload" />
                    <label
                        htmlFor="pdf-upload"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <Upload className="size-4" />
                        {pdfFile ? pdfFile.name : isEditing ? "Substituir PDF" : "Selecionar PDF"}
                    </label>
                </div>

                {/* Error */}
                {formatError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
                        <AlertCircle className="size-4 shrink-0 text-red-500" />
                        <p className="text-sm text-red-500">{formatError}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/80 disabled:opacity-50"
                    >
                        {isLoading ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Material"}
                    </button>
                </div>
            </form>
        </div>
    );
}
