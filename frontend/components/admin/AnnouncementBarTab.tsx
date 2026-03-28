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

import { AnnouncementBar } from "@/domain/entities/AnnouncementBar";
import DIContainer from "@/infrastructure/di/container";
import { Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage } from "./FeedbackMessage";
import { AnnouncementBarForm, AnnouncementBarFormSubmitData } from "./AnnouncementBarForm";
import { GlassCard } from "@/components/ui";

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
            const useCase = DIContainer.getAnnouncementBarsUseCase();
            const data = await useCase.execute();
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
            const useCase = DIContainer.getToggleAnnouncementBarUseCase();
            await useCase.execute(bar.id, !bar.isActive);
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
            const useCase = DIContainer.getUpdateAnnouncementBarUseCase();
            await useCase.execute(editBar.id, data);
            showFeedback("Barra atualizada com sucesso!", "success");
        } else {
            const useCase = DIContainer.getCreateAnnouncementBarUseCase();
            await useCase.execute(data);
            showFeedback("Barra criada com sucesso!", "success");
        }
        setShowForm(false);
        setEditBar(null);
        await loadBars();
    };

    // Duplicar
    const handleDuplicate = async (bar: AnnouncementBar) => {
        try {
            const useCase = DIContainer.getCreateAnnouncementBarUseCase();
            await useCase.execute({
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
            });
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
            const useCase = DIContainer.getDeleteAnnouncementBarUseCase();
            await useCase.execute(confirmDelete.bar.id);
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
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Barras de Aviso</h2>
                <button
                    onClick={() => { setEditBar(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-blue)] text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
                >
                    <Plus className="w-5 h-5" />
                    Nova Barra
                </button>
            </div>

            {/* Tabela */}
            <GlassCard variant="bordered" padding="none">
                {isLoading ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] text-lg">Carregando...</div>
                ) : bars.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] text-lg">
                        Nenhuma barra de aviso cadastrada.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--surface-glass)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">Mensagem</th>
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium w-28">Status</th>
                                    <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium w-20">Prior.</th>
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium w-44">Período</th>
                                    <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium w-36">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-glass)]">
                                {bars.map(bar => {
                                    const status = getBarStatus(bar);
                                    return (
                                        <tr key={bar.id} className="hover:bg-[var(--surface-glass)]/50 transition-colors">
                                            {/* Mensagem */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded flex-shrink-0 border border-white/10"
                                                        style={{ backgroundColor: bar.bgColor }}
                                                        title={`Fundo: ${bar.bgColor}`}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-[var(--text-primary)] truncate max-w-xs">
                                                            {bar.message}
                                                        </p>
                                                        {bar.linkUrl && (
                                                            <p className="text-xs text-[var(--text-secondary)] truncate max-w-xs">
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
                                            <td className="px-4 py-3 text-center text-sm text-[var(--text-secondary)]">
                                                {bar.priority}
                                            </td>
                                            {/* Período */}
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
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
                                                        className="p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                                                        title={bar.isActive ? "Desativar" : "Ativar"}
                                                    >
                                                        {bar.isActive ? (
                                                            <Eye className="w-4 h-4 text-[var(--brand-green)]" />
                                                        ) : (
                                                            <EyeOff className="w-4 h-4 text-[var(--text-secondary)]" />
                                                        )}
                                                    </button>
                                                    {/* Editar */}
                                                    <button
                                                        onClick={() => { setEditBar(bar); setShowForm(true); }}
                                                        className="p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4 text-[var(--brand-blue)]" />
                                                    </button>
                                                    {/* Duplicar */}
                                                    <button
                                                        onClick={() => handleDuplicate(bar)}
                                                        className="p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                                                        title="Duplicar"
                                                    >
                                                        <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                                                    </button>
                                                    {/* Deletar */}
                                                    <button
                                                        onClick={() => setConfirmDelete({ show: true, bar })}
                                                        className="p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
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
            </GlassCard>

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
