"use client";

/**
 * AdminBook Component (Presentation Layer)
 *
 * Formulário de edição do Livro principal (tabela `book`, singleton id = 1).
 * Suporta edição de metadados e upload de arquivos para o Supabase Storage.
 */

import { FeedbackMessage } from "@/components/admin";
import { GlassCard, GradientButton } from "@/components/ui";
import { supabase } from "@/infrastructure/config/supabase";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STORAGE_BUCKET = "materiais";
const STORAGE_FOLDER = "mini-livros/livro";

interface BookRow {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_path: string | null;
    cover_pdf_path: string | null;
    intro_pdf_path: string | null;
    intro_html_path: string | null;
    badge_text: string | null;
    is_active: boolean;
}

const INPUT_CLASS = `w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg
                     text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50
                     focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50`;

const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-2";

// —— FileUploadField (reutilizado do EbookForm) ——
interface FileUploadFieldProps {
    id: string;
    label: string;
    accept: string;
    file: File | null;
    existingPath: string | null;
    onChange: (file: File | null) => void;
}

function FileUploadField({ id, label, accept, file, existingPath, onChange }: FileUploadFieldProps) {
    return (
        <div>
            <label className={LABEL_CLASS}>{label}</label>
            {existingPath && (
                <div className="mb-2 flex items-center gap-2 text-sm text-[var(--brand-green)]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">Atual: {existingPath.split("/").pop()}</span>
                </div>
            )}
            <div className="relative">
                <input
                    type="file"
                    accept={accept}
                    onChange={e => onChange(e.target.files?.[0] ?? null)}
                    className="hidden"
                    id={id}
                />
                <label
                    htmlFor={id}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3
                               bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-glass)] rounded-lg
                               text-[var(--text-secondary)] cursor-pointer hover:border-[var(--brand-blue)]/50 transition-colors"
                >
                    <Upload className="w-5 h-5 shrink-0" />
                    <span className="truncate">
                        {file ? file.name : `Escolher novo arquivo (substitui o atual)`}
                    </span>
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                        aria-label="Remover arquivo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// —— Upload helper ——
async function uploadFile(file: File, path: string): Promise<string> {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

// —— Componente principal ——
export function AdminBook() {
    const [book, setBook] = useState<BookRow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false, message: "", type: "success",
    });

    // Campos de texto
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [badgeText, setBadgeText] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Arquivos novos
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverPdfFile, setCoverPdfFile] = useState<File | null>(null);
    const [introPdfFile, setIntroPdfFile] = useState<File | null>(null);
    const [introHtmlFile, setIntroHtmlFile] = useState<File | null>(null);

    const loadBook = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from("book").select("*").limit(1);
            if (error) throw error;
            const row = data?.[0] ?? null;
            if (row) {
                setBook(row);
                setTitle(row.title ?? "");
                setSubtitle(row.subtitle ?? "");
                setDescription(row.description ?? "");
                setBadgeText(row.badge_text ?? "");
                setIsActive(row.is_active ?? true);
            }
        } catch (err) {
            console.error("AdminBook load error:", err);
            setFeedback({ show: true, message: "Erro ao carregar dados do livro.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadBook(); }, [loadBook]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            const updates: Partial<BookRow> = {
                title: title.trim(),
                subtitle: subtitle.trim() || null,
                description: description.trim() || null,
                badge_text: badgeText.trim() || null,
                is_active: isActive,
            };

            // Faz uploads apenas se novos arquivos foram selecionados
            if (coverImageFile) {
                updates.cover_image_path = await uploadFile(
                    coverImageFile,
                    `${STORAGE_FOLDER}/capa.${coverImageFile.name.split(".").pop()}`,
                );
            }
            if (coverPdfFile) {
                updates.cover_pdf_path = await uploadFile(
                    coverPdfFile,
                    `${STORAGE_FOLDER}/capa.pdf`,
                );
            }
            if (introPdfFile) {
                updates.intro_pdf_path = await uploadFile(
                    introPdfFile,
                    `${STORAGE_FOLDER}/introducao.pdf`,
                );
            }
            if (introHtmlFile) {
                updates.intro_html_path = await uploadFile(
                    introHtmlFile,
                    `${STORAGE_FOLDER}/introducao.html`,
                );
            }

            const { error } = await supabase
                .from("book")
                .update(updates)
                .eq("id", book?.id ?? 1);

            if (error) throw error;

            setFeedback({ show: true, message: "Livro atualizado com sucesso!", type: "success" });
            // Limpa seleção de arquivos e recarrega
            setCoverImageFile(null);
            setCoverPdfFile(null);
            setIntroPdfFile(null);
            setIntroHtmlFile(null);
            await loadBook();
        } catch (err) {
            console.error("AdminBook save error:", err);
            setFeedback({ show: true, message: "Erro ao salvar. Tente novamente.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-[var(--text-secondary)]">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Livro Principal</h2>

            <GlassCard variant="elevated" padding="lg">
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Título */}
                    <div>
                        <label className={LABEL_CLASS}>Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className={INPUT_CLASS}
                            placeholder="Título do livro..."
                        />
                    </div>

                    {/* Subtítulo */}
                    <div>
                        <label className={LABEL_CLASS}>Subtítulo</label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={e => setSubtitle(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="Subtítulo opcional..."
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className={LABEL_CLASS}>Descrição</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className={`${INPUT_CLASS} resize-y`}
                            placeholder="Descrição do livro..."
                        />
                    </div>

                    {/* Badge */}
                    <div>
                        <label className={LABEL_CLASS}>Texto do Badge</label>
                        <input
                            type="text"
                            value={badgeText}
                            onChange={e => setBadgeText(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="Ex: Em desenvolvimento, Novo..."
                        />
                    </div>

                    {/* Visível */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            onClick={() => setIsActive(v => !v)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/40 ${
                                isActive ? "bg-[var(--brand-blue)]" : "bg-[var(--surface-glass)] border border-[var(--border-subtle)]"
                            }`}
                        >
                            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${isActive ? "translate-x-7" : "translate-x-1"}`} />
                        </button>
                        <span className={LABEL_CLASS.replace("mb-2", "mb-0")}>
                            {isActive ? "Visível na página" : "Oculto na página"}
                        </span>
                    </div>

                    {/* Arquivos */}
                    <div className="border-t border-[var(--border-glass)] pt-4 space-y-5">
                        <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                            Arquivos do Livro
                        </p>

                        <FileUploadField
                            id="book-cover-image"
                            label="Imagem de Capa"
                            accept=".jpg,.jpeg,.png,.webp"
                            file={coverImageFile}
                            existingPath={book?.cover_image_path ?? null}
                            onChange={setCoverImageFile}
                        />
                        <FileUploadField
                            id="book-cover-pdf"
                            label="PDF de Capa"
                            accept=".pdf"
                            file={coverPdfFile}
                            existingPath={book?.cover_pdf_path ?? null}
                            onChange={setCoverPdfFile}
                        />
                        <FileUploadField
                            id="book-intro-html"
                            label="HTML de Introdução"
                            accept=".html"
                            file={introHtmlFile}
                            existingPath={book?.intro_html_path ?? null}
                            onChange={setIntroHtmlFile}
                        />
                        <FileUploadField
                            id="book-intro-pdf"
                            label="PDF de Introdução"
                            accept=".pdf"
                            file={introPdfFile}
                            existingPath={book?.intro_pdf_path ?? null}
                            onChange={setIntroPdfFile}
                        />
                    </div>

                    {/* Ações */}
                    <div className="flex justify-end pt-2">
                        <GradientButton type="submit" variant="cta" disabled={isSaving || !title.trim()}>
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </GradientButton>
                    </div>
                </form>
            </GlassCard>

            <FeedbackMessage
                isVisible={feedback.show}
                message={feedback.message}
                type={feedback.type}
                onClose={() => setFeedback(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
