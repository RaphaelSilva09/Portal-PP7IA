"use client";

import { GlassCard } from "@/components/ui";
import { MINI_LIVRO_PARTS, getMiniLivroPartLabel } from "@/constants/miniLivros";
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
import { File, FileText, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SortableContentTableProps {
    items: ContentItem[];
    onEdit: (item: ContentItem) => void;
    onDelete: (item: ContentItem) => void;
    onReorder: (reorderedItems: ContentItem[]) => Promise<void>;
    lastUpdated?: Date | null;
    type?: ContentType;
    selectedEbookIndex?: number;
    onEbookChange?: (index: number) => void;
    ebooks?: { order: number; title: string }[];
}

interface SortableRowProps {
    item: ContentItem;
    position: number;
    onEdit: (item: ContentItem) => void;
    onDelete: (item: ContentItem) => void;
    isBiblioteca: boolean;
    isReordering: boolean;
}

function getTemaLabel(tema: string | null | undefined): string {
    if (!tema) return "-";
    return BIBLIOTECA_TEMAS.find(t => t.slug === tema)?.label ?? tema;
}

function SortableRow({ item, position, onEdit, onDelete, isBiblioteca, isReordering }: SortableRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className="hover:bg-[var(--surface-glass)]/50 transition-colors"
        >
            <td className="px-3 py-3 text-[var(--text-secondary)] w-8">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Arrastar para reordenar"
                    disabled={isReordering}
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </td>
            <td className="px-4 py-3 text-[var(--text-secondary)] font-mono text-sm w-16">
                {position.toString().padStart(3, "0")}
            </td>
            <td className="px-4 py-3 text-[var(--text-primary)]">{item.title}</td>
            <td className="px-4 py-3 text-[var(--text-secondary)]">
                {item.readTime ? `${item.readTime} min` : "-"}
            </td>
            {isBiblioteca && (
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {getTemaLabel(item.tema)}
                </td>
            )}
            <td className="px-4 py-3 text-center">
                {item.htmlAvailable ? (
                    <FileText className="w-5 h-5 text-[var(--brand-green)] mx-auto" />
                ) : (
                    <span className="text-[var(--text-secondary)]">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                {item.pdfAvailable ? (
                    <File className="w-5 h-5 text-[var(--brand-orange)] mx-auto" />
                ) : (
                    <span className="text-[var(--text-secondary)]">-</span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-[var(--brand-blue)]/20 text-[var(--brand-blue)] transition-colors"
                        aria-label="Editar"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                        aria-label="Deletar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function SortableContentTable({ items, onEdit, onDelete, onReorder, lastUpdated, type, selectedEbookIndex = 0, onEbookChange, ebooks = [] }: SortableContentTableProps) {
    const [localItems, setLocalItems] = useState<ContentItem[]>(items);
    const [isReordering, setIsReordering] = useState(false);
    const isBiblioteca = type === "biblioteca";

    // Sync local state when parent provides updated items (e.g. after create/delete)
    // Guard against overwriting an in-progress drag with a stale fetch
    useEffect(() => {
        if (!isReordering) {
            setLocalItems(items);
        }
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
        <GlassCard variant="bordered" padding="none">
            {(lastUpdated || type === "mini-livro") && (
                <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-glass)]">
                    {type === "mini-livro" && onEbookChange ? (
                        <div className="flex flex-wrap gap-2">
                            {MINI_LIVRO_PARTS.map((part, i) => (
                                <button
                                    key={part.order}
                                    onClick={() => onEbookChange(i)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        i === selectedEbookIndex
                                            ? "bg-[var(--brand-purple)] text-white"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]"
                                    }`}
                                >
                                    {getMiniLivroPartLabel(part, ebooks.find(e => e.order === part.order))}
                                </button>
                            ))}
                        </div>
                    ) : <span />}
                    {lastUpdated && (
                        <span className="text-sm text-[var(--text-secondary)] shrink-0 ml-auto">
                            Última atualização:{" "}
                            {lastUpdated.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </span>
                    )}
                </div>
            )}
            {isReordering && (
                <div className="px-4 py-1 text-xs text-[var(--brand-blue)] border-b border-[var(--border-glass)]">
                    Salvando ordem...
                </div>
            )}
            <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="w-full">
                        <thead className="bg-[var(--surface-glass)]">
                            <tr>
                                <th className="px-3 py-3 w-8" />
                                <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                    Ordem
                                </th>
                                <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                    Título
                                </th>
                                <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                    Leitura
                                </th>
                                {isBiblioteca && (
                                    <th className="px-4 py-3 text-left text-[var(--text-secondary)] text-sm font-medium">
                                        Tema
                                    </th>
                                )}
                                <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium">
                                    HTML
                                </th>
                                <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium">
                                    PDF
                                </th>
                                <th className="px-4 py-3 text-center text-[var(--text-secondary)] text-sm font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-glass)]">
                            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                {localItems.map((item, i) => (
                                    <SortableRow
                                        key={item.id}
                                        item={item}
                                        position={i + 1}
                                        onEdit={onEdit}
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
        </GlassCard>
    );
}
