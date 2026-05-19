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
    chunks?: number;
    items?: number;
    skipped?: number;
    error?: string;
    ms?: number;
}

export function ReindexButton() {
    const [running, setRunning] = useState(false);
    const [states, setStates] = useState<Record<string, SourceState>>(
        Object.fromEntries(SOURCES.map(s => [s.key, { status: "idle" }])),
    );

    const setState = (key: string, patch: Partial<SourceState>) =>
        setStates(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));

    const handleClick = async () => {
        setRunning(true);
        setStates(Object.fromEntries(SOURCES.map(s => [s.key, { status: "idle" }])));

        for (const { key } of SOURCES) {
            setState(key, { status: "running" });
            try {
                const res = await fetch(`/api/chat/reindex?source=${key}`, { method: "POST" });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
                setState(key, {
                    status: "ok",
                    chunks: json.chunks_indexed,
                    items: json.items_processed,
                    skipped: json.skipped?.length ?? 0,
                    ms: json.duration_ms,
                });
            } catch (err) {
                setState(key, { status: "error", error: (err as Error).message });
            }
        }

        setRunning(false);
    };

    const anyRan = SOURCES.some(s => states[s.key].status !== "idle");

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleClick}
                disabled={running}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 hover:bg-blue-700"
            >
                {running ? "Reindexando..." : "Reindexar conteúdo"}
            </button>

            {anyRan && (
                <div className="space-y-1 text-sm">
                    {SOURCES.map(({ key, label }) => {
                        const s = states[key];
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <span className="w-44 text-slate-600 dark:text-slate-400">{label}</span>
                                {s.status === "idle" && <span className="text-slate-400">—</span>}
                                {s.status === "running" && <span className="text-blue-500 animate-pulse">indexando…</span>}
                                {s.status === "ok" && (
                                    <span className="text-emerald-600">
                                        ✓ {s.chunks} chunks ({s.items} itens
                                        {s.skipped ? `, ${s.skipped} pulados` : ""}, {s.ms}ms)
                                    </span>
                                )}
                                {s.status === "error" && (
                                    <span className="text-red-600">✗ {s.error}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
