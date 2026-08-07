"use client";

import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { BIBLIOTECA_TEMAS } from "@/domain/entities/BibliotecaItem";
import { useEbook } from "@/presentation/hooks/useEbook";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

type MovableType = Exclude<ContentType, "ebook">;

const MOVABLE_TYPE_LABELS: Record<MovableType, string> = {
    newsletter: "Newsletter",
    "mini-livro": "Mini-livros",
    biblioteca: "Biblioteca",
    "especial-semana": "Inteligência Artificial",
    radar_oportunidades: "Editoriais e Artigos",
    estudar: "Estudar",
};

const MOVABLE_TYPES = Object.keys(MOVABLE_TYPE_LABELS) as MovableType[];

export interface MoveContentInput {
    targetType: ContentType;
    tema?: string;
    ebookId?: number;
    partOrder?: number;
}

interface MoveContentModalProps {
    isOpen: boolean;
    item: ContentItem | null;
    sourceType: ContentType;
    onMove: (input: MoveContentInput) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function MoveContentModal({ isOpen, item, sourceType, onMove, onCancel, isLoading }: MoveContentModalProps) {
    const { all: allEbooks } = useEbook();
    const [targetType, setTargetType] = useState<MovableType | "">("");
    const [tema, setTema] = useState("");
    const [ebookId, setEbookId] = useState("");
    const [showLossConfirm, setShowLossConfirm] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTargetType("");
            setTema("");
            setEbookId("");
            setShowLossConfirm(false);
        }
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const destinations = MOVABLE_TYPES.filter(type => type !== sourceType);
    const requiresTema = targetType === "biblioteca" && !item.tema;
    const requiresEbook = targetType === "mini-livro";
    const losesTema = Boolean(item.tema) && targetType !== "" && targetType !== "biblioteca";
    const losesEbook = Boolean(item.ebookId) && targetType !== "" && targetType !== "mini-livro";
    const willLose = losesTema || losesEbook;

    const canSubmit =
        targetType !== "" &&
        (!requiresTema || tema !== "") &&
        (!requiresEbook || ebookId !== "");

    const buildInput = (): MoveContentInput => {
        const chosenEbook = allEbooks.find(e => e.id === Number(ebookId));
        return {
            targetType: targetType as ContentType,
            tema: requiresTema ? tema : undefined,
            ebookId: requiresEbook ? Number(ebookId) : undefined,
            partOrder: requiresEbook ? chosenEbook?.order : undefined,
        };
    };

    const handleMoveClick = () => {
        if (!canSubmit) return;
        if (willLose) {
            setShowLossConfirm(true);
            return;
        }
        void onMove(buildInput());
    };

    const lossMessageParts: string[] = [];
    if (losesTema) {
        const temaLabel = BIBLIOTECA_TEMAS.find(t => t.slug === item.tema)?.label ?? item.tema;
        lossMessageParts.push(`Tema (${temaLabel})`);
    }
    if (losesEbook) {
        lossMessageParts.push("E-book e Parte vinculados");
    }

    return (
        <>
            <div
                className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
                onClick={onCancel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="move-content-modal-title"
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <div
                    className="relative w-full max-w-md rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-start justify-between px-6 pb-0 pt-6">
                        <h2 id="move-content-modal-title" className="pr-8 font-serif text-2xl tracking-tight text-ink">
                            Mover &quot;{item.title}&quot;
                        </h2>
                        <button
                            onClick={onCancel}
                            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Fechar"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="mx-6 mt-4 h-px bg-border" />

                    <div className="space-y-4 px-6 py-5">
                        <div className="space-y-1.5">
                            <label htmlFor="move-target-type" className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                Mover para
                            </label>
                            <select
                                id="move-target-type"
                                value={targetType}
                                onChange={e => setTargetType(e.target.value as MovableType)}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30"
                            >
                                <option value="">Selecione um bloco…</option>
                                {destinations.map(type => (
                                    <option
                                        key={type}
                                        value={type}
                                        disabled={type === "mini-livro" && allEbooks.length === 0}
                                    >
                                        {MOVABLE_TYPE_LABELS[type]}
                                        {type === "mini-livro" && allEbooks.length === 0 ? " (crie um E-book primeiro)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {requiresTema && (
                            <div className="space-y-1.5">
                                <label htmlFor="move-tema" className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                    Tema *
                                </label>
                                <select
                                    id="move-tema"
                                    value={tema}
                                    onChange={e => setTema(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30"
                                >
                                    <option value="">Selecione o tema…</option>
                                    {BIBLIOTECA_TEMAS.map(({ slug, label }) => (
                                        <option key={slug} value={slug}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {requiresEbook && (
                            <div className="space-y-1.5">
                                <label htmlFor="move-ebook-id" className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                    E-book *
                                </label>
                                <select
                                    id="move-ebook-id"
                                    value={ebookId}
                                    onChange={e => setEbookId(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30"
                                >
                                    <option value="">Selecione o e-book…</option>
                                    {allEbooks.map(ebook => (
                                        <option key={ebook.id} value={ebook.id}>{ebook.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 px-6 pb-6">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleMoveClick}
                            disabled={!canSubmit || isLoading}
                            className="flex-1 rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isLoading ? "Movendo…" : "Mover"}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showLossConfirm}
                title="Confirmar remoção de dados"
                message={`Mover "${item.title}" para ${targetType ? MOVABLE_TYPE_LABELS[targetType] : ""} vai remover: ${lossMessageParts.join(", ")}. Deseja continuar?`}
                confirmLabel="Mover mesmo assim"
                cancelLabel="Cancelar"
                variant="warning"
                onConfirm={() => { void onMove(buildInput()); }}
                onCancel={() => setShowLossConfirm(false)}
            />
        </>
    );
}
