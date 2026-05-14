import type { Citation } from "@/domain/chat/RagAnswer";

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
    const last = c.heading_path[c.heading_path.length - 1];
    return last
        ? `/view/mini-livro/${c.slug}#${anchorize(last)}`
        : `/view/mini-livro/${c.slug}`;
}
