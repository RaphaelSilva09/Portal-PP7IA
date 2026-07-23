"use client";

/**
 * EbookForm Component (Presentation Layer)
 *
 * Formulário especializado para criar e editar E-books.
 * Suporta campos específicos de ebook: subtítulo, descrição, badge,
 * e 4 tipos de upload (intro HTML, intro PDF, capa imagem, capa PDF).
 *
 * Regras de negócio:
 * - Criar: Título obrigatório + pelo menos uma capa (imagem ou intro HTML)
 * - Editar: Todos os campos opcionais (mantém existentes se não enviar novos)
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo formulário de ebook
 * - Controlled Components: Estado gerenciado via React
 * - Validation: Cliente-side antes de submit
 */


import type { ContentItem } from "@/domain/entities/ContentItem";
import { EBOOK_PART_SLUGS } from "@/infrastructure/config/storage.config";
import { AlertCircle, Upload, X } from "lucide-react";
import { useState } from "react";

export interface EbookFormData {
    title: string;
    order?: number;
    subtitle?: string;
    description?: string;
    badgeText?: string;
    readTime?: number;
    introHtmlFile?: File;
    introPdfFile?: File;
    coverImageFile?: File;
    coverPdfFile?: File;
}

interface EbookFormProps {
    editItem?: ContentItem | null;
    onSubmit: (data: EbookFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const INPUT_CLASS = `w-full px-4 py-3 bg-card border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-foreground/20`;

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";

interface FileUploadFieldProps {
    id: string;
    label: string;
    accept: string;
    file: File | null;
    existingPath?: string | null;
    onChange: (file: File | null) => void;
    isEditing: boolean;
}

function FileUploadField({ id, label, accept, file, existingPath, onChange, isEditing }: FileUploadFieldProps) {
    return (
        <div>
            <label className={LABEL_CLASS}>{label}</label>

            {isEditing && existingPath && (
                <div className="mb-2 flex items-center gap-2 text-sm text-green-500">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">Atual: {existingPath.split("/").pop()}</span>
                </div>
            )}

            <div className="relative">
                <input
                    type="file"
                    accept={accept}
                    onChange={e => onChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id={id}
                />
                <label
                    htmlFor={id}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3
                               bg-card border-2 border-dashed border-border rounded-lg
                               text-muted-foreground cursor-pointer hover:border-foreground/30 transition-colors"
                >
                    <Upload className="w-5 h-5 shrink-0" />
                    <span className="truncate">
                        {file
                            ? file.name
                            : isEditing
                                ? `Escolher novo ${label.replace(/\s*\(.*\)/, "")} (substitui o atual)`
                                : `Selecionar ${label.replace(/\s*\(.*\)/, "")}`}
                    </span>
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Remover arquivo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function EbookForm({ editItem, onSubmit, onCancel, isLoading }: EbookFormProps) {
    const [title, setTitle] = useState(editItem?.title || "");
    const [order, setOrder] = useState<string>("");
    const [subtitle, setSubtitle] = useState(editItem?.subtitle || "");
    const [description, setDescription] = useState(editItem?.description || "");
    const [badgeText, setBadgeText] = useState(editItem?.badgeText || "");
    const [readTime, setReadTime] = useState(editItem?.readTime?.toString() || "");

    const [introHtmlFile, setIntroHtmlFile] = useState<File | null>(null);
    const [introPdfFile, setIntroPdfFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverPdfFile, setCoverPdfFile] = useState<File | null>(null);

    const [formatError, setFormatError] = useState("");

    const isEditing = Boolean(editItem);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormatError("");

        // Validação: Ao criar, Parte obrigatória
        if (!isEditing && !order) {
            setFormatError("Selecione a Parte do e-book (I, II ou III)");
            return;
        }

        // Validação: Ao criar, pelo menos intro HTML ou capa imagem
        if (!isEditing && !introHtmlFile && !coverImageFile) {
            setFormatError("Envie pelo menos o HTML de introdução ou a imagem de capa");
            return;
        }

        await onSubmit({
            title,
            order: order ? parseInt(order, 10) : undefined,
            subtitle: subtitle || undefined,
            description: description || undefined,
            badgeText: badgeText || undefined,
            readTime: readTime ? parseInt(readTime, 10) : undefined,
            introHtmlFile: introHtmlFile || undefined,
            introPdfFile: introPdfFile || undefined,
            coverImageFile: coverImageFile || undefined,
            coverPdfFile: coverPdfFile || undefined,
        });
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
                {isEditing ? "Editar E-book" : "Novo E-book"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                    <label className={LABEL_CLASS}>Título *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className={INPUT_CLASS}
                        placeholder="Digite o título do e-book..."
                    />
                </div>

                {/* Parte — só exibe ao criar (ao editar, order não muda) */}
                {!isEditing && (
                    <div>
                        <label className={LABEL_CLASS}>Parte *</label>
                        <select
                            value={order}
                            onChange={e => setOrder(e.target.value)}
                            required
                            className={INPUT_CLASS}
                        >
                            <option value="">Selecione a parte...</option>
                            <option value="1">Parte I — Liderança Híbrida</option>
                            <option value="2">Parte II — A Coragem de Executar</option>
                            <option value="3">Parte III — O Que Fica</option>
                        </select>
                        {order && (
                            <p className="mt-1 text-xs text-muted-foreground/60 font-mono">
                                Pasta no bucket: mini-livros/ebook/{EBOOK_PART_SLUGS[parseInt(order)]}/
                            </p>
                        )}
                    </div>
                )}

                {/* Subtítulo */}
                <div>
                    <label className={LABEL_CLASS}>Subtítulo</label>
                    <input
                        type="text"
                        value={subtitle}
                        onChange={e => setSubtitle(e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="Subtítulo opcional..."
                    />
                </div>

                {/* Descrição */}
                <div>
                    <label className={LABEL_CLASS}>Descrição</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className={`${INPUT_CLASS} resize-y`}
                        placeholder="Descrição do e-book..."
                    />
                </div>

                {/* Badge */}
                <div>
                    <label className={LABEL_CLASS}>Texto do Badge</label>
                    <input
                        type="text"
                        value={badgeText}
                        onChange={e => setBadgeText(e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="Ex: Novo, Premium, Exclusivo..."
                    />
                </div>

                {/* Tempo de Leitura */}
                <div>
                    <label className={LABEL_CLASS}>Tempo de Leitura (minutos)</label>
                    <input
                        type="number"
                        value={readTime}
                        onChange={e => setReadTime(e.target.value)}
                        min="1"
                        className={INPUT_CLASS}
                        placeholder="Ex: 30"
                    />
                </div>

                {/* Separador de arquivos */}
                <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                        Arquivos do E-book
                    </p>

                    <div className="space-y-5">
                        {/* Intro HTML */}
                        <FileUploadField
                            id="intro-html-upload"
                            label={isEditing ? "HTML de Introdução (opcional)" : "HTML de Introdução"}
                            accept=".html"
                            file={introHtmlFile}
                            existingPath={editItem?.htmlPath}
                            onChange={setIntroHtmlFile}
                            isEditing={isEditing}
                        />

                        {/* Intro PDF */}
                        <FileUploadField
                            id="intro-pdf-upload"
                            label={isEditing ? "PDF de Introdução (opcional)" : "PDF de Introdução"}
                            accept=".pdf"
                            file={introPdfFile}
                            existingPath={editItem?.pdfPath}
                            onChange={setIntroPdfFile}
                            isEditing={isEditing}
                        />

                        {/* Capa Imagem */}
                        <FileUploadField
                            id="cover-image-upload"
                            label={isEditing ? "Imagem de Capa (opcional)" : "Imagem de Capa"}
                            accept=".jpg,.jpeg,.png,.webp"
                            file={coverImageFile}
                            existingPath={editItem?.coverImagePath}
                            onChange={setCoverImageFile}
                            isEditing={isEditing}
                        />

                        {/* Capa PDF */}
                        <FileUploadField
                            id="cover-pdf-upload"
                            label={isEditing ? "PDF de Capa (opcional)" : "PDF de Capa"}
                            accept=".pdf"
                            file={coverPdfFile}
                            existingPath={editItem?.coverPdfPath}
                            onChange={setCoverPdfFile}
                            isEditing={isEditing}
                        />
                    </div>
                </div>

                {/* Erro de validação */}
                {formatError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {formatError}
                    </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                        <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {isLoading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar E-book"}
    </button>
                </div>
            </form>
        </div>
    );
}
