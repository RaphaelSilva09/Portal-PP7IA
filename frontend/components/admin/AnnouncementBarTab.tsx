"use client";

/**
 * AnnouncementBarTab Component (Admin)
 *
 * Gerenciamento CRUD de barras de aviso.
 * Tabela com todas as barras + ações (toggle, edit, duplicate, delete).
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pelo CRUD de announcement_bars
 * - Accessibility: botões 48px+, feedback claro
 */

import { AnnouncementBar, AnnouncementBarProps } from "@/domain/entities/AnnouncementBar";
import { Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage } from "./FeedbackMessage";
import { AnnouncementBarForm, AnnouncementBarFormSubmitData } from "./AnnouncementBarForm";


/**
 * Reidrata uma AnnouncementBar serializada via JSON.
 * O entity classes serializam como `{ props: {...} }` (private readonly props).
 * Datas chegam como strings ISO — reconstrói para Date.
 */
function rehydrateAnnouncementBar(raw: unknown): AnnouncementBar {
    const data = raw as { props?: Partial<AnnouncementBarProps> } & Partial<AnnouncementBarProps>;
    const src = (data?.props ?? data) as Partial<AnnouncementBarProps>;
    const props: AnnouncementBarProps = {
        id: String(src.id ?? ""),
        message: String(src.message ?? ""),
        linkUrl: (src.linkUrl as string | null) ?? null,
        linkLabel: (src.linkLabel as string | null) ?? null,
        bgColor: String(src.bgColor ?? "#1a1a1a"),
        textColor: String(src.textColor ?? "#ffffff"),
        isActive: Boolean(src.isActive),
        priority: Number(src.priority ?? 0),
        startsAt: src.startsAt ? new Date(src.startsAt as unknown as string) : null,
        endsAt: src.endsAt ? new Date(src.endsAt as unknown as string) : null,
        isClosable: Boolean(src.isClosable),
        createdAt: src.createdAt ? new Date(src.createdAt as unknown as string) : new Date(0),
        updatedAt: src.updatedAt ? new Date(src.updatedAt as unknown as string) : new Date(0),
    };
    return AnnouncementBar.create(props);
}

/** Determina o status visual de uma barra */
function getBarStatus(bar: AnnouncementBar): { label: string; color: string } {
    const now = new Date();
    if (!bar.isActive) {
        // Verifica se expirou mesmo assim
        if (bar.endsAt && now > bar.endsAt) return { label: "Expirado", color: "#ef4444" };
        return { label: "Pausado", color: "#6b7280" };
    }
    if (bar.endsAt && now > bar.endsAt) return { label: "Expirado", color: "#ef4444" };
    if (bar.startsAt && now < bar.startsAt) return { label: "Agendado", color: "#3b82f6" };
    return { label: "Ativo agora", color: "#22c55e" };
}

