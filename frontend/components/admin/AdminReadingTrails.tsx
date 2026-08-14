"use client";

/**
 * AdminReadingTrails Component (Presentation Layer)
 *
 * CRUD das trilhas de leitura guiadas (PP7I-260811-1800, item 3.2). Os itens
 * são referenciados por content_type + content_id (mesmo par usado em
 * saved_content/content_reactions) — o content_id é o SLUG do arquivo, não o
 * id numérico da linha no banco (os dois divergem: arquivos podem ter offset
 * de numeração ou nome totalmente descritivo, ex. especial-semana/radar).
 * Por isso o admin nunca digita o slug: escolhe o conteúdo pelo título num
 * seletor (/api/admin/content-picker/[type]), que resolve o slug certo.
 */

import { ConfirmDialog, FeedbackMessage } from "@/components/admin";
import { SAVABLE_CONTENT_TYPES } from "@/domain/entities/SavedContent";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ContentOption {
    id: number;
    title: string;
    slug: string;
}

interface TrailItem {
    contentType: string;
    contentId: string;
    position: number;
}

interface TrailRow {
    id: number;
    slug: string;
    title: string;
    description: string;
    coverImagePath: string | null;
    published: boolean;
    items: TrailItem[];
}

interface FormState {
    slug: string;
    title: string;
    description: string;
    coverImagePath: string;
    published: boolean;
    items: { contentType: string; contentId: string }[];
}

function emptyFormState(): FormState {
    return { slug: "", title: "", description: "", coverImagePath: "", published: false, items: [] };
}

function rowToFormState(row: TrailRow): FormState {
    return {
        slug: row.slug,
        title: row.title,
        description: row.description,
        coverImagePath: row.coverImagePath ?? "",
        published: row.published,
        items: row.items.map(i => ({ contentType: i.contentType, contentId: i.contentId })),
    };
}

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20";

