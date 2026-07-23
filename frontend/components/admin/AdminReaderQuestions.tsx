"use client";

/**
 * AdminReaderQuestions Component (Presentation Layer)
 *
 * Triagem das perguntas enviadas por leitores cadastrados (PDF 6.3).
 * Perguntas relevantes viram conteúdo publicado nos blocos normais —
 * esse fluxo editorial é manual, fora desta tela (que só captura + triagem).
 */

import { FeedbackMessage } from "@/components/admin";
import type { ReaderQuestionStatus } from "@/domain/entities/ReaderQuestion";
import { useCallback, useEffect, useState } from "react";

interface QuestionRow {
    id: number;
    userEmail: string | null;
    question: string;
    status: ReaderQuestionStatus;
    createdAt: string;
}

const STATUS_LABEL: Record<ReaderQuestionStatus, string> = {
    pending: "Pendente",
    published: "Publicada",
    archived: "Arquivada",
};

const STATUS_BADGE_CLASS: Record<ReaderQuestionStatus, string> = {
    pending: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 dark:text-yellow-400",
    published: "bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400",
    archived: "bg-accent text-muted-foreground border-border",
};

export default function AdminReaderQuestions() {
    const [rows, setRows] = useState<QuestionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    const showFeedback = (message: string, type: "success" | "error" | "warning") => setFeedback({ show: true, message, type });

    const loadRows = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/reader-questions");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRows((await res.json()) as QuestionRow[]);
        } catch (err) {
            console.error("Erro ao carregar perguntas:", err);
            showFeedback("Erro ao carregar perguntas.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const handleStatusChange = async (row: QuestionRow, status: ReaderQuestionStatus) => {
        try {
            const res = await fetch(`/api/admin/reader-questions/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRows(prev => prev.map(r => (r.id === row.id ? { ...r, status } : r)));
            showFeedback("Status atualizado.", "success");
        } catch (err) {
            console.error("Erro ao atualizar status:", err);
            showFeedback("Erro ao atualizar status.", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-serif text-2xl tracking-tight text-ink">Perguntas dos Leitores</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Perguntas relevantes podem originar artigos ou respostas editoriais publicadas nos blocos normais.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Nenhuma pergunta enviada ainda.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-accent">
                                <tr>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Pergunta</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium">Leitor</th>
                                    <th className="px-4 py-3 text-left text-muted-foreground text-sm font-medium w-36">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-foreground">{row.question}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{row.userEmail ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={row.status}
                                                onChange={e => handleStatusChange(row, e.target.value as ReaderQuestionStatus)}
                                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[row.status]}`}
                                            >
                                                {(Object.keys(STATUS_LABEL) as ReaderQuestionStatus[]).map(status => (
                                                    <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
