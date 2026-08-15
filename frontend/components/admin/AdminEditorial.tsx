"use client";

/**
 * AdminEditorial Component (Presentation Layer)
 *
 * Upload fixo dos dois editoriais exibidos na home — cada um pode ter uma
 * versão HTML (leitura online) e/ou PDF (download), como os demais blocos.
 */

import { useQueryClient } from "@tanstack/react-query";
import {
    EDITORIAL_ITEMS,
    EDITORIAL_STORAGE_FOLDER,
    getEditorialFileName,
    getEditorialPdfFileName,
    getEditorialPdfStoragePath,
    getEditorialStoragePath,
    getEditorialViewPath,
    type EditorialSlug,
} from "@/constants/editorials";

import { AlertCircle, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage } from "./FeedbackMessage";
import { useCallback, useEffect, useMemo, useState } from "react";

type EditorialFormat = "html" | "pdf";
type EditorialFileMap = Record<EditorialSlug, Record<EditorialFormat, string | null>>;
type SelectedFilesMap = Record<EditorialSlug, Record<EditorialFormat, File | null>>;

const EMPTY_FILE_MAP: EditorialFileMap = {
    "primeiros-usuarios": { html: null, pdf: null },
    semanais: { html: null, pdf: null },
};

const FORMAT_META: Record<EditorialFormat, { label: string; accept: string; storagePath: (slug: EditorialSlug) => string }> = {
    html: { label: "HTML (leitura online)", accept: ".html", storagePath: getEditorialStoragePath },
    pdf: { label: "PDF (download)", accept: ".pdf", storagePath: getEditorialPdfStoragePath },
};

interface FormatUploadBlockProps {
    id: string;
    format: EditorialFormat;
    slug: EditorialSlug;
    file: File | null;
    existingFileName: string | null;
    isDeletingExisting: boolean;
    onChange: (slug: EditorialSlug, format: EditorialFormat, file: File | null) => void;
    onDeleteExisting: (slug: EditorialSlug, format: EditorialFormat) => void;
}

