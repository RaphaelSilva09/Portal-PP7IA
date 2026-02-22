/**
 * UserManager Component (Admin UI)
 *
 * Gerenciador de usuários do painel admin.
 * Projetado para idosos 80+: cards ao invés de tabela.
 *
 * Princípios de UX:
 * - Sem tabela HTML (ilegível)
 * - Cards com informações claras
 * - Confirmação em duas etapas para ações destrutivas
 * - Feedback visual centralizado
 */

"use client";

import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import DIContainer from "@/infrastructure/di/container";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage, FeedbackType } from "./FeedbackMessage";
import { UserCard } from "./UserCard";

export function UserManager() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handlePromoteAdmin = (user: UserListItem) => {
        setConfirmDialog({
            isOpen: true,
            title: "Tornar Administrador",
            message: `Tem certeza que deseja tornar ${user.nome || user.email} um administrador? Essa pessoa terá acesso total ao painel.`,
            variant: "warning",
            onConfirm: async () => {
                try {
                    const useCase = DIContainer.getPromoteUserToAdminUseCase();
                    await useCase.execute(user.id);
                    showFeedback("success", "✓ Admin adicionado com sucesso");
                    await loadUsers();
                } catch (error) {
                    console.error("Erro ao promover usuário:", error);
                    showFeedback("error", "Erro ao promover usuário");
                }
            },
        });
    };

    const handleDemoteAdmin = (user: UserListItem) => {
        setConfirmDialog({
            isOpen: true,
            title: "Remover Administrador",
            message: `Tem certeza que deseja remover ${user.nome || user.email} como administrador? Essa pessoa perderá acesso ao painel.`,
            variant: "warning",
            onConfirm: async () => {
                try {
                    const useCase = DIContainer.getDemoteUserFromAdminUseCase();
                    await useCase.execute(user.id);
                    showFeedback("success", "✓ Admin removido com sucesso");
                    await loadUsers();
                } catch (error) {
                    console.error("Erro ao demover usuário:", error);
                    showFeedback("error", "Erro ao remover admin");
                }
            },
        });
    };

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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    Gerenciar Usuários ({users.length})
                </h2>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-[var(--text-secondary)]">Nenhum usuário cadastrado.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onPromoteAdmin={handlePromoteAdmin}
                            onDemoteAdmin={handleDemoteAdmin}
                            onDelete={handleDelete}
                        />
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
