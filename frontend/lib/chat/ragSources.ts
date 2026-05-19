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
];

export function isCitable(sourceType: string): boolean {
    return RAG_SOURCES.find(s => s.sourceType === sourceType)?.citable ?? true;
}
