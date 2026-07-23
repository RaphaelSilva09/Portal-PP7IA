"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { DEFAULT_SITE_BG, isValidBgHex } from "@/domain/entities/SiteBg";
import type { SiteBg } from "@/domain/entities/SiteBg";

const LIGHT_PRESETS = [
    { hex: "#eef4ff", label: "Azul pérola" },
    { hex: "#f8f7f4", label: "Off-white" },
    { hex: "#f5f0e8", label: "Bege" },
    { hex: "#f0f4f0", label: "Verde suave" },
    { hex: "#faf5ff", label: "Lavanda" },
    { hex: "#fff8f0", label: "Pêssego" },
];

const DARK_PRESETS = [
    { hex: "#111111", label: "Preto" },
    { hex: "#0d1117", label: "Azul escuro" },
    { hex: "#13111a", label: "Roxo escuro" },
    { hex: "#0f1110", label: "Verde escuro" },
    { hex: "#1a100a", label: "Marrom escuro" },
    { hex: "#0e0e0e", label: "Carvão" },
];

function PresetSwatch({ hex, label, selected, onSelect }: {
    hex: string; label: string; selected: boolean; onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            title={label}
            className={`relative size-9 rounded-lg border-2 transition ${
                selected ? "border-foreground scale-110" : "border-transparent hover:border-border"
            }`}
            style={{ backgroundColor: hex }}
        >
            {selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <span className="size-2 rounded-full bg-foreground mix-blend-difference" />
                </span>
            )}
        </button>
    );
}

