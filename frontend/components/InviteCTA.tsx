"use client";

import { useState } from "react";
import { Plus, Send, Users } from "lucide-react";
import InviteRow from "./InviteRow";

interface InviteState {
    email: string;
    error?: string;
}

interface InviteResult {
    email: string;
    success: boolean;
    error?: string;
}

interface InviteCTAProps {
    title?: string;
    description?: string;
    maxInvites?: number;
    onInvitesSent?: (results: InviteResult[]) => void;
}

export default function InviteCTA({
    title = "Indique Amigos para a Comunidade PP7+IAS",
    description = "Conhece alguém que se beneficiaria da nossa curadoria? Indique quantos quiser!",
    maxInvites = 10,
    onInvitesSent,
}: InviteCTAProps) {
    const [invites, setInvites] = useState<InviteState[]>([{ email: "" }]);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [results, setResults] = useState<InviteResult[] | null>(null);

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const addInvite = () => {
        if (invites.length < maxInvites) {
            setInvites([...invites, { email: "" }]);
            setGlobalError(null);
            setResults(null);
        }
    };

    const removeInvite = (index: number) => {
        if (invites.length > 1) {
            setInvites(invites.filter((_, i) => i !== index));
            setGlobalError(null);
            setResults(null);
        }
    };

    const updateEmail = (index: number, email: string) => {
        const newInvites = [...invites];
        newInvites[index] = { email, error: undefined };
        setInvites(newInvites);
        setGlobalError(null);
        setResults(null);
    };

    const validateAll = (): boolean => {
        let valid = true;
        const newInvites = invites.map((invite) => {
            const trimmedEmail = invite.email.trim();

            if (!trimmedEmail) {
                return { ...invite, error: undefined }; // Campo vazio é permitido
            }

            if (!isValidEmail(trimmedEmail)) {
                valid = false;
                return { ...invite, error: "Email inválido" };
            }

            return { ...invite, error: undefined };
        });

        setInvites(newInvites);

        // Verificar se há pelo menos um email válido
        const validEmails = newInvites.filter(
            (i) => i.email.trim() && isValidEmail(i.email.trim())
        );

        if (validEmails.length === 0) {
            setGlobalError("Adicione pelo menos um email válido");
            return false;
        }

        // Verificar duplicados
        const emails = validEmails.map((i) => i.email.trim().toLowerCase());
        const uniqueEmails = new Set(emails);

        if (uniqueEmails.size !== emails.length) {
            setGlobalError("Existem emails duplicados na lista");
            return false;
        }

        return valid;
    };

    const handleSubmit = async () => {
        if (!validateAll()) return;

        const emails = invites
            .map((i) => i.email.trim())
            .filter((e) => e && isValidEmail(e));

        if (emails.length === 0) {
            setGlobalError("Adicione pelo menos um email válido");
            return;
        }

        setLoading(true);
        setGlobalError(null);
        setResults(null);

        try {
            const response = await fetch("/api/admin/invite-batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emails }),
            });

            const data = await response.json();

            if (!response.ok) {
                setGlobalError(data.error || "Erro ao enviar convites");
                return;
            }

            const inviteResults: InviteResult[] = data.data.results;
            setResults(inviteResults);
            onInvitesSent?.(inviteResults);

            // Identificar emails que falharam
            const failedEmails = new Set(
                inviteResults
                    .filter((r) => !r.success)
                    .map((r) => r.email.toLowerCase())
            );

            if (failedEmails.size === 0) {
                // Todos enviados com sucesso: resetar para um campo vazio
                setInvites([{ email: "" }]);
            } else {
                // Manter apenas os que falharam
                const remainingInvites = invites.filter((i) =>
                    failedEmails.has(i.email.trim().toLowerCase())
                );

                // Se sobrou algum, manter; senão, resetar
                setInvites(
                    remainingInvites.length > 0
                        ? remainingInvites
                        : [{ email: "" }]
                );
            }
        } catch {
            setGlobalError("Erro ao conectar com o servidor");
        } finally {
            setLoading(false);
        }
    };

    const validEmailsCount = invites.filter(
        (i) => i.email.trim() && isValidEmail(i.email.trim())
    ).length;

    const successCount = results?.filter((r) => r.success).length ?? 0;
    const failedResults = results?.filter((r) => !r.success) ?? [];

    return (
        <div
            id="invite-cta"
            className="glass-card rounded-2xl p-6 sm:p-8 mt-12"
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                        {title}
                    </h3>
                    <p className="text-text-secondary text-sm sm:text-base">
                        {description}
                    </p>
                </div>
            </div>

            {/* Invite Rows */}
            <div className="space-y-3 mb-4">
                {invites.map((invite, index) => (
                    <InviteRow
                        key={index}
                        index={index}
                        email={invite.email}
                        onEmailChange={(value) => updateEmail(index, value)}
                        onRemove={() => removeInvite(index)}
                        error={invite.error}
                        canRemove={invites.length > 1}
                        disabled={loading}
                    />
                ))}
            </div>

            {/* Global Error */}
            {globalError && (
                <div className="text-red-500 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    {globalError}
                </div>
            )}

            {/* Results */}
            {results && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
                    <p className="text-green-400 text-sm font-medium">
                        {successCount} de {results.length}{" "}
                        {results.length === 1 ? "convite enviado" : "convites enviados"} com
                        sucesso!
                    </p>
                    {failedResults.length > 0 && (
                        <div className="space-y-1 mt-2 pt-2 border-t border-red-500/20">
                            <p className="text-red-400 text-xs font-medium">
                                Falhas:
                            </p>
                            {failedResults.map((r, i) => (
                                <p key={i} className="text-red-400 text-xs">
                                    {r.email}: {r.error || "Erro desconhecido"}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Add Button */}
                <button
                    type="button"
                    onClick={addInvite}
                    disabled={loading || invites.length >= maxInvites}
                    className="flex items-center justify-center gap-2 px-4 py-2
                        text-brand-blue hover:text-white hover:bg-brand-blue/20
                        rounded-xl transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        ADICIONAR MAIS UMA INDICAÇÃO
                    </span>
                </button>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || validEmailsCount === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3
                        bg-gradient-to-r from-blue-500 to-purple-600
                        text-white font-semibold rounded-xl
                        shadow-[0_0_20px_rgba(59,130,246,0.4)]
                        hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                        hover:scale-105 active:scale-95
                        transition-all duration-200
                        touch-target whitespace-nowrap
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>
                                ENVIAR{" "}
                                {validEmailsCount > 1 ? "CONVITES" : "CONVITE"}
                                {validEmailsCount > 0 &&
                                    ` (${validEmailsCount})`}
                            </span>
                        </>
                    )}
                </button>
            </div>

            {/* Counter */}
            <p className="text-text-secondary text-xs mt-4 text-center">
                {invites.length}/{maxInvites} indicações
            </p>
        </div>
    );
}
