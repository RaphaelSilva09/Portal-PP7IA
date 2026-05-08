"use client";

/**
 * AdminHomeBlockDescriptions Component (Presentation Layer)
 *
 * Edicao das descricoes dos 7 blocos da home.
 * Cada descricao aceita multiplas linhas (separadas por \n).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard, GradientButton } from "@/components/ui";
import { FeedbackMessage } from "./FeedbackMessage";
import { supabase } from "@/infrastructure/config/supabase";
import { HOME_BLOCKS, type HomeBlockSlug } from "@/constants/homeBlocks";

interface HomeBlockRow {
    slug: HomeBlockSlug;
    description: string | null;
}

const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
const INPUT_CLASS =
    "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-glass)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/50";

export function AdminHomeBlockDescriptions() {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formValues, setFormValues] = useState<Record<HomeBlockSlug, string>>(() => {
        const initial = {} as Record<HomeBlockSlug, string>;
        HOME_BLOCKS.forEach(block => {
            initial[block.slug] = block.defaultDescription;
        });
        return initial;
    });
    const [feedback, setFeedback] = useState<{ show: boolean; message: string; type: "success" | "error" | "warning" }>({
        show: false,
        message: "",
        type: "success",
    });

    const showFeedback = (message: string, type: "success" | "error" | "warning") => {
        setFeedback({ show: true, message, type });
    };

    const loadDescriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("home_block_descriptions")
                .select("slug, description");

            if (error) throw error;

            const nextValues = {} as Record<HomeBlockSlug, string>;
            HOME_BLOCKS.forEach(block => {
                nextValues[block.slug] = block.defaultDescription;
            });
            (data as HomeBlockRow[] | null)?.forEach(row => {
                if (row?.slug) {
                    nextValues[row.slug] = row.description ?? "";
                }
            });
            setFormValues(nextValues);
        } catch (err) {
            console.error("Erro ao carregar descricoes da home:", err);
            showFeedback("Erro ao carregar descricoes. Tente novamente.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDescriptions();
    }, [loadDescriptions]);

    const hasEmptyDescription = useMemo(() => {
        return HOME_BLOCKS.some(block => !formValues[block.slug]?.trim());
    }, [formValues]);

    const handleSave = async () => {
        if (hasEmptyDescription) {
            showFeedback("Preencha a descricao de todos os blocos.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const payload = HOME_BLOCKS.map(block => ({
                slug: block.slug,
                description: formValues[block.slug].trim(),
            }));

            const { error } = await supabase
                .from("home_block_descriptions")
                .upsert(payload, { onConflict: "slug" });

            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ["home-block-descriptions"] });
            showFeedback("Descricoes atualizadas com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao salvar descricoes:", err);
            showFeedback("Erro ao salvar descricoes. Tente novamente.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Descricoes da Home</h2>
                <GradientButton onClick={handleSave} disabled={isLoading || isSaving} loading={isSaving} loadingText="Salvando...">
                    Salvar descricoes
                </GradientButton>
            </div>

            <GlassCard variant="elevated" padding="lg">
                {isLoading ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] text-lg">Carregando...</div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Edite o texto de cada bloco. Use quebra de linha para separar as linhas exibidas na home.
                        </p>
                        {HOME_BLOCKS.map(block => (
                            <div key={block.slug} className="space-y-2">
                                <label className={LABEL_CLASS}>{block.label}</label>
                                <textarea
                                    className={`${INPUT_CLASS} resize-y min-h-[96px]`}
                                    value={formValues[block.slug]}
                                    onChange={event =>
                                        setFormValues(prev => ({
                                            ...prev,
                                            [block.slug]: event.target.value,
                                        }))
                                    }
                                    placeholder={block.defaultDescription}
                                />
                            </div>
                        ))}
                    </div>
                )}
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
