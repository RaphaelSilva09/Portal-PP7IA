/**
 * UserManager Component (Admin UI)
 *
 * Gerenciador de usuários do painel admin com paginação server-side e busca.
 * Projetado para idosos 80+: cards simples, busca grande, feedback claro.
 *
 * Princípios de UX:
 * - Barra de busca grande (20px font, 56px altura) com debounce server-side
 * - Seletor de 10 / 25 / 50 usuários por página
 * - Paginação no rodapé: ← Anterior | Página X de Y | Próximo →
 * - Cards em layout linear simples
 * - Confirmação em duas etapas para exclusão
 *
 * Performance:
 * - Nenhum dado extra em memória — apenas a página atual
 * - Busca executada no Supabase via .ilike (server-side)
 * - isAdmin resolvido corretamente via auth.admin (service_role)
 */

"use client";

import { GlassCard } from "@/components/ui";
import { GetUsersParams, UserListItem } from "@/domain/repositories/IUserManagementRepository";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage, FeedbackType } from "./FeedbackMessage";
import { UserCard } from "./UserCard";
import { UserEditModal } from "./UserEditModal";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function UserManager() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<PageSize>(25);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "danger" | "warning";
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        variant: "danger",
        onConfirm: () => {},
    });

    // Edit modal state
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        user: UserListItem | null;
    }>({
        isOpen: false,
        user: null,
    });

    // Feedback message state
    const [feedback, setFeedback] = useState<{
        isVisible: boolean;
        type: FeedbackType;
        message: string;
    }>({
        isVisible: false,
        type: "success",
        message: "",
    });

    const loadUsers = useCallback(async (params: GetUsersParams) => {
        setIsLoading(true);
        try {
            const qs = new URLSearchParams();
            if (params.page !== undefined) qs.set("page", String(params.page));
            if (params.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
            if (params.search) qs.set("search", params.search);
            const res = await fetch(`/api/admin/users?${qs.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result = (await res.json()) as {
                users: Array<Omit<UserListItem, "createdAt" | "lastSignInAt"> & {
                    createdAt: string;
                    lastSignInAt: string | null;
                }>;
                total: number;
            };
            setUsers(
                result.users.map(u => ({
                    ...u,
                    createdAt: new Date(u.createdAt),
                    lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt) : null,
                })),
            );
            setTotal(result.total);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            showFeedback("error", "Erro ao carregar usuários");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Carga inicial e ao mudar página ou tamanho
    useEffect(() => {
        loadUsers({ page, pageSize, search: searchQuery });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    // Busca com debounce de 400ms — reseta para página 1
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setPage(1);
            loadUsers({ page: 1, pageSize, search: value });
        }, 400);
    };

    const handlePageSizeChange = (newSize: PageSize) => {
        setPageSize(newSize);
        setPage(1);
        // O useEffect acima vai disparar com os novos valores
    };

    const showFeedback = (type: FeedbackType, message: string) => {
        setFeedback({ isVisible: true, type, message });
    };

    const handleEdit = (user: UserListItem) => {
        setEditModal({ isOpen: true, user });
    };

    const handleEditSuccess = (updatedUser: UserListItem) => {
        setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
        setEditModal({ isOpen: false, user: null });
        showFeedback("success", `✓ Dados de ${updatedUser.nome || updatedUser.email} atualizados`);
    };

    const handleDelete = (user: UserListItem) => {
        setConfirmDialog({
            isOpen: true,
            title: "Excluir Usuário",
            message: `Tem certeza que deseja excluir ${user.nome || user.email}? Esta ação não pode ser desfeita e todos os dados serão removidos permanentemente.`,
            variant: "danger",
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error ?? `HTTP ${res.status}`);
                    }
                    showFeedback("success", "✓ Usuário excluído com sucesso");
                    // Recarrega a página atual (pode voltar página se era o único da última página)
                    const newPage = users.length === 1 && page > 1 ? page - 1 : page;
                    setPage(newPage);
                    loadUsers({ page: newPage, pageSize, search: searchQuery });
                } catch (error) {
                    console.error("Erro ao deletar usuário:", error);
                    showFeedback("error", "Erro ao excluir usuário");
                }
            },
        });
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="space-y-6">
            {/* Barra de Busca + Seletor de itens por página */}
            <GlassCard variant="bordered" padding="lg">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    {/* Campo de busca */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => handleSearchChange(e.target.value)}
                            placeholder="Buscar por nome ou email..."
                            className="w-full pl-14 pr-4 py-4 text-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-glass)] rounded-xl
                                       text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50
                                       focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50 focus:border-[var(--brand-blue)]/50
                                       min-h-[56px] transition-colors"
                        />
                    </div>

                    {/* Seletor de itens por página */}
                    <div className="flex items-center gap-3 shrink-0">
                        <label className="text-base text-[var(--text-secondary)] whitespace-nowrap">Por página:</label>
                        <select
                            value={pageSize}
                            onChange={e => handlePageSizeChange(Number(e.target.value) as PageSize)}
                            className="px-4 py-3 text-lg bg-[var(--bg-secondary)] border-2 border-[var(--border-glass)] rounded-xl
                                       text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50
                                       focus:border-[var(--brand-blue)]/50 transition-colors cursor-pointer min-h-[56px]"
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </GlassCard>

            {/* Header com contagem */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    Gerenciar Usuários{total > 0 ? ` (${total} no total)` : ""}
                </h2>
            </div>

            {/* Lista de usuários */}
            {isLoading ? (
                <GlassCard variant="bordered" padding="lg">
                    <div className="text-center py-12">
                        <p className="text-xl text-[var(--text-secondary)]">Carregando usuários...</p>
                    </div>
                </GlassCard>
            ) : users.length === 0 ? (
                <GlassCard variant="bordered" padding="lg">
                    <div className="text-center py-12">
                        <p className="text-lg text-[var(--text-secondary)]">
                            {searchQuery ? "Nenhum usuário encontrado com esse termo." : "Nenhum usuário cadastrado."}
                        </p>
                    </div>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {users.map(user => (
                        <UserCard key={user.id} user={user} onDelete={handleDelete} onEdit={handleEdit} />
                    ))}
                </div>
            )}

            {/* Paginação */}
            {!isLoading && total > pageSize && (
                <GlassCard variant="bordered" padding="md">
                    <div className="flex items-center justify-between gap-4">
                        {/* Botão Anterior */}
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-2 px-5 py-3 text-lg font-medium rounded-xl
                                       bg-[var(--bg-secondary)] border-2 border-[var(--border-glass)]
                                       text-[var(--text-primary)] transition-colors min-h-[52px]
                                       disabled:opacity-40 disabled:cursor-not-allowed
                                       hover:bg-[var(--brand-blue)]/10 hover:border-[var(--brand-blue)]/40
                                       focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50"
                            aria-label="Página anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Anterior
                        </button>

                        {/* Info de página */}
                        <span className="text-lg text-[var(--text-secondary)] font-medium text-center">
                            Página <span className="text-[var(--text-primary)] font-bold">{page}</span> de{" "}
                            <span className="text-[var(--text-primary)] font-bold">{totalPages}</span>
                        </span>

                        {/* Botão Próximo */}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-2 px-5 py-3 text-lg font-medium rounded-xl
                                       bg-[var(--bg-secondary)] border-2 border-[var(--border-glass)]
                                       text-[var(--text-primary)] transition-colors min-h-[52px]
                                       disabled:opacity-40 disabled:cursor-not-allowed
                                       hover:bg-[var(--brand-blue)]/10 hover:border-[var(--brand-blue)]/40
                                       focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50"
                            aria-label="Próxima página"
                        >
                            Próximo
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

            {/* Edit Modal */}
            <UserEditModal
                isOpen={editModal.isOpen}
                user={editModal.user}
                onClose={() => setEditModal({ isOpen: false, user: null })}
                onSuccess={handleEditSuccess}
            />

            {/* Feedback Message */}
            <FeedbackMessage
                isVisible={feedback.isVisible}
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback({ ...feedback, isVisible: false })}
            />
        </div>
    );
}
