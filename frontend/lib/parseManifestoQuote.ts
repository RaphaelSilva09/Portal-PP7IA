export type ManifestoSegment =
    | { type: "text"; text: string }
    | { type: "highlight"; text: string }
    | { type: "linebreak" };

/**
 * Parses a manifesto quote string into renderable segments.
 *
 * Syntax:
 *   - Newlines (\n) → linebreak segment
 *   - [palavra] → highlight segment (rendered in accent color)
 *   - Everything else → plain text segment
 *
 * Example input:  "\"[Liderar] é servir.\nFormar pessoas.\n[Deixar legado].\""
 */
export function parseManifestoQuote(raw: string): ManifestoSegment[] {
    const segments: ManifestoSegment[] = [];
    const lines = raw.split("\n");
    lines.forEach((line, lineIdx) => {
        if (lineIdx > 0) segments.push({ type: "linebreak" });
        const parts = line.split(/(\[[^\]]+\])/);
        parts.forEach((part) => {
            if (part.startsWith("[") && part.endsWith("]")) {
                segments.push({ type: "highlight", text: part.slice(1, -1) });
            } else if (part) {
                segments.push({ type: "text", text: part });
            }
        });
    });
    return segments;
}
