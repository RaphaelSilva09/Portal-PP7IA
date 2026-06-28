"use client";

import Link from "next/link";
import type { Citation } from "@/domain/chat/RagAnswer";
import { hrefForCitation } from "@/lib/chat/citationLink";

interface Props {
    citations: Citation[];
}

export function Citations({ citations }: Props) {
    if (citations.length === 0) return null;
    return (
        <details className="group mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-background/60 px-2.5 py-1 font-medium transition-colors duration-200 group-open:border-ink/15 group-open:bg-ink/5 hover:border-ink/15 hover:text-foreground dark:bg-background/40 dark:group-open:border-foreground/20 dark:group-open:bg-foreground/5">
                <span className="inline-block transition-transform duration-200 group-open:rotate-90">›</span>
                Fontes consultadas ({citations.length})
            </summary>
            <ul className="mt-2.5 space-y-2">
                {citations.map((c, i) => {
                    const heading = c.heading_path.join(" — ") || c.title;
                    return (
                        <li key={`${c.slug}-${i}`} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 dark:bg-background/40">
                            <Link href={hrefForCitation(c)} className="inline-flex text-brand-blue transition-colors duration-200 hover:text-brand-purple hover:underline">
                                <span className="mr-1 font-semibold">[{i + 1}]</span>
                                {heading}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </details>
    );
}
