"use client";

import { useState } from "react";

const SOURCES = [
    { key: "mini_livro",          label: "Mini-livros" },
    { key: "newsletter",          label: "Newsletters" },
    { key: "radar_oportunidades", label: "Radar de Oportunidades" },
    { key: "especial_semana",     label: "Especial da Semana" },
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
        <div className="space-y-1 text-sm">
            {SOURCES.map(({ key, label }) => {
                const s = states[key];
                return (
                    <div key={`${endpoint}-${key}`} className="flex items-center gap-2">
                        <span className="w-44 text-slate-600 dark:text-slate-400">{label}</span>
                        {s.status === "idle"    && <span className="text-slate-400">—</span>}
                        {s.status === "running" && <span className="text-blue-500 animate-pulse">processando…</span>}
                        {s.status === "ok"      && <span className="text-emerald-600">✓ {s.detail}</span>}
                        {s.status === "error"   && <span className="text-red-600">✗ {s.error}</span>}
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
        <div className="space-y-4">
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={handleIndex}
                    disabled={indexRunning || metaRunning}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 hover:bg-blue-700"
                >
                    {indexRunning ? "Reindexando…" : "Reindexar conteúdo"}
                </button>
                <SourceList states={index.states} endpoint="index" />
            </div>

            <div className="space-y-2">
                <button
                    type="button"
                    onClick={handleMeta}
                    disabled={indexRunning || metaRunning}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold disabled:opacity-50 hover:bg-violet-700"
                >
                    {metaRunning ? "Gerando meta-chunks…" : "Gerar meta-chunks"}
                </button>
                <p className="text-xs text-slate-500">Extrai pessoas, empresas e referências via LLM. Lento — ~3-5 min.</p>
                <SourceList states={meta.states} endpoint="meta" />
            </div>
        </div>
    );
}
