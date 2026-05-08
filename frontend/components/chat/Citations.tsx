"use client";

import Link from "next/link";
import type { Citation } from "@/domain/chat/RagAnswer";

interface Props {
    citations: Citation[];
}

function anchorize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export function Citations({ citations }: Props) {
    if (citations.length === 0) return null;
    return (
        <details className="group mt-3 border-t border-border/70 pt-3 text-xs text-text-secondary">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-background/70 px-2.5 py-1 font-medium transition-colors duration-200 group-open:border-brand-blue/20 group-open:bg-brand-blue/10 hover:border-brand-blue/20 hover:text-foreground dark:bg-background/60">
                <span className="inline-block transition-transform duration-200 group-open:rotate-90">›</span>
                Fontes consultadas ({citations.length})
            </summary>
            <ul className="mt-2.5 space-y-2">
                {citations.map((c, i) => {
                    const heading = c.heading_path.join(" — ") || c.title;
                    const lastHeading = c.heading_path[c.heading_path.length - 1];
                    const href = lastHeading
                        ? `/view/mini-livro/${c.slug}#${anchorize(lastHeading)}`
                        : `/view/mini-livro/${c.slug}`;
                    return (
                        <li key={`${c.slug}-${i}`} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 dark:bg-background/40">
                            <Link href={href} className="inline-flex text-brand-blue transition-colors duration-200 hover:text-brand-purple hover:underline">
                                {heading}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </details>
    );
}
