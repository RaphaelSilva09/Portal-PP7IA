"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    type DragEndEvent,
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

import { extractStoragePathFromSourcePath } from "@/constants/miniLivroSections";
import {
    MiniLivroSection,
    type MiniLivroSectionKind,
    type MiniLivroSectionProps,
} from "@/domain/entities/MiniLivroSection";
import {
    AlertCircle,
    FileText,
    GripVertical,
    Loader2,
    Pencil,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage } from "./FeedbackMessage";

const LABEL_CLASS = "block text-sm font-medium text-muted-foreground mb-2";
const INPUT_CLASS = "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-foreground/30";
const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[128px] resize-y`;

interface MiniLivroSectionRow {
    id: number | string; // pg returns BIGINT as string at runtime
    created_at: string;
    updated_at: string;
    kind: MiniLivroSectionKind;
    title: string;
    description: string | null;
    html_path: string | null;
    index: number;
}

interface SectionFormState {
    title: string;
    description: string;
    htmlFile: File | null;
}

interface SortableSectionRowProps {
    item: MiniLivroSection;
    position: number;
    label: string;
    isDraggingDisabled: boolean;
    isDeleting: boolean;
    isEditing: boolean;
    onEdit: (item: MiniLivroSection) => void;
    onDelete: (item: MiniLivroSection) => void;
}

const EMPTY_FORM: SectionFormState = {
    title: "",
    description: "",
    htmlFile: null,
};

function getKindOrder(kind: MiniLivroSectionKind): number {
    return kind === "introducao" ? 0 : 1;
}

function compareSections(left: MiniLivroSection, right: MiniLivroSection): number {
    const kindDifference = getKindOrder(left.kind) - getKindOrder(right.kind);

    if (kindDifference !== 0) {
        return kindDifference;
    }

    const leftHasManualIndex = left.index > 0;
    const rightHasManualIndex = right.index > 0;

    if (leftHasManualIndex && rightHasManualIndex) {
        if (left.index !== right.index) {
            return left.index - right.index;
        }

        return left.id - right.id;
    }

    if (leftHasManualIndex !== rightHasManualIndex) {
        return leftHasManualIndex ? -1 : 1;
    }

    const createdAtDifference = right.createdAt.getTime() - left.createdAt.getTime();

    if (createdAtDifference !== 0) {
        return createdAtDifference;
    }

    return left.id - right.id;
}

function mapRowToSection(row: MiniLivroSectionRow): MiniLivroSection {
    const props: MiniLivroSectionProps = {
        id: Number(row.id),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        kind: row.kind,
        title: row.title,
        description: row.description ?? null,
        htmlPath: row.html_path ?? null,
        index: row.index ?? 0,
    };

    return MiniLivroSection.create(props);
}

function isMiniLivroSectionRow(row: unknown): row is MiniLivroSectionRow {
    if (!row || typeof row !== "object") {
        return false;
    }

    const candidate = row as Record<string, unknown>;
    const idOk = (typeof candidate.id === "number" || typeof candidate.id === "string") && !isNaN(Number(candidate.id));
    return (
        idOk
        && typeof candidate.title === "string"
        && (candidate.kind === "introducao" || candidate.kind === "encerramento")
    );
}

function getExistingFileName(section: MiniLivroSection | null): string | null {
    const storagePath = extractStoragePathFromSourcePath(section?.sourceHtmlPath ?? null);

    if (!storagePath) {
        return null;
    }

    const parts = storagePath.split("/");
    return parts[parts.length - 1] ?? null;
}

function SortableSectionRow({
    item,
    position,
    label,
    isDraggingDisabled,
    isDeleting,
    isEditing,
    onEdit,
    onDelete,
}: SortableSectionRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 }}
            className={`rounded-2xl border p-4 transition-colors ${isEditing ? "border-purple-500/50 bg-purple-500/5" : "border-border bg-card/40"}`}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                    <button
                        {...attributes}
                        {...listeners}
                        disabled={isDraggingDisabled}
                        className="mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Reordenar bloco"
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {label} #{String(position).padStart(2, "0")}
                            </span>
                            {item.htmlAvailable ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-500">
                                    <FileText className="h-4 w-4" />
                                    HTML enviado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    Sem HTML
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                        {item.description && (
                            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg p-2 text-foreground transition-colors hover:bg-foreground/15"
                        aria-label={`Editar ${item.title}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(item)}
                        disabled={isDeleting}
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Excluir ${item.title}`}
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AdminMiniLivroSections() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<MiniLivroSectionKind>("introducao");
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingIntroducao, setIsSavingIntroducao] = useState(false);
    const [isSavingEncerramento, setIsSavingEncerramento] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [introducoes, setIntroducoes] = useState<MiniLivroSection[]>([]);
    const [encerramentos, setEncerramentos] = useState<MiniLivroSection[]>([]);
    const [introducaoForm, setIntroducaoForm] = useState<SectionFormState>(EMPTY_FORM);
    const [encerramentoForm, setEncerramentoForm] = useState<SectionFormState>(EMPTY_FORM);
    const [editingEncerramento, setEditingEncerramento] = useState<MiniLivroSection | null>(null);
    const [editingIntroducao, setEditingIntroducao] = useState<MiniLivroSection | null>(null);
    const [pendingDelete, setPendingDelete] = useState<MiniLivroSection | null>(null);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });
    const [introducaoMeta, setIntroducaoMeta] = useState({ title: "", description: "" });
    const [encerramentoMeta, setEncerramentoMeta] = useState({ title: "", description: "" });
    const [isSavingIntroducaoMeta, setIsSavingIntroducaoMeta] = useState(false);
    const [isSavingEncerramentoMeta, setIsSavingEncerramentoMeta] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const loadSections = useCallback(async () => {
        setIsLoading(true);

        try {
            const sectionsRes = await fetch("/api/admin/mini-livro-sections");
            if (!sectionsRes.ok) {
                const err = await sectionsRes.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${sectionsRes.status}`);
            }
            const data = (await sectionsRes.json()) as unknown[];

            const allSections = data
                .filter((row): row is MiniLivroSectionRow => isMiniLivroSectionRow(row))
                .map(row => mapRowToSection(row))
                .sort(compareSections);

            setIntroducoes(allSections.filter(item => item.kind === "introducao"));
            setEncerramentos(allSections.filter(item => item.kind === "encerramento"));

            const metaRes = await fetch("/api/admin/mini-livro-section-meta");
            if (metaRes.ok) {
                const metaRows = (await metaRes.json()) as Array<{
                    kind: string;
                    title: string | null;
                    description: string | null;
                }>;
                for (const row of metaRows) {
                    if (row.kind === "introducao") {
                        setIntroducaoMeta({ title: row.title ?? "", description: row.description ?? "" });
                    } else if (row.kind === "encerramento") {
                        setEncerramentoMeta({ title: row.title ?? "", description: row.description ?? "" });
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao carregar seções extras dos mini-livros:", error);
            setFeedback({ show: true, message: "Erro ao carregar seções extras dos mini-livros.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSections();
    }, [loadSections]);

    useEffect(() => {
        if (!editingIntroducao) {
            setIntroducaoForm(EMPTY_FORM);
            return;
        }

        setIntroducaoForm({
            title: editingIntroducao.title,
            description: editingIntroducao.description ?? "",
            htmlFile: null,
        });
    }, [editingIntroducao]);

    useEffect(() => {
        if (!editingEncerramento) {
            setEncerramentoForm(EMPTY_FORM);
            return;
        }

        setEncerramentoForm({
            title: editingEncerramento.title,
            description: editingEncerramento.description ?? "",
            htmlFile: null,
        });
    }, [editingEncerramento]);

    const invalidatePublicData = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ["mini-livro-sections"] });
        await queryClient.invalidateQueries({ queryKey: ["mini-livro-section-meta"] });
    }, [queryClient]);

    const handleSaveMeta = useCallback(async (kind: "introducao" | "encerramento", title: string, description: string) => {
        if (kind === "introducao") {
            setIsSavingIntroducaoMeta(true);
        } else {
            setIsSavingEncerramentoMeta(true);
        }

        try {
            const res = await fetch("/api/admin/mini-livro-section-meta", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind, title: title.trim(), description: description.trim() }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            setFeedback({ show: true, message: `Metadados da ${kind === "introducao" ? "introdução" : "seção de encerramento"} salvos com sucesso!`, type: "success" });
        } catch (error) {
            console.error(`Erro ao salvar metadados da ${kind}:`, error);
            setFeedback({ show: true, message: "Erro ao salvar metadados da seção.", type: "error" });
        } finally {
            if (kind === "introducao") {
                setIsSavingIntroducaoMeta(false);
            } else {
                setIsSavingEncerramentoMeta(false);
            }
        }
    }, []);

    const persistSectionOrder = useCallback(async (orderedIds: number[]) => {
        const res = await fetch("/api/admin/mini-livro-sections/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderedIds }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error ?? `HTTP ${res.status}`);
        }
    }, []);

    const handleDeleteSection = useCallback(async (section: MiniLivroSection) => {
        setDeletingId(section.id);

        try {
            const res = await fetch(`/api/admin/mini-livro-sections/${section.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            if (section.kind === "encerramento") {
                const remainingIds = encerramentos.filter(item => item.id !== section.id).map(item => item.id);
                await persistSectionOrder(remainingIds);
            }

            if (section.kind === "introducao") {
                const remainingIds = introducoes.filter(item => item.id !== section.id).map(item => item.id);
                await persistSectionOrder(remainingIds);
            }

            if (editingEncerramento?.id === section.id) {
                setEditingEncerramento(null);
            }

            if (editingIntroducao?.id === section.id) {
                setEditingIntroducao(null);
            }

            await loadSections();
            await invalidatePublicData();
            setFeedback({ show: true, message: "Seção removida com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao excluir seção extra:", error);
            setFeedback({ show: true, message: "Erro ao excluir seção. Tente novamente.", type: "error" });
        } finally {
            setDeletingId(null);
        }
    }, [editingEncerramento?.id, editingIntroducao?.id, encerramentos, introducoes, invalidatePublicData, loadSections, persistSectionOrder]);

    const handleSaveIntroducao = async () => {
        if (!introducaoForm.title.trim()) {
            setFeedback({ show: true, message: "Informe o título do bloco de introdução.", type: "warning" });
            return;
        }

        if (!editingIntroducao && !introducaoForm.htmlFile) {
            setFeedback({ show: true, message: "Envie o arquivo HTML da introdução.", type: "warning" });
            return;
        }

        if (editingIntroducao && !editingIntroducao.htmlAvailable && !introducaoForm.htmlFile) {
            setFeedback({ show: true, message: "Envie o arquivo HTML da introdução.", type: "warning" });
            return;
        }

        setIsSavingIntroducao(true);

        try {
            const title = introducaoForm.title.trim();
            const description = introducaoForm.description.trim();

            const form = new FormData();
            form.append("title", title);
            form.append("description", description);

            if (editingIntroducao) {
                if (introducaoForm.htmlFile) {
                    form.append("file", introducaoForm.htmlFile);
                }
                const res = await fetch(`/api/admin/mini-livro-sections/${editingIntroducao.id}`, {
                    method: "PATCH",
                    body: form,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error ?? `HTTP ${res.status}`);
                }
            } else {
                form.append("kind", "introducao");
                form.append("index", String(introducoes.length + 1));
                form.append("file", introducaoForm.htmlFile!);
                const res = await fetch("/api/admin/mini-livro-sections", {
                    method: "POST",
                    body: form,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error ?? `HTTP ${res.status}`);
                }
            }

            setEditingIntroducao(null);
            await loadSections();
            await invalidatePublicData();
            setFeedback({ show: true, message: "Bloco de introdução salvo com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao salvar bloco de introdução:", error);
            setFeedback({ show: true, message: "Erro ao salvar bloco de introdução. Tente novamente.", type: "error" });
        } finally {
            setIsSavingIntroducao(false);
        }
    };

    const handleSaveEncerramento = async () => {
        if (!encerramentoForm.title.trim()) {
            setFeedback({ show: true, message: "Informe o título do bloco de encerramento.", type: "warning" });
            return;
        }

        if (!editingEncerramento && !encerramentoForm.htmlFile) {
            setFeedback({ show: true, message: "Envie o arquivo HTML do encerramento.", type: "warning" });
            return;
        }

        if (editingEncerramento && !editingEncerramento.htmlAvailable && !encerramentoForm.htmlFile) {
            setFeedback({ show: true, message: "Envie o arquivo HTML do encerramento.", type: "warning" });
            return;
        }

        setIsSavingEncerramento(true);

        try {
            const title = encerramentoForm.title.trim();
            const description = encerramentoForm.description.trim();

            const form = new FormData();
            form.append("title", title);
            form.append("description", description);

            if (editingEncerramento) {
                if (encerramentoForm.htmlFile) {
                    form.append("file", encerramentoForm.htmlFile);
                }
                const res = await fetch(`/api/admin/mini-livro-sections/${editingEncerramento.id}`, {
                    method: "PATCH",
                    body: form,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error ?? `HTTP ${res.status}`);
                }
            } else {
                form.append("kind", "encerramento");
                form.append("index", String(encerramentos.length + 1));
                form.append("file", encerramentoForm.htmlFile!);
                const res = await fetch("/api/admin/mini-livro-sections", {
                    method: "POST",
                    body: form,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error ?? `HTTP ${res.status}`);
                }
            }

            setEditingEncerramento(null);
            await loadSections();
            await invalidatePublicData();
            setFeedback({ show: true, message: "Bloco de encerramento salvo com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao salvar bloco de encerramento:", error);
            setFeedback({ show: true, message: "Erro ao salvar bloco de encerramento. Tente novamente.", type: "error" });
        } finally {
            setIsSavingEncerramento(false);
        }
    };

    const handleEncerramentoDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = encerramentos.findIndex(item => item.id === active.id);
        const newIndex = encerramentos.findIndex(item => item.id === over.id);
        const reordered = arrayMove(encerramentos, oldIndex, newIndex);

        setEncerramentos(reordered);
        setIsReordering(true);

        try {
            await persistSectionOrder(reordered.map(item => item.id));
            await invalidatePublicData();
            setFeedback({ show: true, message: "Ordem do encerramento atualizada com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao reordenar encerramento:", error);
            setFeedback({ show: true, message: "Erro ao salvar a nova ordem do encerramento.", type: "error" });
            await loadSections();
        } finally {
            setIsReordering(false);
        }
    };

    const handleIntroducaoDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = introducoes.findIndex(item => item.id === active.id);
        const newIndex = introducoes.findIndex(item => item.id === over.id);
        const reordered = arrayMove(introducoes, oldIndex, newIndex);

        setIntroducoes(reordered);
        setIsReordering(true);

        try {
            await persistSectionOrder(reordered.map(item => item.id));
            await invalidatePublicData();
            setFeedback({ show: true, message: "Ordem da introdução atualizada com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao reordenar introdução:", error);
            setFeedback({ show: true, message: "Erro ao salvar a nova ordem da introdução.", type: "error" });
            await loadSections();
        } finally {
            setIsReordering(false);
        }
    };

    const editingIntroducaoExistingFile = useMemo(() => getExistingFileName(editingIntroducao), [editingIntroducao]);
    const editingEncerramentoExistingFile = useMemo(() => getExistingFileName(editingEncerramento), [editingEncerramento]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-2xl tracking-tight text-ink">Seções dos Mini-livros</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
                        Gerencie os blocos de introdução e os blocos de encerramento exibidos na página pública de mini-livros e no fluxo de leitura da rota <code>/view</code>.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("introducao")}
                        className={`rounded-lg px-5 py-3 text-base font-medium transition ${activeTab === "introducao" ? "bg-purple-500 text-white shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                        Introdução
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("encerramento")}
                        className={`rounded-lg px-5 py-3 text-base font-medium transition ${activeTab === "encerramento" ? "bg-purple-500 text-white shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                        Encerramento
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Carregando seções extras...
                    </div>
                </div>
            ) : activeTab === "introducao" ? (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">Título e descrição da seção</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Estes campos aparecem como cabeçalho da seção de introdução na página pública.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={LABEL_CLASS}>Título da seção</label>
                                    <input
                                        type="text"
                                        value={introducaoMeta.title}
                                        onChange={event => setIntroducaoMeta(current => ({ ...current, title: event.target.value }))}
                                        className={INPUT_CLASS}
                                        placeholder="Introdução"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => handleSaveMeta("introducao", introducaoMeta.title, introducaoMeta.description)}
                                        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingIntroducaoMeta ? "Salvando…" : "Salvar Metadados"}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>Descrição da seção</label>
                                <textarea
                                    value={introducaoMeta.description}
                                    onChange={event => setIntroducaoMeta(current => ({ ...current, description: event.target.value }))}
                                    className={TEXTAREA_CLASS}
                                    placeholder="Antes de mergulhar nos capítulos, confira estes conteúdos introdutórios."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">Blocos de introdução</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Esses blocos aparecem antes das abas das 3 partes e entram no fluxo de leitura entre o livro principal e a Parte I.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingIntroducao(null);
                                        setIntroducaoForm(EMPTY_FORM);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Novo Bloco
                                </button>
                            </div>

                            {isReordering && (
                                <div className="rounded-xl border border-border bg-accent px-4 py-3 text-sm text-foreground">
                                    Salvando nova ordem da introdução...
                                </div>
                            )}

                            {introducoes.length === 0 ? (
                                <div className="rounded-2xl border border-border bg-card/30 px-6 py-10 text-center text-muted-foreground">
                                    Nenhum bloco de introdução cadastrado ainda.
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIntroducaoDragEnd}>
                                    <SortableContext items={introducoes.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {introducoes.map((item, index) => (
                                                <SortableSectionRow
                                                    key={item.id}
                                                    item={item}
                                                    position={index + 1}
                                                    label="Introdução"
                                                    isDraggingDisabled={isReordering}
                                                    isDeleting={deletingId === item.id}
                                                    isEditing={editingIntroducao?.id === item.id}
                                                    onEdit={setEditingIntroducao}
                                                    onDelete={setPendingDelete}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">
                                    {editingIntroducao ? `Editar: ${editingIntroducao.title}` : "Novo bloco de introdução"}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Cada bloco aceita um título, uma descrição e um arquivo <code>.html</code>. A ordem final é definida pela lista acima.
                                </p>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                                <div className="space-y-5">
                                    <div>
                                        <label className={LABEL_CLASS}>Título</label>
                                        <input
                                            type="text"
                                            value={introducaoForm.title}
                                            onChange={event => setIntroducaoForm(current => ({ ...current, title: event.target.value }))}
                                            className={INPUT_CLASS}
                                            placeholder="Ex.: Antes de começar"
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLASS}>Descrição</label>
                                        <textarea
                                            value={introducaoForm.description}
                                            onChange={event => setIntroducaoForm(current => ({ ...current, description: event.target.value }))}
                                            className={TEXTAREA_CLASS}
                                            placeholder="Texto exibido no bloco público da introdução."
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLASS}>Arquivo HTML</label>
                                        <div className="relative">
                                            <input
                                                id="introducao-html-upload"
                                                type="file"
                                                accept=".html"
                                                className="hidden"
                                                onChange={event => setIntroducaoForm(current => ({ ...current, htmlFile: event.target.files?.[0] ?? null }))}
                                            />
                                            <label
                                                htmlFor="introducao-html-upload"
                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-3 text-muted-foreground transition-colors hover:border-foreground/30/50"
                                            >
                                                <Upload className="h-5 w-5 shrink-0" />
                                                <span className="truncate">
                                                    {introducaoForm.htmlFile ? introducaoForm.htmlFile.name : editingIntroducaoExistingFile ? "Escolher novo HTML (substitui o atual)" : "Selecionar arquivo HTML"}
                                                </span>
                                            </label>
                                            {introducaoForm.htmlFile && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIntroducaoForm(current => ({ ...current, htmlFile: null }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-red-400"
                                                    aria-label="Remover HTML selecionado"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-5">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <FileText className="h-5 w-5 text-foreground" />
                                        <h4 className="text-lg font-semibold">Status atual</h4>
                                    </div>

                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>
                                            HTML atual: {editingIntroducaoExistingFile ? <span className="text-green-500">{editingIntroducaoExistingFile}</span> : "nenhum enviado"}
                                        </p>
                                        <p>
                                            URL de leitura: <code>{editingIntroducao ? `/view/mini-livro-section/${editingIntroducao.id}` : "/view/mini-livro-section/{id}"}</code>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveIntroducao}
                                            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSavingIntroducao ? "Salvando…" : (editingIntroducao ? "Salvar Alterações" : "Criar Bloco")}
                                        </button>

                                        {editingIntroducao && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingIntroducao(null)}
                                                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-accent px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent/70"
                                            >
                                                Cancelar edição
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">Título e descrição da seção</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Estes campos aparecem como cabeçalho da seção de encerramento na página pública.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={LABEL_CLASS}>Título da seção</label>
                                    <input
                                        type="text"
                                        value={encerramentoMeta.title}
                                        onChange={event => setEncerramentoMeta(current => ({ ...current, title: event.target.value }))}
                                        className={INPUT_CLASS}
                                        placeholder="Encerramento"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => handleSaveMeta("encerramento", encerramentoMeta.title, encerramentoMeta.description)}
                                        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingEncerramentoMeta ? "Salvando…" : "Salvar Metadados"}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>Descrição da seção</label>
                                <textarea
                                    value={encerramentoMeta.description}
                                    onChange={event => setEncerramentoMeta(current => ({ ...current, description: event.target.value }))}
                                    className={TEXTAREA_CLASS}
                                    placeholder="Depois do último capítulo, seguem os blocos finais desta jornada."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">Blocos de encerramento</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Esses blocos aparecem somente após o último capítulo da Parte III e podem ser reordenados livremente.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingEncerramento(null);
                                        setEncerramentoForm(EMPTY_FORM);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Novo Bloco
                                </button>
                            </div>

                            {isReordering && (
                                <div className="rounded-xl border border-border bg-accent px-4 py-3 text-sm text-foreground">
                                    Salvando nova ordem do encerramento...
                                </div>
                            )}

                            {encerramentos.length === 0 ? (
                                <div className="rounded-2xl border border-border bg-card/30 px-6 py-10 text-center text-muted-foreground">
                                    Nenhum bloco de encerramento cadastrado ainda.
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEncerramentoDragEnd}>
                                    <SortableContext items={encerramentos.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {encerramentos.map((item, index) => (
                                                <SortableSectionRow
                                                    key={item.id}
                                                    item={item}
                                                    position={index + 1}
                                                    label="Encerramento"
                                                    isDraggingDisabled={isReordering}
                                                    isDeleting={deletingId === item.id}
                                                    isEditing={editingEncerramento?.id === item.id}
                                                    onEdit={setEditingEncerramento}
                                                    onDelete={setPendingDelete}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">
                                    {editingEncerramento ? `Editar: ${editingEncerramento.title}` : "Novo bloco de encerramento"}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Cada bloco aceita um título, uma descrição e um arquivo <code>.html</code>. A ordem final é definida pela lista acima.
                                </p>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                                <div className="space-y-5">
                                    <div>
                                        <label className={LABEL_CLASS}>Título</label>
                                        <input
                                            type="text"
                                            value={encerramentoForm.title}
                                            onChange={event => setEncerramentoForm(current => ({ ...current, title: event.target.value }))}
                                            className={INPUT_CLASS}
                                            placeholder="Ex.: O que fica depois"
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLASS}>Descrição</label>
                                        <textarea
                                            value={encerramentoForm.description}
                                            onChange={event => setEncerramentoForm(current => ({ ...current, description: event.target.value }))}
                                            className={TEXTAREA_CLASS}
                                            placeholder="Texto exibido no bloco público do encerramento."
                                        />
                                    </div>

                                    <div>
                                        <label className={LABEL_CLASS}>Arquivo HTML</label>
                                        <div className="relative">
                                            <input
                                                id="encerramento-html-upload"
                                                type="file"
                                                accept=".html"
                                                className="hidden"
                                                onChange={event => setEncerramentoForm(current => ({ ...current, htmlFile: event.target.files?.[0] ?? null }))}
                                            />
                                            <label
                                                htmlFor="encerramento-html-upload"
                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-3 text-muted-foreground transition-colors hover:border-foreground/30/50"
                                            >
                                                <Upload className="h-5 w-5 shrink-0" />
                                                <span className="truncate">
                                                    {encerramentoForm.htmlFile ? encerramentoForm.htmlFile.name : editingEncerramentoExistingFile ? "Escolher novo HTML (substitui o atual)" : "Selecionar arquivo HTML"}
                                                </span>
                                            </label>
                                            {encerramentoForm.htmlFile && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEncerramentoForm(current => ({ ...current, htmlFile: null }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-red-400"
                                                    aria-label="Remover HTML selecionado"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-5">
                                    <div className="flex items-center gap-2 text-foreground">
                                        <FileText className="h-5 w-5 text-foreground" />
                                        <h4 className="text-lg font-semibold">Status atual</h4>
                                    </div>

                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>
                                            HTML atual: {editingEncerramentoExistingFile ? <span className="text-green-500">{editingEncerramentoExistingFile}</span> : "nenhum enviado"}
                                        </p>
                                        <p>
                                            URL de leitura: <code>{editingEncerramento ? `/view/mini-livro-section/${editingEncerramento.id}` : "/view/mini-livro-section/{id}"}</code>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveEncerramento}
                                            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSavingEncerramento ? "Salvando…" : (editingEncerramento ? "Salvar Alterações" : "Criar Bloco")}
                                        </button>

                                        {editingEncerramento && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingEncerramento(null)}
                                                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-accent px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent/70"
                                            >
                                                Cancelar edição
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(current => ({ ...current, show: false }))}
            />
            <ConfirmDialog
                isOpen={pendingDelete !== null}
                title="Confirmar exclusão"
                message={pendingDelete ? `Você realmente deseja excluir "${pendingDelete.title}"? Esta ação remove o HTML e o bloco da jornada de leitura.` : ""}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={() => {
                    if (pendingDelete) {
                        void handleDeleteSection(pendingDelete);
                    }
                }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    );
}
