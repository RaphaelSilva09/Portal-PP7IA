"use client";

import { portalContentClass } from "@/lib/layout";
import { AlertCircle, Check, Loader2, MailX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

function UnsubscribeWeeklyNewsContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleConfirm() {
        if (!token) return;
        setStatus("loading");
        setErrorMessage(null);
        try {
            const res = await fetch("/api/email/unsubscribe/weekly-news/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            if (!res.ok) {
                setStatus("error");
                setErrorMessage("Este link não é mais válido.");
                return;
            }
            setStatus("success");
        } catch {
            setStatus("error");
            setErrorMessage("Não foi possível concluir agora. Tente novamente em instantes.");
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <div className={portalContentClass}>
                <div className="mx-auto w-full max-w-md">
                    <div className="rounded-2xl border border-border bg-card p-8 text-center">
                        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-accent">
                            <MailX className="size-5 text-muted-foreground" />
                        </div>

                        <h1 className="font-serif text-2xl tracking-tight text-foreground">
                            Cancelar &quot;Novidades da semana&quot;
                        </h1>

                        {!token ? (
                            <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-accent px-4 py-3 text-left text-sm">
                                <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                                <span className="text-foreground">Este link não é válido.</span>
                            </div>
                        ) : status === "success" ? (
                            <>
                                <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-accent px-4 py-3 text-left text-sm">
                                    <Check className="size-4 shrink-0 mt-0.5 text-green-500" />
                                    <span className="text-foreground">
                                        Pronto — você não vai mais receber o e-mail de Novidades da semana.
                                    </span>
                                </div>
                                <Link
                                    href="/"
                                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-foreground/30"
                                >
                                    Voltar para o portal
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Isso desativa apenas o e-mail semanal com o resumo de novidades do portal.
                                    Mensagens essenciais sobre sua conta continuarão sendo enviadas normalmente.
                                </p>

                                {status === "error" && errorMessage && (
                                    <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-accent px-4 py-3 text-left text-sm">
                                        <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                                        <span className="text-foreground">{errorMessage}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={status === "loading"}
                                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50"
                                >
                                    {status === "loading" ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" />
                                            Cancelando…
                                        </>
                                    ) : (
                                        "Cancelar inscrição"
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UnsubscribeWeeklyNewsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                    <div className={portalContentClass}>
                        <div className="mx-auto max-w-md text-center text-muted-foreground">Carregando...</div>
                    </div>
                </div>
            }
        >
            <UnsubscribeWeeklyNewsContent />
        </Suspense>
    );
}
