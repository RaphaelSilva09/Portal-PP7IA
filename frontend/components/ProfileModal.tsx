"use client";

import { AlertCircle, Check, Eye, EyeOff, Mail, Phone, Trash2, User as UserIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { isValidEmail, isValidPassword } from "../lib/validators";
import { useAuth } from "../presentation/hooks/useAuth";
import Portal from "./Portal";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ProfileTab = "info" | "security" | "preferences";

interface FormErrors {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, updateEmail, updatePassword, updatePreferences, deleteAccount, isLoading, error, clearError } =
        useAuth();
    const [activeTab, setActiveTab] = useState<ProfileTab>("info");

    // Form states
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptEmailUpdates, setAcceptEmailUpdates] = useState(true);
    const [acceptWhatsAppUpdates, setAcceptWhatsAppUpdates] = useState(true);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useBodyScrollLock(isOpen);

    // Inicializa dados do usuário
    useEffect(() => {
        if (isOpen && user) {
            setNewEmail(user.email);
            setAcceptEmailUpdates(user.acceptEmailUpdates);
            setAcceptWhatsAppUpdates(user.acceptWhatsAppUpdates);
        }
    }, [isOpen, user]);

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            setActiveTab("info");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
            setSuccessMessage(null);
            setShowDeleteConfirm(false);
            clearError();
        }
    }, [isOpen, clearError]);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage(null);

        if (!isValidEmail(newEmail)) {
            setErrors({ email: "Email inválido" });
            return;
        }

        if (newEmail === user?.email) {
            setErrors({ email: "Este já é seu email atual" });
            return;
        }

        try {
            await updateEmail(newEmail);
            setSuccessMessage(
                "Email atualizado! Verifique sua caixa de entrada para confirmar. Se não encontrar, verifique a pasta de spam.",
            );
        } catch {
            // Error handled by useAuth
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage(null);

        if (!currentPassword) {
            setErrors({ currentPassword: "Digite sua senha atual" });
            return;
        }

        if (!isValidPassword(newPassword)) {
            setErrors({ newPassword: "Senha deve ter no mínimo 6 caracteres" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: "Senhas não conferem" });
            return;
        }

        try {
            await updatePassword(currentPassword, newPassword);
            setSuccessMessage("Senha atualizada com sucesso!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            // Error handled by useAuth
        }
    };

    const handleUpdatePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage(null);

        if (!acceptEmailUpdates && !acceptWhatsAppUpdates) {
            setErrors({ email: "Selecione pelo menos uma forma de receber notificações" });
            return;
        }

        try {
            await updatePreferences(acceptEmailUpdates, acceptWhatsAppUpdates);
            setSuccessMessage("Preferências atualizadas com sucesso!");
        } catch {
            // Error handled by useAuth
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            onClose();
        } catch {
            // Error handled by useAuth
        }
    };

    if (!isOpen || !user) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

                {/* Modal */}
                <div className="relative w-full max-w-lg bg-bg-secondary border border-border-glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border-glass">
                        <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-4 border-b border-border-glass bg-bg-primary/30">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "info"
                                    ? "bg-brand-blue text-white"
                                    : "text-text-secondary hover:text-white hover:bg-white/5"
                            }`}
                        >
                            Informações
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "security"
                                    ? "bg-brand-blue text-white"
                                    : "text-text-secondary hover:text-white hover:bg-white/5"
                            }`}
                        >
                            Segurança
                        </button>
                        <button
                            onClick={() => setActiveTab("preferences")}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "preferences"
                                    ? "bg-brand-blue text-white"
                                    : "text-text-secondary hover:text-white hover:bg-white/5"
                            }`}
                        >
                            Preferências
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {/* Error/Success Messages */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-300">{successMessage}</p>
                            </div>
                        )}

                        {/* Info Tab */}
                        {activeTab === "info" && (
                            <form onSubmit={handleUpdateEmail} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Nome</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="text"
                                            value={user.nome}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-border-glass rounded-xl text-white/50 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">Nome não pode ser alterado</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Celular</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="tel"
                                            value={user.celular}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-border-glass rounded-xl text-white/50 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">Celular não pode ser alterado</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={e => setNewEmail(e.target.value)}
                                            className={`w-full pl-10 pr-3 py-2 bg-white/5 border ${
                                                errors.email ? "border-red-500" : "border-border-glass"
                                            } rounded-xl text-white focus:border-brand-blue focus:bg-white/[0.07] outline-none transition-all`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || newEmail === user.email}
                                    className="w-full px-4 py-3 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Atualizando..." : "Atualizar Email"}
                                </button>
                            </form>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Senha Atual
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            className={`w-full pr-10 pl-3 py-2 bg-white/5 border ${
                                                errors.currentPassword ? "border-red-500" : "border-border-glass"
                                            } rounded-xl text-white focus:border-brand-blue focus:bg-white/[0.07] outline-none transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className={`w-full pr-10 pl-3 py-2 bg-white/5 border ${
                                                errors.newPassword ? "border-red-500" : "border-border-glass"
                                            } rounded-xl text-white focus:border-brand-blue focus:bg-white/[0.07] outline-none transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`w-full pr-10 pl-3 py-2 bg-white/5 border ${
                                                errors.confirmPassword ? "border-red-500" : "border-border-glass"
                                            } rounded-xl text-white focus:border-brand-blue focus:bg-white/[0.07] outline-none transition-all`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Atualizando..." : "Atualizar Senha"}
                                </button>
                            </form>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === "preferences" && (
                            <form onSubmit={handleUpdatePreferences} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-3">
                                        Como deseja receber notificações?
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 bg-white/5 border border-border-glass rounded-xl cursor-pointer hover:bg-white/[0.07] transition-all">
                                            <input
                                                type="checkbox"
                                                checked={acceptEmailUpdates}
                                                onChange={e => setAcceptEmailUpdates(e.target.checked)}
                                                className="w-5 h-5 rounded border-border-glass bg-white/5 text-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-offset-0"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">Email</p>
                                                <p className="text-xs text-text-secondary">
                                                    Receber atualizações por email
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 bg-white/5 border border-border-glass rounded-xl cursor-pointer hover:bg-white/[0.07] transition-all">
                                            <input
                                                type="checkbox"
                                                checked={acceptWhatsAppUpdates}
                                                onChange={e => setAcceptWhatsAppUpdates(e.target.checked)}
                                                className="w-5 h-5 rounded border-border-glass bg-white/5 text-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-offset-0"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">WhatsApp</p>
                                                <p className="text-xs text-text-secondary">
                                                    Receber atualizações no WhatsApp
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 mt-2">{errors.email}</p>}
                                    <p className="text-xs text-text-secondary mt-2">
                                        * Pelo menos uma opção deve estar selecionada
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Salvando..." : "Salvar Preferências"}
                                </button>

                                {/* Delete Account Section */}
                                <div className="pt-4 mt-4 border-t border-border-glass">
                                    <h3 className="text-sm font-medium text-red-400 mb-2">Zona de Perigo</h3>
                                    {!showDeleteConfirm ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Deletar Conta
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-sm text-text-secondary">
                                                Tem certeza? Esta ação é irreversível.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteAccount}
                                                    disabled={isLoading}
                                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    {isLoading ? "Deletando..." : "Sim, Deletar"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}