function FormatUploadBlock({
    id,
    format,
    slug,
    file,
    existingFileName,
    isDeletingExisting,
    onChange,
    onDeleteExisting,
}: FormatUploadBlockProps) {
    const meta = FORMAT_META[format];
    return (
        <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{meta.label}</span>
                {existingFileName && (
                    <button
                        type="button"
                        onClick={() => onDeleteExisting(slug, format)}
                        disabled={isDeletingExisting}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeletingExisting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        {isDeletingExisting ? "Deletando..." : "Deletar"}
                    </button>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                Destino: <code>{meta.storagePath(slug)}</code>
            </p>

            {existingFileName ? (
                <div className="flex items-center gap-2 text-xs text-green-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Arquivo atual: {existingFileName}</span>
                </div>
            ) : (
                <div className="text-xs text-muted-foreground">Nenhum {format.toUpperCase()} enviado ainda.</div>
            )}

            <div className="relative">
                <input
                    type="file"
                    accept={meta.accept}
                    onChange={e => onChange(slug, format, e.target.files?.[0] ?? null)}
                    className="hidden"
                    id={id}
                />
                <label
                    htmlFor={id}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-background border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground cursor-pointer hover:border-foreground/30 transition-colors"
                >
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                        {file ? file.name : existingFileName ? `Escolher novo ${format.toUpperCase()} (substitui o atual)` : `Selecionar arquivo ${format.toUpperCase()}`}
                    </span>
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={() => onChange(slug, format, null)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-400 transition-colors"
                        aria-label={`Remover arquivo ${meta.label}`}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

interface EditorialUploadFieldProps {
    label: string;
    description: string;
    slug: EditorialSlug;
    selectedFiles: Record<EditorialFormat, File | null>;
    existingFiles: Record<EditorialFormat, string | null>;
    deletingFormat: EditorialFormat | null;
    onChange: (slug: EditorialSlug, format: EditorialFormat, file: File | null) => void;
    onDeleteExisting: (slug: EditorialSlug, format: EditorialFormat) => void;
}

function EditorialUploadField({
    label,
    description,
    slug,
    selectedFiles,
    existingFiles,
    deletingFormat,
    onChange,
    onDeleteExisting,
}: EditorialUploadFieldProps) {
    return (
        <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                    <FileText className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold">{label}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                <p className="text-xs text-muted-foreground/80">
                    Leitura pública: <code>{getEditorialViewPath(slug)}</code>
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <FormatUploadBlock
                    id={`editorial-upload-${slug}-html`}
                    format="html"
                    slug={slug}
                    file={selectedFiles.html}
                    existingFileName={existingFiles.html}
                    isDeletingExisting={deletingFormat === "html"}
                    onChange={onChange}
                    onDeleteExisting={onDeleteExisting}
                />
                <FormatUploadBlock
                    id={`editorial-upload-${slug}-pdf`}
                    format="pdf"
                    slug={slug}
                    file={selectedFiles.pdf}
                    existingFileName={existingFiles.pdf}
                    isDeletingExisting={deletingFormat === "pdf"}
                    onChange={onChange}
                    onDeleteExisting={onDeleteExisting}
                />
            </div>
        </div>
    );
}

// —— Componente principal ——
export function AdminEditorial() {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleting, setDeleting] = useState<{ slug: EditorialSlug; format: EditorialFormat } | null>(null);
    const [pendingDelete, setPendingDelete] = useState<{ slug: EditorialSlug; format: EditorialFormat } | null>(null);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });
    const [existingFiles, setExistingFiles] = useState<EditorialFileMap>(EMPTY_FILE_MAP);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFilesMap>({
        "primeiros-usuarios": { html: null, pdf: null },
        semanais: { html: null, pdf: null },
    });

    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/editorials");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const payload = (await res.json()) as { files?: string[] };
            const availableFiles = new Set(payload.files ?? []);
            const next: EditorialFileMap = { "primeiros-usuarios": { html: null, pdf: null }, semanais: { html: null, pdf: null } };
            for (const item of EDITORIAL_ITEMS) {
                next[item.slug] = {
                    html: availableFiles.has(getEditorialFileName(item.slug)) ? getEditorialFileName(item.slug) : null,
                    pdf: availableFiles.has(getEditorialPdfFileName(item.slug)) ? getEditorialPdfFileName(item.slug) : null,
                };
            }
            setExistingFiles(next);
        } catch (err) {
            console.error("Erro ao carregar editoriais:", err);
            setFeedback({ show: true, message: "Erro ao carregar arquivos editoriais.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const hasPendingUploads = useMemo(
        () => Object.values(selectedFiles).some(bySlug => bySlug.html || bySlug.pdf),
        [selectedFiles],
    );

    const handleFileChange = (slug: EditorialSlug, format: EditorialFormat, file: File | null) => {
        setSelectedFiles(prev => ({ ...prev, [slug]: { ...prev[slug], [format]: file } }));
    };

    // —— Salvar ——
    const handleSave = async () => {
        if (!hasPendingUploads) {
            setFeedback({ show: true, message: "Selecione pelo menos um arquivo para enviar.", type: "warning" });
            return;
        }

        setIsSaving(true);
        try {
            for (const item of EDITORIAL_ITEMS) {
                for (const format of ["html", "pdf"] as const) {
                    const file = selectedFiles[item.slug][format];
                    if (!file) continue;

                    const formData = new FormData();
                    formData.append("slug", item.slug);
                    formData.append("format", format);
                    formData.append("file", file);

                    const res = await fetch("/api/admin/editorials/upload", {
                        method: "POST",
                        body: formData,
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error ?? `HTTP ${res.status}`);
                    }
                }
            }

            setSelectedFiles({
                "primeiros-usuarios": { html: null, pdf: null },
                semanais: { html: null, pdf: null },
            });
            await loadFiles();
            await queryClient.invalidateQueries({ queryKey: ["editoriais"] });
            setFeedback({ show: true, message: "Editoriais atualizados com sucesso!", type: "success" });
        } catch (err) {
            console.error("Erro ao salvar editoriais:", err);
            setFeedback({ show: true, message: "Erro ao enviar os arquivos. Tente novamente.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExisting = async (slug: EditorialSlug, format: EditorialFormat) => {
        setDeleting({ slug, format });
        try {
            const res = await fetch(`/api/admin/editorials/${encodeURIComponent(slug)}?format=${format}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            await loadFiles();
            await queryClient.invalidateQueries({ queryKey: ["editoriais"] });
            setFeedback({ show: true, message: `${format.toUpperCase()} deletado com sucesso!`, type: "success" });
        } catch (err) {
            console.error("Erro ao deletar editorial:", err);
            setFeedback({ show: true, message: "Erro ao deletar o arquivo. Tente novamente.", type: "error" });
        } finally {
            setDeleting(null);
        }
    };

    const pendingDeleteItem = pendingDelete
        ? EDITORIAL_ITEMS.find(item => item.slug === pendingDelete.slug) ?? null
        : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight text-ink">Editorial</h2>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isLoading || !hasPendingUploads}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? "Enviando…" : "Salvar arquivos"}
                </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A home aponta para dois editoriais fixos. Cada um pode ter uma versão HTML (leitura online) e/ou PDF (download) — o portal exibe os botões automaticamente conforme o que estiver disponível.
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                            Pasta de storage usada: <code>{EDITORIAL_STORAGE_FOLDER}</code>
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Carregando...
                        </div>
                    ) : (
                        <div className="grid gap-5 xl:grid-cols-2">
                            {EDITORIAL_ITEMS.map(item => (
                                <EditorialUploadField
                                    key={item.slug}
                                    label={item.title}
                                    description={item.description}
                                    slug={item.slug}
                                    selectedFiles={selectedFiles[item.slug]}
                                    existingFiles={existingFiles[item.slug]}
                                    deletingFormat={deleting?.slug === item.slug ? deleting.format : null}
                                    onChange={handleFileChange}
                                    onDeleteExisting={(slug, format) => setPendingDelete({ slug, format })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
            <ConfirmDialog
                isOpen={pendingDeleteItem !== null}
                title="Confirmar exclusão"
                message={pendingDeleteItem && pendingDelete
                    ? `Você realmente deseja deletar o ${pendingDelete.format.toUpperCase()} de "${pendingDeleteItem.title}"? Esta ação remove o arquivo do storage.`
                    : ""}
                confirmLabel="Deletar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={() => {
                    if (pendingDelete) {
                        void handleDeleteExisting(pendingDelete.slug, pendingDelete.format);
                    }
                }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
}
