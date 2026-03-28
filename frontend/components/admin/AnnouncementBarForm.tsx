"use client";

/**
 * AnnouncementBarForm Component (Admin)
 *
 * Formulário inline de criação/edição de barras de aviso.
 * Estilo GlassCard, igual ao formulário de Novidades (AdminPortalNews).
 */

import { GlassCard } from "@/components/ui";
import { AnnouncementBar } from "@/domain/entities/AnnouncementBar";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnnouncementBarPreview } from "./AnnouncementBarPreview";

const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50";

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]/70 whitespace-nowrap">
                {label}
            </span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>
    );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`${LABEL_CLASS} text-center`}>{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/40 ${
                    checked ? "bg-[var(--brand-blue)]" : "bg-[var(--surface-glass)] border border-[var(--border-subtle)]"
                }`}
            >
                <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                        checked ? "translate-x-7" : "translate-x-1"
                    }`}
                />
            </button>
            <span className="text-xs text-[var(--text-secondary)]">{checked ? "Sim" : "Não"}</span>
        </div>
    );
}

interface FormState {
    message: string;
    linkUrl: string;
    linkLabel: string;
    bgColor: string;
    textColor: string;
    priority: number;
    isActive: boolean;
    isClosable: boolean;
    startsAt: string;
    endsAt: string;
}

