/**
 * UserManager Component (Admin UI)
 *
 * Gerenciador de usuários do painel admin com busca.
 * Projetado para idosos 80+: cards simples, busca grande, feedback claro.
 *
 * Princípios de UX:
 * - Barra de busca grande (20px font, 56px altura)
 * - Busca por nome ou email
 * - Cards em layout linear simples
 * - Confirmação em duas etapas para exclusão
 */

"use client";

import { GlassCard } from "@/components/ui";
import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import DIContainer from "@/infrastructure/di/container";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage, FeedbackType } from "./FeedbackMessage";
import { UserCard } from "./UserCard";

export function UserManager() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const useCase = DIContainer.getAllUsersUseCase();
            const data = await useCase.execute();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            showFeedback("error", "Erro ao carregar usuários");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const showFeedback = (type: FeedbackType, message: string) => {
        setFeedback({ isVisible: true, type, message });
    };

    // Filtrar usuários por nome ou email
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) {
            return users;
        }

        const query = searchQuery.toLowerCase();
        return users.filter(
            user => user.nome.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
        );
    }, [users, searchQuery]);

    const handleDelete = (user: UserListItem) => {
        setConfirmDialog({
            isOpen: true,
            title: "Excluir Usuário",
            message: `Tem certeza que deseja excluir ${user.nome || user.email}? Esta ação não pode ser desfeita e todos os dados serão removidos permanentemente.`,
            variant: "danger",
            onConfirm: async () => {
                try {
                    const useCase = DIContainer.getDeleteUserAndDataUseCase();
                    await useCase.execute(user.id);
                    showFeedback("success", "✓ Usuário excluído com sucesso");
                    await loadUsers();
                } catch (error) {
                    console.error("Erro ao deletar usuário:", error);
                    showFeedback("error", "Erro ao excluir usuário");
                }
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-xl text-[var(--text-secondary)]">Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Barra de Busca */}
            <GlassCard variant="bordered" padding="lg">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        className="w-full pl-14 pr-4 py-4 text-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-glass)] rounded-xl
                                   text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50
                                   focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50 focus:border-[var(--brand-blue)]/50
                                   min-h-[56px] transition-colors"
                    />
                </div>
            </GlassCard>

            {/* Header com contagem */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    Gerenciar Usuários ({filteredUsers.length})
                </h2>
            </div>

            {/* Lista de usuários */}
            {filteredUsers.length === 0 ? (
                <GlassCard variant="bordered" padding="lg">
                    <div className="text-center py-12">
                        <p className="text-lg text-[var(--text-secondary)]">
                            {searchQuery ? "Nenhum usuário encontrado com esse termo." : "Nenhum usuário cadastrado."}
                        </p>
                    </div>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {filteredUsers.map(user => (
                        <UserCard key={user.id} user={user} onDelete={handleDelete} />
                    ))}
                </div>
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
