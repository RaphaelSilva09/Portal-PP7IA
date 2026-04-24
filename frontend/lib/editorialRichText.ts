function normalizeEmptyEditorialParagraph(...args: Array<string | number | undefined>) {
    const attributes = typeof args[1] === "string" ? args[1] : "";
    return `<p${attributes}><br></p>`;
}

export function normalizeEditorialHtml(html: string): string {
    if (!html) return "";

    return html.replace(
        /<p([^>]*)>\s*(?:(?:<br\s*\/?>)|&nbsp;|\u00A0|\s)*<\/p>/gi,
        normalizeEmptyEditorialParagraph,
    );
}

export function hasMeaningfulEditorialContent(html: string): boolean {
    if (!html) return false;

    const textContent = normalizeEditorialHtml(html)
        .replace(/<p([^>]*)>\s*<br\s*\/?>\s*<\/p>/gi, "")
        .replace(/<br\s*\/?>/gi, "")
        .replace(/&nbsp;|\u00A0/gi, " ")
        .replace(/<[^>]+>/g, "")
        .trim();

    return textContent.length > 0;
}
