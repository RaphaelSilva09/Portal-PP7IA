"use client";

/**
 * AdminEditorial Component (Presentation Layer)
 *
 * Interface de edição do conteúdo editorial via TipTap rich text.
 * Auto-contida: gerencia seus próprios dados e estado.
 */

import { FeedbackMessage } from "@/components/admin";
import { GlassCard } from "@/components/ui";
import { supabase } from "@/infrastructure/config/supabase";
import DIContainer from "@/infrastructure/di/container";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Check, Loader2, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

type EditorTab = "editar" | "preview";
type LinkMode = "idle" | "input";

// —— Toolbar ——
function Toolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    const btn = (active: boolean, onClick: () => void, label: ReactNode, title: string) => (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
                active
                    ? "bg-[var(--brand-blue)] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border-glass)] bg-[var(--bg-secondary)] rounded-t-lg">
            {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <strong>N</strong>, "Negrito")}
            {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <em>I</em>, "Itálico")}
            {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <u>S</u>, "Sublinhado")}
            <div className="w-px h-5 bg-[var(--border-glass)] mx-1" />
            {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "H1", "Título 1")}
            {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", "Título 2")}
            <div className="w-px h-5 bg-[var(--border-glass)] mx-1" />
            {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "• Lista", "Lista de pontos")}
            {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "1. Lista numérica", "Lista numerada")}
            <div className="w-px h-5 bg-[var(--border-glass)] mx-1" />
            {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), <AlignLeft className="w-4 h-4" />, "Alinhar à esquerda")}
            {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), <AlignCenter className="w-4 h-4" />, "Centralizar")}
            {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), <AlignRight className="w-4 h-4" />, "Alinhar à direita")}
            {btn(editor.isActive({ textAlign: "justify" }), () => editor.chain().focus().setTextAlign("justify").run(), <AlignJustify className="w-4 h-4" />, "Justificar")}
        </div>
    );
}

