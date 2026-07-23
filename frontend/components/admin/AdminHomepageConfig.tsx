"use client";

import { useEffect, useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    ArrowUp,
    ArrowDown,
    Save,
} from "lucide-react";

import type { HomepageConfig, SectionConfig, SectionId } from "@/domain/entities/HomepageConfig";
import {
    DEFAULT_HOMEPAGE_CONFIG,
    SECTION_LABELS,
    SECTION_TEXT_FIELDS,
} from "@/domain/entities/HomepageConfig";
import { parseManifestoQuote } from "@/lib/parseManifestoQuote";

function ManifestoPreview({ text }: { text: string }) {
    if (!text.trim()) return null;
    const segments = parseManifestoQuote(text);
    return (
        <div className="mt-3 rounded-xl border border-border bg-background px-4 py-3">
            <p className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                Prévia
            </p>
            <p className="font-serif text-lg leading-snug text-foreground">
                {segments.map((seg, i) => {
                    if (seg.type === "linebreak") return <br key={i} />;
                    if (seg.type === "highlight")
                        return (
                            <span key={i} style={{ color: "var(--block-livro)" }}>
                                {seg.text}
                            </span>
                        );
                    return <span key={i}>{seg.text}</span>;
                })}
            </p>
        </div>
    );
}

function mergeWithDefaults(loaded: HomepageConfig): SectionConfig[] {
    const defaults = DEFAULT_HOMEPAGE_CONFIG.sections;
    const byId = Object.fromEntries(loaded.sections.map((s) => [s.id, s]));
    return defaults.map((def) => {
        const saved = byId[def.id];
        if (!saved) return def;
        return {
            ...def,
            order: saved.order,
            visible: saved.visible,
            texts: { ...def.texts, ...saved.texts },
        };
    });
}

export default function AdminHomepageConfig() {
    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [expanded, setExpanded] = useState<SectionId | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/homepage-config")
            .then((r) => r.json())
            .then((data: HomepageConfig) => {
                setSections(mergeWithDefaults(data).sort((a, b) => a.order - b.order));
            })
            .catch(() => {
                setSections(
                    [...DEFAULT_HOMEPAGE_CONFIG.sections].sort((a, b) => a.order - b.order),
                );
            });
    }, []);

    function move(index: number, dir: -1 | 1) {
        const next = [...sections];
        const swapIdx = index + dir;
        if (swapIdx < 0 || swapIdx >= next.length) return;
        [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
        const reordered = next.map((s, i) => ({ ...s, order: i }));
        setSections(reordered);
    }

    function toggleVisible(id: SectionId) {
        setSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
        );
    }

    function updateText(id: SectionId, key: string, value: string) {
        setSections((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, texts: { ...s.texts, [key]: value } } : s,
            ),
        );
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/homepage-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sections }),
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

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Página Principal
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Reordene as seções e edite todos os textos da homepage.
                        </p>
                    </div>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
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

            {sections.map((section, index) => {
                const fields = SECTION_TEXT_FIELDS[section.id];
                const isExpanded = expanded === section.id;

                return (
                    <div key={section.id} className="rounded-2xl border border-border bg-card p-6">
                        {/* Header da seção */}
                        <div className="flex items-center gap-3">
                            {/* Botões de ordem */}
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                    className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                                    aria-label="Mover para cima"
                                >
                                    <ArrowUp className="size-4" />
                                </button>
                                <button
                                    onClick={() => move(index, 1)}
                                    disabled={index === sections.length - 1}
                                    className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                                    aria-label="Mover para baixo"
                                >
                                    <ArrowDown className="size-4" />
                                </button>
                            </div>

                            {/* Posição */}
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-sm font-semibold text-muted-foreground">
                                {index + 1}
                            </span>

                            {/* Nome */}
                            <div className="flex-1">
                                <span className="font-medium text-foreground">
                                    {SECTION_LABELS[section.id]}
                                </span>
                                {!section.visible && (
                                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                        oculta
                                    </span>
                                )}
                            </div>

                            {/* Visibilidade */}
                            <button
                                onClick={() => toggleVisible(section.id)}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent"
                                aria-label={section.visible ? "Ocultar seção" : "Mostrar seção"}
                                title={section.visible ? "Ocultar" : "Mostrar"}
                            >
                                {section.visible ? (
                                    <Eye className="size-4" />
                                ) : (
                                    <EyeOff className="size-4" />
                                )}
                            </button>

                            {/* Expand/collapse */}
                            <button
                                onClick={() => setExpanded(isExpanded ? null : section.id)}
                                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent"
                                aria-label="Editar textos"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="size-4" />
                                ) : (
                                    <ChevronDown className="size-4" />
                                )}
                            </button>
                        </div>

                        {/* Campos de texto */}
                        {isExpanded && (
                            <div className="mt-5 space-y-4 border-t border-border pt-5">
                                {fields.map(({ key, label, multiline, hint }) => (
                                    <div key={key}>
                                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {label}
                                        </label>
                                        {multiline ? (
                                            <textarea
                                                rows={3}
                                                value={section.texts[key] ?? ""}
                                                onChange={(e) =>
                                                    updateText(section.id, key, e.target.value)
                                                }
                                                className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={section.texts[key] ?? ""}
                                                onChange={(e) =>
                                                    updateText(section.id, key, e.target.value)
                                                }
                                                className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                            />
                                        )}
                                        {hint && (
                                            <p className="mt-1.5 text-xs text-muted-foreground">
                                                {hint}
                                            </p>
                                        )}
                                        {section.id === "manifesto" && key === "quote" && (
                                            <ManifestoPreview text={section.texts[key] ?? ""} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
