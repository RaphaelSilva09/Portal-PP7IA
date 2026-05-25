"use client";

import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import { useEffect, useState } from "react";

export function TodayRegistrations() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTodayRegistrations();
    }, []);

    const loadTodayRegistrations = async () => {
        try {
            const res = await fetch("/api/admin/users/today");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { users: raw } = (await res.json()) as { users: Array<Omit<UserListItem, "createdAt"> & { createdAt: string }> };
            setUsers(raw.map(u => ({ ...u, createdAt: new Date(u.createdAt) })));
        } catch (error) {
            console.error("Erro ao carregar cadastros do dia:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatHora = (date: Date) =>
        date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Cadastros de Hoje
                </p>
                {!isLoading && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {users.length}
                    </span>
                )}
            </div>

            <div className="p-5">
                {isLoading && (
                    <p className="text-sm text-muted-foreground">Carregando…</p>
                )}

                {!isLoading && users.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum cadastro hoje.</p>
                )}

                {!isLoading && users.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="pb-3 pr-5 font-medium text-muted-foreground">Nome</th>
                                    <th className="pb-3 pr-5 font-medium text-muted-foreground">E-mail</th>
                                    <th className="pb-3 pr-5 font-medium text-muted-foreground">Celular</th>
                                    <th className="pb-3 pr-5 font-medium text-muted-foreground">Hora</th>
                                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-border last:border-0">
                                        <td className="py-3 pr-5 font-medium text-foreground">{user.nome}</td>
                                        <td className="py-3 pr-5 text-muted-foreground">{user.email}</td>
                                        <td className="py-3 pr-5 text-muted-foreground">{user.celular || "—"}</td>
                                        <td className="py-3 pr-5 text-muted-foreground">{formatHora(user.createdAt)}</td>
                                        <td className="py-3">
                                            {user.emailVerified ? (
                                                <span className="inline-flex rounded-full border border-green-500/30 px-2.5 py-0.5 text-[11px] font-medium text-green-600">
                                                    Verificado
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full border border-orange-500/30 px-2.5 py-0.5 text-[11px] font-medium text-orange-600">
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