// —— Componente principal ——
export function AdminEditorial() {
    const [tab, setTab] = useState<EditorTab>("editar");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    // —— Bubble de link ——
    const [linkMode, setLinkMode] = useState<LinkMode>("idle");
    const [linkUrl, setLinkUrl] = useState("");
    const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null);
    const linkInputRef = useRef<HTMLInputElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const linkModeRef = useRef<LinkMode>("idle");
    const BASE_W = 128; // px base
    const MAX_W = BASE_W * 3; // triplo

    // mantém ref sincronizada para uso dentro de event listeners
    useEffect(() => { linkModeRef.current = linkMode; }, [linkMode]);

    const resetLink = useCallback(() => {
        setLinkMode("idle");
        setLinkUrl("");
        setBubblePos(null);
    }, []);

    const confirmLink = useCallback((editorInstance: Editor) => {
        const url = linkUrl.trim();
        if (url) {
            editorInstance.chain().focus().setLink({ href: url }).run();
        } else {
            editorInstance.chain().focus().unsetLink().run();
        }
        setLinkMode("idle");
        setLinkUrl("");
        // mantém bubblePos — a seleção ainda está ativa, será atualizada pelo próximo evento
    }, [linkUrl]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "min-h-[240px] px-4 py-3 text-[var(--text-primary)] focus:outline-none",
            },
        },
    });

    // —— Posiciona o bubble ao mudar a seleção ——
    useEffect(() => {
        if (!editor) return;

        const updateBubble = () => {
            // enquanto o usuário digita o link não reposiciona
            if (linkModeRef.current === "input") return;

            const { empty } = editor.state.selection;
            if (empty) {
                setBubblePos(null);
                return;
            }

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const rect = sel.getRangeAt(0).getBoundingClientRect();
            if (!rect.width) return;

            setBubblePos({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        };

        // Esconde o bubble ao clicar fora do editor e fora do bubble
        const handleMouseDown = (e: MouseEvent) => {
            if (bubbleRef.current?.contains(e.target as Node)) return;
            if ((editor.view.dom as HTMLElement).contains(e.target as Node)) return;
            resetLink();
        };

        editor.on("selectionUpdate", updateBubble);
        document.addEventListener("mousedown", handleMouseDown);

        return () => {
            editor.off("selectionUpdate", updateBubble);
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, [editor, resetLink]);

    // —— Carregar conteúdo atual ——
    const loadContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from("editorial")
                .select("content")
                .eq("id", 1)
                .single();

            if (data?.content && editor) {
                editor.commands.setContent(data.content);
            }
        } catch (err) {
            console.error("Erro ao carregar editorial:", err);
        } finally {
            setIsLoading(false);
        }
    }, [editor]);

    useEffect(() => {
        if (editor) loadContent();
    }, [editor, loadContent]);

    // —— Salvar ——
    const handleSave = async () => {
        if (!editor) return;
        setIsSaving(true);
        try {
            const useCase = DIContainer.getSaveEditorialUseCase();
            await useCase.execute(editor.getHTML());
            setFeedback({ show: true, message: "Editorial salvo com sucesso!", type: "success" });
        } catch (err) {
            console.error("Erro ao salvar editorial:", err);
            setFeedback({ show: true, message: "Erro ao salvar. Tente novamente.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const previewHtml = editor?.getHTML() ?? "";

    // —— Bubble de link (portal) ——
    const bubble = bubblePos && editor ? createPortal(
        <div
            ref={bubbleRef}
            style={{ position: "absolute", top: bubblePos.top, left: bubblePos.left, transform: "translateX(-50%)", zIndex: 9999 }}
            // preventDefault impede que o editor perca o foco/seleção ao interagir com o bubble
            onMouseDown={e => e.preventDefault()}
        >
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1a1a2e] border border-white/10 shadow-2xl text-sm">
                {linkMode === "idle" ? (
                    <button
                        type="button"
                        className="text-white/70 hover:text-white transition-colors whitespace-nowrap text-xs"
                        onMouseDown={e => {
                            e.preventDefault(); // garante que o editor mantém a seleção
                            const existing = editor.getAttributes("link").href ?? "";
                            setLinkUrl(existing);
                            setLinkMode("input");
                            setTimeout(() => {
                                if (linkInputRef.current) {
                                    linkInputRef.current.style.width = `${BASE_W}px`;
                                    linkInputRef.current.focus();
                                    linkInputRef.current.select();
                                }
                            }, 20);
                        }}
                    >
                        Atribuir link
                    </button>
                ) : (
                    <>
                        <input
                            ref={linkInputRef}
                            type="url"
                            value={linkUrl}
                            placeholder="https://..."
                            // stopPropagation para que o input receba foco normalmente
                            // sem acionar o preventDefault do container
                            onMouseDown={e => e.stopPropagation()}
                            onChange={e => {
                                setLinkUrl(e.target.value);
                                // cresce até triplo do valor base
                                e.target.style.width = "0";
                                e.target.style.width =
                                    Math.min(Math.max(e.target.scrollWidth, BASE_W), MAX_W) + "px";
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter") { e.preventDefault(); confirmLink(editor); }
                                if (e.key === "Escape") resetLink();
                            }}
                            style={{ width: `${BASE_W}px` }}
                            className="bg-transparent text-white/90 placeholder-white/25 outline-none border-none text-xs min-w-0"
                        />
                        <div className="w-px h-3.5 bg-white/10 mx-0.5" />
                        <button
                            type="button"
                            title="Cancelar"
                            onMouseDown={e => { e.preventDefault(); resetLink(); }}
                            className="text-white/30 hover:text-white/70 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            title="Confirmar (Enter)"
                            onMouseDown={e => { e.preventDefault(); confirmLink(editor); }}
                            className="text-white/30 hover:text-white/70 transition-colors"
                        >
                            <Check className="w-3 h-3" />
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body,
    ) : null;

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Editorial</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-blue)] text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Salvar
                        </>
                    )}
                </button>
            </div>

            <GlassCard variant="bordered" padding="none">
                {/* Sub-abas */}
                <div className="flex border-b border-[var(--border-glass)]">
                    {(["editar", "preview"] as EditorTab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                                tab === t
                                    ? "text-[var(--text-primary)] border-b-2 border-[var(--brand-blue)]"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                            {t === "editar" ? "Editar" : "Pré-visualização"}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-[var(--text-secondary)]">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Carregando...
                    </div>
                ) : tab === "editar" ? (
                    <div className="rounded-b-lg">
                        <Toolbar editor={editor} />
                        <EditorContent editor={editor} />
                    </div>
                ) : (
                    <div className="px-6 py-4">
                        {previewHtml && previewHtml !== "<p></p>" ? (
                            <div
                                className="prose prose-invert prose-sm max-w-none text-slate-200"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        ) : (
                            <p className="text-[var(--text-secondary)] text-sm italic">
                                Nenhum conteúdo para pré-visualizar.
                            </p>
                        )}
                    </div>
                )}
            </GlassCard>

            {bubble}

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
