"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { FeedbackMessage } from "./FeedbackMessage";
import { ConfirmDialog } from "./ConfirmDialog";
import {
    RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
    RECOMENDACOES_PAULO_DEFAULT_TITLE,
    RECOMENDACOES_PAULO_SLUG,
    getRecomendacoesPauloStoragePath,
    getRecomendacoesPauloViewPath,
} from "@/constants/recomendacoesPaulo";
import { AlertCircle, FileText, Loader2, Trash2, Upload, X } from "lucide-react";

interface RecomendacoesRow {
    slug: string;
    title: string | null;
    description: string | null;
    html_path: string | null;
}

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20";

export function AdminHomeRecomendacoesPaulo() {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingFileName, setExistingFileName] = useState<string | null>(null);
    const [formValues, setFormValues] = useState({
        title: RECOMENDACOES_PAULO_DEFAULT_TITLE,
        description: RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
    });
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>(
        {
            show: false,
            message: "",
            type: "success",
        },
    );

    const showFeedback = (message: string, type: "success" | "error" | "warning") => {
        setFeedback({ show: true, message, type });
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/home-recomendacoes-paulo");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const payload = (await res.json()) as { row: RecomendacoesRow | null; available: boolean };
            const row = payload.row;
            setFormValues({
                title: row?.title?.trim() || RECOMENDACOES_PAULO_DEFAULT_TITLE,
                description: row?.description?.trim() || RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
            });

            const expectedFileName = `${RECOMENDACOES_PAULO_SLUG}.html`;
            setExistingFileName(payload.available ? expectedFileName : null);
        } catch (err) {
            console.error("Erro ao carregar recomendacoes do Paulo:", err);
            showFeedback("Erro ao carregar dados. Tente novamente.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const hasEmptyFields = useMemo(() => !formValues.title.trim() || !formValues.description.trim(), [formValues]);
    const hasChanges = useMemo(
        () => selectedFile !== null || !hasEmptyFields,
        [selectedFile, hasEmptyFields],
    );

    const handleSave = async () => {
        if (hasEmptyFields) {
            showFeedback("Preencha titulo e descricao antes de salvar.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const form = new FormData();
            form.append("title", formValues.title.trim());
            form.append("description", formValues.description.trim());
            if (selectedFile) {
                form.append("file", selectedFile);
            }

            const res = await fetch("/api/admin/home-recomendacoes-paulo", {
                method: "PUT",
                body: form,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            setSelectedFile(null);
            await loadData();
            await queryClient.invalidateQueries({ queryKey: ["home-recomendacoes-paulo"] });
            showFeedback("Recomendacoes atualizadas com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao salvar recomendacoes:", err);
            showFeedback(
                err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.",
                "error",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExisting = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch("/api/admin/home-recomendacoes-paulo/file", {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            await loadData();
            await queryClient.invalidateQueries({ queryKey: ["home-recomendacoes-paulo"] });
            showFeedback("HTML removido com sucesso.", "success");
        } catch (err) {
            console.error("Erro ao deletar HTML:", err);
            showFeedback(
                err instanceof Error ? err.message : "Erro ao deletar HTML. Tente novamente.",
                "error",
            );
        } finally {
            setIsDeleting(false);
            setPendingDelete(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight text-ink">Recomendacoes do Paulo</h2>
                    <button
        type="button"
        onClick={handleSave}
        disabled={isLoading || isSaving || !hasChanges}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {isSaving ? "Salvando…" : "Salvar"}
    </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground text-lg">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Carregando...
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className={LABEL_CLASS}>Titulo da secao</label>
                            <input
                                className={INPUT_CLASS}
                                value={formValues.title}
                                onChange={event => setFormValues(prev => ({ ...prev, title: event.target.value }))}
                                placeholder={RECOMENDACOES_PAULO_DEFAULT_TITLE}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={LABEL_CLASS}>Descricao</label>
                            <textarea
                                className={`${INPUT_CLASS} resize-y min-h-[96px]`}
                                value={formValues.description}
                                onChange={event => setFormValues(prev => ({ ...prev, description: event.target.value }))}
                                placeholder={RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION}
                            />
                            <p className="text-xs text-muted-foreground">Use quebra de linha para separar as frases.</p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-foreground">
                                    <FileText className="w-5 h-5 text-foreground" />
                                    <h3 className="text-lg font-semibold">Arquivo HTML</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Este HTML aparece na home e abre em uma nova pagina ao clicar.
                                </p>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>Destino no storage: <code>{getRecomendacoesPauloStoragePath()}</code></p>
                                <p>Leitura publica: <code>{getRecomendacoesPauloViewPath()}</code></p>
                            </div>

                            {existingFileName ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-green-500">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span className="truncate">Arquivo atual: {existingFileName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPendingDelete(true)}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        {isDeleting ? "Deletando..." : "Deletar HTML atual"}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Nenhum HTML enviado ainda.</div>
                            )}

                            <div>
                                <label className={LABEL_CLASS}>Enviar novo HTML</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".html"
                                        onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                                        className="hidden"
                                        id="recomendacoes-paulo-html"
                                    />
                                    <label
                                        htmlFor="recomendacoes-paulo-html"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-background border-2 border-dashed border-border rounded-lg text-muted-foreground cursor-pointer hover:border-foreground/30 transition-colors"
                                    >
                                        <Upload className="w-5 h-5 shrink-0" />
                                        <span className="truncate">
                                            {selectedFile
                                                ? selectedFile.name
                                                : existingFileName
                                                    ? "Escolher novo HTML (substitui o atual)"
                                                    : "Selecionar arquivo HTML"}
                                        </span>
                                    </label>
                                    {selectedFile && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-400 transition-colors"
                                            aria-label="Remover arquivo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
            <ConfirmDialog
                isOpen={pendingDelete}
                title="Confirmar exclusao"
                message="Voce realmente deseja deletar o HTML atual? Esta acao remove o arquivo do storage."
                confirmLabel="Deletar HTML"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={() => void handleDeleteExisting()}
                onCancel={() => setPendingDelete(false)}
            />
        </div>
    );
}
