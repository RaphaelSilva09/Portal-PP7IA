export interface RagSourceConfig {
    sourceType: string;
    topK: number;
    citable: boolean;
}

export const RAG_SOURCES: RagSourceConfig[] = [
    { sourceType: "mini_livro",          topK: 50, citable: true  },
    { sourceType: "newsletter",          topK: 4,  citable: true  },
    { sourceType: "radar_oportunidades", topK: 3,  citable: true  },
    { sourceType: "especial_semana",     topK: 3,  citable: true  },
    { sourceType: "biblioteca",          topK: 3,  citable: true  },
    { sourceType: "estudar",             topK: 4,  citable: true  },
    { sourceType: "meta_summary",        topK: 3,  citable: true  },
    { sourceType: "meta_global",         topK: 1,  citable: false },
    { sourceType: "meta_themes",         topK: 1,  citable: false },
    { sourceType: "meta_entity_index",   topK: 1,  citable: false },
];

export function isCitable(sourceType: string): boolean {
    return RAG_SOURCES.find(s => s.sourceType === sourceType)?.citable ?? true;
}

/**
 * Mapeia o `type` usado nas páginas `/view/[type]/[slug]` para o `source_type`
 * do RAG (chat contextual). Tipos ausentes daqui não têm chunks ingeridos
 * (ex.: editorial, ebook, book, mini-livro-section) — o chat contextual é
 * ignorado nesses casos, sem quebrar o restante da conversa.
 */
const VIEW_TYPE_TO_RAG_SOURCE: Record<string, string> = {
    newsletter: "newsletter",
    "mini-livro": "mini_livro",
    biblioteca: "biblioteca",
    "especial-semana": "especial_semana",
    radar_oportunidades: "radar_oportunidades",
    estudar: "estudar",
};

export function articleContextSourceType(viewType: string): string | null {
    return VIEW_TYPE_TO_RAG_SOURCE[viewType] ?? null;
}
