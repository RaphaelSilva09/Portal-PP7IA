"use client";

/**
 * useSectionBrowse Hook (Presentation Layer)
 *
 * Busca os primeiros 5 itens de uma seção/subseção para o preview
 * do Estado A (modo navegação por abas) do SearchModal.
 *
 * Para a seção "biblioteca", filtra pelo campo `tema`.
 * Para a seção "ias", retorna array vazio (chips têm directUrl).
 *
 * Consome os endpoints HTTP `/api/content/{type}` (mesmos usados pelos
 * hooks principais) — evita importar repositórios pg-based no client.
 */

import { useEffect, useState } from "react";
import type { SectionType } from "../../constants/sections";

export interface BrowseItem {
    id: number;
    title: string;
    url: string | null;
}

const MAX_PREVIEW = 5;

/** Mapeia SectionType -> path esperado por `/api/content/[type]`. */
const SECTION_TO_API_TYPE: Record<Exclude<SectionType, "ias">, string> = {
    newsletter:        "newsletter",
    "especial-semana": "especial-semana",
    radar:             "radar_oportunidades",
    "mini-livro":      "mini-livro",
    biblioteca:        "biblioteca",
    estudar:           "estudar",
};

/**
 * O backend serializa instâncias de entidade como `{ props: {...} }` —
 * extraímos o `props` (ou aceitamos um objeto plano), e expomos os
 * campos crus que o preview precisa. Replica internamente a lógica de
 * `htmlPath` getter para `/view/{type}/{slug}` quando o path apontar
 * para um `.html`.
 */
interface RawProps {
    id?: number;
    title?: string;
    htmlPath?: string | null;
    tema?: string;
}

function unwrapProps(raw: unknown): RawProps {
    return ((raw as { props?: RawProps })?.props ?? (raw as RawProps)) || {};
}

/**
 * Reconstrói path de visualização equivalente ao getter `htmlPath` das
 * entidades (que extrai slug do `.html` e devolve `/view/{type}/{slug}`).
 * Quando não casar com `.html`, devolve o caminho cru.
 */
function buildViewUrl(rawPath: string | null | undefined, type: string): string | null {
    const trimmed = rawPath?.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/\/([^/]+)\.html$/);
    if (!match) return trimmed;
    const slug = match[1];
    return `/view/${type}/${slug}`;
}

/**
 * Reconstrói lista a partir do JSON do endpoint `/api/content/{type}`,
 * suportando os shapes conhecidos:
 *  - `{ latest, older }` (biblioteca, newsletter, mini-livro, radar, estudar)
 *  - `{ all }`           (mini-livro também expõe `all`)
 *  - `{ "0": x, "1": y }` (especial-semana — array spread no objeto)
 */
function listFromContentJson(json: Record<string, unknown>): unknown[] {
    if (Array.isArray((json as { all?: unknown }).all)) {
        return (json as { all: unknown[] }).all;
    }
    if ("latest" in json || "older" in json) {
        const latest = (json as { latest?: unknown }).latest ?? null;
        const older = ((json as { older?: unknown[] }).older ?? []) as unknown[];
        return latest ? [latest, ...older] : older;
    }
    // Fallback: array espalhado em chaves numéricas (caso especial-semana)
    const out: unknown[] = [];
    let i = 0;
    while (Object.prototype.hasOwnProperty.call(json, String(i))) {
        out.push(json[String(i)]);
        i++;
    }
    return out;
}

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

        const apiType = SECTION_TO_API_TYPE[sectionId as Exclude<SectionType, "ias">];
        if (!apiType) {
            setItems([]);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        async function fetchPreview() {
            try {
                const res = await fetch(`/api/content/${apiType}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = (await res.json()) as Record<string, unknown>;
                const rawList = listFromContentJson(json);

                let raw: BrowseItem[] = rawList.map(item => {
                    const props = unwrapProps(item);
                    return {
                        id: props.id ?? 0,
                        title: props.title?.trim() || "Material indisponível",
                        url: buildViewUrl(props.htmlPath ?? null, sectionId as string),
                    };
                });

                // Filtro por tema (apenas biblioteca)
                if (sectionId === "biblioteca" && tema) {
                    const filteredRaw = rawList.filter(item => unwrapProps(item).tema === tema);
                    raw = filteredRaw.map(item => {
                        const props = unwrapProps(item);
                        return {
                            id: props.id ?? 0,
                            title: props.title?.trim() || "Material indisponível",
                            url: buildViewUrl(props.htmlPath ?? null, sectionId as string),
                        };
                    });
                }

                if (!cancelled) setItems(raw.slice(0, MAX_PREVIEW));
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchPreview();
        return () => {
            cancelled = true;
        };
    }, [sectionId, subsectionId, tema]);

    return { items, isLoading };
}
