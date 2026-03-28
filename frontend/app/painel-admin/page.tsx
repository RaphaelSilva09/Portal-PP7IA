"use client";

/**
 * Painel de Administração (Presentation Layer)
 *
 * Página principal para gerenciamento de conteúdo, estatísticas e usuários.
 * Interface otimizada para usuários 80+ anos (botões grandes, feedback claro).
 *
 * Segurança: Protegida pelo middleware que verifica admin.
 *
 * Princípios aplicados:
 * - SRP: Orquestra componentes e estado da página
 * - Composition: Usa componentes especializados (Dashboard, UserManager, ContentTable)
 * - Accessibility: 18px+ texto, 48px+ botões, confirmações em duas etapas
 * - DI: Obtém use cases via DIContainer
 */

import type { EbookFormData } from "@/components/admin";
import {
    AdminBook,
    AdminEditorial,
    AdminPortalNews,
    AnnouncementBarTab,
    ConfirmDialog,
    ContentForm,
    ContentTable,
    Dashboard,
    EbookForm,
    FeedbackMessage,
    SortableContentTable,
    UserManager,
} from "@/components/admin";
import { GlassCard, GradientButton } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import DIContainer from "@/infrastructure/di/container";
import {
    ArrowLeft,
    Bell,
    BookMarked,
    BookOpen,
    BookText,
    FileText,
    GraduationCap,
    Home,
    Library,
    Newspaper,
    NotebookPen,
    Plus,
    Radar,
    Star,
    Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useEbook } from "@/presentation/hooks/useEbook";

// Seções principais do painel (navegação de alto nível)
type MainSection = "inicio" | "conteudo" | "usuarios" | "novidades" | "editorial" | "barra-aviso";

type ContentTab = ContentType | "livro";

// Tabs de conteúdo (sub-navegação)
const SORTABLE_TYPES = new Set<ContentTab>(["newsletter", "mini-livro", "biblioteca", "especial-semana", "radar_oportunidades", "estudar"]);

/** Mapeamento do ContentType para a query key usada pelo hook público correspondente */
const CONTENT_QUERY_KEY: Partial<Record<ContentType, string>> = {
    newsletter: "newsletters",
    "mini-livro": "mini-livros",
    biblioteca: "biblioteca",
    "especial-semana": "especial-semana",
    radar_oportunidades: "radar-oportunidades",
    estudar: "estudar",
};

const CONTENT_TABS: { type: ContentTab; label: string; icon: typeof Newspaper }[] = [
    { type: "newsletter", label: "Newsletters", icon: Newspaper },
    { type: "mini-livro", label: "Mini-livros - Ebook - Livros", icon: BookOpen },
    { type: "biblioteca", label: "Biblioteca", icon: Library },
    { type: "especial-semana", label: "Especial da Semana", icon: Star },
    { type: "ebook", label: "E-books", icon: BookMarked },
    { type: "livro", label: "Livro", icon: BookText },
    { type: "radar_oportunidades", label: "Radar de Oportunidades", icon: Radar },
    { type: "estudar", label: "Estudar", icon: GraduationCap },
];

interface FeedbackState {
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
}

interface ConfirmState {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

export default function PainelAdminPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();

    // Navegação principal
    const [mainSection, setMainSection] = useState<MainSection>("inicio");

