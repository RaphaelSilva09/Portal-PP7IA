"use client";

import { useState } from "react";
import { useHomeBlockDescriptions } from "@/presentation/hooks/useHomeBlockDescriptions";
import { useNewsletters } from "@/presentation/hooks/useNewsletters";
import { useEspecialSemana } from "@/presentation/hooks/useEspecialSemana";
import { useRadarOportunidades } from "@/presentation/hooks/useRadarOportunidades";
import { useMiniLivros } from "@/presentation/hooks/useMiniLivros";
import { useBiblioteca } from "@/presentation/hooks/useBiblioteca";
import { useEstudar } from "@/presentation/hooks/useEstudar";
import type { HomeBlockSlug } from "@/constants/homeBlocks";

type LatestTitleItem = { createdAt: Date; title: string };

function getLatestTitles<T extends LatestTitleItem>(
    items: Array<T | null | undefined>,
    limit = 2,
): string[] {
    return items
        .filter((item): item is T => item != null)
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit)
        .map((item) => item.title);
}

const BLOCK_META = [
    {
        slug: "newsletter" as HomeBlockSlug,
        label: "Newsletter",
        number: "01",
        color: "var(--block-newsletter)",
        colorSoft: "var(--block-newsletter-soft)",
        colorOn: "var(--block-newsletter-on)",
        colorOnSoft: "var(--block-newsletter-on-soft)",
        subtitle: "Bloco 01 · Toda quarta",
        shortDesc: "Notícias práticas de IA e startups",
        cadence: "Toda quarta",
        href: "/newsletter",
    },
    {
        slug: "especial-semana" as HomeBlockSlug,
        label: "Inteligência Artificial",
        number: "02",
        color: "var(--block-reportagem)",
        colorSoft: "var(--block-reportagem-soft)",
        colorOn: "var(--block-reportagem-on)",
        colorOnSoft: "var(--block-reportagem-on-soft)",
        subtitle: "Bloco 02 · IA",
        shortDesc: "Notícias e análises importantes para o Brasil",
        cadence: "Atualização contínua",
        href: "/especial-semana",
    },
    {
        slug: "radar" as HomeBlockSlug,
        label: "Editoriais e Artigos",
        number: "03",
        color: "var(--block-radar)",
        colorSoft: "var(--block-radar-soft)",
        colorOn: "var(--block-radar-on)",
        colorOnSoft: "var(--block-radar-on-soft)",
        subtitle: "Bloco 03 · Editorial",
        shortDesc: "Textos curtos e opinião editorial",
        cadence: "3 a 4 por publicação",
        href: "/radar-oportunidades",
    },
    {
        slug: "mini-livros" as HomeBlockSlug,
        label: "Enquanto é Tempo",
        number: "04",
        color: "var(--block-livro)",
        colorSoft: "var(--block-livro-soft)",
        colorOn: "var(--block-livro-on)",
        colorOnSoft: "var(--block-livro-on-soft)",
        subtitle: "Bloco 04 · Mini-livro",
        shortDesc: "Mini-livro publicado a cada semana",
        cadence: "20 de 21 publicados",
        href: "/mini-livros",
    },
    {
        slug: "biblioteca" as HomeBlockSlug,
        label: "Biblioteca",
        number: "05",
        color: "var(--block-biblioteca)",
        colorSoft: "var(--block-biblioteca-soft)",
        colorOn: "var(--block-biblioteca-on)",
        colorOnSoft: "var(--block-biblioteca-on-soft)",
        subtitle: "Bloco 05 · Semanal",
        shortDesc: "Acervo vivo de prompts, leituras e referências",
        cadence: "Atualizada toda semana",
        href: "/biblioteca",
    },
    {
        slug: "estudar" as HomeBlockSlug,
        label: "Estudar",
        number: "06",
        color: "var(--block-estudar)",
        colorSoft: "var(--block-estudar-soft)",
        colorOn: "var(--block-estudar-on)",
        colorOnSoft: "var(--block-estudar-on-soft)",
        subtitle: "Bloco 06 · Em curadoria",
        shortDesc: "Guias, tutoriais e aulas",
        cadence: "Em curadoria",
        href: "/estudar",
    },
    {
        slug: "ensinar" as HomeBlockSlug,
        label: "Ensinar",
        number: "07",
        color: "var(--block-ensinar)",
        colorSoft: "var(--block-ensinar-soft)",
        colorOn: "var(--block-ensinar-on)",
        colorOnSoft: "var(--block-ensinar-on-soft)",
        subtitle: "Bloco 07 · Em construção",
        shortDesc: "Espaço para multiplicar conhecimento",
        cadence: "Em construção",
        href: "#newsletter",
    },
] as const;

