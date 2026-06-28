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
import AdminBlockColors from "@/components/admin/AdminBlockColors";
import {
    AdminBook,
    AdminEditorial,
    AdminExplorarConfig,
    AdminSiteBg,
    AdminHomeBlockDescriptions,
    AdminHomepageConfig,
    AdminHomeRecomendacoesPaulo,
    AdminMiniLivroSections,
    AdminPortalNews,
    AnnouncementBarTab,
    ConfirmDialog,
    ContentForm,
    ContentTable,
    Dashboard,
    EbookForm,
    FeedbackMessage,
    ReindexButton,
    SortableContentTable,
    UserManager,
} from "@/components/admin";
import { useAuth } from "@/context/AuthContext";
import { ContentItem, ContentItemProps, ContentType } from "@/domain/entities/ContentItem";
import { portalContentClass } from "@/lib/layout";
import {
    ArrowLeft,
    Bell,
    BookMarked,
    BookOpen,
    BookText,
    FileText,
    Home as HomeIcon,
    GraduationCap,
    Home,
    Library,
    Newspaper,
    NotebookPen,
    Palette,
    Plus,
    Radar,
    Star,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useEbook } from "@/presentation/hooks/useEbook";
import ThemeToggle from "@/components/ThemeToggle";

// Seções principais do painel (navegação de alto nível)
type MainSection = "inicio" | "conteudo" | "usuarios" | "novidades" | "editorial" | "barra-aviso" | "home" | "recomendacoes" | "pagina-home" | "cores-blocos" | "pagina-explorar" | "site-bg";

type ContentTab = ContentType | "livro" | "mini-livro-sections";

// Tabs de conteúdo (sub-navegação)
const SORTABLE_TYPES = new Set<ContentTab>(["newsletter", "mini-livro", "biblioteca", "especial-semana", "radar_oportunidades", "estudar"]);

const CONTENT_TABS: { type: ContentTab; label: string; icon: typeof Newspaper }[] = [
    { type: "biblioteca", label: "Biblioteca", icon: Library },
    { type: "ebook", label: "E-books", icon: BookMarked },
    { type: "especial-semana", label: "Inteligência Artificial", icon: Star },
    { type: "estudar", label: "Estudar", icon: GraduationCap },
    { type: "livro", label: "Livro", icon: BookText },
    { type: "mini-livro", label: "Mini-livros", icon: BookOpen },
    { type: "mini-livro-sections", label: "Seções Mini-livros", icon: BookText },
    { type: "newsletter", label: "Newsletters", icon: Newspaper },
    { type: "radar_oportunidades", label: "Editoriais e Artigos", icon: Radar },
];

/**
 * Reidrata um ContentItem serializado vindo da API.
 * Entidades de domínio serializam como `{ props: {...} }` por usarem `private readonly props`.
 * Datas chegam como strings ISO — reconstrói para Date.
 */
function rehydrateContentItem(raw: unknown): ContentItem {
    const data = raw as { props?: Partial<ContentItemProps> } & Partial<ContentItemProps>;
    const src = (data?.props ?? data) as Partial<ContentItemProps>;
    const props: ContentItemProps = {
        id: Number(src.id ?? 0),
        createdAt: src.createdAt ? new Date(src.createdAt as unknown as string) : new Date(0),
        title: String(src.title ?? ""),
        htmlPath: (src.htmlPath as string | null) ?? null,
        pdfPath: (src.pdfPath as string | null) ?? null,
        readTime: Number(src.readTime ?? 0),
        index: src.index as number | undefined,
        ebookId: (src.ebookId as number | null | undefined) ?? null,
        partOrder: (src.partOrder as number | null | undefined) ?? null,
        tema: (src.tema as string | null | undefined) ?? null,
        subtitle: (src.subtitle as string | null | undefined) ?? null,
        description: (src.description as string | null | undefined) ?? null,
        badgeText: (src.badgeText as string | null | undefined) ?? null,
        coverImagePath: (src.coverImagePath as string | null | undefined) ?? null,
        coverPdfPath: (src.coverPdfPath as string | null | undefined) ?? null,
        ebookOrder: (src.ebookOrder as number | null | undefined) ?? null,
    };
    return ContentItem.create(props);
}

/**
 * Extrai uma lista achatada de itens a partir do payload do endpoint
 * `/api/content/[type]`, lidando com as diferentes formas de retorno:
 * - especial-semana: `{ items: [...] }`
 * - mini-livro: `{ all: [...], latest, older }`
 * - biblioteca/newsletter/radar_oportunidades/estudar: `{ latest, older }`
 */
