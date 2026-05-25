"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import {
    DEFAULT_EXPLORAR_CONFIG,
    EXPLORAR_BLOCK_LABELS,
    type ExplorarBlockConfig,
    type ExplorarBlockId,
    type ExplorarConfig,
    type ExplorarHeroConfig,
} from "@/domain/entities/ExplorarConfig";

const HERO_FIELDS: { key: keyof ExplorarHeroConfig; label: string; hint?: string }[] = [
    { key: "eyebrow",     label: "Label (eyebrow)" },
    { key: "titleBefore", label: "Título — texto antes do destaque" },
    { key: "titleEm",     label: "Título — texto em destaque (itálico)" },
    { key: "description", label: "Descrição", hint: 'Exibida abaixo do título.' },
];

const BLOCK_ORDER: ExplorarBlockId[] = ["newsletter", "reportagem", "radar", "livro", "biblioteca", "estudar"];

function mergeWithDefaults(loaded: ExplorarConfig): ExplorarConfig {
    const byId = Object.fromEntries(loaded.blocks.map(b => [b.id, b]));
    return {
        hero: { ...DEFAULT_EXPLORAR_CONFIG.hero, ...loaded.hero },
        blocks: DEFAULT_EXPLORAR_CONFIG.blocks.map(def => ({
            ...def,
            ...(byId[def.id] ?? {}),
        })),
    };
}

export default function AdminExplorarConfig() {
    const [config, setConfig] = useState<ExplorarConfig>(DEFAULT_EXPLORAR_CONFIG);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [expandedBlock, setExpandedBlock] = useState<ExplorarBlockId | null>(null);

    useEffect(() => {
        fetch("/api/admin/explorar-config")
            .then(r => r.json())
            .then((data: ExplorarConfig) => setConfig(mergeWithDefaults(data)))
            .catch(() => setConfig(DEFAULT_EXPLORAR_CONFIG));
    }, []);

    function updateHero(key: keyof ExplorarHeroConfig, value: string) {
        setConfig(prev => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
    }

    function updateBlock(id: ExplorarBlockId, key: keyof ExplorarBlockConfig, value: string) {
        setConfig(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, [key]: value } : b),
        }));
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/explorar-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            if (!res.ok) throw new Error();
            setToast("Salvo com sucesso!");
        } catch {
            setToast("Erro ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    }

    const sortedBlocks = BLOCK_ORDER.map(id => config.blocks.find(b => b.id === id)).filter(Boolean) as ExplorarBlockConfig[];

    return (
        <div className="space-y-4">
            {/* Header card */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Página Explorar</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Edite os textos do hero e as descrições de cada bloco editorial.
                        </p>
                    </div>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        <Save className="size-4" />
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
                {toast && (
                    <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {toast}
                    </div>
                )}
            </div>

            {/* Hero section */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Hero (topo da página)
                </h3>
                <div className="space-y-4">
                    {HERO_FIELDS.map(({ key, label, hint }) => (
                        <div key={key}>
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {label}
                            </label>
                            <input
                                type="text"
                                value={config.hero[key]}
                                onChange={e => updateHero(key, e.target.value)}
                                className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                            />
                            {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
                        </div>
                    ))}
                    {/* Live preview */}
                    <div className="mt-4 rounded-xl border border-border bg-background px-5 py-4">
                        <p className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Prévia do título</p>
                        <p className="font-serif text-2xl leading-snug text-foreground">
                            {config.hero.titleBefore}{" "}
                            <em className="italic text-primary">{config.hero.titleEm}</em>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Block sections */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Blocos editoriais
                </h3>
                <div className="space-y-3">
                    {sortedBlocks.map(block => {
                        const isExpanded = expandedBlock === block.id;
                        return (
                            <div key={block.id} className="rounded-xl border border-border bg-background">
                                <button
                                    onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {EXPLORAR_BLOCK_LABELS[block.id]}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {isExpanded ? "Fechar" : "Editar"}
                                    </span>
                                </button>
                                {isExpanded && (
                                    <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Título
                                            </label>
                                            <input
                                                type="text"
                                                value={block.title}
                                                onChange={e => updateBlock(block.id, "title", e.target.value)}
                                                className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Descrição
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={block.description}
                                                onChange={e => updateBlock(block.id, "description", e.target.value)}
                                                className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
