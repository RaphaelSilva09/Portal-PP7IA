/**
 * UserCard Component (Admin UI)
 *
 * Card de usuário em layout linear simplificado.
 * Projetado para idosos 80+: layout horizontal claro, informações essenciais.
 *
 * Princípios de UX:
 * - Layout linear: nome | email | telefone | excluir
 * - Font-size mínimo 18px
 * - Badge admin visível
 * - Botão excluir com área de toque generosa (48px)
 */

"use client";

import { GlassCard } from "@/components/ui";
import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import { Shield, Trash2 } from "lucide-react";

export interface UserCardProps {
    user: UserListItem;
    onDelete: (user: UserListItem) => void;
}

export function UserCard({ user, onDelete }: UserCardProps) {
    return (
        <GlassCard variant="bordered" padding="md">
            <div className="flex items-center gap-6">
                {/* Nome */}
                <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="text-lg font-semibold text-[var(--text-primary)] truncate">
                        {user.nome || "Sem nome"}
                    </span>
                    {user.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--brand-green)]/20 border border-[var(--brand-green)]/50 text-[var(--brand-green)] text-xs font-medium whitespace-nowrap">
                            <Shield className="w-3 h-3" />
                            Admin
                        </span>
                    )}
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-[var(--border-glass)]" />

                {/* Email */}
                <div className="flex-1 min-w-[250px]">
                    <span className="text-lg text-[var(--text-secondary)]">{user.email}</span>
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-[var(--border-glass)]" />

                {/* Telefone */}
                <div className="min-w-[150px]">
                    <span className="text-lg text-[var(--text-secondary)]">{user.celular || "Sem telefone"}</span>
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-[var(--border-glass)]" />

                {/* Botão Excluir */}
                <button
                    onClick={() => onDelete(user)}
                    className="flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold rounded-lg bg-[var(--surface-glass)] border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors min-h-[48px] whitespace-nowrap"
                    aria-label={`Excluir ${user.nome || user.email}`}
                >
                    <Trash2 className="w-5 h-5" />
                    Excluir
                </button>
            </div>
        </GlassCard>
    );
}