    // Estado da seção Conteúdo
    const [contentTab, setContentTab] = useState<ContentTab>("newsletter");
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<ContentItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEbookIndex, setSelectedEbookIndex] = useState(0);

    const { all: allEbooks } = useEbook();

    // Feedback e confirmação (compartilhado por todas seções)
    const [feedback, setFeedback] = useState<FeedbackState>({
        show: false,
        message: "",
        type: "success",
    });
    const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
        show: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    // Redireciona para home se não logado (logout detectado)
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [authLoading, user, router]);

    // Carregar itens de conteúdo quando tab muda
    const loadItems = useCallback(async () => {
        if (mainSection !== "conteudo") return;
        if (contentTab === "livro") return; // singleton gerenciado pelo AdminBook

        setIsLoading(true);
        try {
            const repo = DIContainer.getContentRepository();
            const [data, lu] = await Promise.all([repo.getAll(contentTab as ContentType), repo.getLastUpdated(contentTab as ContentType)]);
            setItems(data);
            setLastUpdated(lu);
        } catch (error) {
            console.error("Erro ao carregar itens:", error);
            setFeedback({
                show: true,
                message: "Erro ao carregar itens. Tente novamente.",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }, [contentTab, mainSection]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // Handlers de navegação
    const handleMainSectionChange = (section: MainSection) => {
        setMainSection(section);
        setShowForm(false);
        setEditItem(null);
    };

    const handleContentTabChange = (type: ContentTab) => {
        setContentTab(type);
        setShowForm(false);
        setEditItem(null);
        setSelectedEbookIndex(0);
    };

    // Handlers de conteúdo
    const handleCreate = () => {
        setEditItem(null);
        setShowForm(true);
    };

    const handleEdit = (item: ContentItem) => {
        setEditItem(item);
        setShowForm(true);
    };

    const handleDelete = (item: ContentItem) => {
        setConfirmDialog({
            show: true,
            title: "Confirmar Exclusão",
            message: `Você tem certeza que deseja deletar "${item.title}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, show: false });
                try {
                    const useCase = DIContainer.getDeleteContentWithFilesUseCase();
                    await useCase.execute(contentTab as ContentType, item.id);
                    await loadItems();
                    setFeedback({
                        show: true,
                        message: "Material deletado com sucesso!",
                        type: "success",
                    });
                } catch (error) {
                    console.error("Erro ao deletar:", error);
                    setFeedback({
                        show: true,
                        message: "Erro ao deletar material. Tente novamente.",
                        type: "error",
                    });
                }
            },
        });
    };

    const handleSubmit = async (data: { title: string; readTime?: number; htmlFile?: File; pdfFile?: File; tema?: string; relativeEbook?: number | null }) => {
        setIsSubmitting(true);
        try {
            if (editItem) {
                // Atualizar via use case (com suporte a upload de arquivos)
                const useCase = DIContainer.getUpdateContentWithFilesUseCase();
                await useCase.execute({
                    type: contentTab as ContentType,
                    id: editItem.id,
                    title: data.title,
                    readTime: data.readTime,
                    htmlFile: data.htmlFile,
                    pdfFile: data.pdfFile,
                    tema: data.tema,
                });
                setFeedback({
                    show: true,
                    message: "Material atualizado com sucesso!",
                    type: "success",
                });
            } else {
                // Criar com upload
                const useCase = DIContainer.getCreateContentWithUploadUseCase();
                await useCase.execute({
                    type: contentTab as ContentType,
                    title: data.title,
                    readTime: data.readTime,
                    htmlFile: data.htmlFile,
                    pdfFile: data.pdfFile,
                    tema: data.tema,
                    relativeEbook: data.relativeEbook,
                });
                setFeedback({
                    show: true,
                    message: "Material criado com sucesso!",
                    type: "success",
                });
            }
            setShowForm(false);
            setEditItem(null);
            await loadItems();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setFeedback({
                show: true,
                message: "Erro ao salvar material. Tente novamente.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReorder = async (reorderedItems: ContentItem[]) => {
        try {
            const repo = DIContainer.getContentRepository();
            await repo.reorderItems(contentTab as ContentType, reorderedItems.map(i => i.id));
            setItems(reorderedItems);
            // Invalida o cache do React Query para que a página pública reflita a nova ordem imediatamente
            const queryKey = CONTENT_QUERY_KEY[contentTab as ContentType];
            if (queryKey) {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
            }
            setFeedback({ show: true, message: "Ordem atualizada com sucesso!", type: "success" });
        } catch (error) {
            console.error("Erro ao reordenar:", error);
            setFeedback({ show: true, message: "Erro ao salvar nova ordem. Tente novamente.", type: "error" });
        }
    };

    const handleEbookSubmit = async (data: EbookFormData) => {
        setIsSubmitting(true);
        try {
            if (editItem) {
                // Editar ebook via use case
                const useCase = DIContainer.getUpdateContentWithFilesUseCase();
                await useCase.execute({
                    type: "ebook",
                    id: editItem.id,
                    title: data.title,
                    readTime: data.readTime,
                    subtitle: data.subtitle,
                    description: data.description,
                    badgeText: data.badgeText,
                    htmlFile: data.introHtmlFile,
                    pdfFile: data.introPdfFile,
                    coverImageFile: data.coverImageFile,
                    coverPdfFile: data.coverPdfFile,
                });
                setFeedback({
                    show: true,
                    message: "E-book atualizado com sucesso!",
                    type: "success",
                });
            } else {
                // Criar ebook com upload
                const useCase = DIContainer.getCreateContentWithUploadUseCase();
                await useCase.execute({
                    type: "ebook",
                    title: data.title,
                    readTime: data.readTime,
                    subtitle: data.subtitle,
                    description: data.description,
                    badgeText: data.badgeText,
                    htmlFile: data.introHtmlFile,
                    pdfFile: data.introPdfFile,
                    coverImageFile: data.coverImageFile,
                    coverPdfFile: data.coverPdfFile,
                });
                setFeedback({
                    show: true,
                    message: "E-book criado com sucesso!",
                    type: "success",
                });
            }
            setShowForm(false);
            setEditItem(null);
            await loadItems();
        } catch (error) {
            console.error("Erro ao salvar e-book:", error);
            setFeedback({
                show: true,
                message: "Erro ao salvar e-book. Tente novamente.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <button
                        onClick={() => router.push("/user")}
                        className="cursor-pointer inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-lg">Voltar para Perfil</span>
                    </button>
                    <h1 className="text-4xl font-bold text-[var(--text-primary)]">Painel de Administração</h1>
                </div>

                {/* Menu Principal - Botões Grandes (80+ acessibilidade) */}
                <GlassCard variant="bordered" padding="lg">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleMainSectionChange("inicio")}
                            className={`flex items-center gap-3 px-8 py-5 rounded-xl text-lg font-medium transition-all min-h-[56px] ${
                                mainSection === "inicio"
                                    ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] border-2 border-[var(--border-subtle)]"
                            }`}
                        >
                            <Home className="w-6 h-6" />
                            Início
                        </button>
                        <button
                            onClick={() => handleMainSectionChange("conteudo")}
                            className={`flex items-center gap-3 px-8 py-5 rounded-xl text-lg font-medium transition-all min-h-[56px] ${
                                mainSection === "conteudo"
                                    ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] border-2 border-[var(--border-subtle)]"
                            }`}
                        >
                            <FileText className="w-6 h-6" />
                            Conteúdo
                        </button>
                        <button
                            onClick={() => handleMainSectionChange("usuarios")}
                            className={`flex items-center gap-3 px-8 py-5 rounded-xl text-lg font-medium transition-all min-h-[56px] ${
                                mainSection === "usuarios"
                                    ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] border-2 border-[var(--border-subtle)]"
                            }`}
                        >
                            <Users className="w-6 h-6" />
                            Usuários
                        </button>
                        <button
                            onClick={() => handleMainSectionChange("novidades")}
                            className={`flex items-center gap-3 px-8 py-5 rounded-xl text-lg font-medium transition-all min-h-[56px] ${
                                mainSection === "novidades"
                                    ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] border-2 border-[var(--border-subtle)]"
                            }`}
                        >
                            <Bell className="w-6 h-6" />
                            Novidades
                        </button>
                        <button
                            onClick={() => handleMainSectionChange("editorial")}
                            className={`flex items-center gap-3 px-8 py-5 rounded-xl text-lg font-medium transition-all min-h-[56px] ${
                                mainSection === "editorial"
                                    ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] border-2 border-[var(--border-subtle)]"
                            }`}
                        >
                            <NotebookPen className="w-6 h-6" />
                            Editorial
                        </button>
                        <button
                            onClick={() => handleMainSectionChange("barra-aviso")}
                            className={`flex items-center gap-3 px-8 py-5 rounded-xl text-lg font-medium transition-all min-h-[56px] ${
                                mainSection === "barra-aviso"
                                    ? "bg-[var(--brand-blue)] text-white shadow-lg scale-105"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)] border-2 border-[var(--border-subtle)]"
                            }`}
                        >
                            <Bell className="w-6 h-6" />
                            Barra de Aviso
                        </button>
                    </div>
                </GlassCard>

                {/* Conteúdo por Seção */}
                {mainSection === "inicio" && <Dashboard />}

                {mainSection === "conteudo" && (
                    <div className="space-y-6">
                        {/* Sub-navegação de Conteúdo */}
                        <GlassCard variant="bordered" padding="md">
                            <div className="flex flex-wrap gap-3 justify-center">
                                {CONTENT_TABS.map(({ type, label, icon: Icon }) => (
                                    <button
                                        key={type}
                                        onClick={() => handleContentTabChange(type)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-all min-h-[48px] ${
                                            contentTab === type
                                                ? "bg-[var(--brand-purple)] text-white shadow-md"
                                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Aba Livro — singleton, gerenciado pelo AdminBook */}
                        {contentTab === "livro" ? (
                            <AdminBook />
                        ) : showForm ? (
                            contentTab === "ebook" ? (
                                <EbookForm
                                    editItem={editItem}
                                    onSubmit={handleEbookSubmit}
                                    onCancel={() => {
                                        setShowForm(false);
                                        setEditItem(null);
                                    }}
                                    isLoading={isSubmitting}
                                />
                            ) : (
                                <ContentForm
                                    type={contentTab as ContentType}
                                    editItem={editItem}
                                    onSubmit={handleSubmit}
                                    onCancel={() => {
                                        setShowForm(false);
                                        setEditItem(null);
                                    }}
                                    isLoading={isSubmitting}
                                    relativeEbook={contentTab === "mini-livro" && !editItem ? (allEbooks[selectedEbookIndex]?.order ?? null) : undefined}
                                />
                            )
                        ) : (
                            <>
                                {/* Botão Criar */}
                                <div className="flex justify-end">
                                    <GradientButton variant="cta" icon={Plus} onClick={handleCreate}>
                                        Novo Material
                                    </GradientButton>
                                </div>

                                {/* Tabela */}
                                {isLoading ? (
                                    <div className="text-center py-12 text-[var(--text-secondary)] text-lg">
                                        Carregando...
                                    </div>
                                ) : items.length === 0 ? (
                                    <GlassCard variant="bordered" padding="lg">
                                        <div className="text-center py-8 text-[var(--text-secondary)] text-lg">
                                            Nenhum material cadastrado.
                                        </div>
                                    </GlassCard>
                                ) : SORTABLE_TYPES.has(contentTab) ? (
                                    <SortableContentTable
                                        items={contentTab === "mini-livro"
                                            ? items.filter(ml => ml.relativeEbook === (allEbooks[selectedEbookIndex]?.order ?? null))
                                            : items}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onReorder={handleReorder}
                                        lastUpdated={lastUpdated}
                                        type={contentTab as ContentType}
                                        selectedEbookIndex={selectedEbookIndex}
                                        onEbookChange={setSelectedEbookIndex}
                                    />
                                ) : (
                                    <ContentTable
                                        items={items}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        lastUpdated={lastUpdated}
                                        type={contentTab as ContentType}
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}

                {mainSection === "usuarios" && <UserManager />}

                {mainSection === "novidades" && <AdminPortalNews />}

                {mainSection === "editorial" && <AdminEditorial />}

                {mainSection === "barra-aviso" && <AnnouncementBarTab />}
            </div>

            {/* Componentes Globais */}
            <ConfirmDialog
                isOpen={confirmDialog.show}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
            />
            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback({ ...feedback, show: false })}
            />
        </div>
    );
}
