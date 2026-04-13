"use client";

import { GlassCard } from "@/components/ui";
import DIContainer from "@/infrastructure/di/container";
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
            const useCase = DIContainer.getTodayRegistrationsUseCase();
            const data = await useCase.execute();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar cadastros do dia:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatHora = (date: Date) =>
        date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return (
        <GlassCard variant="bordered" padding="lg">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                    Cadastros de Hoje{" "}
                    {!isLoading && (
                        <span className="text-[var(--text-secondary)] font-normal">({users.length})</span>
                    )}
                </h3>

                {isLoading && (
                    <p className="text-xl text-[var(--text-secondary)]">Carregando...</p>
                )}

                {!isLoading && users.length === 0 && (
                    <p className="text-xl text-[var(--text-secondary)]">Nenhum cadastro hoje.</p>
                )}

                {!isLoading && users.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-lg">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-left">
                                    <th className="pb-3 pr-6 font-semibold text-[var(--text-secondary)]">Nome</th>
                                    <th className="pb-3 pr-6 font-semibold text-[var(--text-secondary)]">E-mail</th>
                                    <th className="pb-3 pr-6 font-semibold text-[var(--text-secondary)]">Celular</th>
                                    <th className="pb-3 pr-6 font-semibold text-[var(--text-secondary)]">Hora</th>
                                    <th className="pb-3 font-semibold text-[var(--text-secondary)]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-[var(--border-color)] last:border-0"
                                    >
                                        <td className="py-3 pr-6 text-[var(--text-primary)] font-medium">
                                            {user.nome}
                                        </td>
                                        <td className="py-3 pr-6 text-[var(--text-secondary)]">{user.email}</td>
                                        <td className="py-3 pr-6 text-[var(--text-secondary)]">{user.celular}</td>
                                        <td className="py-3 pr-6 text-[var(--text-secondary)]">
                                            {formatHora(user.createdAt)}
                                        </td>
                                        <td className="py-3">
                                            {user.emailVerified ? (
                                                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-base font-semibold text-green-800">
                                                    Verificado
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-base font-semibold text-yellow-800">
                                                    Não verificado
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
        </GlassCard>
    );
}
