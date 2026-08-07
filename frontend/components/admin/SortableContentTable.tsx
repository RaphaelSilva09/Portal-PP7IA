"use client";

import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import { BIBLIOTECA_TEMAS } from "@/domain/entities/BibliotecaItem";
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRightLeft, FileText, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const MINI_LIVRO_EBOOK_TABS = [
    "Parte I — Liderança Híbrida",
    "Parte II — A Coragem de Executar",
    "Parte III — O Que Fica",
] as const;

interface SortableContentTableProps {
    items: ContentItem[];
    onEdit: (item: ContentItem) => void;
    onMove?: (item: ContentItem) => void;
    onDelete: (item: ContentItem) => void;
    onReorder: (reorderedItems: ContentItem[]) => Promise<void>;
    lastUpdated?: Date | null;
    type?: ContentType;
    selectedEbookIndex?: number;
    onEbookChange?: (index: number) => void;
}

interface SortableRowProps {
    item: ContentItem;
    position: number;
    onEdit: (item: ContentItem) => void;
    onMove?: (item: ContentItem) => void;
    onDelete: (item: ContentItem) => void;
    isBiblioteca: boolean;
    isReordering: boolean;
}

function getTemaLabel(tema: string | null | undefined): string {
    if (!tema) return "—";
    return BIBLIOTECA_TEMAS.find(t => t.slug === tema)?.label ?? tema;
}

function SortableRow({ item, position, onEdit, onMove, onDelete, isBiblioteca, isReordering }: SortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="transition-colors hover:bg-accent/50">
            <td className="w-8 px-3 py-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded p-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
                    aria-label="Arrastar para reordenar"
                    disabled={isReordering}
                >
                    <GripVertical className="size-4" />
                </button>
            </td>
            <td className="w-12 px-4 py-3 font-mono text-xs text-muted-foreground">
                {position.toString().padStart(3, "0")}
            </td>
            <td className="px-4 py-3 text-sm text-foreground">{item.title}</td>
            <td className="px-4 py-3 text-sm text-muted-foreground">
                {item.readTime ? `${item.readTime} min` : "—"}
            </td>
            {isBiblioteca && (
                <td className="px-4 py-3 text-sm text-muted-foreground">{getTemaLabel(item.tema)}</td>
            )}
            <td className="px-4 py-3 text-center">
                {item.htmlAvailable ? (
                    <FileText className="mx-auto size-4 text-green-500" />
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onEdit(item)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Editar"
                    >
                        <Pencil className="size-3.5" />
                    </button>
                    {onMove && (
                        <button
                            onClick={() => onMove(item)}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Mover para outro bloco"
                        >
                            <ArrowRightLeft className="size-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(item)}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                        aria-label="Deletar"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function SortableContentTable({ items, onEdit, onMove, onDelete, onReorder, lastUpdated, type, selectedEbookIndex = 0, onEbookChange }: SortableContentTableProps) {
    const [localItems, setLocalItems] = useState<ContentItem[]>(items);
    const [isReordering, setIsReordering] = useState(false);
    const isBiblioteca = type === "biblioteca";

    useEffect(() => {
        if (!isReordering) setLocalItems(items);
    }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localItems.findIndex(i => i.id === active.id);
        const newIndex = localItems.findIndex(i => i.id === over.id);
        const reordered = arrayMove(localItems, oldIndex, newIndex);
        setLocalItems(reordered);
        setIsReordering(true);
        try {
            await onReorder(reordered);
        } finally {
            setIsReordering(false);
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {/* Toolbar */}
            {(lastUpdated || type === "mini-livro") && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                    {type === "mini-livro" && onEbookChange ? (
                        <div className="flex flex-wrap gap-2">
                            {MINI_LIVRO_EBOOK_TABS.map((label, i) => (
                                <button
                                    key={i}
                                    onClick={() => onEbookChange(i)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                        i === selectedEbookIndex
                                            ? "bg-foreground text-background"
                                            : "border border-border text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    ) : <span />}
                    {lastUpdated && (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                            Atualizado em{" "}
                            {lastUpdated.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </span>
                    )}
                </div>
            )}

            {isReordering && (
                <div className="border-b border-border px-4 py-1.5 text-[11px] text-muted-foreground">
                    Salvando ordem…
                </div>
            )}

            <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="w-full text-sm">
                        <thead className="bg-accent">
                            <tr>
                                <th className="w-8 px-3 py-3" />
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ordem</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Título</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leitura</th>
                                {isBiblioteca && (
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tema</th>
                                )}
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">HTML</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                {localItems.map((item, i) => (
                                    <SortableRow
                                        key={item.id}
                                        item={item}
                                        position={i + 1}
                                        onEdit={onEdit}
                                        onMove={onMove}
                                        onDelete={onDelete}
                                        isBiblioteca={isBiblioteca}
                                        isReordering={isReordering}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            </div>
        </div>
    );
}