function ColorPicker({ label, value, placeholder, onChange }: {
    label: string; value: string; placeholder: string; onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            />
            <input
                type="text"
                value={value}
                onChange={e => isValidBgHex(e.target.value) && onChange(e.target.value)}
                className="w-28 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
                placeholder={placeholder}
                maxLength={7}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

export default function AdminSiteBg() {
    const [bg, setBg] = useState<SiteBg>({ ...DEFAULT_SITE_BG });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/site-bg")
            .then(r => r.json())
            .then((data: SiteBg) => {
                if (isValidBgHex(data?.light) && isValidBgHex(data?.dark)) {
                    setBg({
                        ...DEFAULT_SITE_BG,
                        ...data,
                    });
                }
            })
            .catch(() => {});
    }, []);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/site-bg", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bg),
            });
            if (!res.ok) throw new Error();
            showToast("Fundo salvo. Recarregue a página para ver o efeito.");
        } catch {
            showToast("Erro ao salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    function reset() {
        setBg({ ...DEFAULT_SITE_BG });
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="font-serif text-2xl text-ink">Fundo do Site</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Define a cor de fundo principal do portal em modo claro e escuro.
                </p>
            </div>

            {/* Preview */}
            <div className="overflow-hidden rounded-2xl border border-border">
                <div
                    className="flex h-20 items-center justify-center text-sm font-medium transition-colors duration-300"
                    style={{ backgroundColor: bg.light, color: "#162338" }}
                >
                    Modo claro — {bg.light}
                </div>
                <div
                    className="flex h-20 items-center justify-center text-sm font-medium transition-colors duration-300"
                    style={{ backgroundColor: bg.dark, color: "#dadada" }}
                >
                    Modo escuro — {bg.dark}
                </div>
            </div>

            {/* Modo claro */}
            <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Modo claro
                </h3>
                <div className="flex flex-wrap gap-3">
                    {LIGHT_PRESETS.map(p => (
                        <PresetSwatch
                            key={p.hex}
                            hex={p.hex}
                            label={p.label}
                            selected={bg.light === p.hex}
                            onSelect={() => setBg(prev => ({ ...prev, light: p.hex }))}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={bg.light}
                        onChange={e => setBg(prev => ({ ...prev, light: e.target.value }))}
                        className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                    />
                    <input
                        type="text"
                        value={bg.light}
                        onChange={e => isValidBgHex(e.target.value) && setBg(prev => ({ ...prev, light: e.target.value }))}
                        className="w-28 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
                        placeholder="#eef4ff"
                        maxLength={7}
                    />
                    <span className="text-xs text-muted-foreground">hex personalizado</span>
                </div>
            </section>

            {/* Modo escuro */}
            <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Modo escuro
                </h3>
                <div className="flex flex-wrap gap-3">
                    {DARK_PRESETS.map(p => (
                        <PresetSwatch
                            key={p.hex}
                            hex={p.hex}
                            label={p.label}
                            selected={bg.dark === p.hex}
                            onSelect={() => setBg(prev => ({ ...prev, dark: p.hex }))}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={bg.dark}
                        onChange={e => setBg(prev => ({ ...prev, dark: e.target.value }))}
                        className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                    />
                    <input
                        type="text"
                        value={bg.dark}
                        onChange={e => isValidBgHex(e.target.value) && setBg(prev => ({ ...prev, dark: e.target.value }))}
                        className="w-28 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
                        placeholder="#111111"
                        maxLength={7}
                    />
                    <span className="text-xs text-muted-foreground">hex personalizado</span>
                </div>
            </section>

            {/* Card do Livro */}
            <section className="space-y-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Card do Livro
                </h3>

                {/* Live preview */}
                <div
                    className="flex min-h-[80px] flex-col justify-between rounded-xl p-4 transition-colors duration-300"
                    style={{ backgroundColor: bg.bookCardBg }}
                >
                    <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: bg.bookCardLabelColor }}>
                        O Livro · Novo Capítulo
                    </p>
                    <p className="mt-1 text-lg font-bold uppercase" style={{ color: bg.bookCardTitleColor }}>
                        Enquanto é Tempo
                    </p>
                    <p className="mt-0.5 font-serif italic text-sm" style={{ color: bg.bookCardSubtitleColor }}>
                        Subtítulo do livro
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex flex-1 flex-col gap-1">
                            <div className="relative h-1 w-full overflow-hidden rounded-full"
                                style={{ backgroundColor: bg.bookCardProgressBgColor }}>
                                <div className="absolute inset-y-0 left-0 rounded-full"
                                    style={{ width: "70%", backgroundColor: bg.bookCardProgressFillColor }} />
                            </div>
                            <span className="text-[10px]" style={{ color: bg.bookCardLabelColor }}>20 de 21 cap.</span>
                        </div>
                        <span className="text-sm font-medium" style={{ color: bg.bookCardCtaColor }}>Ler →</span>
                    </div>
                </div>

                <ColorPicker label="Fundo" value={bg.bookCardBg} placeholder="#1a2f20"
                    onChange={v => setBg(prev => ({ ...prev, bookCardBg: v }))} />
                <ColorPicker label="Título" value={bg.bookCardTitleColor} placeholder="#ffffff"
                    onChange={v => setBg(prev => ({ ...prev, bookCardTitleColor: v }))} />
                <ColorPicker label="Labels e progresso" value={bg.bookCardLabelColor} placeholder="#8a9e93"
                    onChange={v => setBg(prev => ({ ...prev, bookCardLabelColor: v }))} />
                <ColorPicker label="Subtítulo" value={bg.bookCardSubtitleColor} placeholder="#96b0a0"
                    onChange={v => setBg(prev => ({ ...prev, bookCardSubtitleColor: v }))} />
                <ColorPicker label="Botão Ler" value={bg.bookCardCtaColor} placeholder="#9dbcac"
                    onChange={v => setBg(prev => ({ ...prev, bookCardCtaColor: v }))} />
                <ColorPicker label="Barra de progresso — fundo (trilho)" value={bg.bookCardProgressBgColor} placeholder="#3a5a47"
                    onChange={v => setBg(prev => ({ ...prev, bookCardProgressBgColor: v }))} />
                <ColorPicker label="Barra de progresso — preenchimento" value={bg.bookCardProgressFillColor} placeholder="#6fa88a"
                    onChange={v => setBg(prev => ({ ...prev, bookCardProgressFillColor: v }))} />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Total de capítulos planejados</label>
                    <p className="text-xs text-muted-foreground">Capítulos publicados são detectados automaticamente.</p>
                    <input
                        type="number" min={1} max={999} value={bg.bookChaptersTotal}
                        onChange={e => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n > 0) setBg(prev => ({ ...prev, bookChaptersTotal: n })); }}
                        className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                </div>
            </section>

            {/* Card de Newsletter */}
            <section className="space-y-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Card de Newsletter
                </h3>

                {/* Live preview */}
                <div
                    className="flex min-h-[100px] flex-col justify-between rounded-xl p-4 transition-colors duration-300"
                    style={{ backgroundColor: bg.newsletterCardBg }}
                >
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: bg.newsletterSidebarLabelColor }}>
                            Curadoria Semanal
                        </p>
                        <p className="mt-1 font-serif italic text-lg leading-tight" style={{ color: bg.newsletterSidebarNumberColor }}>
                            O melhor da IA,<br />segunda e quarta.
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs" style={{ color: bg.newsletterSidebarLabelColor }}>Gratuita · Sem ruído</span>
                        <span className="text-sm font-medium" style={{ color: bg.newsletterSidebarNumberColor }}>Assinar →</span>
                    </div>
                </div>

                <ColorPicker label="Fundo" value={bg.newsletterCardBg} placeholder="#6366f1"
                    onChange={v => setBg(prev => ({ ...prev, newsletterCardBg: v }))} />
                <ColorPicker label="Título e CTA" value={bg.newsletterSidebarNumberColor} placeholder="#ffffff"
                    onChange={v => setBg(prev => ({ ...prev, newsletterSidebarNumberColor: v }))} />
                <ColorPicker label="Labels e tagline" value={bg.newsletterSidebarLabelColor} placeholder="#cfd0fc"
                    onChange={v => setBg(prev => ({ ...prev, newsletterSidebarLabelColor: v }))} />
            </section>

            {/* Ações */}
            <div className="flex items-center gap-3 border-t border-border pt-6">
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                    <Save className="size-4" />
                    {saving ? "Salvando…" : "Salvar"}
                </button>
                <button
                    onClick={reset}
                    className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <RotateCcw className="size-4" />
                    Restaurar padrão
                </button>
            </div>

            {toast && (
                <p className="text-sm text-muted-foreground">{toast}</p>
            )}
        </div>
    );
}
