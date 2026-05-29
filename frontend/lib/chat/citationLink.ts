import type { Citation } from "@/domain/chat/RagAnswer";

// Maps source_type values to their /view/[type] URL segment.
// especial_semana uses a hyphenated URL unlike its underscore source_type.
const VIEW_TYPE_SEGMENTS: Record<string, string> = {
    mini_livro:          "mini-livro",
    newsletter:          "newsletter",
    radar_oportunidades: "radar_oportunidades",
    especial_semana:     "especial-semana",
    biblioteca:          "biblioteca",
    estudar:             "estudar",
};

function anchorize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export function hrefForCitation(c: Citation): string {
    const segment = VIEW_TYPE_SEGMENTS[c.source_type] ?? c.source_type;
    const base = `/view/${segment}/${c.slug}`;
    if (c.source_type === "mini_livro" && c.heading_path.length > 0) {
        const last = c.heading_path[c.heading_path.length - 1];
        return `${base}#${anchorize(last)}`;
    }
    return base;
}
