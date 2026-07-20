"use client";

/**
 * AdminPromptLibrary Component (Presentation Layer)
 *
 * CRUD da biblioteca de prompts prontos para as 7 IAs do portal (PDF 5.4).
 */

import { ConfirmDialog, FeedbackMessage } from "@/components/admin";
import { AI_TOOLS } from "@/domain/entities/PromptLibraryItem";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface PromptRow {
    id: number;
    aiTool: string;
    title: string;
    promptBody: string;
    useCase: string;
    isGated: boolean;
    sortOrder: number;
}

interface FormState {
    aiTool: string;
    title: string;
    promptBody: string;
    useCase: string;
    isGated: boolean;
    sortOrder: number;
}

function emptyFormState(): FormState {
    return { aiTool: AI_TOOLS[0], title: "", promptBody: "", useCase: "", isGated: true, sortOrder: 0 };
}

function rowToFormState(row: PromptRow): FormState {
    return {
        aiTool: row.aiTool,
        title: row.title,
        promptBody: row.promptBody,
        useCase: row.useCase,
        isGated: row.isGated,
        sortOrder: row.sortOrder,
    };
}

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20";

export default function AdminPromptLibrary() {
    const [rows, setRows] = useState<PromptRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editRow, setEditRow] = useState<PromptRow | null>(null);
    const [form, setForm] = useState<FormState>(emptyFormState());
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; row: PromptRow | null }>({ show: false, row: null });
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    const showFeedback = (message: string, type: "success" | "error" | "warning") => setFeedback({ show: true, message, type });

    const loadRows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/prompt-library");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRows((await res.json()) as PromptRow[]);
        } catch (err) {
            console.error("Erro ao carregar prompts:", err);
            showFeedback("Erro ao carregar prompts.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const handleOpenCreate = () => {
        setEditRow(null);
        setForm(emptyFormState());
        setShowForm(true);
    };

    const handleOpenEdit = (row: PromptRow) => {
        setEditRow(row);
        setForm(rowToFormState(row));
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.promptBody.trim()) return;
        setIsSubmitting(true);
        try {
            const url = editRow ? `/api/admin/prompt-library/${editRow.id}` : "/api/admin/prompt-library";
            const method = editRow ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showFeedback(editRow ? "Prompt atualizado." : "Prompt criado.", "success");
            setShowForm(false);
            await loadRows();
        } catch (err) {
            console.error("Erro ao salvar prompt:", err);
            showFeedback("Erro ao salvar prompt.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete.row) return;
        try {
            const res = await fetch(`/api/admin/prompt-library/${confirmDelete.row.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showFeedback("Prompt deletado.", "success");
            await loadRows();
        } catch (err) {
            console.error("Erro ao deletar prompt:", err);
            showFeedback("Erro ao deletar prompt.", "error");
        } finally {
            setConfirmDelete({ show: false, row: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight text-ink">Biblioteca de Prompts</h2>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
                >
                    <Plus className="w-5 h-5" />
                    Novo prompt
                </button>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{editRow ? "Editar prompt" : "Novo prompt"}</h3>
                    <form
                        onSubmit={e => { e.preventDefault(); handleSubmit(); }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>IA</label>
                                <select
                                    className={INPUT_CLASS}
                                    value={form.aiTool}
                                    onChange={e => setForm(f => ({ ...f, aiTool: e.target.value }))}
                                >
                                    {AI_TOOLS.map(tool => (
                                        <option key={tool} value={tool}>{tool}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>Título</label>
                                <input
                                    className={INPUT_CLASS}
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Ex: Resumo executivo de reunião"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>Caso de uso (breve)</label>
                            <input
                                className={INPUT_CLASS}
                                value={form.useCase}
                                onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))}
                                placeholder="Quando usar este prompt"
                            />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>Corpo do prompt</label>
                            <textarea
                                className={`${INPUT_CLASS} resize-y min-h-[140px] font-mono text-xs`}
                                value={form.promptBody}
                                onChange={e => setForm(f => ({ ...f, promptBody: e.target.value }))}
                                placeholder="Texto completo do prompt..."
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={form.isGated}
                                    onChange={e => setForm(f => ({ ...f, isGated: e.target.checked }))}
                                />
                                Restrito a leitores cadastrados
                            </label>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Ordem</label>
                                <input
                                    type="number"
                                    className="w-20 px-2 py-1.5 text-sm text-center rounded bg-accent border border-border text-foreground"
                                    value={form.sortOrder}
                                    onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-4 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !form.title.trim() || !form.promptBody.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editRow ? "Salvar alterações" : "Publicar prompt"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Nenhum prompt cadastrado.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">IA</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Título</th>
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium w-24">Restrito</th>
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium w-28">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{row.aiTool}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">{row.title}</p>
                                            {row.useCase && <p className="text-xs text-muted-foreground truncate max-w-xs">{row.useCase}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">{row.isGated ? "Sim" : "Não"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleOpenEdit(row)} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Editar">
                                                    <Pencil className="w-4 h-4 text-foreground" />
                                                </button>
                                                <button onClick={() => setConfirmDelete({ show: true, row })} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Deletar">
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDelete.show}
                title="Confirmar Exclusão"
                message={`Deletar o prompt "${confirmDelete.row?.title}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Deletar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete({ show: false, row: null })}
            />

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
