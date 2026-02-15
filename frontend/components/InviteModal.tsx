"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, Mail, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { isValidEmail } from "../lib/validators";
import Portal from "./Portal";

/**
 * InviteModal Component
 *
 * Modal com interface "planilha" para convidar múltiplas pessoas por email.
 * Cada linha representa um convite. O usuário pode adicionar ou remover linhas.
 *
 * Princípios aplicados:
 * - SRP: Focado exclusivamente no fluxo de convites
 * - Clean Code: Nomes reveladores de intenção, funções pequenas
 */

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface InviteRow {
    id: string;
    email: string;
    status: "idle" | "sending" | "success" | "error";
    errorMessage?: string;
}

function createRow(): InviteRow {
    return {
        id: crypto.randomUUID(),
        email: "",
        status: "idle",
    };
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [rows, setRows] = useState<InviteRow[]>([createRow()]);
    const [isSending, setIsSending] = useState(false);
    const [hasSent, setHasSent] = useState(false);

    useBodyScrollLock(isOpen);

    const validEmailCount = rows.filter(r => r.status === "idle" && isValidEmail(r.email)).length;
    const allDone = hasSent && rows.every(r => r.status === "success" || r.status === "error" || !r.email.trim());

    const handleEmailChange = (id: string, value: string) => {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, email: value, status: "idle", errorMessage: undefined } : r)));
    };

    const addRow = () => {
        setRows(prev => [...prev, createRow()]);
    };

    const removeRow = (id: string) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const handleClose = () => {
        setRows([createRow()]);
        setIsSending(false);
        setHasSent(false);
        onClose();
    };

    const handleSend = async () => {
        setIsSending(true);
        setHasSent(true);

        const rowsToSend = rows.filter(r => isValidEmail(r.email) && r.status === "idle");

        for (const row of rowsToSend) {
            setRows(prev => prev.map(r => (r.id === row.id ? { ...r, status: "sending" } : r)));

            try {
                const response = await fetch("/api/admin/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: row.email.trim().toLowerCase() }),
                });

                const data = await response.json();

                if (response.ok) {
                    setRows(prev => prev.map(r => (r.id === row.id ? { ...r, status: "success" } : r)));
                } else {
                    setRows(prev =>
                        prev.map(r => (r.id === row.id ? { ...r, status: "error", errorMessage: data.error || "Erro ao enviar" } : r)),
                    );
                }
            } catch {
                setRows(prev =>
                    prev.map(r => (r.id === row.id ? { ...r, status: "error", errorMessage: "Erro de conexão" } : r)),
                );
            }
        }

        setIsSending(false);
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-4" onClick={handleClose}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

                {/* Modal */}
                <div
                    className="relative w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-bg-primary/95 backdrop-blur-xl border border-border-glass rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 pb-0">
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-bold text-white">Convidar para o Portal</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                            aria-label="Fechar modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Subtitle */}
                    <p className="px-4 pt-1.5 pb-3 text-xs text-text-secondary">
                        Envie convites para que outras pessoas façam parte do PP7+IAS Portal. Cada pessoa receberá um
                        email com o link para se cadastrar.
                    </p>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4 space-y-3">
                        {/* Rows */}
                        <div className="space-y-2">
                            {rows.map((row, index) => (
                                <div key={row.id} className="flex items-center gap-2">
                                    {/* Row number */}
                                    <span className="w-5 text-xs text-text-secondary/60 text-right shrink-0">
                                        {index + 1}
                                    </span>

                                    {/* Email input or status */}
                                    {row.status === "idle" || row.status === "sending" ? (
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                            <input
                                                type="email"
                                                value={row.email}
                                                onChange={e => handleEmailChange(row.id, e.target.value)}
                                                placeholder="email@exemplo.com"
                                                disabled={row.status === "sending" || isSending}
                                                autoComplete="off"
                                                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-border-glass rounded-xl text-white text-sm placeholder:text-text-secondary/50 outline-none focus:border-brand-blue focus:bg-white/[0.07] transition-all duration-200 disabled:opacity-50"
                                            />
                                            {row.status === "sending" && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
                                            )}
                                        </div>
                                    ) : row.status === "success" ? (
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                                            <Check className="w-4 h-4 text-green-400 shrink-0" />
                                            <span className="text-sm text-green-300 truncate">{row.email}</span>
                                            <span className="text-xs text-green-400/70 shrink-0">Convite enviado!</span>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                            <span className="text-sm text-red-300 truncate">{row.email}</span>
                                            <span className="text-xs text-red-400/70 shrink-0">
                                                {row.errorMessage}
                                            </span>
                                        </div>
                                    )}

                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length <= 1 || isSending || row.status === "success"}
                                        className="p-1.5 text-text-secondary/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none shrink-0"
                                        aria-label="Remover linha"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add row button */}
                        <button
                            onClick={addRow}
                            disabled={isSending}
                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar mais uma pessoa</span>
                        </button>

                        {/* Volume notice */}
                        <div className="p-3 bg-white/[0.03] border border-border-glass rounded-xl">
                            <p className="text-xs text-text-secondary/70 leading-relaxed">
                                Precisa convidar muitas pessoas de uma vez? Entre em contato pelo email{" "}
                                <a
                                    href="mailto:paulof@pp7ias-portal.com.br"
                                    className="text-blue-400 hover:underline"
                                >
                                    paulof@pp7ias-portal.com.br
                                </a>{" "}
                                ou pelo WhatsApp{" "}
                                <a
                                    href="https://wa.me/5511914892836"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    +55 11 91489-2836
                                </a>{" "}
                                (links no final da página).
                            </p>
                        </div>

                        {/* Submit / Close button */}
                        {allDone ? (
                            <button
                                onClick={handleClose}
                                className="w-full px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl transition-all duration-200"
                            >
                                Fechar
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={isSending || validEmailCount === 0}
                                className="w-full px-5 py-2.5 flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] text-white font-semibold text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <span>
                                        Enviar Convite{validEmailCount !== 1 ? "s" : ""}
                                        {validEmailCount > 0 ? ` (${validEmailCount})` : ""}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}
