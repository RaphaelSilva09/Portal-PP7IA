"use client";

interface Props {
    used?: number | null;
    limit: number;
}

export function Disclaimer({ used, limit }: Props) {
    const counter = used != null ? `${used}/${limit} mensagens hoje` : `Limite ${limit} mensagens/dia`;
    return (
        <div className="border-t border-border/80 bg-background/92 px-3 py-2 text-center text-[11px] leading-5 text-text-secondary dark:bg-background/60">
            <span className="font-medium text-foreground/85">Respostas com base no livro</span> · {counter}
        </div>
    );
}
