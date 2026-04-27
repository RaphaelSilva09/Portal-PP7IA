"use client";

import { useState } from "react";
import { supabase } from "@/infrastructure/config/supabase";

interface ReindexResult {
    chunks_indexed: number;
    books_processed: number;
    skipped: { source_id: string; reason: string }[];
    duration_ms: number;
}

export function ReindexButton() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<ReindexResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setError(null);
        setResult(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
            setError("Sem sessão. Faça login novamente.");
            return;
        }

        setRunning(true);
        try {
            const res = await fetch("/api/chat/reindex", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
            setResult(json as ReindexResult);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={handleClick}
                disabled={running}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 hover:bg-blue-700"
            >
                {running ? "Reindexando..." : "Reindexar mini-livros"}
            </button>
            {result && (
                <div className="text-sm text-emerald-700">
                    ✓ {result.chunks_indexed} chunks de {result.books_processed} livros em {result.duration_ms}ms
                    {result.skipped.length > 0 && ` (${result.skipped.length} pulados)`}
                </div>
            )}
            {error && <div className="text-sm text-red-700">Erro: {error}</div>}
        </div>
    );
}
