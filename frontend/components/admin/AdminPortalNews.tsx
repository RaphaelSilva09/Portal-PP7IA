"use client";

/**
 * AdminPortalNews Component (Presentation Layer)
 *
 * Interface de gerenciamento CRUD das novidades do portal.
 * Auto-contida: gerencia seus próprios dados e estado.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo CRUD de portal_news
 * - Accessibility: botões 48px+, texto 14px+, feedback claro
 */

import { ConfirmDialog, FeedbackMessage } from "@/components/admin";
import { GlassCard } from "@/components/ui";
import { CATEGORY_DEFAULT_COLORS, PortalNewsCategory } from "@/domain/entities/PortalNewsItem";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Tipo local para row do Supabase (snake_case)
interface PortalNewsRow {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    category: PortalNewsCategory;
    accent_color: string | null;
    published_at: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    link_type: string | null;
    link_item_id: number | null;
}

const LINK_TYPE_CONFIG: Record<string, { label: string; table: string }> = {
    "newsletter":          { label: "Newsletter",              table: "newsletters" },
    "mini-livro":          { label: "Mini-livros",             table: "mini_livros" },
    "biblioteca":          { label: "Biblioteca",              table: "biblioteca" },
    "especial-semana":     { label: "Especial da Semana",      table: "especial_semana" },
    "radar-oportunidades": { label: "Radar de Oportunidades",  table: "radar_oportunidades" },
    "estudar":             { label: "Estudar",                 table: "estudar" },
};

const CATEGORY_LABELS: Record<PortalNewsCategory, string> = {
    launch: "Lançamento",
    newsletter: "Newsletter",
    content: "Conteúdo",
    tool: "Ferramenta",
};

interface FormState {
    title: string;
    description: string;
    icon: string;
    category: PortalNewsCategory;
    accentColor: string;
    publishedAt: string; // "YYYY-MM-DD" para o input date
    displayOrder: number;
    isActive: boolean;
    linkType: string;
    linkItemId: number | null;
}

function toDateInputValue(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function rowToFormState(row: PortalNewsRow): FormState {
    return {
        title: row.title,
        description: row.description ?? "",
        icon: row.icon,
        category: row.category,
        accentColor: row.accent_color ?? CATEGORY_DEFAULT_COLORS[row.category],
        publishedAt: toDateInputValue(row.published_at),
        displayOrder: row.display_order,
        isActive: row.is_active,
        linkType: row.link_type ?? "",
        linkItemId: row.link_item_id ?? null,
    };
}

function emptyFormState(): FormState {
    return {
        title: "",
        description: "",
        icon: "📌",
        category: "launch",
        accentColor: CATEGORY_DEFAULT_COLORS["launch"],
        publishedAt: toDateInputValue(new Date()),
        displayOrder: 0,
        isActive: true,
        linkType: "",
        linkItemId: null,
    };
}

// —— Subcomponente: Formulário de criação/edição ——
interface ItemModalProps {
    form: FormState;
    isSubmitting: boolean;
    isEdit: boolean;
    onChange: (field: keyof FormState, value: string | boolean | number | null) => void;
    onSubmit: () => void;
    onCancel: () => void;
    linkItems: Array<{ id: number; title: string }>;
    isLoadingLinkItems: boolean;
}

// Classes reutilizáveis — mantém padrão visual do formulário de Conteúdos
const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50";

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]/70 whitespace-nowrap">
                {label}
            </span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
    );
}

