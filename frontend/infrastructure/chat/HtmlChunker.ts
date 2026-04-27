// frontend/infrastructure/chat/HtmlChunker.ts
import * as cheerio from "cheerio";
import type { Chunk } from "@/domain/chat/Chunk";

// Minimal structural types for the dom nodes we walk. cheerio's runtime
// returns domhandler nodes; we rely only on the small surface below so we
// don't have to import a transitive type.
interface DomTextNode {
    type: "text";
    data: string;
}
interface DomTagNode {
    type: "tag" | "script" | "style";
    name: string;
    children?: DomNode[];
}
type DomNode = DomTextNode | DomTagNode | { type: string };

export interface ChunkerOptions {
    /** Word count threshold above which a section is split. */
    maxTokens?: number;
    /** Word count of overlap between consecutive split chunks. */
    overlapTokens?: number;
    /** Trimmed character length below which a section merges with the next.
     *  Uses chars (not words) so single-character throwaway fragments are
     *  pruned without nuking short-but-real prose paragraphs. */
    minChars?: number;
}

export interface ChunkerInput {
    source_type?: string;
    source_id?: string;
    slug?: string;
    title?: string;
}

const DEFAULTS = { maxTokens: 800, overlapTokens: 100, minChars: 100 } as const;
const HEADING_LEVELS = ["h1", "h2", "h3"] as const;
const HEADING_SET = new Set<string>(HEADING_LEVELS);

const INLINE_TAGS = new Set<string>([
    "a",
    "abbr",
    "b",
    "bdi",
    "bdo",
    "cite",
    "code",
    "data",
    "dfn",
    "em",
    "i",
    "kbd",
    "mark",
    "q",
    "s",
    "samp",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "time",
    "u",
    "var",
    "wbr",
    "ins",
    "del",
]);

interface RawSection {
    headingPath: string[];
    text: string;
}

function deeperPath(a: string[], b: string[]): string[] {
    return b.length >= a.length ? b : a;
}

export class HtmlChunker {
    private readonly opts: Required<ChunkerOptions>;

    constructor(options: ChunkerOptions = {}) {
        this.opts = { ...DEFAULTS, ...options };
    }

    chunk(html: string, overrides: ChunkerOptions & ChunkerInput = {}): Chunk[] {
        if (!html || !html.trim()) return [];

        const opts = {
            maxTokens: overrides.maxTokens ?? this.opts.maxTokens,
            overlapTokens: overrides.overlapTokens ?? this.opts.overlapTokens,
            minChars: overrides.minChars ?? this.opts.minChars,
        };

        const sections = this.collectSections(html);
        const merged = this.mergeUndersized(sections, opts.minChars);
        const split = merged.flatMap((s) =>
            this.splitOversized(s, opts.maxTokens, opts.overlapTokens),
        );

        return split.map((s, i): Chunk => ({
            source_type: overrides.source_type ?? "mini_livro",
            source_id: overrides.source_id ?? "",
            chunk_index: i,
            content: s.text.trim(),
            metadata: {
                heading_path: s.headingPath,
                slug: overrides.slug ?? "",
                title: overrides.title ?? "",
                // char_start/char_end reserved for future use; tracking real HTML offsets
                // requires cheerio { withStartIndices: true } and isn't wired in v1.
                char_start: 0,
                char_end: 0,
            },
        }));
    }

    private collectSections(html: string): RawSection[] {
        const $ = cheerio.load(html);
        const sections: RawSection[] = [];
        const headingStack: string[] = [];
        let buffer = "";

        const flush = () => {
            sections.push({
                headingPath: [...headingStack],
                text: buffer,
            });
            buffer = "";
        };

        const appendText = (text: string) => {
            buffer += text;
        };

        const updateStackOnHeading = (level: number, text: string) => {
            // Drop equal-or-deeper levels, then push this heading.
            // level: 1 for h1, 2 for h2, 3 for h3.
            // Stack length should equal level after push.
            while (headingStack.length >= level) headingStack.pop();
            headingStack.push(text);
        };

        const walk = (node: DomNode): void => {
            if (node.type === "text") {
                const text = (node as DomTextNode).data;
                if (text) appendText(text);
                return;
            }
            if (node.type !== "tag") {
                // skip script/style/comments/etc.
                return;
            }
            const el = node as DomTagNode;
            const tag = el.name.toLowerCase();

            if (HEADING_SET.has(tag)) {
                // Flush current section, then update stack
                flush();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const headingText = $(node as any).text().trim();
                const level = Number(tag.slice(1)); // h1->1, h2->2, h3->3
                updateStackOnHeading(level, headingText);
                return;
            }

            // Recurse into children
            const isBlock = !INLINE_TAGS.has(tag);
            const children = (el.children ?? []) as DomNode[];
            for (const child of children) {
                walk(child);
            }
            if (isBlock) {
                appendText(" ");
            }
        };

        const root = $.root();
        const rootChildren = root.contents().toArray() as unknown as DomNode[];
        for (const child of rootChildren) {
            walk(child);
        }
        // Final flush
        flush();

        return sections;
    }

    private mergeUndersized(sections: RawSection[], minChars: number): RawSection[] {
        if (sections.length === 0) return [];

        // Pre-pass: absorb whitespace-only sections forward so they don't
        // consume a real section's merge slot. Whitespace-only sections
        // appear when the HTML has heading-after-heading transitions or
        // text-node whitespace between block elements; they carry no body
        // content, only their place in the heading stack — which is already
        // captured in the next non-empty section's headingPath.
        const cleaned: RawSection[] = [];
        for (const s of sections) {
            if (s.text.trim().length === 0) continue;
            cleaned.push(s);
        }
        if (cleaned.length === 0) return [];

        // Pairwise merge: if section[i] is undersized AND section[i+1] exists,
        // merge them; output result and skip i+1.
        //
        // "Undersized" uses trimmed character length as the proxy. This
        // distinguishes real content like "Conteúdo introdutório breve."
        // from micro-fragments like "x x". Pure word count is too coarse:
        // a 3-word, 28-char paragraph is real content, while a 2-word, 3-char
        // fragment is not.
        const passOne: RawSection[] = [];
        let i = 0;
        while (i < cleaned.length) {
            const cur = cleaned[i];
            const curSize = cur.text.trim().length;
            if (curSize < minChars && i + 1 < cleaned.length) {
                const next = cleaned[i + 1];
                passOne.push({
                    headingPath: deeperPath(cur.headingPath, next.headingPath),
                    text: cur.text + " " + next.text,
                });
                i += 2;
            } else {
                passOne.push(cur);
                i += 1;
            }
        }

        return passOne;
    }

    private splitOversized(
        section: RawSection,
        maxTokens: number,
        overlapTokens: number,
    ): RawSection[] {
        const trimmed = section.text.trim();
        if (!trimmed) return [];

        const words = trimmed.split(/\s+/).filter(Boolean);
        if (words.length <= maxTokens) {
            return [section];
        }

        const totalWords = words.length;
        const step = Math.max(1, maxTokens - overlapTokens);
        const out: RawSection[] = [];

        let startIdx = 0;
        while (startIdx < totalWords) {
            const endIdx = Math.min(totalWords, startIdx + maxTokens);
            const windowText = words.slice(startIdx, endIdx).join(" ");
            out.push({
                headingPath: section.headingPath,
                text: windowText,
            });
            if (endIdx >= totalWords) break;
            startIdx += step;
        }

        return out;
    }
}
