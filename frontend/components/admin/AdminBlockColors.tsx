"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import {
    BLOCK_IDS,
    BLOCK_LABELS,
    BLOCK_NUMBERS,
    DEFAULT_BLOCK_COLORS,
} from "@/domain/entities/BlockColors";
import type { BlockColors } from "@/domain/entities/BlockColors";

export default function AdminBlockColors() {
    const [colors, setColors] = useState<BlockColors>({ ...DEFAULT_BLOCK_COLORS });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/block-colors")
            .then(r => r.json())
            .then((data: BlockColors) => setColors({ ...DEFAULT_BLOCK_COLORS, ...data }))
            .catch(() => {});
    }, []);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/block-colors", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(colors),
            });
            if (!res.ok) throw new Error();
            showToast("Cores salvas. Recarregue a página para ver o efeito.");
        } catch {
            showToast("Erro ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    function reset() {
        setColors({ ...DEFAULT_BLOCK_COLORS });
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Cores dos Blocos</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Define a cor de destaque de cada bloco editorial em toda a aplicação.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <RotateCcw className="size-3.5" />
                        Restaurar padrões
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
                    >
                        <Save className="size-3.5" />
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {BLOCK_IDS.map(id => (
                    <label key={id} className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-foreground/20">
                        <div className="relative shrink-0">
                            <input
                                type="color"
                                value={colors[id]}
                                onChange={e => setColors(prev => ({ ...prev, [id]: e.target.value }))}
                                className="absolute inset-0 size-full cursor-pointer opacity-0"
                                aria-label={`Cor do bloco ${BLOCK_LABELS[id]}`}
                            />
                            <div
                                className="size-10 rounded-lg border border-border shadow-sm transition-transform group-hover:scale-105"
                                style={{ backgroundColor: colors[id] }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-serif text-xs text-muted-foreground">{BLOCK_NUMBERS[id]}</span>
                                <span className="truncate text-sm font-medium text-foreground">{BLOCK_LABELS[id]}</span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{colors[id]}</span>
                        </div>
                    </label>
                ))}
            </div>

            {toast && (
                <div className="mt-4 rounded-xl border border-border bg-accent px-4 py-3 text-sm text-foreground">
                    {toast}
                </div>
            )}
        </div>
    );
}