function flattenContentPayload(payload: Record<string, unknown>): unknown[] {
    if (Array.isArray(payload.items)) return payload.items as unknown[];
    if (Array.isArray(payload.all)) return payload.all as unknown[];
    const out: unknown[] = [];
    if (payload.latest) out.push(payload.latest);
    if (Array.isArray(payload.older)) out.push(...(payload.older as unknown[]));
    return out;
}

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
        if (contentTab === "ebook") {
            // Aba ebook é alimentada via useEbook() / allEbooks; não há rota /api/content/ebook
            // no formato lista usada aqui. Mantém items vazio para evitar 400.
            // TODO Phase 5d: rotear via /api/admin/content/* quando essa rota existir.
            setItems([]);
            setLastUpdated(null);
            return;
        }
        if (contentTab === "mini-livro-sections") return; // CRUD dedicado

        setIsLoading(true);
        try {
            const res = await fetch(`/api/content/${encodeURIComponent(contentTab)}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const payload = (await res.json()) as Record<string, unknown>;
            const rawItems = flattenContentPayload(payload);
            const data = rawItems.map(rehydrateContentItem);
            const lu = payload.lastUpdated ? new Date(payload.lastUpdated as string) : null;
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
                    const res = await fetch(
                        `/api/admin/content/${encodeURIComponent(contentTab)}/${item.id}`,
                        { method: "DELETE" },
                    );
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error ?? `HTTP ${res.status}`);
                    }
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

    const handleSubmit = async (data: { title: string; readTime?: number; htmlFile?: File; pdfFile?: File; tema?: string; ebookId?: number | null }) => {
        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append("title", data.title);
            if (data.readTime !== undefined) form.append("readTime", String(data.readTime));
            if (data.tema) form.append("tema", data.tema);
            if (data.ebookId != null) form.append("ebookId", String(data.ebookId));
            if (data.htmlFile) form.append("htmlFile", data.htmlFile);
            if (data.pdfFile) form.append("pdfFile", data.pdfFile);

            const url = editItem
                ? `/api/admin/content/${encodeURIComponent(contentTab)}/${editItem.id}`
                : `/api/admin/content/${encodeURIComponent(contentTab)}`;
            const method = editItem ? "PUT" : "POST";
            const res = await fetch(url, { method, body: form });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            setShowForm(false);
            setEditItem(null);
            await loadItems();
            setFeedback({
                show: true,
                message: editItem ? "Material atualizado com sucesso!" : "Material criado com sucesso!",
                type: "success",
            });
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setFeedback({
                show: true,
                message: error instanceof Error ? error.message : "Erro ao salvar material. Tente novamente.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReorder = async (reorderedItems: ContentItem[]) => {
        try {
            const orderedIds = reorderedItems.map(item => item.id);
            const res = await fetch(
                `/api/admin/content/${encodeURIComponent(contentTab)}/reorder`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderedIds }),
                },
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            await loadItems();
        } catch (error) {
            console.error("Erro ao reordenar:", error);
            setFeedback({ show: true, message: "Erro ao salvar nova ordem. Tente novamente.", type: "error" });
        }
    };

    const handleEbookSubmit = async (data: EbookFormData) => {
        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append("title", data.title);
            if (data.order !== undefined) form.append("order", String(data.order));
            if (data.subtitle) form.append("subtitle", data.subtitle);
            if (data.description) form.append("description", data.description);
            if (data.badgeText) form.append("badgeText", data.badgeText);
            if (data.readTime !== undefined) form.append("readTime", String(data.readTime));
            if (data.introHtmlFile) form.append("htmlFile", data.introHtmlFile);
            if (data.introPdfFile) form.append("pdfFile", data.introPdfFile);
            if (data.coverImageFile) form.append("coverImageFile", data.coverImageFile);
            if (data.coverPdfFile) form.append("coverPdfFile", data.coverPdfFile);

            const url = editItem
                ? `/api/admin/content/ebook/${editItem.id}`
                : `/api/admin/content/ebook`;
            const method = editItem ? "PUT" : "POST";
            const res = await fetch(url, { method, body: form });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            setShowForm(false);
            setEditItem(null);
            await loadItems();
            setFeedback({
                show: true,
                message: editItem ? "E-book atualizado com sucesso!" : "E-book criado com sucesso!",
                type: "success",
            });
        } catch (error) {
            console.error("Erro ao salvar e-book:", error);
            setFeedback({
                show: true,
                message: error instanceof Error ? error.message : "Erro ao salvar e-book. Tente novamente.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Nav helpers ──────────────────────────────────────────────────────────
    type NavGroup = {
        label: string;
        items: { section: MainSection; label: string; icon: typeof Home }[];
    };

    const NAV_GROUPS: NavGroup[] = [
        {
            label: "Visão Geral",
            items: [
                { section: "inicio",      label: "Dashboard",       icon: Home       },
                { section: "usuarios",    label: "Usuários",        icon: Users      },
            ],
        },
        {
            label: "Conteúdo",
            items: [
                { section: "conteudo",    label: "Materiais",       icon: FileText   },
                { section: "editorial",   label: "Editorial",       icon: NotebookPen },
                { section: "novidades",   label: "Portal News",     icon: Bell       },
                { section: "barra-aviso", label: "Barra de Aviso",  icon: Bell       },
            ],
        },
        {
            label: "Homepage",
            items: [
                { section: "home",        label: "Blocos",          icon: HomeIcon   },
                { section: "pagina-home", label: "Configuração",    icon: HomeIcon   },
                { section: "recomendacoes", label: "Recomendações", icon: BookOpen   },
                { section: "cores-blocos", label: "Cores dos Blocos", icon: Palette  },
                { section: "site-bg",      label: "Fundo do Site",    icon: Palette  },
            ],
        },
        {
            label: "Explorar",
            items: [
                { section: "pagina-explorar", label: "Configuração", icon: Radar },
            ],
        },
    ];

    function NavItem({ section, label, icon: Icon }: { section: MainSection; label: string; icon: typeof Home }) {
        const isActive = mainSection === section;
        return (
            <button
                onClick={() => handleMainSectionChange(section)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
            >
                <Icon className="size-4 shrink-0" />
                {label}
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className={`${portalContentClass} py-8`}>

                {/* Header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.push("/user")}
                            className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5" />
                            Perfil
                        </button>
                        <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                            Administração.
                        </h1>
                    </div>
                    <div className="shrink-0 pt-1">
                        <ThemeToggle />
                    </div>
                </div>

                {/* Layout: sidebar + content */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start">

                    {/* ── Sidebar ─────────────────────────────────────── */}
                    <aside className="shrink-0 md:w-52">
                        {/* Mobile: horizontal scroll */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
                            {NAV_GROUPS.flatMap(g => g.items).map(({ section, label, icon: Icon }) => {
                                const isActive = mainSection === section;
                                return (
                                    <button
                                        key={section}
                                        onClick={() => handleMainSectionChange(section)}
                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-foreground text-background"
                                                : "border border-border text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="size-3.5" />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop: grouped sidebar */}
                        <nav className="hidden rounded-2xl border border-border bg-card p-3 md:block">
                            {NAV_GROUPS.map((group, gi) => (
                                <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
                                    <p className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60">
                                        {group.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {group.items.map(item => (
                                            <NavItem key={item.section} {...item} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* ── Content area ────────────────────────────────── */}
                    <div className="min-w-0 flex-1 space-y-6">

                        {mainSection === "inicio" && (
                            <>
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                        Assistente RAG
                                    </p>
                                    <ReindexButton />
                                </div>
                                <Dashboard />
                            </>
                        )}

                        {mainSection === "pagina-explorar" && <AdminExplorarConfig />}
                        {mainSection === "home"         && <AdminHomeBlockDescriptions />}
                        {mainSection === "pagina-home"  && <AdminHomepageConfig />}
                        {mainSection === "cores-blocos" && <AdminBlockColors />}
{mainSection === "site-bg"      && <AdminSiteBg />}
                        {mainSection === "recomendacoes" && <AdminHomeRecomendacoesPaulo />}
                        {mainSection === "usuarios"     && <UserManager />}
                        {mainSection === "novidades"    && <AdminPortalNews />}
                        {mainSection === "editorial"    && <AdminEditorial />}
                        {mainSection === "barra-aviso"  && <AnnouncementBarTab />}

                        {mainSection === "conteudo" && (
                            <div className="space-y-5">
                                {/* Content type tabs */}
                                <div className="flex flex-wrap gap-2">
                                    {CONTENT_TABS.map(({ type, label, icon: Icon }) => (
                                        <button
                                            key={type}
                                            onClick={() => handleContentTabChange(type)}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                                contentTab === type
                                                    ? "bg-foreground text-background"
                                                    : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="size-3.5" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {contentTab === "livro" ? (
                                    <AdminBook />
                                ) : contentTab === "mini-livro-sections" ? (
                                    <AdminMiniLivroSections />
                                ) : showForm ? (
                                    contentTab === "ebook" ? (
                                        <EbookForm
                                            editItem={editItem}
                                            onSubmit={handleEbookSubmit}
                                            onCancel={() => { setShowForm(false); setEditItem(null); }}
                                            isLoading={isSubmitting}
                                        />
                                    ) : (
                                        <ContentForm
                                            type={contentTab as ContentType}
                                            editItem={editItem}
                                            onSubmit={handleSubmit}
                                            onCancel={() => { setShowForm(false); setEditItem(null); }}
                                            isLoading={isSubmitting}
                                            ebookId={contentTab === "mini-livro" && !editItem ? (allEbooks.find(e => e.order === selectedEbookIndex + 1)?.id ?? null) : undefined}
                                        />
                                    )
                                ) : (
                                    <>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleCreate}
                                                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/80"
                                            >
                                                <Plus className="size-4" />
                                                Novo Material
                                            </button>
                                        </div>

                                        {isLoading ? (
                                            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                                                <p className="text-sm text-muted-foreground">Carregando…</p>
                                            </div>
                                        ) : items.length === 0 ? (
                                            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                                                <p className="text-sm text-muted-foreground">Nenhum material cadastrado.</p>
                                            </div>
                                        ) : SORTABLE_TYPES.has(contentTab) ? (
                                            <SortableContentTable
                                                items={contentTab === "mini-livro"
                                                    ? items.filter(ml => ml.partOrder === selectedEbookIndex + 1)
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

                    </div>
                </div>
            </div>

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
