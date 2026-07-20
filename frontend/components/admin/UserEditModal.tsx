"use client";

import { UserListItem } from "@/domain/repositories/IUserManagementRepository";
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

const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border ${hasError ? "border-red-500/60 focus:border-red-500" : "border-border focus:border-foreground/30"} bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors`;

export function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [celular, setCelular] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

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
        const errors: FieldErrors = {
            nome: validateNome(nome),
            email: validateEmail(email),
            celular: validateCelular(celular),
        };
        if (Object.values(errors).some(Boolean)) {
            setFieldErrors(errors);
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim(),
                    celular: celular.replace(/\D/g, ""),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
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
            setGlobalError(err instanceof Error ? err.message : "Erro ao salvar alterações");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-md rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pb-0 pt-6">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            Usuário
                        </p>
                        <h2 className="mt-1 font-serif text-2xl tracking-tight text-ink">Editar dados.</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Fechar"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mx-6 mt-4 h-px bg-border" />

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    {success && (
                        <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
                            <Check className="size-4 shrink-0 text-green-500" />
                            <span className="text-sm text-foreground">Usuário atualizado com sucesso!</span>
                        </div>
                    )}
                    {globalError && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                            <span className="text-sm text-foreground">{globalError}</span>
                        </div>
                    )}

                    {/* Nome */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            <User className="size-3" /> Nome
                        </label>
                        <input
                            type="text"
                            value={nome}
                            onChange={e => { setNome(e.target.value); setFieldErrors(p => ({ ...p, nome: undefined })); }}
                            placeholder="Nome completo"
                            className={inputClass(Boolean(fieldErrors.nome))}
                        />
                        {fieldErrors.nome && (
                            <p className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="size-3" />{fieldErrors.nome}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            <Mail className="size-3" /> Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
                            placeholder="email@exemplo.com"
                            className={inputClass(Boolean(fieldErrors.email))}
                        />
                        {fieldErrors.email && (
                            <p className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="size-3" />{fieldErrors.email}
                            </p>
                        )}
                    </div>

                    {/* Celular */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            <Phone className="size-3" /> Celular
                        </label>
                        <input
                            type="tel"
                            value={celular}
                            onChange={e => handleCelularChange(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className={inputClass(Boolean(fieldErrors.celular))}
                        />
                        {fieldErrors.celular && (
                            <p className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="size-3" />{fieldErrors.celular}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pb-1 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || success}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <><Loader2 className="size-4 animate-spin" />Salvando…</>
                            ) : success ? (
                                <><Check className="size-4" />Salvo!</>
                            ) : "Salvar Alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
