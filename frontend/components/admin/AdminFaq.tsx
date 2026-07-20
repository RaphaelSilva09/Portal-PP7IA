"use client";

/**
 * AdminFaq Component (Presentation Layer)
 *
 * CRUD das perguntas frequentes públicas do portal (PDF 6.2).
 */

import { ConfirmDialog, FeedbackMessage } from "@/components/admin";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface FaqRow {
    id: number;
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
}

interface FormState {
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
}

function emptyFormState(): FormState {
    return { question: "", answer: "", category: "", sortOrder: 0 };
}

function rowToFormState(row: FaqRow): FormState {
    return { question: row.question, answer: row.answer, category: row.category, sortOrder: row.sortOrder };
}

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20";

export default function AdminFaq() {
    const [rows, setRows] = useState<FaqRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editRow, setEditRow] = useState<FaqRow | null>(null);
    const [form, setForm] = useState<FormState>(emptyFormState());
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; row: FaqRow | null }>({ show: false, row: null });
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    const showFeedback = (message: string, type: "success" | "error" | "warning") => setFeedback({ show: true, message, type });

    const loadRows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/faq");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRows((await res.json()) as FaqRow[]);
        } catch (err) {
            console.error("Erro ao carregar FAQ:", err);
            showFeedback("Erro ao carregar perguntas.", "error");
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

    const handleOpenEdit = (row: FaqRow) => {
        setEditRow(row);
        setForm(rowToFormState(row));
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!form.question.trim() || !form.answer.trim()) return;
        setIsSubmitting(true);
        try {
            const url = editRow ? `/api/admin/faq/${editRow.id}` : "/api/admin/faq";
            const method = editRow ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showFeedback(editRow ? "Pergunta atualizada." : "Pergunta criada.", "success");
            setShowForm(false);
            await loadRows();
        } catch (err) {
            console.error("Erro ao salvar pergunta:", err);
            showFeedback("Erro ao salvar pergunta.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete.row) return;
        try {
            const res = await fetch(`/api/admin/faq/${confirmDelete.row.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showFeedback("Pergunta deletada.", "success");
            await loadRows();
        } catch (err) {
            console.error("Erro ao deletar pergunta:", err);
            showFeedback("Erro ao deletar pergunta.", "error");
        } finally {
            setConfirmDelete({ show: false, row: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight text-ink">Perguntas Frequentes</h2>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
                >
                    <Plus className="w-5 h-5" />
                    Nova pergunta
                </button>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{editRow ? "Editar pergunta" : "Nova pergunta"}</h3>
                    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                        <div>
                            <label className={LABEL_CLASS}>Pergunta</label>
                            <input
                                className={INPUT_CLASS}
                                value={form.question}
                                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                                placeholder="Ex: Como funciona o bloco de Newsletter?"
                            />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>Resposta</label>
                            <textarea
                                className={`${INPUT_CLASS} resize-y min-h-[120px]`}
                                value={form.answer}
                                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                                placeholder="Resposta completa..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>Categoria (opcional)</label>
                                <input
                                    className={INPUT_CLASS}
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    placeholder="Ex: Conta, Conteúdo, Indicações"
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>Ordem</label>
                                <input
                                    type="number"
                                    className={INPUT_CLASS}
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
                                disabled={isSubmitting || !form.question.trim() || !form.answer.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editRow ? "Salvar alterações" : "Publicar pergunta"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Nenhuma pergunta cadastrada.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Pergunta</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Categoria</th>
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium w-28">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">{row.question}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-md">{row.answer}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{row.category || "—"}</td>
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
                message={`Deletar a pergunta "${confirmDelete.row?.question}"? Esta ação não pode ser desfeita.`}
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
