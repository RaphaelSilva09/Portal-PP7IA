/**
 * UserEditModal Component (Admin UI)
 *
 * Modal para edição de dados de usuário pelo admin.
 * Usa PATCH /api/admin/users/[id] com service_role.
 *
 * Princípios:
 * - Glassmorphism: visual consistente com o restante do painel
 * - Validação por campo: feedback específico, não genérico
 * - SRP: único arquivo, única responsabilidade (editar um usuário)
 */

"use client";

import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
import DIContainer from "@/infrastructure/di/container";
import { AlertCircle, Check, Loader2, Mail, Phone, User, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FieldErrors {
    nome?: string;
    email?: string;
    celular?: string;
}

export interface UserEditModalProps {
    user: UserListItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedUser: UserListItem) => void;
}

function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
        return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, a, b, c) =>
            c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a}` : "",
        );
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) =>
        c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a}` : "",
    );
}

function validateEmail(email: string): string | undefined {
    if (!email.trim()) return "Email é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
}

function validateNome(nome: string): string | undefined {
    if (!nome.trim()) return "Nome é obrigatório";
    if (nome.trim().length < 2) return "Nome deve ter pelo menos 2 caracteres";
}

function validateCelular(celular: string): string | undefined {
    const digits = celular.replace(/\D/g, "");
    if (digits.length > 0 && (digits.length < 10 || digits.length > 11)) return "Celular deve ter 10 ou 11 dígitos";
}

export function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [celular, setCelular] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Sincroniza campos ao abrir o modal
    useEffect(() => {
        if (user && isOpen) {
            setNome(user.nome || "");
            setEmail(user.email || "");
            setCelular(user.celular || "");
            setFieldErrors({});
            setGlobalError(null);
            setSuccess(false);
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleCelularChange = (value: string) => {
        setCelular(formatPhone(value));
        setFieldErrors(prev => ({ ...prev, celular: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError(null);

        // Validação por campo
        const errors: FieldErrors = {
            nome: validateNome(nome),
            email: validateEmail(email),
            celular: validateCelular(celular),
        };
        const hasErrors = Object.values(errors).some(Boolean);
        if (hasErrors) {
            setFieldErrors(errors);
            return;
        }

        setIsSaving(true);
        try {
            const repo = DIContainer.getUserManagementRepository();
            await repo.updateUser(user.id, {
                nome: nome.trim(),
                email: email.trim(),
                celular: celular.replace(/\D/g, ""),
            });

            setSuccess(true);
            const updatedUser: UserListItem = {
                ...user,
                nome: nome.trim(),
                email: email.trim(),
                celular: celular.replace(/\D/g, ""),
            };

            setTimeout(() => {
                onSuccess(updatedUser);
                setSuccess(false);
            }, 1200);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao salvar alterações";
            setGlobalError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Painel glassmorphism */}
            <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-glass)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Editar Usuário</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Sucesso */}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Usuário atualizado com sucesso!</span>
                        </div>
                    )}

                    {/* Erro global */}
                    {globalError && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{globalError}</span>
                        </div>
                    )}

                    {/* Nome */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                            <User className="w-4 h-4" />
                            Nome
                        </label>
                        <input
                            type="text"
                            value={nome}
                            onChange={e => {
                                setNome(e.target.value);
                                setFieldErrors(p => ({ ...p, nome: undefined }));
                            }}
                            placeholder="Nome completo"
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none focus:bg-white/[0.07] transition-all ${fieldErrors.nome ? "border-red-500/60 focus:border-red-500" : "border-[var(--border-glass)] focus:border-[var(--brand-blue)]"}`}
                        />
                        {fieldErrors.nome && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {fieldErrors.nome}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                setFieldErrors(p => ({ ...p, email: undefined }));
                            }}
                            placeholder="email@exemplo.com"
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none focus:bg-white/[0.07] transition-all ${fieldErrors.email ? "border-red-500/60 focus:border-red-500" : "border-[var(--border-glass)] focus:border-[var(--brand-blue)]"}`}
                        />
                        {fieldErrors.email && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    {/* Celular */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                            <Phone className="w-4 h-4" />
                            Celular
                        </label>
                        <input
                            type="tel"
                            value={celular}
                            onChange={e => handleCelularChange(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none focus:bg-white/[0.07] transition-all ${fieldErrors.celular ? "border-red-500/60 focus:border-red-500" : "border-[var(--border-glass)] focus:border-[var(--brand-blue)]"}`}
                        />
                        {fieldErrors.celular && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {fieldErrors.celular}
                            </p>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] rounded-xl transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || success}
                            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                                </>
                            ) : success ? (
                                <>
                                    <Check className="w-4 h-4" /> Salvo!
                                </>
                            ) : (
                                "Salvar Alterações"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
