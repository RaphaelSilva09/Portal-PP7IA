"use client";

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

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "danger" | "warning";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", variant: "danger", onConfirm: () => {} });

    const [editModal, setEditModal] = useState<{ isOpen: boolean; user: UserListItem | null }>({
        isOpen: false,
        user: null,
    });

    const [feedback, setFeedback] = useState<{ isVisible: boolean; type: FeedbackType; message: string }>({
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
            setUsers(result.users.map(u => ({
                ...u,
                createdAt: new Date(u.createdAt),
                lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt) : null,
            })));
            setTotal(result.total);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            showFeedback("error", "Erro ao carregar usuários");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers({ page, pageSize, search: searchQuery });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

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
    };

    const showFeedback = (type: FeedbackType, message: string) => {
        setFeedback({ isVisible: true, type, message });
    };

    const handleEdit = (user: UserListItem) => setEditModal({ isOpen: true, user });

    const handleEditSuccess = (updatedUser: UserListItem) => {
        setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
        setEditModal({ isOpen: false, user: null });
        showFeedback("success", `Dados de ${updatedUser.nome || updatedUser.email} atualizados`);
    };

    const handleDelete = (user: UserListItem) => {
        setConfirmDialog({
            isOpen: true,
            title: "Excluir Usuário",
            message: `Tem certeza que deseja excluir ${user.nome || user.email}? Esta ação não pode ser desfeita.`,
            variant: "danger",
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error ?? `HTTP ${res.status}`);
                    }
                    showFeedback("success", "Usuário excluído com sucesso");
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
        <div className="space-y-5">
            {/* Search + page size */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Buscar por nome ou email…"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-foreground/30"
                    />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-muted-foreground">Por página:</span>
                    <select
                        value={pageSize}
                        onChange={e => handlePageSizeChange(Number(e.target.value) as PageSize)}
                        className="rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/30"
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Count label */}
            {total > 0 && (
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {total} usuário{total !== 1 ? "s" : ""}
                </p>
            )}

            {/* User list */}
            {isLoading ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                    <p className="text-sm text-muted-foreground">Carregando…</p>
                </div>
            ) : users.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map(user => (
                        <UserCard key={user.id} user={user} onDelete={handleDelete} onEdit={handleEdit} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && total > pageSize && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="size-4" />
                        Anterior
                    </button>

                    <span className="text-sm text-muted-foreground">
                        Página <span className="font-medium text-foreground">{page}</span> de{" "}
                        <span className="font-medium text-foreground">{totalPages}</span>
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Próxima página"
                    >
                        Próximo
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                requireCheckboxLabel={
                    confirmDialog.variant === "danger"
                        ? "Compreendo que deletar um usuário é uma ação não reversível e, caso queira recadastrar, o usuário deverá repetir o fluxo de cadastro pela página"
                        : undefined
                }
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
            <UserEditModal
                isOpen={editModal.isOpen}
                user={editModal.user}
                onClose={() => setEditModal({ isOpen: false, user: null })}
                onSuccess={handleEditSuccess}
            />
            <FeedbackMessage
                isVisible={feedback.isVisible}
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback({ ...feedback, isVisible: false })}
            />
        </div>
    );
}
