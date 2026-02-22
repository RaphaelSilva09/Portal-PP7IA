"use client";

/**
 * Painel de Administração (Presentation Layer)
 *
 * Página principal para gerenciamento de conteúdo.
 * Permite CRUD de newsletters, mini-livros e biblioteca.
 *
 * Segurança: Protegida pelo middleware que verifica admin.
 *
 * Princípios aplicados:
 * - SRP: Orquestra componentes e estado da página
 * - Composition: Usa componentes especializados
 * - DI: Obtém use cases via DIContainer
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContentType, ContentItem } from "@/domain/entities/ContentItem";
import { useAuth } from "@/context/AuthContext";
import DIContainer from "@/infrastructure/di/container";
import { ContentTable, ContentForm } from "@/components/admin";
import { GlassCard, GradientButton } from "@/components/ui";
import { Plus, Newspaper, BookOpen, Library } from "lucide-react";

const TABS: { type: ContentType; label: string; icon: typeof Newspaper }[] = [
    { type: "newsletter", label: "Newsletters", icon: Newspaper },
    { type: "mini-livro", label: "Mini-Livros", icon: BookOpen },
    { type: "biblioteca", label: "Biblioteca", icon: Library },
];

export default function PainelAdminPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<ContentType>("newsletter");
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<ContentItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redireciona para home se não logado (logout detectado)
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [authLoading, user, router]);

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const repo = DIContainer.getContentRepository();
            const data = await repo.getAll(activeTab);
            setItems(data);
        } catch (error) {
            console.error("Erro ao carregar itens:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    // Carregar itens quando aba muda
    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleCreate = () => {
        setEditItem(null);
        setShowForm(true);
    };

    const handleEdit = (item: ContentItem) => {
        setEditItem(item);
        setShowForm(true);
    };

    const handleDelete = async (item: ContentItem) => {
        if (!confirm(`Tem certeza que deseja deletar "${item.title}"?`)) {
            return;
        }

        try {
            const useCase = DIContainer.getDeleteContentWithFilesUseCase();
            await useCase.execute(activeTab, item.id);
            await loadItems();
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Falha ao deletar. Tente novamente.");
        }
    };

    const handleSubmit = async (data: {
        title: string;
        readTime?: number;
        htmlFile?: File;
        pdfFile?: File;
    }) => {
        setIsSubmitting(true);
        try {
            if (editItem) {
                // Atualizar
                const repo = DIContainer.getContentRepository();
                await repo.update(activeTab, editItem.id, {
                    title: data.title,
                    readTime: data.readTime,
                });
            } else {
                // Criar com upload
                const useCase = DIContainer.getCreateContentWithUploadUseCase();
                await useCase.execute({
                    type: activeTab,
                    title: data.title,
                    readTime: data.readTime,
                    htmlFile: data.htmlFile,
                    pdfFile: data.pdfFile,
                });
            }
            setShowForm(false);
            setEditItem(null);
            await loadItems();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Falha ao salvar. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTabChange = (type: ContentType) => {
        setActiveTab(type);
        setShowForm(false);
        setEditItem(null);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        Painel de Administração
                    </h1>
                </div>

                {/* Tabs */}
                <GlassCard variant="bordered" padding="sm">
                    <div className="flex gap-2">
                        {TABS.map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                onClick={() => handleTabChange(type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    activeTab === type
                                        ? "bg-[var(--brand-blue)] text-white"
                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Conteúdo */}
                {showForm ? (
                    <ContentForm
                        type={activeTab}
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
                            <GradientButton
                                variant="cta"
                                icon={Plus}
                                onClick={handleCreate}
                            >
                                Novo Material
                            </GradientButton>
                        </div>

                        {/* Tabela */}
                        {isLoading ? (
                            <div className="text-center py-12 text-[var(--text-secondary)]">
                                Carregando...
                            </div>
                        ) : items.length === 0 ? (
                            <GlassCard variant="bordered" padding="lg">
                                <div className="text-center py-8 text-[var(--text-secondary)]">
                                    Nenhum material cadastrado.
                                </div>
                            </GlassCard>
                        ) : (
                            <ContentTable
                                items={items}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
