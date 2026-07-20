"use client";

import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { AccordionGroup } from "@/components/ui/AccordionGroup";

interface FaqRow {
    id: number;
    question: string;
    answer: string;
    category: string;
}

export default function FaqClient() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["faq"],
        queryFn: async () => {
            const res = await fetch("/api/content/faq");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()) as FaqRow[];
        },
    });

    const items = data ?? [];

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Carregando…</p>;
    }

    if (error) {
        return <p className="text-sm text-muted-foreground">Não foi possível carregar as perguntas. Tente novamente.</p>;
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <HelpCircle className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Nenhuma pergunta publicada ainda.</p>
            </div>
        );
    }

    return (
        <AccordionGroup>
            {items.map(item => (
                <Accordion key={item.id} id={String(item.id)} variant="level1" title={item.question} isOpen={false} onToggle={() => {}}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.answer}</p>
                </Accordion>
            ))}
        </AccordionGroup>
    );
}
