"use client";

import { useState } from "react";

const SOURCES = [
    { key: "mini_livro",          label: "Mini-livros" },
    { key: "newsletter",          label: "Newsletters" },
    { key: "radar_oportunidades", label: "Editoriais e Artigos" },
    { key: "especial_semana",     label: "Inteligência Artificial" },
    { key: "biblioteca",          label: "Biblioteca" },
    { key: "estudar",             label: "Estudar" },
];

type Status = "idle" | "running" | "ok" | "error";

interface SourceState {
    status: Status;
    detail?: string;
    error?: string;
}

function useSourceStates() {
    const initial = () => Object.fromEntries(SOURCES.map(s => [s.key, { status: "idle" as Status }]));
    const [states, setStates] = useState<Record<string, SourceState>>(initial);
    const reset = () => setStates(initial());
    const patch = (key: string, p: Partial<SourceState>) =>
        setStates(prev => ({ ...prev, [key]: { ...prev[key], ...p } }));
    return { states, reset, patch };
}

function SourceList({ states, endpoint }: { states: Record<string, SourceState>; endpoint: string }) {
    const anyRan = SOURCES.some(s => states[s.key].status !== "idle");
    if (!anyRan) return null;
    return (
        <div className="mt-3 space-y-1.5">
            {SOURCES.map(({ key, label }) => {
                const s = states[key];
                return (
                    <div key={`${endpoint}-${key}`} className="flex items-center gap-2 text-xs">
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

export function ReindexButton() {
    const [indexRunning, setIndexRunning] = useState(false);
    const [metaRunning, setMetaRunning] = useState(false);
    const index = useSourceStates();
    const meta = useSourceStates();

    const runSequential = async (
        endpoint: string,
        { reset, patch }: ReturnType<typeof useSourceStates>,
        setRunning: (v: boolean) => void,
        detailFromJson: (json: Record<string, unknown>) => string,
    ) => {
        setRunning(true);
        reset();
        for (const { key } of SOURCES) {
            patch(key, { status: "running" });
            try {
                const res = await fetch(`${endpoint}?source=${key}`, { method: "POST" });
                const json = await res.json() as Record<string, unknown>;
                if (!res.ok) throw new Error((json.error as string) ?? `HTTP ${res.status}`);
                patch(key, { status: "ok", detail: detailFromJson(json) });
            } catch (err) {
                patch(key, { status: "error", error: (err as Error).message });
            }
        }
        setRunning(false);
    };

    const handleIndex = () => runSequential(
        "/api/chat/reindex",
        index,
        setIndexRunning,
        json => {
            const skipped = Array.isArray(json.skipped) ? json.skipped.length : 0;
            return `${json.chunks_indexed} chunks (${json.items_processed} itens${skipped ? `, ${skipped} pulados` : ""}, ${json.duration_ms}ms)`;
        },
    );

    const handleMeta = () => runSequential(
        "/api/chat/reindex-meta",
        meta,
        setMetaRunning,
        json => `${json.chunks_stored} chunks (${json.items_processed} itens, ${json.duration_ms}ms)`,
    );

    return (
        <div className="space-y-5">
            <div>
                <button
                    type="button"
                    onClick={handleIndex}
                    disabled={indexRunning || metaRunning}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 disabled:opacity-50"
                >
                    {indexRunning ? "Reindexando…" : "Reindexar conteúdo"}
                </button>
                <SourceList states={index.states} endpoint="index" />
            </div>

            <div>
                <button
                    type="button"
                    onClick={handleMeta}
                    disabled={indexRunning || metaRunning}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 disabled:opacity-50"
                >
                    {metaRunning ? "Gerando meta-chunks…" : "Gerar meta-chunks"}
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    Extrai pessoas, empresas e referências via LLM. Lento — ~3–5 min.
                </p>
                <SourceList states={meta.states} endpoint="meta" />
            </div>
        </div>
    );
}
