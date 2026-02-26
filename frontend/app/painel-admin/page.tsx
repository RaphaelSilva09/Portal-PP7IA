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

import { ConfirmDialog, ContentForm, ContentTable, Dashboard, FeedbackMessage, UserManager } from "@/components/admin";
import { GlassCard, GradientButton } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import DIContainer from "@/infrastructure/di/container";
import {
    ArrowLeft,
    BookMarked,
    BookOpen,
    FileText,
    GraduationCap,
    Home,
    Library,
    Newspaper,
    Plus,
    Radar,
    Star,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Seções principais do painel (navegação de alto nível)
type MainSection = "inicio" | "conteudo" | "usuarios";

// Tabs de conteúdo (sub-navegação)
const CONTENT_TABS: { type: ContentType; label: string; icon: typeof Newspaper }[] = [
    { type: "newsletter", label: "Newsletters", icon: Newspaper },
    { type: "mini-livro", label: "Mini-Livros", icon: BookOpen },
    { type: "biblioteca", label: "Biblioteca", icon: Library },
    { type: "especial-semana", label: "Especial da Semana", icon: Star },
    { type: "ebook", label: "E-books", icon: BookMarked },
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

    // Navegação principal
    const [mainSection, setMainSection] = useState<MainSection>("inicio");

    // Estado da seção Conteúdo
    const [contentTab, setContentTab] = useState<ContentType>("newsletter");
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<ContentItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsLoading(true);
        try {
            const repo = DIContainer.getContentRepository();
            const data = await repo.getAll(contentTab);
            setItems(data);
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

    const handleContentTabChange = (type: ContentType) => {
        setContentTab(type);
        setShowForm(false);
        setEditItem(null);
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
                    await useCase.execute(contentTab, item.id);
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

    const handleSubmit = async (data: { title: string; readTime?: number; htmlFile?: File; pdfFile?: File }) => {
        setIsSubmitting(true);
        try {
            if (editItem) {
                // Atualizar
                const repo = DIContainer.getContentRepository();
                await repo.update(contentTab, editItem.id, {
                    title: data.title,
                    readTime: data.readTime,
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
                    type: contentTab,
                    title: data.title,
                    readTime: data.readTime,
                    htmlFile: data.htmlFile,
                    pdfFile: data.pdfFile,
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
                    </div>
                </GlassCard>

                {/* Conteúdo por Seção */}
                {mainSection === "inicio" && <Dashboard />}

                {mainSection === "conteudo" && (
                    <div className="space-y-6">
                        {/* Sub-navegação de Conteúdo */}
                        <GlassCard variant="bordered" padding="md">
                            <div className="flex flex-wrap gap-3">
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

                        {/* Formulário ou Tabela */}
                        {showForm ? (
                            <ContentForm
                                type={contentTab}
                                editItem={editItem}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditItem(null);
                                }}
                                isLoading={isSubmitting}
                            />
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
                                ) : (
                                    <ContentTable items={items} onEdit={handleEdit} onDelete={handleDelete} />
                                )}
                            </>
                        )}
                    </div>
                )}

                {mainSection === "usuarios" && <UserManager />}
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
