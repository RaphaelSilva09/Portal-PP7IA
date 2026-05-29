"use client";

import Link from "next/link";
import type { Citation } from "@/domain/chat/RagAnswer";
import { hrefForCitation } from "@/lib/chat/citationLink";

interface Props {
    content: string;
    citations: Citation[];
}

const LINK_CLASS =
    "mx-0.5 inline-flex items-baseline align-baseline rounded px-1 text-[12px] font-semibold text-brand-blue hover:text-brand-purple hover:underline";

export function MessageContent({ content, citations }: Props) {
    const parts = content.split(/(\[\d+\])/g);
    return (
        <>
            {parts.map((part, i) => {
                const m = part.match(/^\[(\d+)\]$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    const c = citations[n - 1];
                    if (c) {
                        return (
                            <Link
                                key={i}
                                href={hrefForCitation(c)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={LINK_CLASS}
                            >
                                [{n}]
                            </Link>
                        );
                    }
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}