function toDatetimeLocalValue(date: Date | null | undefined): string {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyForm(): FormState {
    return {
        message: "", linkUrl: "", linkLabel: "",
        bgColor: "#1a1a1a", textColor: "#ffffff",
        priority: 0, isActive: true, isClosable: true,
        startsAt: "", endsAt: "",
    };
}

function barToForm(bar: AnnouncementBar): FormState {
    return {
        message:   bar.message,
        linkUrl:   bar.linkUrl   ?? "",
        linkLabel: bar.linkLabel ?? "",
        bgColor:   bar.bgColor,
        textColor: bar.textColor,
        priority:  bar.priority,
        isActive:  bar.isActive,
        isClosable: bar.isClosable,
        startsAt:  toDatetimeLocalValue(bar.startsAt),
        endsAt:    toDatetimeLocalValue(bar.endsAt),
    };
}

export interface AnnouncementBarFormSubmitData {
    message: string;
    linkUrl: string | null;
    linkLabel: string | null;
    bgColor: string;
    textColor: string;
    priority: number;
    isActive: boolean;
    isClosable: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
}

interface AnnouncementBarFormProps {
    editBar?: AnnouncementBar | null;
    onSubmit: (data: AnnouncementBarFormSubmitData) => Promise<void>;
    onCancel: () => void;
}

export function AnnouncementBarForm({ editBar, onSubmit, onCancel }: AnnouncementBarFormProps) {
    const [form, setForm] = useState<FormState>(editBar ? barToForm(editBar) : emptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const msgRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const t = setTimeout(() => msgRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, []);

    const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const msgEmpty = !form.message.trim();
    const msgLen = form.message.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (msgEmpty) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit({
                message:    form.message.trim(),
                linkUrl:    form.linkUrl.trim()    || null,
                linkLabel:  form.linkLabel.trim()  || null,
                bgColor:    form.bgColor,
                textColor:  form.textColor,
                priority:   form.priority,
                isActive:   form.isActive,
                isClosable: form.isClosable,
                startsAt:   form.startsAt ? new Date(form.startsAt) : null,
                endsAt:     form.endsAt   ? new Date(form.endsAt)   : null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar barra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GlassCard variant="elevated" padding="lg">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {editBar ? "Editar Barra de Aviso" : "Nova Barra de Aviso"}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {editBar ? "Altere os campos e salve." : "Preencha os campos e publique."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* — Mensagem — */}
                <SectionDivider label="Mensagem" />

                <div>
                    <label className={LABEL_CLASS}>
                        Texto <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        ref={msgRef}
                        className={`${INPUT_CLASS} resize-y min-h-[72px] ${msgEmpty ? "border-red-500/60" : ""}`}
                        value={form.message}
                        onChange={e => set("message", e.target.value)}
                        maxLength={200}
                        placeholder="Texto exibido na barra..."
                        aria-required="true"
                        aria-invalid={msgEmpty}
                    />
                    <div className="flex items-center justify-between mt-1">
                        {msgEmpty && (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                                <AlertCircle className="w-3 h-3" /> Campo obrigatório
                            </span>
                        )}
                        <span className="ml-auto text-xs text-[var(--text-secondary)]">{msgLen}/200</span>
                    </div>
                </div>

                {/* Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>URL do link <span className="font-normal opacity-60">(opcional)</span></label>
                        <input
                            className={INPUT_CLASS}
                            value={form.linkUrl}
                            onChange={e => set("linkUrl", e.target.value)}
                            placeholder="https://youtube.com"
                            type="text"
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Texto do link</label>
                        <input
                            className={INPUT_CLASS}
                            value={form.linkLabel}
                            onChange={e => set("linkLabel", e.target.value)}
                            placeholder="Saiba mais"
                            type="text"
                        />
                    </div>
                </div>

                {/* — Aparência — */}
                <SectionDivider label="Aparência" />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>Cor de fundo</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={form.bgColor}
                                onChange={e => set("bgColor", e.target.value)}
                                className="h-12 w-14 rounded-lg cursor-pointer border border-[var(--border-glass)] bg-transparent flex-shrink-0"
                                aria-label="Cor de fundo"
                            />
                            <input
                                className={`${INPUT_CLASS} font-mono text-xs`}
                                value={form.bgColor}
                                onChange={e => set("bgColor", e.target.value)}
                                maxLength={7}
                                placeholder="#1a1a1a"
                            />
                        </div>
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Cor do texto</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={form.textColor}
                                onChange={e => set("textColor", e.target.value)}
                                className="h-12 w-14 rounded-lg cursor-pointer border border-[var(--border-glass)] bg-transparent flex-shrink-0"
                                aria-label="Cor do texto"
                            />
                            <input
                                className={`${INPUT_CLASS} font-mono text-xs`}
                                value={form.textColor}
                                onChange={e => set("textColor", e.target.value)}
                                maxLength={7}
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>
                </div>

                {/* — Publicação — */}
                <SectionDivider label="Publicação" />

                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto_auto] gap-4 items-start">
                    <div>
                        <label className={LABEL_CLASS}>Início <span className="font-normal opacity-60">(opcional)</span></label>
                        <input type="datetime-local" className={INPUT_CLASS} value={form.startsAt} onChange={e => set("startsAt", e.target.value)} />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Prioridade</label>
                        <input type="number" className={INPUT_CLASS} value={form.priority} onChange={e => set("priority", Number(e.target.value))} min={0} />
                    </div>
                    <Toggle checked={form.isActive}   onChange={v => set("isActive", v)}   label="Ativo" />
                    <Toggle checked={form.isClosable} onChange={v => set("isClosable", v)} label="Fechável" />
                </div>

                <div>
                    <label className={LABEL_CLASS}>Fim <span className="font-normal opacity-60">(opcional)</span></label>
                    <input type="datetime-local" className={INPUT_CLASS} value={form.endsAt} onChange={e => set("endsAt", e.target.value)} />
                </div>

                {/* — Preview — */}
                <SectionDivider label="Preview" />

                <AnnouncementBarPreview
                    bar={{
                        message:   form.message,
                        linkLabel: form.linkLabel,
                        bgColor:   form.bgColor,
                        textColor: form.textColor,
                    }}
                />

                {/* Erro */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-red-400">{error}</span>
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || msgEmpty}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--brand-blue)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Salvando...
                            </>
                        ) : editBar ? (
                            "Salvar alterações"
                        ) : (
                            "Criar barra"
                        )}
                    </button>
                </div>
            </form>
        </GlassCard>
    );
}
