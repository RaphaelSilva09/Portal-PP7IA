"use client";

/**
 * TODO Phase 0b (feat/removeSupabase): this admin component still calls
 * supabase directly (table upsert on `home_recomendacoes_paulo` + storage
 * upload/remove on bucket `materiais`). Rewrite once the following exist:
 *   - GET    /api/admin/home-recomendacoes-paulo            — read row
 *   - PUT    /api/admin/home-recomendacoes-paulo            — upsert row
 *   - POST   /api/admin/home-recomendacoes-paulo/upload     — multipart HTML
 *   - DELETE /api/admin/home-recomendacoes-paulo/file       — remove HTML
 * Until then, the component remains functional via the legacy supabase client.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, GradientButton } from "@/components/ui";
import { FeedbackMessage } from "./FeedbackMessage";
import { ConfirmDialog } from "./ConfirmDialog";
import { supabase } from "@/infrastructure/config/supabase";
import {
    RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
    RECOMENDACOES_PAULO_DEFAULT_TITLE,
    RECOMENDACOES_PAULO_SLUG,
    RECOMENDACOES_PAULO_STORAGE_BUCKET,
    RECOMENDACOES_PAULO_STORAGE_FOLDER,
    getRecomendacoesPauloSourcePath,
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

const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50";

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
            const [{ data, error }, storageResult] = await Promise.all([
                supabase
                    .from("home_recomendacoes_paulo")
                    .select("slug, title, description, html_path")
                    .eq("slug", RECOMENDACOES_PAULO_SLUG)
                    .maybeSingle(),
                supabase.storage.from(RECOMENDACOES_PAULO_STORAGE_BUCKET).list(RECOMENDACOES_PAULO_STORAGE_FOLDER, {
                    limit: 100,
                }),
            ]);

            if (error) throw error;
            if (storageResult.error) throw storageResult.error;

            const row = data as RecomendacoesRow | null;
            setFormValues({
                title: row?.title?.trim() || RECOMENDACOES_PAULO_DEFAULT_TITLE,
                description: row?.description?.trim() || RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION,
            });

            const availableFiles = new Set((storageResult.data ?? []).map(item => item.name));
            const expectedFileName = `${RECOMENDACOES_PAULO_SLUG}.html`;
            setExistingFileName(availableFiles.has(expectedFileName) ? expectedFileName : null);
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
            if (selectedFile) {
                const { error: uploadError } = await supabase.storage
                    .from(RECOMENDACOES_PAULO_STORAGE_BUCKET)
                    .upload(getRecomendacoesPauloStoragePath(), selectedFile, { cacheControl: "3600", upsert: true });

                if (uploadError) throw uploadError;
            }

            const { error } = await supabase
                .from("home_recomendacoes_paulo")
                .upsert(
                    {
                        slug: RECOMENDACOES_PAULO_SLUG,
                        title: formValues.title.trim(),
                        description: formValues.description.trim(),
                        html_path: getRecomendacoesPauloSourcePath(),
                    },
                    { onConflict: "slug" },
                );

            if (error) throw error;

            setSelectedFile(null);
            await loadData();
            await queryClient.invalidateQueries({ queryKey: ["home-recomendacoes-paulo"] });
            showFeedback("Recomendacoes atualizadas com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao salvar recomendacoes:", err);
            showFeedback("Erro ao salvar. Tente novamente.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExisting = async () => {
        setIsDeleting(true);
        try {
            const { error } = await supabase.storage
                .from(RECOMENDACOES_PAULO_STORAGE_BUCKET)
                .remove([getRecomendacoesPauloStoragePath()]);

            if (error) throw error;

            await loadData();
            await queryClient.invalidateQueries({ queryKey: ["home-recomendacoes-paulo"] });
            showFeedback("HTML removido com sucesso.", "success");
        } catch (err) {
            console.error("Erro ao deletar HTML:", err);
            showFeedback("Erro ao deletar HTML. Tente novamente.", "error");
        } finally {
            setIsDeleting(false);
            setPendingDelete(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Recomendacoes do Paulo</h2>
                <GradientButton onClick={handleSave} disabled={isLoading || isSaving || !hasChanges} loading={isSaving} loadingText="Salvando...">
                    Salvar recomendacoes
                </GradientButton>
            </div>

            <GlassCard variant="elevated" padding="lg">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-[var(--text-secondary)] text-lg">
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
                            <p className="text-xs text-[var(--text-secondary)]">Use quebra de linha para separar as frases.</p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-secondary)]/40 p-5 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                                    <FileText className="w-5 h-5 text-[var(--brand-blue)]" />
                                    <h3 className="text-lg font-semibold">Arquivo HTML</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    Este HTML aparece na home e abre em uma nova pagina ao clicar.
                                </p>
                            </div>

                            <div className="text-xs text-[var(--text-secondary)] space-y-1">
                                <p>Destino no storage: <code>{getRecomendacoesPauloStoragePath()}</code></p>
                                <p>Leitura publica: <code>{getRecomendacoesPauloViewPath()}</code></p>
                            </div>

                            {existingFileName ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-[var(--brand-green)]">
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
                                <div className="text-sm text-[var(--text-secondary)]">Nenhum HTML enviado ainda.</div>
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
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--bg-primary)] border-2 border-dashed border-[var(--border-glass)] rounded-lg text-[var(--text-secondary)] cursor-pointer hover:border-[var(--brand-blue)]/50 transition-colors"
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
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
            </GlassCard>

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
