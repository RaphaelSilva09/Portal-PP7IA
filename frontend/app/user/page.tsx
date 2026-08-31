"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { portalContentClass } from "@/lib/layout";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    Compass,
    Eye,
    EyeOff,
    Key,
    Loader2,
    Shield,
    Trash2,
    UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function UserPage() {
    const router = useRouter();
    const { user, isLoading, deleteAccount, updatePassword, updateProfile, getCurrentUser } = useAuth();
    const { openModal: openInviteModal } = useInviteModal();
    const { openOnboarding } = useOnboarding();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Profile form — always visible, pre-filled
    const [editData, setEditData] = useState({ nome: "", email: "", celular: "" });
    const [editErrors, setEditErrors] = useState<{ nome?: string; email?: string; celular?: string }>({});
    const [isEditSaving, setIsEditSaving] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editFormError, setEditFormError] = useState<string | null>(null);

    // Password form
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Weekly news preference
    const [weeklyNewsEnabled, setWeeklyNewsEnabled] = useState(false);
    const [weeklyNewsLoaded, setWeeklyNewsLoaded] = useState(false);
    const [weeklyNewsSaving, setWeeklyNewsSaving] = useState(false);
    const [weeklyNewsError, setWeeklyNewsError] = useState<string | null>(null);

    const isAdmin = user?.isAdmin ?? false;

    useEffect(() => {
        if (!isLoading) setHasLoaded(true);
    }, [isLoading]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        fetch("/api/user/preferences/weekly-news")
            .then(res => (res.ok ? res.json() : Promise.reject(res)))
            .then((data: { enabled: boolean }) => {
                if (!cancelled) setWeeklyNewsEnabled(data.enabled);
            })
            .catch(() => {
                // Falha ao carregar preferência: mantém o padrão seguro (não inscrito).
            })
            .finally(() => {
                if (!cancelled) setWeeklyNewsLoaded(true);
            });
        return () => { cancelled = true; };
    }, [user]);

    const handleToggleWeeklyNews = useCallback(async () => {
        const next = !weeklyNewsEnabled;
        setWeeklyNewsEnabled(next);
        setWeeklyNewsSaving(true);
        setWeeklyNewsError(null);
        try {
            const res = await fetch("/api/user/preferences/weekly-news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: next }),
            });
            if (!res.ok) throw new Error();
        } catch {
            setWeeklyNewsEnabled(!next);
            setWeeklyNewsError("Não foi possível salvar agora. Tente novamente.");
        } finally {
            setWeeklyNewsSaving(false);
        }
    }, [weeklyNewsEnabled]);

    useEffect(() => {
        if (hasLoaded && !isLoading && !user) router.push("/");
    }, [hasLoaded, isLoading, user, router]);

    // Pre-fill form when user loads
    useEffect(() => {
        if (user) {
            setEditData({
                nome: user.nome || "",
                email: user.email || "",
                celular: formatPhone(user.celular || ""),
            });
        }
    }, [user]);

    const isProfileDirty = user && (
        editData.nome !== (user.nome || "") ||
        editData.email !== (user.email || "") ||
        editData.celular.replace(/\D/g, "") !== (user.celular || "").replace(/\D/g, "")
    );

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

    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        setEditFormError(null);
        const errors: typeof editErrors = {};
        if (!editData.nome.trim() || editData.nome.trim().length < 2)
            errors.nome = "Nome deve ter pelo menos 2 caracteres";
        if (!editData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email))
            errors.email = "Email com formato inválido";
        const celularDigits = editData.celular.replace(/\D/g, "");
        if (celularDigits.length > 0 && (celularDigits.length < 10 || celularDigits.length > 11))
            errors.celular = "Celular deve ter 10 ou 11 dígitos";
        if (Object.keys(errors).length) { setEditErrors(errors); return; }
        setIsEditSaving(true);
        try {
            await updateProfile(editData.nome.trim(), editData.email.trim(), celularDigits);
            await getCurrentUser();
            setEditSuccess(true);
            setTimeout(() => setEditSuccess(false), 3000);
        } catch (err) {
            setEditFormError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
        } finally {
            setIsEditSaving(false);
        }
    }

    async function handleDeleteAccount() {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteAccount();
            router.push("/");
        } catch {
            setDeleteError("Erro ao excluir conta. Tente novamente.");
            setIsDeleting(false);
        }
    }

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);
        setIsChangingPassword(true);
        if (!passwordData.currentPassword.trim()) { setPasswordError("Digite sua senha atual."); setIsChangingPassword(false); return; }
        if (!passwordData.newPassword.trim()) { setPasswordError("Digite a nova senha."); setIsChangingPassword(false); return; }
        if (passwordData.newPassword.length < 6) { setPasswordError("A nova senha deve ter pelo menos 6 caracteres."); setIsChangingPassword(false); return; }
        if (passwordData.newPassword !== passwordData.confirmPassword) { setPasswordError("As senhas não coincidem."); setIsChangingPassword(false); return; }
        if (passwordData.currentPassword === passwordData.newPassword) { setPasswordError("A nova senha deve ser diferente da senha atual."); setIsChangingPassword(false); return; }
        try {
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordSuccess(true);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => { setShowPasswordForm(false); setPasswordSuccess(false); }, 3000);
        } catch (err) {
            if (err instanceof Error) {
                const msg = err.message;
                if (msg.includes("credenciais") || msg.includes("senha incorreta")) setPasswordError("Senha atual incorreta.");
                else if (msg.includes("network") || msg.includes("rede")) setPasswordError("Erro de conexão. Verifique sua internet.");
                else setPasswordError(msg);
            } else {
                setPasswordError("Erro ao alterar senha. Tente novamente mais tarde.");
            }
        } finally {
            setIsChangingPassword(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!user) return null;

    const firstName = (user.nome || "").split(" ")[0] || "Minha conta";

    const inputBase = "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-foreground/40 transition-colors";
    const inputErr  = "border-red-500/50 focus:border-red-500/70";

    function SectionLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
        return (
            <p className={`mb-3 text-[11px] font-medium uppercase tracking-[0.22em] ${danger ? "text-red-400/70" : "text-muted-foreground"}`}>
                {children}
            </p>
        );
    }

    function Feedback({ ok, message }: { ok: boolean; message: string }) {
        return (
            <div className={`flex items-start gap-2 rounded-xl border border-border px-4 py-3 text-sm ${ok ? "bg-accent" : "bg-accent"}`}>
                {ok
                    ? <Check className="size-4 shrink-0 mt-0.5 text-green-500" />
                    : <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />}
                <span className="text-foreground">{message}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pb-24 pt-10">
                <div className={portalContentClass}>
                    <div className="mx-auto max-w-2xl">

                        {/* Back */}
                        <button
                            onClick={() => router.push("/")}
                            className="mb-10 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5" />
                            Início
                        </button>

                        {/* ── Cabeçalho do usuário ────────────────────────── */}
                        <div className="mb-10 flex items-center gap-5">
                            <div
                                className="flex size-14 shrink-0 items-center justify-center rounded-2xl font-serif text-2xl"
                                style={{ backgroundColor: "var(--block-newsletter-soft)", color: "var(--block-newsletter-on-soft)" }}
                            >
                                {firstName[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="font-serif text-3xl tracking-tight text-ink md:text-4xl">
                                    {firstName}.
                                </h1>
                                <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        {/* ── Admin banner ─────────────────────────────────── */}
                        {isAdmin && (
                            <div className="mb-10">
                                <SectionLabel>Administração</SectionLabel>
                                <button
                                    onClick={() => router.push("/painel-admin")}
                                    className="group w-full overflow-hidden rounded-2xl bg-foreground px-6 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/15">
                                            <Shield className="size-5 text-background" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-background">Painel de Administração</p>
                                            <p className="text-sm text-background/55">Usuários · Conteúdos · Configurações</p>
                                        </div>
                                        <ArrowRight className="size-4 text-background/40 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* ── Conta ────────────────────────────────────────── */}
                        <div className="mb-8">
                            <SectionLabel>Conta</SectionLabel>
                            <div className="rounded-2xl border border-border bg-card p-6">
                                <form onSubmit={handleEditSubmit} className="space-y-5">
                                    {editSuccess && <Feedback ok message="Perfil atualizado com sucesso." />}
                                    {editFormError && <Feedback ok={false} message={editFormError} />}

                                    {([
                                        { id: "editNome",    label: "Nome",    type: "text",  key: "nome",    placeholder: "Seu nome completo"  },
                                        { id: "editEmail",   label: "Email",   type: "email", key: "email",   placeholder: "seu@email.com"      },
                                        { id: "editCelular", label: "Celular", type: "tel",   key: "celular", placeholder: "(11) 99999-9999"    },
                                    ] as const).map(({ id, label, type, key, placeholder }) => (
                                        <div key={id} className="space-y-1.5">
                                            <label htmlFor={id} className="block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                {label}
                                            </label>
                                            <input
                                                id={id}
                                                type={type}
                                                value={editData[key]}
                                                onChange={e => {
                                                    const val = key === "celular" ? formatPhone(e.target.value) : e.target.value;
                                                    setEditData(p => ({ ...p, [key]: val }));
                                                    setEditErrors(p => ({ ...p, [key]: undefined }));
                                                }}
                                                placeholder={placeholder}
                                                className={`${inputBase} ${editErrors[key] ? inputErr : ""}`}
                                            />
                                            {editErrors[key] && <p className="text-xs text-red-500">{editErrors[key]}</p>}
                                        </div>
                                    ))}

                                    {isProfileDirty && (
                                        <div className="flex gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (user) setEditData({ nome: user.nome || "", email: user.email || "", celular: formatPhone(user.celular || "") });
                                                    setEditErrors({});
                                                    setEditFormError(null);
                                                }}
                                                disabled={isEditSaving}
                                                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                                            >
                                                Descartar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isEditSaving || editSuccess}
                                                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50"
                                            >
                                                {isEditSaving
                                                    ? <><Loader2 className="size-3.5 animate-spin" />Salvando…</>
                                                    : editSuccess
                                                    ? <><Check className="size-3.5" />Salvo!</>
                                                    : "Salvar alterações"}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* ── Segurança ─────────────────────────────────────── */}
                        <div className="mb-8">
                            <SectionLabel>Segurança</SectionLabel>
                            <div className="rounded-2xl border border-border bg-card">
                                <button
                                    type="button"
                                    onClick={() => { setShowPasswordForm(v => !v); setPasswordError(null); setPasswordSuccess(false); }}
                                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-accent/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <Key className="size-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">Senha de acesso</span>
                                    </div>
                                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        {showPasswordForm ? "Fechar" : "Alterar"}
                                    </span>
                                </button>

                                {showPasswordForm && (
                                    <form onSubmit={handlePasswordChange} className="border-t border-border px-6 pb-6 pt-5 space-y-4">
                                        {passwordSuccess && (
                                            <Feedback ok message={`Senha alterada. Confirmação enviada para ${user.email}.`} />
                                        )}
                                        {passwordError && <Feedback ok={false} message={passwordError} />}

                                        {(["currentPassword", "newPassword", "confirmPassword"] as const).map(field => {
                                            const labels      = { currentPassword: "Senha atual", newPassword: "Nova senha", confirmPassword: "Confirmar nova senha" };
                                            const placeholders = { currentPassword: "••••••••", newPassword: "Mínimo 6 caracteres", confirmPassword: "Repita a nova senha" };
                                            const visKey      = field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm";
                                            const isNew       = field === "newPassword";
                                            const isConfirm   = field === "confirmPassword";
                                            const borderExtra = isNew && passwordData.newPassword.length > 0
                                                ? passwordData.newPassword.length < 6 ? "border-amber-500/50" : "border-green-500/50"
                                                : isConfirm && passwordData.confirmPassword.length > 0
                                                ? passwordData.confirmPassword !== passwordData.newPassword ? "border-red-500/50" : "border-green-500/50"
                                                : "";
                                            return (
                                                <div key={field} className="space-y-1.5">
                                                    <label htmlFor={field} className="block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        {labels[field]}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id={field}
                                                            type={showPasswords[visKey] ? "text" : "password"}
                                                            value={passwordData[field]}
                                                            onChange={e => setPasswordData(p => ({ ...p, [field]: e.target.value }))}
                                                            placeholder={placeholders[field]}
                                                            required
                                                            minLength={field !== "currentPassword" ? 6 : undefined}
                                                            className={`${inputBase} pr-10 ${borderExtra}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(p => ({ ...p, [visKey]: !p[visKey] }))}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                                            aria-label={showPasswords[visKey] ? "Ocultar" : "Mostrar"}
                                                        >
                                                            {showPasswords[visKey] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                        </button>
                                                    </div>
                                                    {isNew && passwordData.newPassword.length > 0 && passwordData.newPassword.length < 6 && (
                                                        <p className="text-xs text-amber-500">Faltam {6 - passwordData.newPassword.length} caracteres</p>
                                                    )}
                                                    {isConfirm && passwordData.confirmPassword.length > 0 && passwordData.confirmPassword !== passwordData.newPassword && (
                                                        <p className="text-xs text-red-500">As senhas não coincidem</p>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <div className="flex gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => { setShowPasswordForm(false); setPasswordError(null); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                                                disabled={isChangingPassword}
                                                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isChangingPassword || passwordSuccess}
                                                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50"
                                            >
                                                {isChangingPassword
                                                    ? <><Loader2 className="size-3.5 animate-spin" />Alterando…</>
                                                    : passwordSuccess
                                                    ? <><Check className="size-3.5" />Alterada!</>
                                                    : "Salvar nova senha"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* ── Comunicações por e-mail ──────────────────────── */}
                        <div className="mb-8">
                            <SectionLabel>Comunicações por e-mail</SectionLabel>
                            <div className="rounded-2xl border border-border bg-card px-6 py-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Novidades da semana</p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            Receba por e-mail um resumo dos novos conteúdos publicados na plataforma.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={weeklyNewsEnabled}
                                        aria-label="Novidades da semana"
                                        onClick={handleToggleWeeklyNews}
                                        disabled={!weeklyNewsLoaded || weeklyNewsSaving}
                                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 disabled:opacity-50 ${
                                            weeklyNewsEnabled ? "bg-foreground" : "bg-accent border border-border"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block size-5 rounded-full bg-background shadow-md transition-transform ${
                                                weeklyNewsEnabled ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {weeklyNewsLoaded && (weeklyNewsEnabled ? "Inscrito" : "Não inscrito")}
                                    {" · "}Essa preferência afeta apenas o e-mail Novidades da semana. Mensagens
                                    essenciais sobre sua conta continuarão sendo enviadas.
                                </p>
                                {weeklyNewsError && (
                                    <div className="mt-3">
                                        <Feedback ok={false} message={weeklyNewsError} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Comunidade ────────────────────────────────────── */}
                        <div className="mb-8 space-y-3">
                            <SectionLabel>Comunidade</SectionLabel>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Convidar para o Portal</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        Indique alguém que se beneficiaria do PP7+IAS.
                                    </p>
                                </div>
                                <button
                                    onClick={openInviteModal}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/30 hover:-translate-y-0.5"
                                >
                                    <UserPlus className="size-4" />
                                    Convidar
                                </button>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Tour do portal</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        Reveja as seções e ferramentas principais do portal.
                                    </p>
                                </div>
                                <button
                                    onClick={openOnboarding}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground/30 hover:-translate-y-0.5"
                                >
                                    <Compass className="size-4" />
                                    Repetir onboarding
                                </button>
                            </div>
                        </div>

                        {/* ── Zona de Perigo ────────────────────────────────── */}
                        <div>
                            <SectionLabel danger>Zona de Perigo</SectionLabel>
                            <div className="rounded-2xl border border-red-500/20 bg-card px-6 py-5">
                                <p className="text-sm text-muted-foreground">
                                    A exclusão da conta é permanente e não pode ser desfeita.
                                </p>

                                {deleteError && (
                                    <div className="mt-3">
                                        <Feedback ok={false} message={deleteError} />
                                    </div>
                                )}

                                <div className="mt-4">
                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-500 transition hover:border-red-500/60 hover:bg-red-500/5"
                                        >
                                            <Trash2 className="size-4" />
                                            Excluir minha conta
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-foreground">Tem certeza? Esta ação não pode ser desfeita.</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={isDeleting}
                                                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {isDeleting
                                                        ? <><Loader2 className="size-3.5 animate-spin" />Excluindo…</>
                                                        : "Confirmar exclusão"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