function ItemModal({ form, isSubmitting, isEdit, onChange, onSubmit, onCancel, linkItems, isLoadingLinkItems }: ItemModalProps) {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const titleEmpty = !form.title.trim();

    // Focar o campo título ao abrir
    useEffect(() => {
        const timer = setTimeout(() => titleInputRef.current?.focus(), 50);
        return () => clearTimeout(timer);
    }, []);

    // Formata a data de publicação para o preview
    const previewDate = form.publishedAt
        ? (() => {
            const [y, m, d] = form.publishedAt.split("-");
            return `${d}.${m}.${y}`;
        })()
        : "—";

    return (
        <GlassCard variant="elevated" padding="lg">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {isEdit ? "Editar Novidade" : "Nova Novidade"}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {isEdit ? "Altere os campos e salve." : "Preencha os campos e publique."}
                </p>
            </div>

            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="space-y-6"
            >

                {/* — Conteúdo — */}
                <SectionDivider label="Conteúdo" />

                {/* Ícone + Título */}
                <div className="grid grid-cols-1 md:grid-cols-[90px_1fr] gap-4">
                    <div>
                        <label className={LABEL_CLASS}>Ícone</label>
                        <input
                            className={`${INPUT_CLASS} text-center text-xl`}
                            value={form.icon}
                            onChange={e => onChange("icon", e.target.value)}
                            placeholder="📌"
                            maxLength={4}
                            aria-label="Ícone da novidade"
                        />
                    </div>
                    <div className="flex-1">
                        <label className={LABEL_CLASS}>
                            Título <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={titleInputRef}
                            className={`${INPUT_CLASS} ${titleEmpty ? "border-red-500/60" : ""}`}
                            value={form.title}
                            onChange={e => onChange("title", e.target.value)}
                            placeholder="Ex: Novo bloco disponível!"
                            aria-required="true"
                            aria-invalid={titleEmpty}
                        />
                        {titleEmpty && (
                            <p className="text-xs text-red-400 mt-1">Campo obrigatório.</p>
                        )}
                    </div>
                </div>

                {/* Descrição */}
                <div>
                    <label className={LABEL_CLASS}>
                        Descrição <span className="font-normal text-[var(--text-secondary)]/70">(opcional)</span>
                    </label>
                    <textarea
                        className={`${INPUT_CLASS} resize-y min-h-[68px]`}
                        value={form.description}
                        onChange={e => onChange("description", e.target.value)}
                        placeholder="Subtítulo ou detalhes que aparecem abaixo do título..."
                    />
                </div>

                {/* — Aparência — */}
                <SectionDivider label="Aparência" />

                {/* Categoria */}
                <div>
                    <label className={LABEL_CLASS}>Categoria</label>
                    <select
                        className={INPUT_CLASS}
                        value={form.category}
                        onChange={e => {
                            const cat = e.target.value as PortalNewsCategory;
                            onChange("category", cat);
                            onChange("accentColor", CATEGORY_DEFAULT_COLORS[cat]);
                        }}
                    >
                        {(Object.keys(CATEGORY_LABELS) as PortalNewsCategory[]).map(cat => (
                            <option key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cor da barra */}
                <div>
                    <label className={LABEL_CLASS}>Cor da barra lateral</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            className="h-12 w-14 rounded-lg cursor-pointer border border-[var(--border-glass)] bg-transparent flex-shrink-0"
                            value={form.accentColor}
                            onChange={e => onChange("accentColor", e.target.value)}
                            aria-label="Selecionar cor"
                        />
                        <input
                            className={`${INPUT_CLASS} font-mono text-xs flex-1`}
                            value={form.accentColor}
                            onChange={e => onChange("accentColor", e.target.value)}
                            maxLength={7}
                            placeholder="#f97316"
                        />
                        {/* Chips de atalho por categoria */}
                        <div className="flex gap-1 flex-shrink-0">
                            {(Object.keys(CATEGORY_DEFAULT_COLORS) as PortalNewsCategory[]).map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    title={CATEGORY_LABELS[cat]}
                                    onClick={() => onChange("accentColor", CATEGORY_DEFAULT_COLORS[cat])}
                                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                                    style={{
                                        backgroundColor: CATEGORY_DEFAULT_COLORS[cat],
                                        borderColor:
                                            form.accentColor === CATEGORY_DEFAULT_COLORS[cat]
                                                ? "white"
                                                : "transparent",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* — Publicação — */}
                <SectionDivider label="Publicação" />

                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-4 items-start">
                    <div>
                        <label className={LABEL_CLASS}>Data de publicação</label>
                        <input
                            type="date"
                            className={INPUT_CLASS}
                            value={form.publishedAt}
                            onChange={e => onChange("publishedAt", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Ordem</label>
                        <input
                            type="number"
                            className={INPUT_CLASS}
                            value={form.displayOrder}
                            onChange={e => onChange("displayOrder", Number(e.target.value))}
                            min={0}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className={LABEL_CLASS}>Visível</label>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isActive}
                            onClick={() => onChange("isActive", !form.isActive)}
                            className={`mt-1 relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/40 ${form.isActive ? "bg-[var(--brand-blue)]" : "bg-[var(--surface-glass)] border border-[var(--border-subtle)]"
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${form.isActive ? "translate-x-7" : "translate-x-1"
                                    }`}
                            />
                        </button>
                        <span className="text-xs text-[var(--text-secondary)] mt-1 text-center">
                            {form.isActive ? "Sim" : "Não"}
                        </span>
                    </div>
                </div>

                {/* — Vincular Material — */}
                <SectionDivider label="Vincular Material (opcional)" />

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className={LABEL_CLASS}>Tema</label>
                            <select
                                className={INPUT_CLASS}
                                value={form.linkType}
                                onChange={e => {
                                    onChange("linkType", e.target.value);
                                    onChange("linkItemId", null);
                                }}
                            >
                                <option value="">Nenhum</option>
                                {Object.entries(LINK_TYPE_CONFIG).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        {form.linkType && (
                            <div className="flex flex-col">
                                <label className={LABEL_CLASS}>&nbsp;</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange("linkType", "");
                                        onChange("linkItemId", null);
                                    }}
                                    className="mt-1 p-2.5 rounded-lg border border-[var(--border-subtle)] hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                                    title="Remover vínculo"
                                >
                                    <X className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        )}
                    </div>

                    {form.linkType && (
                        <div>
                            <label className={LABEL_CLASS}>Material</label>
                            {isLoadingLinkItems ? (
                                <div className="flex items-center gap-2 py-3 text-[var(--text-secondary)] text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Carregando...
                                </div>
                            ) : (
                                <select
                                    className={INPUT_CLASS}
                                    value={form.linkItemId ?? ""}
                                    onChange={e => onChange("linkItemId", e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">Selecionar item...</option>
                                    {linkItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.title}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {form.linkType && form.linkItemId && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-glass)] rounded-lg border border-[var(--border-subtle)]">
                            <span className="text-sm">📎</span>
                            <span className="text-sm text-[var(--text-secondary)]">
                                {LINK_TYPE_CONFIG[form.linkType]?.label} ›{" "}
                                <span className="text-[var(--text-primary)]">
                                    {linkItems.find(i => i.id === form.linkItemId)?.title ?? `ID ${form.linkItemId}`}
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                {/* — Preview — */}
                <SectionDivider label="Preview" />

                <div className="bg-[#111111] border border-[#b8860b]/20 rounded-xl overflow-hidden">
                    <div className="flex items-stretch">
                        <div
                            className="w-1 flex-shrink-0"
                            style={{ backgroundColor: form.accentColor }}
                        />
                        <div className="flex-1 px-4 py-3">
                            <div className="flex items-start gap-2">
                                <span className="text-base leading-none mt-0.5 flex-shrink-0">
                                    {form.icon || "📌"}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold leading-snug">
                                        {form.title || <span className="text-white/30 italic">Título da novidade...</span>}
                                    </p>
                                    {form.description && (
                                        <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{form.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-white/30 text-xs">Publicado em {previewDate}</p>
                                        <span
                                            className="text-[10px] font-semibold px-1.5 py-px rounded-full"
                                            style={{
                                                backgroundColor: form.accentColor + "33",
                                                color: form.accentColor,
                                                border: `1px solid ${form.accentColor}66`,
                                            }}
                                        >
                                            {CATEGORY_LABELS[form.category]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || titleEmpty}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-green)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Salvando...
                            </>
                        ) : isEdit ? (
                            "Salvar alterações"
                        ) : (
                            "Publicar novidade"
                        )}
                    </button>
                </div>
            </form>
        </GlassCard>
    );
}

// —— Componente principal ——
export function AdminPortalNews() {
    const [rows, setRows] = useState<PortalNewsRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Formulário de criação/edição
    const [showModal, setShowModal] = useState(false);
    const [editRow, setEditRow] = useState<PortalNewsRow | null>(null);
    const [form, setForm] = useState<FormState>(emptyFormState());

    // Estado de vínculo de material
    const [linkItems, setLinkItems] = useState<Array<{ id: number; title: string }>>([]);
    const [isLoadingLinkItems, setIsLoadingLinkItems] = useState(false);

    // Confirmação de delete
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; row: PortalNewsRow | null }>({
        show: false,
        row: null,
    });

    // Feedback
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    const showFeedback = (message: string, type: "success" | "error" | "warning") => {
        setFeedback({ show: true, message, type });
    };

    // —— Fetch ——
    const loadRows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/portal-news");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const data = (await res.json()) as PortalNewsRow[];
            setRows(data ?? []);
        } catch (err) {
            console.error("Erro ao carregar novidades:", err);
            showFeedback("Erro ao carregar novidades. Tente novamente.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    // —— Handlers do formulário ——
    const handleFormChange = (field: keyof FormState, value: string | boolean | number | null) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Carrega itens quando linkType muda
    useEffect(() => {
        if (!form.linkType || !showModal) {
            setLinkItems([]);
            return;
        }
        const config = LINK_TYPE_CONFIG[form.linkType];
        if (!config) return;
        // LINK_TYPE_CONFIG uses hyphen (radar-oportunidades); /api/content
        // expects underscore (radar_oportunidades) — translate.
        const apiType = form.linkType === "radar-oportunidades"
            ? "radar_oportunidades"
            : form.linkType;
        setIsLoadingLinkItems(true);
        fetch(`/api/content/${encodeURIComponent(apiType)}`)
            .then(async res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const payload = (await res.json()) as unknown;
                const raw = Array.isArray(payload)
                    ? payload
                    : Array.isArray((payload as { items?: unknown[] })?.items)
                        ? (payload as { items: unknown[] }).items
                        : [];
                const items = raw
                    .map(entry => {
                        const e = entry as { props?: { id?: number; title?: string }; id?: number; title?: string };
                        const src = e.props ?? e;
                        return { id: Number(src.id ?? 0), title: String(src.title ?? "") };
                    })
                    .filter(it => it.id > 0 && it.title)
                    .sort((a, b) => b.id - a.id);
                setLinkItems(items);
            })
            .catch(err => {
                console.error("Erro ao carregar itens para link:", err);
                setLinkItems([]);
            })
            .finally(() => setIsLoadingLinkItems(false));
    }, [form.linkType, showModal]);

    const handleOpenCreate = () => {
        setEditRow(null);
        setForm(emptyFormState());
        setShowModal(true);
    };

    const handleOpenEdit = (row: PortalNewsRow) => {
        setEditRow(row);
        setForm(rowToFormState(row));
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditRow(null);
        setLinkItems([]);
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        setIsSubmitting(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                icon: form.icon.trim() || "📌",
                category: form.category,
                accent_color: form.accentColor || CATEGORY_DEFAULT_COLORS[form.category],
                published_at: form.publishedAt,
                display_order: form.displayOrder,
                is_active: form.isActive,
                link_type: form.linkType || null,
                link_item_id: form.linkItemId,
            };

            const url = editRow
                ? `/api/admin/portal-news/${editRow.id}`
                : `/api/admin/portal-news`;
            const method = editRow ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback(editRow ? "Novidade atualizada com sucesso!" : "Novidade criada com sucesso!", "success");
            handleCloseModal();
            await loadRows();
        } catch (err) {
            console.error("Erro ao salvar novidade:", err);
            showFeedback("Erro ao salvar novidade. Tente novamente.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // —— Toggle ativo ——
    const handleToggleActive = async (row: PortalNewsRow) => {
        try {
            const res = await fetch(`/api/admin/portal-news/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !row.is_active }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback(
                !row.is_active ? "Novidade ativada." : "Novidade desativada.",
                "success",
            );
            await loadRows();
        } catch (err) {
            console.error("Erro ao alternar visibilidade:", err);
            showFeedback("Erro ao alterar visibilidade.", "error");
        }
    };

    // —— Update display_order inline ——
    const handleOrderChange = async (row: PortalNewsRow, newOrder: number) => {
        try {
            const res = await fetch(`/api/admin/portal-news/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ display_order: newOrder }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            await loadRows();
        } catch (err) {
            console.error("Erro ao reordenar:", err);
            showFeedback("Erro ao reordenar item.", "error");
        }
    };

    // —— Delete ——
    const handleDeleteConfirm = async () => {
        if (!confirmDelete.row) return;
        try {
            const res = await fetch(`/api/admin/portal-news/${confirmDelete.row.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback("Novidade deletada.", "success");
            await loadRows();
        } catch (err) {
            console.error("Erro ao deletar:", err);
            showFeedback("Erro ao deletar novidade.", "error");
        } finally {
            setConfirmDelete({ show: false, row: null });
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho + botão criar */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Novidades do Portal</h2>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-blue)] text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
                >
                    <Plus className="w-5 h-5" />
                    Nova novidade
                </button>
            </div>

            {/* Formulário criar/editar (inline) */}
            {showModal && (
                <ItemModal
                    form={form}
                    isSubmitting={isSubmitting}
                    isEdit={editRow !== null}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    linkItems={linkItems}
                    isLoadingLinkItems={isLoadingLinkItems}
                />
            )}

            {/* Tabela */}
            <GlassCard variant="bordered" padding="none">
                {isLoading ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] text-lg">Carregando...</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] text-lg">
                        Nenhuma novidade cadastrada.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--surface-glass)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium w-8">Cor</th>
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">Título</th>
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">Categoria</th>
                                    <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium w-20">Ordem</th>
                                    <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium w-20">Ativo</th>
                                    <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium w-28">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-glass)]">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-[var(--surface-glass)]/50 transition-colors">
                                        {/* Preview barra colorida */}
                                        <td className="px-4 py-3">
                                            <div
                                                className="w-3 h-8 rounded-sm mx-auto"
                                                style={{
                                                    backgroundColor:
                                                        row.accent_color ?? CATEGORY_DEFAULT_COLORS[row.category],
                                                }}
                                            />
                                        </td>
                                        {/* Título */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-start gap-2">
                                                <span className="text-base flex-shrink-0">{row.icon}</span>
                                                <div>
                                                    <p className={`text-sm font-medium ${row.is_active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] line-through"}`}>
                                                        {row.title}
                                                    </p>
                                                    {row.description && (
                                                        <p className="text-xs text-[var(--text-secondary)] truncate max-w-xs">
                                                            {row.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Categoria */}
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                                                style={{
                                                    backgroundColor:
                                                        CATEGORY_DEFAULT_COLORS[row.category] + "99",
                                                    border: `1px solid ${CATEGORY_DEFAULT_COLORS[row.category]}`,
                                                    color: CATEGORY_DEFAULT_COLORS[row.category],
                                                }}
                                            >
                                                {CATEGORY_LABELS[row.category]}
                                            </span>
                                        </td>
                                        {/* Ordem (editável inline) */}
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                className="w-14 px-2 py-1 text-xs text-center rounded bg-[var(--surface-glass)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
                                                defaultValue={row.display_order}
                                                onBlur={e => {
                                                    const val = Number(e.target.value);
                                                    if (val !== row.display_order) {
                                                        handleOrderChange(row, val);
                                                    }
                                                }}
                                                min={0}
                                            />
                                        </td>
                                        {/* Toggle ativo */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleActive(row)}
                                                className="p-1.5 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                                                title={row.is_active ? "Desativar" : "Ativar"}
                                            >
                                                {row.is_active ? (
                                                    <Eye className="w-5 h-5 text-[var(--brand-green)]" />
                                                ) : (
                                                    <EyeOff className="w-5 h-5 text-[var(--text-secondary)]" />
                                                )}
                                            </button>
                                        </td>
                                        {/* Ações */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(row)}
                                                    className="p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4 text-[var(--brand-blue)]" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete({ show: true, row })}
                                                    className="p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                                                    title="Deletar"
                                                >
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
            </GlassCard>

            {/* Confirmação de delete */}
            <ConfirmDialog
                isOpen={confirmDelete.show}
                title="Confirmar Exclusão"
                message={`Você tem certeza que deseja deletar "${confirmDelete.row?.title}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Deletar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete({ show: false, row: null })}
            />

            {/* Feedback */}
            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
