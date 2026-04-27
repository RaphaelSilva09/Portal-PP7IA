"use client";

interface Props {
    used?: number | null;
    limit: number;
}

export function Disclaimer({ used, limit }: Props) {
    const counter = used != null ? `${used}/${limit} mensagens hoje` : `Limite ${limit} mensagens/dia`;
    return (
        <div className="text-center text-[10px] text-slate-500 px-3 py-1.5 bg-white border-t border-[rgba(99,132,181,0.22)]">
            Respostas baseadas no livro · {counter}
        </div>
    );
}
