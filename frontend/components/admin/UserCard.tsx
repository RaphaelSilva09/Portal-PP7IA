/**
 * UserCard Component (Admin UI)
 *
 * Card de usuário em layout linear simplificado.
 * Projetado para idosos 80+: layout horizontal claro, informações essenciais.
 *
 * Princípios de UX:
 * - Layout linear: nome | email | telefone | último acesso | editar | excluir
 * - Font-size mínimo 18px
 * - Badge admin visível
 * - Botão excluir com área de toque generosa (48px)
 */

"use client";

import { GlassCard } from "@/components/ui";
import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import { Pencil, Shield, Trash2 } from "lucide-react";

export interface UserCardProps {
    user: UserListItem;
    onDelete: (user: UserListItem) => void;
    onEdit: (user: UserListItem) => void;
}

function formatLastSignIn(date: Date | null): string {
    if (!date) return "Nunca acessou";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function UserCard({ user, onDelete, onEdit }: UserCardProps) {
    return (
        <GlassCard variant="bordered" padding="md">
            <div className="flex items-center gap-4 flex-wrap">
                {/* Nome */}
                <div className="flex items-center gap-2 min-w-[180px]">
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
                <div className="flex-1 min-w-[220px]">
                    <span className="text-lg text-[var(--text-secondary)]">{user.email}</span>
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-[var(--border-glass)]" />

                {/* Telefone */}
                <div className="min-w-[140px]">
                    <span className="text-lg text-[var(--text-secondary)]">{user.celular || "Sem telefone"}</span>
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-[var(--border-glass)]" />

                {/* Último acesso */}
                <div className="min-w-[120px]">
                    <span className="text-base text-[var(--text-secondary)]">
                        {formatLastSignIn(user.lastSignInAt)}
                    </span>
                </div>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-[var(--border-glass)]" />

                {/* Botão Editar */}
                <button
                    onClick={() => onEdit(user)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-lg bg-[var(--surface-glass)] border border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors min-h-[48px] whitespace-nowrap"
                    aria-label={`Editar ${user.nome || user.email}`}
                >
                    <Pencil className="w-4 h-4" />
                    Editar
                </button>

                {/* Botão Excluir */}
                <button
                    onClick={() => onDelete(user)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-lg bg-[var(--surface-glass)] border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors min-h-[48px] whitespace-nowrap"
                    aria-label={`Excluir ${user.nome || user.email}`}
                >
                    <Trash2 className="w-5 h-5" />
                    Excluir
                </button>
            </div>
        </GlassCard>
    );
}
