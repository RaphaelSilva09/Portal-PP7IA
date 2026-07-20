"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { generateLocalId } from "../lib/uid";
import { isValidEmail } from "../lib/validators";
import Portal from "./Portal";

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
    return { id: generateLocalId(), email: "", status: "idle" };
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [rows, setRows] = useState<InviteRow[]>([createRow()]);
    const [isSending, setIsSending] = useState(false);
    const [hasSent, setHasSent] = useState(false);

    useBodyScrollLock(isOpen);

    const validEmailCount = rows.filter(r => r.status === "idle" && isValidEmail(r.email)).length;
    const allDone = hasSent && rows.every(r => r.status === "success" || r.status === "error" || !r.email.trim());

    const handleEmailChange = (id: string, value: string) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, email: value, status: "idle", errorMessage: undefined } : r));
    };

    const addRow = () => setRows(prev => [...prev, createRow()]);

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
        const toSend = rows.filter(r => isValidEmail(r.email) && r.status === "idle");
        for (const row of toSend) {
            setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "sending" } : r));
            try {
                const res = await fetch("/api/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: row.email.trim().toLowerCase() }),
                });
                const data = await res.json();
                if (res.ok) {
                    setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "success" } : r));
                } else {
                    setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "error", errorMessage: data.error || "Erro ao enviar" } : r));
                }
            } catch {
                setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "error", errorMessage: "Erro de conexão" } : r));
            }
        }
        setIsSending(false);
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div
                className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
                onClick={handleClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <div
                    className="relative flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:max-w-md sm:rounded-3xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pb-0 pt-6">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                PP7+IAS
                            </p>
                            <h2 className="mt-1 font-serif text-2xl tracking-tight text-ink">
                                Convidar para o Portal.
                            </h2>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                Quem mais deveria ter acesso à curadoria?
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="ml-4 mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Fechar"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 mt-5 h-px bg-border" />

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5 space-y-3">

                        {/* Email rows */}
                        <div className="space-y-2">
                            {rows.map(row => (
                                <div key={row.id} className="flex items-center gap-2">
                                    {row.status === "idle" || row.status === "sending" ? (
                                        <div className="relative flex-1">
                                            <input
                                                type="email"
                                                value={row.email}
                                                onChange={e => handleEmailChange(row.id, e.target.value)}
                                                placeholder="email@exemplo.com"
                                                disabled={row.status === "sending" || isSending}
                                                autoComplete="off"
                                                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-foreground/30 transition-colors disabled:opacity-50"
                                            />
                                            {row.status === "sending" && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                                            )}
                                        </div>
                                    ) : row.status === "success" ? (
                                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-accent px-4 py-3">
                                            <Check className="size-4 shrink-0 text-green-500" />
                                            <span className="flex-1 truncate text-sm text-foreground">{row.email}</span>
                                            <span className="shrink-0 text-xs text-muted-foreground">Enviado</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-accent px-4 py-3">
                                            <AlertCircle className="size-4 shrink-0 text-red-500" />
                                            <span className="flex-1 truncate text-sm text-foreground">{row.email}</span>
                                            <span className="shrink-0 text-xs text-red-500">{row.errorMessage}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length <= 1 || isSending || row.status === "success"}
                                        className="shrink-0 text-muted-foreground/40 transition-colors hover:text-red-400 disabled:pointer-events-none disabled:opacity-0"
                                        aria-label="Remover"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add row */}
                        {!hasSent && (
                            <button
                                onClick={addRow}
                                disabled={isSending}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                            >
                                <Plus className="size-3.5" />
                                Adicionar outra pessoa
                            </button>
                        )}

                        {/* Volume notice */}
                        <div className="rounded-xl border border-border bg-card p-4">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Precisa convidar muitas pessoas de uma vez? Entre em contato pelo email{" "}
                                <a
                                    href="mailto:paulof@pp7ias-portal.com.br"
                                    className="text-foreground underline underline-offset-2 hover:text-ink transition-colors"
                                >
                                    paulof@pp7ias-portal.com.br
                                </a>{" "}
                                ou pelo WhatsApp{" "}
                                <a
                                    href="https://wa.me/5511914892836"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground underline underline-offset-2 hover:text-ink transition-colors"
                                >
                                    +55 11 91489-2836
                                </a>{" "}
                                (links no final da página).
                            </p>
                        </div>

                        {/* CTA */}
                        {allDone ? (
                            <button
                                onClick={handleClose}
                                className="w-full rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
                            >
                                Fechar
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={isSending || validEmailCount === 0}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <><Loader2 className="size-4 animate-spin" />Enviando…</>
                                ) : (
                                    <>Enviar convite{validEmailCount !== 1 ? "s" : ""}{validEmailCount > 0 ? ` (${validEmailCount})` : ""}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}