export default function HeroBlockCard() {
    const [active, setActive] = useState(0);

    const { descriptions } = useHomeBlockDescriptions();
    const newsletters = useNewsletters();
    const especial = useEspecialSemana();
    const radar = useRadarOportunidades();
    const miniLivros = useMiniLivros();
    const biblioteca = useBiblioteca();
    const estudar = useEstudar();

    const latestTitles: Record<HomeBlockSlug, string[]> = {
        newsletter: getLatestTitles([newsletters.latest, ...newsletters.older]),
        "especial-semana": getLatestTitles([especial.latest, ...especial.older]),
        radar: getLatestTitles([radar.latest, ...radar.older]),
        "mini-livros": getLatestTitles(miniLivros.all),
        biblioteca: getLatestTitles([biblioteca.latest, ...biblioteca.older]),
        estudar: getLatestTitles([estudar.latest, ...estudar.older]),
        ensinar: [],
    };

    const block = BLOCK_META[active];
    const rawDescription = descriptions[block.slug] ?? "";
    const bodyLines = rawDescription.split("\n").filter(Boolean);
    const bodyText = bodyLines.join(" ");
    const titles = latestTitles[block.slug];

    return (
        <div className="rounded-3xl border border-border bg-card/80 p-2 shadow-[var(--shadow-card)] backdrop-blur">
            <div className="flex flex-wrap gap-1 p-2">
                {BLOCK_META.map((b, i) => (
                    <button
                        key={b.slug}
                        onClick={() => setActive(i)}
                        className={`group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${
                            active === i
                                ? ""
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                        style={active === i ? { color: b.colorOn } : undefined}
                    >
                        {active === i && (
                            <span
                                className="absolute inset-0 rounded-full"
                                style={{ backgroundColor: b.color }}
                            />
                        )}
                        <span
                            className="relative size-1.5 rounded-full"
                            style={{
                                backgroundColor:
                                    active === i ? b.colorOn : b.color,
                            }}
                        />
                        <span className="relative font-medium">{b.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative m-2 overflow-hidden rounded-2xl border border-border bg-background p-7">
                <div
                    className="absolute inset-y-0 left-0 w-1.5 transition-colors duration-500"
                    style={{ backgroundColor: block.color }}
                />
                <div className="flex items-start justify-between">
                    <div>
                        <div
                            className="text-[10px] uppercase tracking-[0.22em] transition-colors duration-500"
                            style={{ color: block.colorOnSoft }}
                        >
                            {block.subtitle}
                        </div>
                        <h3 className="mt-2 font-serif text-4xl tracking-tight text-ink md:text-5xl">
                            {block.label}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-foreground/80">
                            {block.shortDesc}
                        </p>
                    </div>
                    <div
                        className="flex size-12 items-center justify-center rounded-xl font-serif text-xl transition-colors duration-500"
                        style={{
                            backgroundColor: block.colorSoft,
                            color: "var(--ink)",
                        }}
                    >
                        {block.number}
                    </div>
                </div>

                {bodyText && (
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                        {bodyText}
                    </p>
                )}

                <div className="mt-6 border-t border-border pt-4">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Última publicação
                    </div>
                    {titles.length > 0 ? (
                        <ul className="space-y-1.5">
                            {titles.map((title) => (
                                <li
                                    key={title}
                                    className="flex items-start gap-2 text-sm text-foreground"
                                >
                                    <span
                                        className="mt-1.5 size-1.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: block.color }}
                                    />
                                    {title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {block.slug === "ensinar"
                                ? "Em construção — em breve."
                                : "Sem publicações recentes."}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <a
                        href={block.href}
                        className="text-[10px] uppercase tracking-[0.22em] transition-colors hover:underline"
                        style={{ color: block.colorOnSoft }}
                    >
                        Acessar {block.label} →
                    </a>
                    <div className="flex items-center gap-1">
                        {BLOCK_META.map((b, i) => (
                            <button
                                key={b.slug}
                                onClick={() => setActive(i)}
                                aria-label={`Ver bloco ${b.label}`}
                                className="h-1.5 cursor-pointer rounded-full transition"
                                style={{
                                    backgroundColor: b.color,
                                    opacity: active === i ? 1 : 0.35,
                                    width: active === i ? "2rem" : "0.75rem",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
