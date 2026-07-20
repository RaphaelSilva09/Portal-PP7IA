"use client";

import { useState } from "react";

interface ReadingTimeResponse {
    results: {
        source: string;
        items_processed: number;
        items_updated: number;
        items_skipped: number;
        errors: number;
        duration_ms: number;
    }[];
    total_updated: number;
    total_skipped: number;
    total_errors: number;
    duration_ms: number;
}

type Status = "idle" | "running" | "ok" | "error";

interface SourceState {
    status: Status;
    detail?: string;
    error?: string;
}

const SOURCES = [
    "Newsletters",
    "Mini-livros",
    "Biblioteca",
    "Inteligência Artificial",
    "Editoriais e Artigos",
    "Estudar",
    "E-books",
];

function useSourceStates() {
    const initial = () => Object.fromEntries(SOURCES.map(s => [s, { status: "idle" as Status }]));
    const [states, setStates] = useState<Record<string, SourceState>>(initial);
    const reset = () => setStates(initial());
    const patch = (key: string, p: Partial<SourceState>) =>
        setStates(prev => ({ ...prev, [key]: { ...prev[key], ...p } }));
    return { states, reset, patch };
}

function SourceList({ states }: { states: Record<string, SourceState> }) {
    const anyRan = SOURCES.some(s => states[s].status !== "idle");
    if (!anyRan) return null;
    return (
        <div className="mt-3 space-y-1.5">
            {SOURCES.map(label => {
                const s = states[label];
                return (
                    <div key={label} className="flex items-center gap-2 text-xs">
                        <span className="w-40 text-muted-foreground">{label}</span>
                        {s.status === "idle"    && <span className="text-muted-foreground/40">—</span>}
                        {s.status === "running" && <span className="animate-pulse text-foreground">processando…</span>}
                        {s.status === "ok"      && <span className="text-green-500">✓ {s.detail}</span>}
                        {s.status === "error"   && <span className="text-red-500">✗ {s.error}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export function ReadingTimeButton() {
    const [running, setRunning] = useState(false);
    const states = useSourceStates();
    const [forceAll, setForceAll] = useState(false);

    const handleCalculate = async () => {
        setRunning(true);
        states.reset();

        try {
            const res = await fetch(`/api/admin/reading-time?all=${forceAll}`, { method: "POST" });
            const json = await res.json() as ReadingTimeResponse;

            if (!res.ok) {
                throw new Error((json as unknown as { error?: string }).error ?? `HTTP ${res.status}`);
            }

            for (const r of json.results) {
                if (r.errors > 0) {
                    states.patch(r.source, {
                        status: "error",
                        error: `${r.errors} erro(s)`,
                    });
                } else if (r.items_updated === 0 && r.items_skipped > 0) {
                    states.patch(r.source, {
                        status: "ok",
                        detail: `${r.items_skipped} sem alteração`,
                    });
                } else {
                    states.patch(r.source, {
                        status: "ok",
                        detail: `${r.items_updated} atualizados, ${r.items_skipped} pulados`,
                    });
                }
            }
        } catch (err) {
            SOURCES.forEach(s => {
                if (states.states[s].status === "idle") {
                    states.patch(s, { status: "error", error: (err as Error).message });
                }
            });
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={running}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 disabled:opacity-50"
                >
                    {running ? "Calculando…" : "Calcular tempo de leitura"}
                </button>
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={forceAll}
                        onChange={e => setForceAll(e.target.checked)}
                        disabled={running}
                        className="size-3.5 rounded border-border accent-foreground"
                    />
                    Recalcular todos
                </label>
            </div>
            <p className="text-[11px] text-muted-foreground">
                Calcula automaticamente a partir do HTML. Pula conteúdo não modificado (usa hash SHA-256).
            </p>
            <SourceList states={states.states} />
        </div>
    );
}
