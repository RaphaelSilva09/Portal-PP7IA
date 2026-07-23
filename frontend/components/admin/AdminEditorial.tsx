"use client";

/**
 * AdminEditorial Component (Presentation Layer)
 *
 * Upload fixo dos dois editoriais HTML exibidos na home.
 */

import { useQueryClient } from "@tanstack/react-query";
import {
    EDITORIAL_ITEMS,
    EDITORIAL_STORAGE_FOLDER,
    getEditorialFileName,
    getEditorialStoragePath,
    getEditorialViewPath,
    type EditorialSlug,
} from "@/constants/editorials";

import { AlertCircle, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage } from "./FeedbackMessage";
import { useCallback, useEffect, useMemo, useState } from "react";

type EditorialFileMap = Record<EditorialSlug, string | null>;

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";

interface EditorialUploadFieldProps {
    id: string;
    label: string;
    description: string;
    slug: EditorialSlug;
    file: File | null;
    existingFileName: string | null;
    isDeletingExisting: boolean;
    onChange: (slug: EditorialSlug, file: File | null) => void;
    onDeleteExisting: (slug: EditorialSlug) => void;
}

function EditorialUploadField({
    id,
    label,
    description,
    slug,
    file,
    existingFileName,
    isDeletingExisting,
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
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
                <p>Destino no storage: <code>{getEditorialStoragePath(slug)}</code></p>
                <p>Leitura pública: <code>{getEditorialViewPath(slug)}</code></p>
            </div>

            {existingFileName ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">Arquivo atual: {existingFileName}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDeleteExisting(slug)}
                        disabled={isDeletingExisting}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeletingExisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {isDeletingExisting ? "Deletando..." : "Deletar HTML atual"}
                    </button>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">Nenhum HTML enviado ainda.</div>
            )}

            <div>
                <label className={LABEL_CLASS}>Arquivo HTML</label>
                <div className="relative">
                    <input
                        type="file"
                        accept=".html"
                        onChange={e => onChange(slug, e.target.files?.[0] ?? null)}
                        className="hidden"
                        id={id}
                    />
                    <label
                        htmlFor={id}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-background border-2 border-dashed border-border rounded-lg text-muted-foreground cursor-pointer hover:border-foreground/30 transition-colors"
                    >
                        <Upload className="w-5 h-5 shrink-0" />
                        <span className="truncate">
                            {file ? file.name : existingFileName ? "Escolher novo HTML (substitui o atual)" : "Selecionar arquivo HTML"}
                        </span>
                    </label>
                    {file && (
                        <button
                            type="button"
                            onClick={() => onChange(slug, null)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-400 transition-colors"
                            aria-label={`Remover arquivo ${label}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// —— Componente principal ——
export function AdminEditorial() {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingSlug, setDeletingSlug] = useState<EditorialSlug | null>(null);
    const [pendingDeleteSlug, setPendingDeleteSlug] = useState<EditorialSlug | null>(null);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });
    const [existingFiles, setExistingFiles] = useState<EditorialFileMap>({
        "primeiros-usuarios": null,
        semanais: null,
    });
    const [selectedFiles, setSelectedFiles] = useState<Record<EditorialSlug, File | null>>({
        "primeiros-usuarios": null,
        semanais: null,
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
            setExistingFiles({
                "primeiros-usuarios": availableFiles.has(getEditorialFileName("primeiros-usuarios"))
                    ? getEditorialFileName("primeiros-usuarios")
                    : null,
                semanais: availableFiles.has(getEditorialFileName("semanais"))
                    ? getEditorialFileName("semanais")
                    : null,
            });
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

    const hasPendingUploads = useMemo(() => Object.values(selectedFiles).some(Boolean), [selectedFiles]);

    const handleFileChange = (slug: EditorialSlug, file: File | null) => {
        setSelectedFiles(prev => ({ ...prev, [slug]: file }));
    };

    // —— Salvar ——
    const handleSave = async () => {
        if (!hasPendingUploads) {
            setFeedback({ show: true, message: "Selecione pelo menos um HTML para enviar.", type: "warning" });
            return;
        }

        setIsSaving(true);
        try {
            for (const item of EDITORIAL_ITEMS) {
                const file = selectedFiles[item.slug];
                if (!file) continue;

                const formData = new FormData();
                formData.append("slug", item.slug);
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

            setSelectedFiles({
                "primeiros-usuarios": null,
                semanais: null,
            });
            await loadFiles();
            await queryClient.invalidateQueries({ queryKey: ["editoriais"] });
            setFeedback({ show: true, message: "Editoriais atualizados com sucesso!", type: "success" });
        } catch (err) {
            console.error("Erro ao salvar editoriais:", err);
            setFeedback({ show: true, message: "Erro ao enviar os HTMLs. Tente novamente.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExisting = async (slug: EditorialSlug) => {
        setDeletingSlug(slug);
        try {
            const res = await fetch(`/api/admin/editorials/${encodeURIComponent(slug)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            await loadFiles();
            await queryClient.invalidateQueries({ queryKey: ["editoriais"] });
            setFeedback({ show: true, message: "HTML editorial deletado com sucesso!", type: "success" });
        } catch (err) {
            console.error("Erro ao deletar editorial:", err);
            setFeedback({ show: true, message: "Erro ao deletar o HTML. Tente novamente.", type: "error" });
        } finally {
            setDeletingSlug(null);
        }
    };

    const pendingDeleteItem = pendingDeleteSlug
        ? EDITORIAL_ITEMS.find(item => item.slug === pendingDeleteSlug) ?? null
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
        {isSaving ? "Enviando…" : "Salvar HTMLs"}
    </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A home agora aponta para dois editoriais fixos. Envie um arquivo HTML para cada destino e o portal exibirá os botões automaticamente.
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
                                    id={`editorial-upload-${item.slug}`}
                                    label={item.title}
                                    description={item.description}
                                    slug={item.slug}
                                    file={selectedFiles[item.slug]}
                                    existingFileName={existingFiles[item.slug]}
                                    isDeletingExisting={deletingSlug === item.slug}
                                    onChange={handleFileChange}
                                    onDeleteExisting={setPendingDeleteSlug}
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
                message={pendingDeleteItem
                    ? `Você realmente deseja deletar o arquivo HTML de "${pendingDeleteItem.title}"? Esta ação remove o editorial do storage.`
                    : ""}
                confirmLabel="Deletar HTML"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={() => {
                    if (pendingDeleteSlug) {
                        void handleDeleteExisting(pendingDeleteSlug);
                    }
                }}
                onCancel={() => setPendingDeleteSlug(null)}
            />
        </div>
    );
}
