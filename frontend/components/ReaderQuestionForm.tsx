"use client";

import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

const MAX_LENGTH = 2000;

export default function ReaderQuestionForm() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { openModal } = useAuthModal();
    const [question, setQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/reader-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: question.trim() }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setQuestion("");
            setStatus("sent");
        } catch {
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading) return null;

    return (
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-serif text-xl tracking-tight text-ink">Não encontrou sua resposta?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
                Envie sua pergunta — as mais relevantes podem virar artigos ou respostas editoriais no portal.
            </p>

            {!user ? (
                <button
                    type="button"
                    onClick={() => openModal(undefined, "signup")}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
                >
                    <Lock className="size-3.5" aria-hidden="true" />
                    Entrar para enviar uma pergunta
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4">
                    <textarea
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        maxLength={MAX_LENGTH}
                        placeholder="Qual sua dúvida?"
                        className="w-full min-h-[100px] resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                        {status === "sent" && <p className="text-xs text-green-600 dark:text-green-400">Pergunta enviada — obrigado!</p>}
                        {status === "error" && <p className="text-xs text-red-600 dark:text-red-400">Não foi possível enviar. Tente novamente.</p>}
                        {status === "idle" && <span />}
                        <button
                            type="submit"
                            disabled={!question.trim() || isSubmitting}
                            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            <Send className="size-3.5" aria-hidden="true" />
                            {isSubmitting ? "Enviando…" : "Enviar pergunta"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
