/**
 * UserCard Component (Admin UI)
 *
 * Card de usuário substituindo tabela HTML.
 * Projetado para idosos 80+: informações claras, botões grandes.
 *
 * Princípios de UX:
 * - Sem tabela HTML (ilegível para 80+)
 * - Font-size mínimo 16px
 * - Botões com área de toque generosa
 * - Badge visual para admin
 */

"use client";

import { GlassCard } from "@/components/ui";
import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import { Shield, Trash2, UserMinus } from "lucide-react";

export interface UserCardProps {
    user: UserListItem;
    onPromoteAdmin: (user: UserListItem) => void;
    onDemoteAdmin: (user: UserListItem) => void;
    onDelete: (user: UserListItem) => void;
}

export function UserCard({ user, onPromoteAdmin, onDemoteAdmin, onDelete }: UserCardProps) {
    const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "short",
    });

    return (
        <GlassCard variant="bordered" padding="lg">
            <div className="space-y-4">
                {/* Informações do Usuário */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-[var(--text-primary)] truncate">
                                {user.nome || "Sem nome"}
                            </h3>
                            {user.isAdmin && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--brand-green)]/20 border border-[var(--brand-green)]/50 text-[var(--brand-green)] text-sm font-medium whitespace-nowrap">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-base text-[var(--text-secondary)] mb-1">{user.email}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Membro desde: {memberSince}</p>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t border-[var(--border-glass)]">
                    {user.isAdmin ? (
                        <button
                            onClick={() => onDemoteAdmin(user)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-lg bg-[var(--surface-glass)] border border-orange-500/50 text-orange-400 hover:bg-orange-500/20 transition-colors min-h-[48px]"
                        >
                            <UserMinus className="w-5 h-5" />
                            Remover Admin
                        </button>
                    ) : (
                        <button
                            onClick={() => onPromoteAdmin(user)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-lg bg-[var(--surface-glass)] border border-[var(--brand-green)]/50 text-[var(--brand-green)] hover:bg-[var(--brand-green)]/20 transition-colors min-h-[48px]"
                        >
                            <Shield className="w-5 h-5" />
                            Tornar Admin
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(user)}
                        className="px-4 py-3 text-base font-semibold rounded-lg bg-[var(--surface-glass)] border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors min-h-[48px]"
                        aria-label={`Excluir ${user.nome || user.email}`}
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
