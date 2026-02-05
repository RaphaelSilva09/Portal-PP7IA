"use client";

import { Footer, Navbar } from "@/components";
import { useAuth } from "@/presentation/hooks/useAuth";
import { AlertCircle, Mail, Phone, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Página de Perfil do Usuário
 *
 * Exibe informações cadastrais e permite solicitar exclusão da conta.
 * Segue princípios de Clean Architecture: usa hook useAuth para acesso a dados.
 */
export default function UserPage() {
    const router = useRouter();
    const { user, isLoading, deleteAccount, getCurrentUser } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Busca usuário atual ao montar
    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    // Redireciona para home se não logado
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/");
        }
    }, [isLoading, user, router]);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await deleteAccount();
            router.push("/");
        } catch {
            setError("Erro ao excluir conta. Tente novamente.");
            setIsDeleting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary text-white">
                <Navbar />
                <main className="pt-20 flex items-center justify-center min-h-[60vh]">
                    <div className="text-text-secondary">Carregando...</div>
                </main>
                <Footer />
            </div>
        );
    }

    // Não renderiza se não há usuário (vai redirecionar)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-bg-primary text-white">
            <Navbar />
            <main className="pt-20 pb-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Minha Conta</h1>
                        <p className="text-text-secondary">Suas informações cadastrais</p>
                    </div>

                    {/* Card de Informações */}
                    <div className="bg-bg-secondary border border-border-glass rounded-2xl p-6 space-y-6">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                <User className="w-4 h-4" />
                                Nome
                            </label>
                            <div className="px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-white">
                                {user.nome}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                <Mail className="w-4 h-4" />
                                Email
                            </label>
                            <div className="px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-white">
                                {user.email}
                            </div>
                        </div>

                        {/* Telefone */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                <Phone className="w-4 h-4" />
                                Telefone
                            </label>
                            <div className="px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-white">
                                {user.celular}
                            </div>
                        </div>
                    </div>

                    {/* Seção de Exclusão */}
                    <div className="mt-8 bg-bg-secondary border border-red-500/20 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-red-400 mb-2">Zona de Perigo</h2>
                        <p className="text-sm text-text-secondary mb-4">
                            Ao solicitar a exclusão, sua conta e todos os dados associados serão permanentemente
                            removidos.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                Solicitar Exclusão da Conta
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-white font-medium">
                                    Tem certeza? Esta ação é irreversível.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="cursor-pointer flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="cursor-pointer flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
