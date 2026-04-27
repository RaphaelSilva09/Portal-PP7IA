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
        <details className="mt-2.5 pt-2.5 border-t border-dashed border-[rgba(99,132,181,0.22)] text-[11px] text-slate-500 group">
            <summary className="cursor-pointer font-bold text-blue-700 select-none list-none flex items-center gap-1.5 hover:text-blue-800">
                <span className="inline-block transition-transform group-open:rotate-90">▶</span>
                📖 Fontes ({citations.length})
            </summary>
            <ul className="space-y-0.5 mt-1.5 ml-4">
                {citations.map((c, i) => {
                    const heading = c.heading_path.join(" — ") || c.title;
                    const lastHeading = c.heading_path[c.heading_path.length - 1];
                    const href = lastHeading
                        ? `/view/mini-livro/${c.slug}#${anchorize(lastHeading)}`
                        : `/view/mini-livro/${c.slug}`;
                    return (
                        <li key={`${c.slug}-${i}`}>
                            <Link href={href} className="text-blue-700 hover:underline">{heading}</Link>
                        </li>
                    );
                })}
            </ul>
        </details>
    );
}
