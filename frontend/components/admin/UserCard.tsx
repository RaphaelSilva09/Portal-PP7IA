"use client";

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
        <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Name + admin badge */}
                <div className="flex min-w-[160px] flex-1 items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {user.nome || "Sem nome"}
                    </span>
                    {user.isAdmin && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            <Shield className="size-2.5" />
                            Admin
                        </span>
                    )}
                </div>

                {/* Email */}
                <span className="min-w-[200px] flex-1 truncate text-sm text-muted-foreground">
                    {user.email}
                </span>

                {/* Phone */}
                <span className="hidden text-sm text-muted-foreground sm:block">
                    {user.celular || "—"}
                </span>

                {/* Last sign-in */}
                <span className="hidden text-sm text-muted-foreground md:block">
                    {formatLastSignIn(user.lastSignInAt)}
                </span>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={() => onEdit(user)}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                        aria-label={`Editar ${user.nome || user.email}`}
                    >
                        <Pencil className="size-3.5" />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(user)}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-400/30 hover:text-red-500"
                        aria-label={`Excluir ${user.nome || user.email}`}
                    >
                        <Trash2 className="size-3.5" />
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}
