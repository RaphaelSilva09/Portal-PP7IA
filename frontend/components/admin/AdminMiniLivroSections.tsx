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
import { GlassCard, GradientButton } from "@/components/ui";
import {
    MINI_LIVRO_SECTION_STORAGE_BUCKET,
    extractStoragePathFromSourcePath,
    getMiniLivroSectionSourcePath,
    getMiniLivroSectionStoragePath,
} from "@/constants/miniLivroSections";
import {
    MiniLivroSection,
    type MiniLivroSectionKind,
    type MiniLivroSectionProps,
} from "@/domain/entities/MiniLivroSection";
import { supabase } from "@/infrastructure/config/supabase";
import {
    AlertCircle,
    BookOpen,
    FileText,
    GripVertical,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { FeedbackMessage } from "./FeedbackMessage";

const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
const INPUT_CLASS = "w-full rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--brand-blue)]";
const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[128px] resize-y`;

interface MiniLivroSectionRow {
    id: number;
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

interface SortableEncerramentoRowProps {
    item: MiniLivroSection;
    position: number;
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
    return kind === "prefacio" ? 0 : 1;
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
        id: row.id,
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
    return (
        typeof candidate.id === "number"
        && typeof candidate.title === "string"
        && (candidate.kind === "prefacio" || candidate.kind === "encerramento")
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

function SortableEncerramentoRow({
    item,
    position,
    isDraggingDisabled,
    isDeleting,
    isEditing,
    onEdit,
    onDelete,
}: SortableEncerramentoRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 }}
            className={`rounded-2xl border p-4 transition-colors ${isEditing ? "border-[var(--brand-purple)] bg-[var(--brand-purple)]/8" : "border-[var(--border-glass)] bg-[var(--bg-secondary)]/40"}`}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                    <button
                        {...attributes}
                        {...listeners}
                        disabled={isDraggingDisabled}
                        className="mt-1 rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-glass)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Reordenar bloco"
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[var(--surface-glass)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                                Bloco #{String(position).padStart(2, "0")}
                            </span>
                            {item.htmlAvailable ? (
                                <span className="inline-flex items-center gap-1 text-xs text-[var(--brand-green)]">
                                    <FileText className="h-4 w-4" />
                                    HTML enviado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                    <AlertCircle className="h-4 w-4" />
                                    Sem HTML
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                        {item.description && (
                            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg p-2 text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)]/15"
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
    const [activeTab, setActiveTab] = useState<MiniLivroSectionKind>("prefacio");
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingPrefacio, setIsSavingPrefacio] = useState(false);
    const [isSavingEncerramento, setIsSavingEncerramento] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [prefacio, setPrefacio] = useState<MiniLivroSection | null>(null);
    const [encerramentos, setEncerramentos] = useState<MiniLivroSection[]>([]);
    const [prefacioForm, setPrefacioForm] = useState<SectionFormState>(EMPTY_FORM);
    const [encerramentoForm, setEncerramentoForm] = useState<SectionFormState>(EMPTY_FORM);
    const [editingEncerramento, setEditingEncerramento] = useState<MiniLivroSection | null>(null);
    const [pendingDelete, setPendingDelete] = useState<MiniLivroSection | null>(null);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const loadSections = useCallback(async () => {
        setIsLoading(true);

        try {
            const { data, error } = await supabase.from("mini_livro_sections").select("*");

            if (error) {
                throw error;
            }

            const allSections = (data ?? [])
                .filter((row): row is MiniLivroSectionRow => isMiniLivroSectionRow(row))
                .map(row => mapRowToSection(row))
                .sort(compareSections);

            setPrefacio(allSections.find(item => item.kind === "prefacio") ?? null);
            setEncerramentos(allSections.filter(item => item.kind === "encerramento"));
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
        setPrefacioForm({
            title: prefacio?.title ?? "",
            description: prefacio?.description ?? "",
            htmlFile: null,
        });
    }, [prefacio]);

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
    }, [queryClient]);

    const persistEncerramentoOrder = useCallback(async (orderedIds: number[]) => {
        await Promise.all(
            orderedIds.map((id, index) => supabase.from("mini_livro_sections").update({ index: index + 1 }).eq("id", id)),
        );
    }, []);

    const handleUpload = useCallback(async (storagePath: string, file: File) => {
        const { error } = await supabase.storage
            .from(MINI_LIVRO_SECTION_STORAGE_BUCKET)
            .upload(storagePath, file, { cacheControl: "3600", upsert: true });

        if (error) {
            throw error;
        }
    }, []);

    const handleDeleteSection = useCallback(async (section: MiniLivroSection) => {
        setDeletingId(section.id);

        try {
            const storagePath = extractStoragePathFromSourcePath(section.sourceHtmlPath);

            if (storagePath) {
                const { error: storageError } = await supabase.storage
                    .from(MINI_LIVRO_SECTION_STORAGE_BUCKET)
                    .remove([storagePath]);

                if (storageError) {
                    throw storageError;
                }
            }

            const { error } = await supabase.from("mini_livro_sections").delete().eq("id", section.id);

            if (error) {
                throw error;
            }

            if (section.kind === "encerramento") {
                const remainingIds = encerramentos.filter(item => item.id !== section.id).map(item => item.id);
                await persistEncerramentoOrder(remainingIds);
            }

            if (editingEncerramento?.id === section.id) {
                setEditingEncerramento(null);
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
    }, [editingEncerramento?.id, encerramentos, invalidatePublicData, loadSections, persistEncerramentoOrder]);

    const handleSavePrefacio = async () => {
        if (!prefacioForm.title.trim()) {
            setFeedback({ show: true, message: "Informe o título do prefácio.", type: "warning" });
            return;
        }

        if (!prefacio && !prefacioForm.htmlFile) {
            setFeedback({ show: true, message: "Envie o arquivo HTML do prefácio.", type: "warning" });
            return;
        }

        if (prefacio && !prefacio.htmlAvailable && !prefacioForm.htmlFile) {
            setFeedback({ show: true, message: "Envie o arquivo HTML do prefácio.", type: "warning" });
            return;
        }

        setIsSavingPrefacio(true);

        try {
            const title = prefacioForm.title.trim();
            const description = prefacioForm.description.trim() || null;

            if (prefacio) {
                const updatePayload: Record<string, unknown> = { title, description };

                if (prefacioForm.htmlFile) {
                    await handleUpload(getMiniLivroSectionStoragePath("prefacio"), prefacioForm.htmlFile);
                    updatePayload.html_path = getMiniLivroSectionSourcePath("prefacio");
                }

                const { error } = await supabase.from("mini_livro_sections").update(updatePayload).eq("id", prefacio.id);

                if (error) {
                    throw error;
                }
            } else {
                const { data, error } = await supabase
                    .from("mini_livro_sections")
                    .insert({ kind: "prefacio", title, description, index: 1 })
                    .select()
                    .single();

                if (error || !data || !isMiniLivroSectionRow(data)) {
                    throw error || new Error("Falha ao criar registro do prefácio.");
                }

                try {
                    await handleUpload(getMiniLivroSectionStoragePath("prefacio"), prefacioForm.htmlFile!);
                    const { error: updateError } = await supabase
                        .from("mini_livro_sections")
                        .update({ html_path: getMiniLivroSectionSourcePath("prefacio") })
                        .eq("id", data.id);

                    if (updateError) {
                        throw updateError;
                    }
                } catch (uploadError) {
                    await supabase.from("mini_livro_sections").delete().eq("id", data.id);
                    throw uploadError;
                }
            }

            await loadSections();
            await invalidatePublicData();
            setFeedback({ show: true, message: "Prefácio salvo com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao salvar prefácio:", error);
            setFeedback({ show: true, message: "Erro ao salvar prefácio. Tente novamente.", type: "error" });
        } finally {
            setIsSavingPrefacio(false);
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
            const description = encerramentoForm.description.trim() || null;

            if (editingEncerramento) {
                const updatePayload: Record<string, unknown> = { title, description };

                if (encerramentoForm.htmlFile) {
                    await handleUpload(
                        getMiniLivroSectionStoragePath("encerramento", editingEncerramento.id),
                        encerramentoForm.htmlFile,
                    );
                    updatePayload.html_path = getMiniLivroSectionSourcePath("encerramento", editingEncerramento.id);
                }

                const { error } = await supabase.from("mini_livro_sections").update(updatePayload).eq("id", editingEncerramento.id);

                if (error) {
                    throw error;
                }
            } else {
                const nextIndex = encerramentos.length + 1;
                const { data, error } = await supabase
                    .from("mini_livro_sections")
                    .insert({ kind: "encerramento", title, description, index: nextIndex })
                    .select()
                    .single();

                if (error || !data || !isMiniLivroSectionRow(data)) {
                    throw error || new Error("Falha ao criar bloco de encerramento.");
                }

                try {
                    await handleUpload(getMiniLivroSectionStoragePath("encerramento", data.id), encerramentoForm.htmlFile!);
                    const { error: updateError } = await supabase
                        .from("mini_livro_sections")
                        .update({ html_path: getMiniLivroSectionSourcePath("encerramento", data.id) })
                        .eq("id", data.id);

                    if (updateError) {
                        throw updateError;
                    }
                } catch (uploadError) {
                    await supabase.from("mini_livro_sections").delete().eq("id", data.id);
                    throw uploadError;
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

    const handleDragEnd = async (event: DragEndEvent) => {
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
            await persistEncerramentoOrder(reordered.map(item => item.id));
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

    const prefacioExistingFile = useMemo(() => getExistingFileName(prefacio), [prefacio]);
    const editingEncerramentoExistingFile = useMemo(() => getExistingFileName(editingEncerramento), [editingEncerramento]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Seções dos Mini-livros</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] max-w-3xl">
                        Gerencie o prefácio único e os blocos de encerramento exibidos na página pública de mini-livros e no fluxo de leitura da rota <code>/view</code>.
                    </p>
                </div>
            </div>

            <GlassCard variant="bordered" padding="md">
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("prefacio")}
                        className={`rounded-lg px-5 py-3 text-base font-medium transition-all ${activeTab === "prefacio" ? "bg-[var(--brand-purple)] text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] hover:text-[var(--text-primary)]"}`}
                    >
                        Prefácio
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("encerramento")}
                        className={`rounded-lg px-5 py-3 text-base font-medium transition-all ${activeTab === "encerramento" ? "bg-[var(--brand-purple)] text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] hover:text-[var(--text-primary)]"}`}
                    >
                        Encerramento
                    </button>
                </div>
            </GlassCard>

            {isLoading ? (
                <GlassCard variant="bordered" padding="lg">
                    <div className="flex items-center justify-center py-16 text-[var(--text-secondary)]">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Carregando seções extras...
                    </div>
                </GlassCard>
            ) : activeTab === "prefacio" ? (
                <GlassCard variant="elevated" padding="lg">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Prefácio global</h3>
                            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                Este bloco aparece antes das abas das 3 partes e entra no fluxo de leitura entre o livro principal e a Parte I.
                            </p>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="space-y-5">
                                <div>
                                    <label className={LABEL_CLASS}>Título</label>
                                    <input
                                        type="text"
                                        value={prefacioForm.title}
                                        onChange={event => setPrefacioForm(current => ({ ...current, title: event.target.value }))}
                                        className={INPUT_CLASS}
                                        placeholder="Ex.: Antes de começar"
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Descrição</label>
                                    <textarea
                                        value={prefacioForm.description}
                                        onChange={event => setPrefacioForm(current => ({ ...current, description: event.target.value }))}
                                        className={TEXTAREA_CLASS}
                                        placeholder="Texto curto exibido no bloco público do prefácio."
                                    />
                                </div>

                                <div>
                                    <label className={LABEL_CLASS}>Arquivo HTML</label>
                                    <div className="relative">
                                        <input
                                            id="prefacio-html-upload"
                                            type="file"
                                            accept=".html"
                                            className="hidden"
                                            onChange={event => setPrefacioForm(current => ({ ...current, htmlFile: event.target.files?.[0] ?? null }))}
                                        />
                                        <label
                                            htmlFor="prefacio-html-upload"
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-glass)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-blue)]/50"
                                        >
                                            <Upload className="h-5 w-5 shrink-0" />
                                            <span className="truncate">
                                                {prefacioForm.htmlFile ? prefacioForm.htmlFile.name : prefacioExistingFile ? "Escolher novo HTML (substitui o atual)" : "Selecionar arquivo HTML"}
                                            </span>
                                        </label>
                                        {prefacioForm.htmlFile && (
                                            <button
                                                type="button"
                                                onClick={() => setPrefacioForm(current => ({ ...current, htmlFile: null }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition-colors hover:text-red-400"
                                                aria-label="Remover HTML selecionado"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-secondary)]/40 p-5">
                                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                                    <BookOpen className="h-5 w-5 text-[var(--brand-blue)]" />
                                    <h4 className="text-lg font-semibold">Status atual</h4>
                                </div>

                                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                                    <p>Leitura pública: <code>/view/mini-livro-section/{prefacio?.id ?? "{id}"}</code></p>
                                    <p>Arquivo no storage: <code>{getMiniLivroSectionStoragePath("prefacio")}</code></p>
                                    <p>
                                        HTML atual: {prefacioExistingFile ? <span className="text-[var(--brand-green)]">{prefacioExistingFile}</span> : "nenhum enviado"}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <GradientButton
                                        variant="cta"
                                        icon={Upload}
                                        onClick={handleSavePrefacio}
                                        loading={isSavingPrefacio}
                                        loadingText="Salvando..."
                                    >
                                        Salvar Prefácio
                                    </GradientButton>

                                    {prefacio && (
                                        <button
                                            type="button"
                                            onClick={() => setPendingDelete(prefacio)}
                                            disabled={deletingId === prefacio.id}
                                            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deletingId === prefacio.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            Excluir Prefácio
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            ) : (
                <div className="space-y-6">
                    <GlassCard variant="elevated" padding="lg">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">Blocos de encerramento</h3>
                                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                        Esses blocos aparecem somente após o último capítulo da Parte III e podem ser reordenados livremente.
                                    </p>
                                </div>

                                <GradientButton
                                    variant="cta"
                                    icon={Plus}
                                    onClick={() => {
                                        setEditingEncerramento(null);
                                        setEncerramentoForm(EMPTY_FORM);
                                    }}
                                >
                                    Novo Bloco
                                </GradientButton>
                            </div>

                            {isReordering && (
                                <div className="rounded-xl border border-[var(--brand-blue)]/20 bg-[var(--brand-blue)]/8 px-4 py-3 text-sm text-[var(--brand-blue)]">
                                    Salvando nova ordem do encerramento...
                                </div>
                            )}

                            {encerramentos.length === 0 ? (
                                <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-secondary)]/30 px-6 py-10 text-center text-[var(--text-secondary)]">
                                    Nenhum bloco de encerramento cadastrado ainda.
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={encerramentos.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {encerramentos.map((item, index) => (
                                                <SortableEncerramentoRow
                                                    key={item.id}
                                                    item={item}
                                                    position={index + 1}
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
                    </GlassCard>

                    <GlassCard variant="elevated" padding="lg">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                                    {editingEncerramento ? `Editar: ${editingEncerramento.title}` : "Novo bloco de encerramento"}
                                </h3>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
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
                                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-glass)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-blue)]/50"
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
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition-colors hover:text-red-400"
                                                    aria-label="Remover HTML selecionado"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 rounded-2xl border border-[var(--border-glass)] bg-[var(--bg-secondary)]/40 p-5">
                                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                                        <FileText className="h-5 w-5 text-[var(--brand-blue)]" />
                                        <h4 className="text-lg font-semibold">Status atual</h4>
                                    </div>

                                    <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                                        <p>
                                            HTML atual: {editingEncerramentoExistingFile ? <span className="text-[var(--brand-green)]">{editingEncerramentoExistingFile}</span> : "nenhum enviado"}
                                        </p>
                                        <p>
                                            URL de leitura: <code>{editingEncerramento ? `/view/mini-livro-section/${editingEncerramento.id}` : "/view/mini-livro-section/{id}"}</code>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <GradientButton
                                            variant="cta"
                                            icon={Upload}
                                            onClick={handleSaveEncerramento}
                                            loading={isSavingEncerramento}
                                            loadingText="Salvando..."
                                        >
                                            {editingEncerramento ? "Salvar Alterações" : "Criar Bloco"}
                                        </GradientButton>

                                        {editingEncerramento && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingEncerramento(null)}
                                                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[var(--border-glass)] bg-[var(--surface-glass)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-glass)]/70"
                                            >
                                                Cancelar edição
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
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
