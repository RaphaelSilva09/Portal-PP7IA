"use client";

import { AlertCircle, Check, Eye, EyeOff, Mail, Phone, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForgotPasswordModal } from "../context/ForgotPasswordModalContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useDialogA11y } from "../hooks/useDialogA11y";
import { formatPhone } from "../lib/formatters";
import { attributeReferralIfPresent } from "../lib/referralCapture";
import { isValidEmail, isValidPassword, isValidPhone } from "../lib/validators";
import Portal from "./Portal";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
    initialData?: {
        email?: string;
        celular?: string;
    };
}

type AuthMode = "login" | "signup";

interface FormData {
    nome: string;
    email: string;
    celular: string;
    senha: string;
}

interface FormErrors {
    nome?: string;
    email?: string;
    celular?: string;
    senha?: string;
    consent?: string;
}

export default function AuthModal({ isOpen, onClose, initialMode = "signup", initialData }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        nome: "",
        email: initialData?.email || "",
        celular: initialData?.celular || "",
        senha: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [acceptEmailUpdates, setAcceptEmailUpdates] = useState(false);
    const [acceptWhatsAppUpdates, setAcceptWhatsAppUpdates] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingNext, setPendingNext] = useState<string | null>(null);

    const { signUp, signIn, isLoading, error: authError, clearError } = useAuth();
    const { openModal: openForgotPasswordModal } = useForgotPasswordModal();
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);

    useBodyScrollLock(isOpen);
    useDialogA11y(isOpen, onClose, panelRef);

    useEffect(() => {
        if (isOpen) setMode(initialMode);
    }, [isOpen, initialMode]);

    useEffect(() => {
        if (!isOpen) return;
        try {
            const next = sessionStorage.getItem("pp7ias.auth-next");
            setPendingNext(next?.startsWith("/") ? next : null);
        } catch {
            setPendingNext(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setFormData({ nome: "", email: initialData?.email || "", celular: initialData?.celular || "", senha: "" });
            setErrors({});
            setShowPassword(false);
            setAcceptEmailUpdates(false);
            setAcceptWhatsAppUpdates(false);
            clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, isOpen, initialData]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (mode === "signup") {
            if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
            if (!formData.celular.trim()) newErrors.celular = "Celular é obrigatório";
            else if (!isValidPhone(formData.celular)) newErrors.celular = "Celular inválido";
            if (!acceptEmailUpdates && !acceptWhatsAppUpdates) {
                newErrors.consent = "Aceite pelo menos uma forma de receber atualizações";
            }
        }

        if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
        else if (!isValidEmail(formData.email)) newErrors.email = "Email inválido";

        if (!formData.senha.trim()) newErrors.senha = "Senha é obrigatória";
        else if (!isValidPassword(formData.senha)) newErrors.senha = "Senha deve ter no mínimo 6 caracteres";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (field === "celular") value = formatPhone(value);
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (mode === "login") {
                await signIn({ email: formData.email, password: formData.senha });
                onClose();
                // Retorna à página que o usuário tentou acessar antes do login.
                let next: string | null = null;
                try {
                    next = sessionStorage.getItem("pp7ias.auth-next");
                    sessionStorage.removeItem("pp7ias.auth-next");
                } catch { /* storage indisponível */ }
                router.push(next?.startsWith("/") ? next : "/");
            } else {
                const result = await signUp({
                    email: formData.email,
                    password: formData.senha,
                    nome: formData.nome,
                    celular: formData.celular,
                    acceptEmailUpdates,
                    acceptWhatsAppUpdates,
                });
                attributeReferralIfPresent();
                if (result.emailConfirmationRequired) {
                    setSuccessMessage("Cadastro realizado! Verifique seu email para confirmar sua conta. Se não encontrar, verifique a pasta de spam.");
                } else {
                    onClose();
                }
            }
        } catch (error) {
            console.error("Erro ao processar autenticação:", error);
        }
    };

    const toggleMode = () => setMode(prev => (prev === "login" ? "signup" : "login"));

    if (!isOpen) return null;

    const isLoginMode = mode === "login";
    const nameInputId = "auth-nome";
    const emailInputId = "auth-email";
    const phoneInputId = "auth-celular";
    const passwordInputId = "auth-senha";

    const inputClass = (hasError: boolean) =>
        `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-background outline-none transition focus:ring-2 focus:ring-primary/20 ${
            hasError ? "border-red-400" : "border-border focus:border-primary/40"
        }`;

    const iconInputClass = (hasError: boolean) => `${inputClass(hasError)} pl-10`;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
                <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="auth-modal-title"
                    className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-elevated)]"
                    style={{ maxHeight: "calc(100vh - 2rem)" }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                {isLoginMode ? "Bem-vindo de volta" : "Criar conta"}
                            </div>
                            <h2 id="auth-modal-title" className="mt-1 font-serif text-3xl text-ink">
                                {isLoginMode ? "Entrar." : "Cadastrar."}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {isLoginMode
                                    ? "Entre com suas credenciais para acessar sua conta"
                                    : "Crie sua conta para ter acesso completo ao portal"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 mt-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Fechar modal"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Contexto de redirect: usuário tentou acessar área protegida */}
                    {isLoginMode && pendingNext && !authError && !successMessage && (
                        <div className="mx-6 mb-2 flex items-start gap-2 rounded-xl border border-border bg-accent/60 p-3">
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                                Entre para acessar a página que você tentou abrir.
                            </p>
                        </div>
                    )}

                    {/* Auth Error */}
                    {authError && (
                        <div
                            role="alert"
                            className="mx-6 mb-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/20"
                        >
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                            <p className="text-xs text-red-700 dark:text-red-400">{authError}</p>
                        </div>
                    )}

                    {/* Success */}
                    {successMessage && (
                        <div className="mx-6 mb-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
                            <div className="mb-3 flex items-start gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                <p className="text-sm text-emerald-800 dark:text-emerald-300">{successMessage}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-full border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400"
                            >
                                Explorar conteúdo
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
                            {/* Nome */}
                            {!isLoginMode && (
                                <div className="space-y-1.5">
                                    <label htmlFor={nameInputId} className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Nome Completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id={nameInputId}
                                            type="text"
                                            value={formData.nome}
                                            onChange={handleInputChange("nome")}
                                            placeholder="Seu nome completo"
                                            autoComplete="name"
                                            aria-invalid={!!errors.nome}
                                            className={iconInputClass(!!errors.nome)}
                                        />
                                    </div>
                                    {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label htmlFor={emailInputId} className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id={emailInputId}
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange("email")}
                                        placeholder="seu@email.com"
                                        autoComplete="email"
                                        aria-invalid={!!errors.email}
                                        className={iconInputClass(!!errors.email)}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {/* Celular */}
                            {!isLoginMode && (
                                <div className="space-y-1.5">
                                    <label htmlFor={phoneInputId} className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Celular
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            id={phoneInputId}
                                            type="tel"
                                            value={formData.celular}
                                            onChange={handleInputChange("celular")}
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                            autoComplete="tel"
                                            aria-invalid={!!errors.celular}
                                            className={iconInputClass(!!errors.celular)}
                                        />
                                    </div>
                                    {errors.celular && <p className="text-xs text-red-500">{errors.celular}</p>}
                                </div>
                            )}

                            {/* Senha */}
                            <div className="space-y-1.5">
                                <label htmlFor={passwordInputId} className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id={passwordInputId}
                                        type={showPassword ? "text" : "password"}
                                        value={formData.senha}
                                        onChange={handleInputChange("senha")}
                                        placeholder="Mínimo 6 caracteres"
                                        autoComplete={isLoginMode ? "current-password" : "new-password"}
                                        aria-invalid={!!errors.senha}
                                        className={`${inputClass(!!errors.senha)} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.senha && <p className="text-xs text-red-500">{errors.senha}</p>}
                            </div>

                            {/* Checkboxes */}
                            {!isLoginMode && (
                                <div className="space-y-2 rounded-xl border border-border p-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                        Quero receber atualizações por
                                    </p>
                                    {[
                                        { id: "auth-consent-email", checked: acceptEmailUpdates, onChange: (v: boolean) => { setAcceptEmailUpdates(v); if (errors.consent && (v || acceptWhatsAppUpdates)) setErrors(p => ({ ...p, consent: undefined })); }, label: "E-mail" },
                                        { id: "auth-consent-whatsapp", checked: acceptWhatsAppUpdates, onChange: (v: boolean) => { setAcceptWhatsAppUpdates(v); if (errors.consent && (v || acceptEmailUpdates)) setErrors(p => ({ ...p, consent: undefined })); }, label: "WhatsApp" },
                                    ].map(({ id, checked, onChange, label }) => (
                                        <label key={label} htmlFor={id} className="flex cursor-pointer items-center gap-2.5 group">
                                            <input
                                                id={id}
                                                type="checkbox"
                                                checked={checked}
                                                onChange={event => onChange(event.target.checked)}
                                                className="sr-only"
                                            />
                                            <span
                                                aria-hidden="true"
                                                className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                                    checked ? "border-ink bg-ink" : "border-border group-hover:border-foreground/40"
                                                }`}
                                            >
                                                {checked && <Check className="size-2.5 text-background" />}
                                            </span>
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                                        </label>
                                    ))}
                                    {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                                        Processando…
                                    </span>
                                ) : (
                                    isLoginMode ? "Entrar" : "Cadastrar"
                                )}
                            </button>

                            {/* Footer links */}
                            <div className="border-t border-border pt-4 text-center">
                                <p className="text-xs text-muted-foreground">
                                    {isLoginMode ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        className="font-medium text-primary underline-offset-2 hover:underline"
                                    >
                                        {isLoginMode ? "Cadastrar" : "Entrar"}
                                    </button>
                                </p>
                                {isLoginMode && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        <button
                                            type="button"
                                            onClick={() => { onClose(); openForgotPasswordModal(); }}
                                            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors"
                                        >
                                            Esqueceu sua senha?
                                        </button>
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