export default function AdminReadingTrails() {
    const [rows, setRows] = useState<TrailRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editRow, setEditRow] = useState<TrailRow | null>(null);
    const [form, setForm] = useState<FormState>(emptyFormState());
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; row: TrailRow | null }>({ show: false, row: null });
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });
    const [contentOptions, setContentOptions] = useState<Record<string, ContentOption[]>>({});
    const [loadingTypes, setLoadingTypes] = useState<Set<string>>(new Set());

    const showFeedback = (message: string, type: "success" | "error" | "warning") => setFeedback({ show: true, message, type });

    const ensureContentOptions = useCallback((contentType: string) => {
        setContentOptions(prev => {
            if (contentType in prev) return prev;
            setLoadingTypes(s => new Set(s).add(contentType));
            fetch(`/api/admin/content-picker/${contentType}`)
                .then(res => (res.ok ? res.json() : { items: [] }))
                .then(json => setContentOptions(p => ({ ...p, [contentType]: json.items as ContentOption[] })))
                .catch(() => setContentOptions(p => ({ ...p, [contentType]: [] })))
                .finally(() => setLoadingTypes(s => { const next = new Set(s); next.delete(contentType); return next; }));
            return prev;
        });
    }, []);

    const loadRows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/reading-trails");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setRows(json.trails as TrailRow[]);
        } catch (err) {
            console.error("Erro ao carregar trilhas:", err);
            showFeedback("Erro ao carregar trilhas.", "error");
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

    const handleOpenEdit = (row: TrailRow) => {
        setEditRow(row);
        setForm(rowToFormState(row));
        setShowForm(true);
        for (const item of row.items) ensureContentOptions(item.contentType);
    };

    const addItem = () => {
        const contentType = SAVABLE_CONTENT_TYPES[0];
        ensureContentOptions(contentType);
        setForm(f => ({ ...f, items: [...f.items, { contentType, contentId: "" }] }));
    };
    const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    const moveItem = (idx: number, dir: -1 | 1) => setForm(f => {
        const target = idx + dir;
        if (target < 0 || target >= f.items.length) return f;
        const items = [...f.items];
        [items[idx], items[target]] = [items[target], items[idx]];
        return { ...f, items };
    });
    const updateItem = (idx: number, patch: Partial<{ contentType: string; contentId: string }>) => {
        if (patch.contentType) ensureContentOptions(patch.contentType);
        setForm(f => ({
            ...f,
            items: f.items.map((it, i) => (i === idx ? { ...it, ...patch, ...(patch.contentType ? { contentId: "" } : {}) } : it)),
        }));
    };

    const handleSubmit = async () => {
        if (!form.slug.trim() || !form.title.trim() || form.items.some(i => !i.contentId.trim())) return;
        setIsSubmitting(true);
        try {
            const url = editRow ? `/api/admin/reading-trails/${editRow.id}` : "/api/admin/reading-trails";
            const method = editRow ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: form.slug.trim(),
                    title: form.title.trim(),
                    description: form.description,
                    coverImagePath: form.coverImagePath.trim() || null,
                    published: form.published,
                    items: form.items,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? `HTTP ${res.status}`);
            }
            showFeedback(editRow ? "Trilha atualizada." : "Trilha criada.", "success");
            setShowForm(false);
            await loadRows();
        } catch (err) {
            console.error("Erro ao salvar trilha:", err);
            showFeedback(err instanceof Error ? err.message : "Erro ao salvar trilha.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete.row) return;
        try {
            const res = await fetch(`/api/admin/reading-trails/${confirmDelete.row.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showFeedback("Trilha deletada.", "success");
            await loadRows();
        } catch (err) {
            console.error("Erro ao deletar trilha:", err);
            showFeedback("Erro ao deletar trilha.", "error");
        } finally {
            setConfirmDelete({ show: false, row: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight text-ink">Trilhas de Leitura</h2>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
                >
                    <Plus className="w-5 h-5" />
                    Nova trilha
                </button>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{editRow ? "Editar trilha" : "Nova trilha"}</h3>
                    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>Título</label>
                                <input
                                    className={INPUT_CLASS}
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Ex: Entenda IA em 5 leituras"
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>Slug (URL)</label>
                                <input
                                    className={INPUT_CLASS}
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    placeholder="entenda-ia"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>Descrição</label>
                            <textarea
                                className={`${INPUT_CLASS} resize-y min-h-[80px]`}
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Resumo curto do que o leitor vai encontrar nesta trilha."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="trail-published"
                                checked={form.published}
                                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                                className="size-4"
                            />
                            <label htmlFor="trail-published" className="text-sm text-foreground">Publicada (visível em /trilhas)</label>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={`${LABEL_CLASS} mb-0`}>Passos da trilha</label>
                                <button type="button" onClick={addItem} className="text-sm font-medium text-foreground hover:opacity-80">
                                    + Adicionar passo
                                </button>
                            </div>
                            <p className="mb-2 text-xs text-muted-foreground">
                                Escolha o tipo e depois o conteúdo pelo título — já publicado no portal.
                            </p>
                            {form.items.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhum passo adicionado ainda.</p>
                            )}
                            <div className="space-y-2">
                                {form.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-5 shrink-0 text-xs text-muted-foreground">{idx + 1}.</span>
                                        <select
                                            className={`${INPUT_CLASS} w-auto`}
                                            value={item.contentType}
                                            onChange={e => updateItem(idx, { contentType: e.target.value })}
                                        >
                                            {SAVABLE_CONTENT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {(() => {
                                            const options = contentOptions[item.contentType] ?? [];
                                            const isLoading = loadingTypes.has(item.contentType);
                                            const currentMissing = item.contentId && !options.some(o => o.slug === item.contentId);
                                            return (
                                                <select
                                                    className={INPUT_CLASS}
                                                    value={item.contentId}
                                                    disabled={isLoading}
                                                    onChange={e => updateItem(idx, { contentId: e.target.value })}
                                                >
                                                    <option value="" disabled>
                                                        {isLoading ? "Carregando conteúdo…" : "Selecione o conteúdo…"}
                                                    </option>
                                                    {currentMissing && (
                                                        <option value={item.contentId}>{item.contentId} (não encontrado na lista atual)</option>
                                                    )}
                                                    {options.map(o => (
                                                        <option key={o.slug} value={o.slug}>{o.title}</option>
                                                    ))}
                                                </select>
                                            );
                                        })()}
                                        <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30" title="Mover para cima">
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === form.items.length - 1} className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30" title="Mover para baixo">
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => removeItem(idx)} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Remover">
                                            <X className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !form.slug.trim() || !form.title.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editRow ? "Salvar alterações" : "Criar trilha"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Nenhuma trilha cadastrada.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Trilha</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Passos</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium w-28">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-foreground">{row.title}</p>
                                            <p className="text-xs text-muted-foreground">/{row.slug}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{row.items.length}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {row.published
                                                ? <span className="text-green-600 dark:text-green-400">Publicada</span>
                                                : <span className="text-muted-foreground">Rascunho</span>}
                                        </td>
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
                message={`Deletar a trilha "${confirmDelete.row?.title}"? Esta ação não pode ser desfeita.`}
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