function formatDatetime(date: Date | null): string {
    if (!date) return "—";
    return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function AnnouncementBarTab() {
    const [bars, setBars] = useState<AnnouncementBar[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal de criação/edição
    const [showForm, setShowForm] = useState(false);
    const [editBar, setEditBar] = useState<AnnouncementBar | null>(null);

    // Confirmação de delete
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; bar: AnnouncementBar | null }>({
        show: false,
        bar: null,
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

    const loadBars = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/content/announcement-bars");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const json = (await res.json()) as { items: unknown[] };
            const data = (json.items ?? []).map(rehydrateAnnouncementBar);
            setBars(data);
        } catch (err) {
            console.error("Erro ao carregar barras de aviso:", err);
            showFeedback("Erro ao carregar barras de aviso.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBars();
    }, [loadBars]);

    // Toggle rápido
    const handleToggle = async (bar: AnnouncementBar) => {
        try {
            const res = await fetch(`/api/content/announcement-bars/${encodeURIComponent(bar.id)}/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !bar.isActive }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback(!bar.isActive ? "Barra ativada." : "Barra desativada.", "success");
            await loadBars();
        } catch (err) {
            console.error("Erro ao alternar barra:", err);
            showFeedback("Erro ao alternar barra.", "error");
        }
    };

    // Criar ou editar
    const handleFormSubmit = async (data: AnnouncementBarFormSubmitData) => {
        if (editBar) {
            const res = await fetch(`/api/content/announcement-bars/${encodeURIComponent(editBar.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback("Barra atualizada com sucesso!", "success");
        } else {
            const res = await fetch("/api/content/announcement-bars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback("Barra criada com sucesso!", "success");
        }
        setShowForm(false);
        setEditBar(null);
        await loadBars();
    };

    // Duplicar
    const handleDuplicate = async (bar: AnnouncementBar) => {
        try {
            const res = await fetch("/api/content/announcement-bars", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message:   bar.message,
                    linkUrl:   bar.linkUrl,
                    linkLabel: bar.linkLabel,
                    bgColor:   bar.bgColor,
                    textColor: bar.textColor,
                    priority:  bar.priority,
                    isActive:  false, // cópia inativa por padrão
                    isClosable: bar.isClosable,
                    startsAt:  bar.startsAt,
                    endsAt:    bar.endsAt,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback("Barra duplicada (inativa).", "success");
            await loadBars();
        } catch (err) {
            console.error("Erro ao duplicar barra:", err);
            showFeedback("Erro ao duplicar barra.", "error");
        }
    };

    // Deletar
    const handleDeleteConfirm = async () => {
        if (!confirmDelete.bar) return;
        try {
            const res = await fetch(`/api/content/announcement-bars/${encodeURIComponent(confirmDelete.bar.id)}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            showFeedback("Barra deletada.", "success");
            await loadBars();
        } catch (err) {
            console.error("Erro ao deletar barra:", err);
            showFeedback("Erro ao deletar barra.", "error");
        } finally {
            setConfirmDelete({ show: false, bar: null });
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl tracking-tight text-ink">Barras de Aviso</h2>
                <button
                    onClick={() => { setEditBar(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
                >
                    <Plus className="w-5 h-5" />
                    Nova Barra
                </button>
            </div>

            {/* Tabela */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground text-lg">Carregando...</div>
                ) : bars.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-lg">
                        Nenhuma barra de aviso cadastrada.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Mensagem</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium w-28">Status</th>
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium w-20">Prior.</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium w-44">Período</th>
                                    <th className="px-4 py-3 text-center text-muted-foreground text-sm font-medium w-36">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {bars.map(bar => {
                                    const status = getBarStatus(bar);
                                    return (
                                        <tr key={bar.id} className="hover:bg-accent/50 transition-colors">
                                            {/* Mensagem */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded flex-shrink-0 border border-white/10"
                                                        style={{ backgroundColor: bar.bgColor }}
                                                        title={`Fundo: ${bar.bgColor}`}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-foreground truncate max-w-xs">
                                                            {bar.message}
                                                        </p>
                                                        {bar.linkUrl && (
                                                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                                🔗 {bar.linkLabel || bar.linkUrl}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                                                    style={{
                                                        backgroundColor: status.color + "22",
                                                        color: status.color,
                                                        border: `1px solid ${status.color}55`,
                                                    }}
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: status.color }}
                                                    />
                                                    {status.label}
                                                </span>
                                            </td>
                                            {/* Prioridade */}
                                            <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                                                {bar.priority}
                                            </td>
                                            {/* Período */}
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-muted-foreground space-y-0.5">
                                                    <div>De: {formatDatetime(bar.startsAt)}</div>
                                                    <div>Até: {formatDatetime(bar.endsAt)}</div>
                                                </div>
                                            </td>
                                            {/* Ações */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Toggle ativo */}
                                                    <button
                                                        onClick={() => handleToggle(bar)}
                                                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                                                        title={bar.isActive ? "Desativar" : "Ativar"}
                                                    >
                                                        {bar.isActive ? (
                                                            <Eye className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                    {/* Editar */}
                                                    <button
                                                        onClick={() => { setEditBar(bar); setShowForm(true); }}
                                                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4 text-foreground" />
                                                    </button>
                                                    {/* Duplicar */}
                                                    <button
                                                        onClick={() => handleDuplicate(bar)}
                                                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                                                        title="Duplicar"
                                                    >
                                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    {/* Deletar */}
                                                    <button
                                                        onClick={() => setConfirmDelete({ show: true, bar })}
                                                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                                                        title="Deletar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de criação/edição */}
            {showForm && (
                <AnnouncementBarForm
                    editBar={editBar}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setShowForm(false); setEditBar(null); }}
                />
            )}

            {/* Confirmação de delete */}
            <ConfirmDialog
                isOpen={confirmDelete.show}
                title="Confirmar Exclusão"
                message={`Deseja deletar a barra "${confirmDelete.bar?.message.slice(0, 60)}..."? Esta ação não pode ser desfeita.`}
                confirmLabel="Deletar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete({ show: false, bar: null })}
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
