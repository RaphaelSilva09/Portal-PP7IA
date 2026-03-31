"use client";

/**
 * useSectionBrowse Hook (Presentation Layer)
 *
 * Busca os primeiros 5 itens de uma seção/subseção para o preview
 * do Estado A (modo navegação por abas) do SearchModal.
 *
 * Para a seção "biblioteca", filtra pelo campo `tema`.
 * Para a seção "ias", retorna array vazio (chips têm directUrl).
 */

import { useEffect, useState } from "react";
import type { SectionType } from "../../constants/sections";
import DIContainer from "../../infrastructure/di/container";

export interface BrowseItem {
    id: number;
    title: string;
    url: string | null;
}

const MAX_PREVIEW = 5;

export function useSectionBrowse(
    sectionId: SectionType | null,
    subsectionId: string | null,
    tema?: string,
): { items: BrowseItem[]; isLoading: boolean } {
    const [items, setItems] = useState<BrowseItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!sectionId || !subsectionId) {
            setItems([]);
            return;
        }

        // Seção "ias" não tem preview de materiais
        if (sectionId === "ias") {
            setItems([]);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function fetch() {
            try {
                let raw: BrowseItem[] = [];

                if (sectionId === "newsletter") {
                    const all = await DIContainer.getNewsletterRepository().getAll();
                    raw = all.map(i => ({ id: i.id, title: i.title, url: i.htmlPath }));
                } else if (sectionId === "especial-semana") {
                    const all = await DIContainer.getEspecialSemanaRepository().getAll();
                    raw = all.map(i => ({ id: i.id, title: i.title, url: i.htmlPath }));
                } else if (sectionId === "radar") {
                    const all = await DIContainer.getRadarOportunidadesRepository().getAll();
                    raw = all.map(i => ({ id: i.id, title: i.title, url: i.htmlPath }));
                } else if (sectionId === "mini-livro") {
                    const all = await DIContainer.getMiniLivroRepository().getAll();
                    raw = all.map(i => ({ id: i.id, title: i.title, url: i.htmlPath }));
                } else if (sectionId === "biblioteca") {
                    const all = await DIContainer.getBibliotecaRepository().getAll();
                    const filtered = tema ? all.filter(i => i.tema === tema) : all;
                    raw = filtered.map(i => ({ id: i.id, title: i.title, url: i.htmlPath }));
                } else if (sectionId === "estudar") {
                    const all = await DIContainer.getEstudarRepository().getAll();
                    raw = all.map(i => ({ id: i.id, title: i.title, url: i.htmlPath }));
                }

                if (!cancelled) setItems(raw.slice(0, MAX_PREVIEW));
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetch();
        return () => { cancelled = true; };
    }, [sectionId, subsectionId, tema]);

    return { items, isLoading };
}
