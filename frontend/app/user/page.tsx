"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useInviteModal } from "@/context/InviteModalContext";
import {
    AlertCircle,
    ArrowLeft,
    Check,
    Eye,
    EyeOff,
    Key,
    Mail,
    Phone,
    Shield,
    Trash2,
    User,
    UserPlus,
} from "lucide-react";
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
    const { user, isLoading, deleteAccount, updatePassword, updateProfile, getCurrentUser } = useAuth();
    const { openModal: openInviteModal } = useInviteModal();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Estados para editar perfil
    const [showEditForm, setShowEditForm] = useState(false);
    const [editData, setEditData] = useState({ nome: "", email: "", celular: "" });
    const [editErrors, setEditErrors] = useState<{ nome?: string; email?: string; celular?: string }>({});
    const [isEditSaving, setIsEditSaving] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editFormError, setEditFormError] = useState<string | null>(null);

    // Estados para alterar senha
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Derivado do user entity - sem efeito, sem chamada assíncrona
    const isAdmin = user?.isAdmin ?? false;

    // Marca que o primeiro ciclo de loading completou
    useEffect(() => {
        if (!isLoading) setHasLoaded(true);
    }, [isLoading]);

    // Redireciona para home se não logado (somente após loading inicial)
    useEffect(() => {
        if (hasLoaded && !isLoading && !user) {
            router.push("/");
        }
    }, [hasLoaded, isLoading, user, router]);

    const openEditForm = () => {
        if (!user) return;
        setEditData({ nome: user.nome || "", email: user.email || "", celular: user.celular || "" });
        setEditErrors({});
        setEditFormError(null);
        setEditSuccess(false);
        setShowEditForm(true);
    };

    const formatPhone = (value: string): string => {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 10) {
            return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, a, b, c) =>
                c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a}` : "",
            );
        }
        return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) =>
            c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a}` : "",
        );
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditFormError(null);
        const errors: { nome?: string; email?: string; celular?: string } = {};
        if (!editData.nome.trim() || editData.nome.trim().length < 2)
            errors.nome = "Nome deve ter pelo menos 2 caracteres";
        if (!editData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email))
            errors.email = "Email com formato inválido";
        const celularDigits = editData.celular.replace(/\D/g, "");
        if (celularDigits.length > 0 && (celularDigits.length < 10 || celularDigits.length > 11))
            errors.celular = "Celular deve ter 10 ou 11 dígitos";
        if (Object.keys(errors).length) {
            setEditErrors(errors);
            return;
        }
        setIsEditSaving(true);
        try {
            await updateProfile(editData.nome.trim(), editData.email.trim(), celularDigits);
            await getCurrentUser();
            setEditSuccess(true);
            setTimeout(() => {
                setShowEditForm(false);
                setEditSuccess(false);
            }, 2000);
        } catch (err) {
            setEditFormError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
        } finally {
            setIsEditSaving(false);
        }
    };

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

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);
        setIsChangingPassword(true);

        // Validação: Senha atual preenchida
        if (!passwordData.currentPassword.trim()) {
            setPasswordError("Digite sua senha atual.");
            setIsChangingPassword(false);
            return;
        }

        // Validação: Nova senha preenchida
        if (!passwordData.newPassword.trim()) {
            setPasswordError("Digite a nova senha.");
            setIsChangingPassword(false);
            return;
        }

        // Validação: Comprimento mínimo
        if (passwordData.newPassword.length < 6) {
            setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
            setIsChangingPassword(false);
            return;
        }

        // Validação: Senhas coincidem
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("A nova senha e a confirmação não coincidem.");
            setIsChangingPassword(false);
            return;
        }

        // Validação: Senha diferente da atual
        if (passwordData.currentPassword === passwordData.newPassword) {
            setPasswordError("A nova senha deve ser diferente da senha atual.");
            setIsChangingPassword(false);
            return;
        }

        try {
            // Supabase updateUser sempre retorna sucesso (200) se não houver error
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);

            // Sucesso - senha alterada e email de confirmação enviado
            setPasswordSuccess(true);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

            // Aguarda 3 segundos antes de fechar o formulário
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess(false);
            }, 3000);
        } catch (err: unknown) {
            // Tratamento de erros específicos
            if (err instanceof Error) {
                const errorMessage = err.message;

                // Mensagens mais claras baseadas no erro
                if (errorMessage.includes("credenciais") || errorMessage.includes("senha incorreta")) {
                    setPasswordError("Senha atual incorreta. Verifique e tente novamente.");
                } else if (errorMessage.includes("network") || errorMessage.includes("rede")) {
                    setPasswordError("Erro de conexão. Verifique sua internet e tente novamente.");
                } else {
                    setPasswordError(errorMessage);
                }
            } else {
                setPasswordError("Erro ao alterar senha. Tente novamente mais tarde.");
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="flex items-center justify-center min-h-[60vh]">
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
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pb-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push("/")}
                            className="portal-back-link cursor-pointer inline-flex items-center gap-2 text-text-secondary mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar para início</span>
                        </button>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Minha Conta</h1>
                                <p className="text-text-secondary">Suas informações cadastrais</p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => router.push("/painel-admin")}
                                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Shield className="w-5 h-5" />
                                    <span>Painel Admin</span>
                                </button>
                            )}
                        </div>
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

                    {/* Seção Editar Perfil */}
                    <div className="mt-8 bg-bg-secondary border border-border-glass rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Editar Perfil
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Atualize seu nome, email ou celular cadastrado.
                                </p>
                            </div>
                        </div>

                        {!showEditForm ? (
                            <button
                                onClick={openEditForm}
                                className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-border-glass text-white font-medium rounded-xl transition-all"
                            >
                                <User className="w-4 h-4" />
                                Editar Meus Dados
                            </button>
                        ) : (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                {editSuccess && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <p className="text-sm font-medium text-green-300">
                                            Perfil atualizado!
                                            {editData.email !== user?.email &&
                                                " Um email de confirmação foi enviado para o novo endereço."}
                                        </p>
                                    </div>
                                )}

                                {editFormError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-300">{editFormError}</p>
                                    </div>
                                )}

                                {/* Nome */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="editNome"
                                        className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                                    >
                                        <User className="w-4 h-4" />
                                        Nome
                                    </label>
                                    <input
                                        id="editNome"
                                        type="text"
                                        value={editData.nome}
                                        onChange={e => {
                                            setEditData(p => ({ ...p, nome: e.target.value }));
                                            setEditErrors(p => ({ ...p, nome: undefined }));
                                        }}
                                        placeholder="Seu nome completo"
                                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:bg-white/[0.07] transition-all ${editErrors.nome ? "border-red-500/50 focus:border-red-500" : "border-border-glass focus:border-brand-blue"}`}
                                    />
                                    {editErrors.nome && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {editErrors.nome}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="editEmail"
                                        className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <input
                                        id="editEmail"
                                        type="email"
                                        value={editData.email}
                                        onChange={e => {
                                            setEditData(p => ({ ...p, email: e.target.value }));
                                            setEditErrors(p => ({ ...p, email: undefined }));
                                        }}
                                        placeholder="seu@email.com"
                                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:bg-white/[0.07] transition-all ${editErrors.email ? "border-red-500/50 focus:border-red-500" : "border-border-glass focus:border-brand-blue"}`}
                                    />
                                    {editErrors.email && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {editErrors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Celular */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="editCelular"
                                        className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Celular
                                    </label>
                                    <input
                                        id="editCelular"
                                        type="tel"
                                        value={editData.celular}
                                        onChange={e => {
                                            setEditData(p => ({ ...p, celular: formatPhone(e.target.value) }));
                                            setEditErrors(p => ({ ...p, celular: undefined }));
                                        }}
                                        placeholder="(11) 99999-9999"
                                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:bg-white/[0.07] transition-all ${editErrors.celular ? "border-red-500/50 focus:border-red-500" : "border-border-glass focus:border-brand-blue"}`}
                                    />
                                    {editErrors.celular && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {editErrors.celular}
                                        </p>
                                    )}
                                </div>

                                {/* Botões */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditForm(false);
                                            setEditErrors({});
                                            setEditFormError(null);
                                        }}
                                        disabled={isEditSaving}
                                        className="cursor-pointer flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isEditSaving || editSuccess}
                                        className="cursor-pointer flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isEditSaving ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Salvando...</span>
                                            </>
                                        ) : editSuccess ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Salvo!</span>
                                            </>
                                        ) : (
                                            "Salvar Alterações"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Seção Alterar Senha */}
                    <div className="mt-8 bg-bg-secondary border border-border-glass rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    Alterar Senha
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Mantenha sua conta segura atualizando sua senha regularmente.
                                </p>
                            </div>
                        </div>

                        {!showPasswordForm ? (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-border-glass text-white font-medium rounded-xl transition-all"
                            >
                                <Key className="w-4 h-4" />
                                Alterar Minha Senha
                            </button>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                {passwordSuccess && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <p className="text-sm font-medium text-green-300">
                                                Senha alterada com sucesso!
                                            </p>
                                        </div>
                                        <p className="text-xs text-green-300/70 pl-6">
                                            Um email de confirmação foi enviado para {user?.email}
                                        </p>
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-300">{passwordError}</p>
                                    </div>
                                )}

                                {/* Senha Atual */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="currentPassword"
                                        className="block text-sm font-medium text-text-secondary"
                                    >
                                        Senha Atual
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="currentPassword"
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={e =>
                                                setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
                                            }
                                            placeholder="Digite sua senha atual"
                                            required
                                            className="w-full px-4 pr-10 py-3 bg-white/5 border border-border-glass rounded-xl text-white placeholder:text-text-secondary/50 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility("current")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                            aria-label={showPasswords.current ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Nova Senha */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-text-secondary"
                                    >
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={e =>
                                                setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                                            }
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                            minLength={6}
                                            className={`w-full px-4 pr-10 py-3 bg-white/5 border rounded-xl text-white placeholder:text-text-secondary/50 outline-none transition-all ${
                                                passwordData.newPassword.length > 0 &&
                                                passwordData.newPassword.length < 6
                                                    ? "border-yellow-500/50 focus:border-yellow-500"
                                                    : passwordData.newPassword.length >= 6
                                                      ? "border-green-500/50 focus:border-green-500"
                                                      : "border-border-glass focus:border-brand-blue"
                                            } focus:bg-white/[0.07]`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility("new")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                            aria-label={showPasswords.new ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordData.newPassword.length > 0 && passwordData.newPassword.length < 6 && (
                                        <p className="text-xs text-yellow-500">
                                            Faltam {6 - passwordData.newPassword.length} caracteres
                                        </p>
                                    )}
                                    {passwordData.newPassword.length >= 6 && (
                                        <p className="text-xs text-green-500">✓ Senha válida</p>
                                    )}
                                </div>

                                {/* Confirmar Nova Senha */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-text-secondary"
                                    >
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={e =>
                                                setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                                            }
                                            placeholder="Digite a senha novamente"
                                            required
                                            minLength={6}
                                            className={`w-full px-4 pr-10 py-3 bg-white/5 border rounded-xl text-white placeholder:text-text-secondary/50 outline-none transition-all ${
                                                passwordData.confirmPassword.length > 0 &&
                                                passwordData.confirmPassword !== passwordData.newPassword
                                                    ? "border-red-500/50 focus:border-red-500"
                                                    : passwordData.confirmPassword.length > 0 &&
                                                        passwordData.confirmPassword === passwordData.newPassword &&
                                                        passwordData.newPassword.length >= 6
                                                      ? "border-green-500/50 focus:border-green-500"
                                                      : "border-border-glass focus:border-brand-blue"
                                            } focus:bg-white/[0.07]`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility("confirm")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                            aria-label={showPasswords.confirm ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordData.confirmPassword.length > 0 &&
                                        passwordData.confirmPassword !== passwordData.newPassword && (
                                            <p className="text-xs text-red-500">✗ As senhas não coincidem</p>
                                        )}
                                    {passwordData.confirmPassword.length > 0 &&
                                        passwordData.confirmPassword === passwordData.newPassword &&
                                        passwordData.newPassword.length >= 6 && (
                                            <p className="text-xs text-green-500">✓ As senhas coincidem</p>
                                        )}
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordError(null);
                                            setPasswordSuccess(false);
                                            setPasswordData({
                                                currentPassword: "",
                                                newPassword: "",
                                                confirmPassword: "",
                                            });
                                        }}
                                        disabled={isChangingPassword}
                                        className="cursor-pointer flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword || passwordSuccess}
                                        className="cursor-pointer flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isChangingPassword ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Alterando Senha...</span>
                                            </>
                                        ) : passwordSuccess ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Senha Alterada!</span>
                                            </>
                                        ) : (
                                            "Salvar Nova Senha"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Seção Convidar */}
                    <div className="mt-8 bg-bg-secondary border border-blue-500/20 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-blue-400 mb-2">Convidar para o Portal</h2>
                        <p className="text-sm text-text-secondary mb-4">
                            Conhece alguém que se beneficiaria do PP7+IAS? Envie um convite por email e a pessoa
                            receberá um link para se cadastrar.
                        </p>
                        <button
                            onClick={openInviteModal}
                            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 font-medium rounded-xl transition-all"
                        >
                            <UserPlus className="w-4 h-4" />
                            Convidar por Email
                        </button>
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
                                <p className="text-sm text-white font-medium">Tem certeza? Esta ação é irreversível.</p>
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
                                className="cursor-pointer flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
