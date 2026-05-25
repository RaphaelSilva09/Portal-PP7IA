"use client";

import { portalContentClass } from "@/lib/layout";
import { ArrowUpRight, BookOpen, GraduationCap, Heart, Library, Mail, Search, Star } from "lucide-react";
import { useBiblioteca } from "../presentation/hooks/useBiblioteca";
import { useEspecialSemana } from "../presentation/hooks/useEspecialSemana";
import { useEstudar } from "../presentation/hooks/useEstudar";
import { useMiniLivros } from "../presentation/hooks/useMiniLivros";
import { useNewsletters } from "../presentation/hooks/useNewsletters";
import { useRadarOportunidades } from "../presentation/hooks/useRadarOportunidades";
import { useHomeBlockDescriptions } from "../presentation/hooks/useHomeBlockDescriptions";

type LatestTitleItem = {
    createdAt: Date;
    title: string;
};

function getLatestTitles<T extends LatestTitleItem>(items: Array<T | null | undefined>, limit = 2): string[] {
    return items
        .filter((item): item is T => item != null)
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit)
        .map(item => item.title);
}

function LatestTitles({ titles }: { titles: string[] }) {
    if (titles.length === 0) {
        return <p className="mt-4 text-xs text-text-secondary/85 tracking-tight">Sem conteúdos editoriais neste momento.</p>;
    }

    return (
        <div className="mt-4">
            <div className="mb-2 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    Ultimos adicionados
                </span>
            </div>

            <div className="mb-2 h-px w-full bg-border/45" />

            <ul className="space-y-2">
                {titles.map((title, index) => (
                    <li
                        key={`${title}-${index}`}
                        className="group/item flex items-start gap-2 px-0 py-1 transition-colors duration-200"
                    >
                        <span className="mt-2 inline-flex h-1 w-1 shrink-0 rounded-full bg-brand-blue/70" />
                        <span className="text-sm text-foreground/95 leading-snug line-clamp-2 tracking-tight group-hover/item:text-foreground">
                            {title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

type CardHeaderProps = {
    icon: React.ReactNode;
    title: React.ReactNode;
    titleClassName: string;
    arrowClassName: string;
};

function CardHeader({ icon, title, titleClassName, arrowClassName }: CardHeaderProps) {
    return (
        <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
                <div className="shrink-0">{icon}</div>
                <div className="min-w-0">
                    <div className={titleClassName}>{title}</div>
                </div>
            </div>

            <ArrowUpRight className={arrowClassName} />
        </div>
    );
}

export default function BentoGrid() {
    const newsletters = useNewsletters();
    const especial = useEspecialSemana();
    const radar = useRadarOportunidades();
    const miniLivros = useMiniLivros();
    const biblioteca = useBiblioteca();
    const estudar = useEstudar();
    const { descriptions } = useHomeBlockDescriptions();

    const newsletterTitles = getLatestTitles([newsletters.latest, ...newsletters.older]);
    const especialTitles = getLatestTitles([especial.latest, ...especial.older]);
    const radarTitles = getLatestTitles([radar.latest, ...radar.older]);
    const miniLivrosTitles = getLatestTitles(miniLivros.all);
    const bibliotecaTitles = getLatestTitles([biblioteca.latest, ...biblioteca.older]);
    const estudarTitles = getLatestTitles([estudar.latest, ...estudar.older]);

    return (
        <section id="indice" className="py-8" style={{ scrollMarginTop: "100px" }}>
            <div className={portalContentClass}>
                <div className="mx-auto max-w-4xl">
                    <div className="flex flex-col gap-4 text-center sm:gap-6">
                        <div className="flex flex-col items-center gap-1 pb-8 sm:pb-10 md:pb-12">
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                                Sobre os{" "}
                                <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                    7 Blocos
                                </span>
                            </h3>
                            <p className="max-w-2xl px-4 text-sm tracking-tight text-text-secondary sm:text-base">
                                Cada bloco foi projetado e revisado para entregar valor específico e complementar.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-8">
                    <a
                        href="/explorar?b=newsletter"
                        id="newsletter"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-blue-500/35 bg-gradient-to-br from-blue-600/10 via-indigo-500/8 to-card/90 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:from-blue-600/15 hover:via-indigo-500/10 hover:to-card/95 hover:border-blue-500/55 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] xl:col-span-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col p-5 sm:p-6">
                            <CardHeader
                                icon={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 transition-transform duration-300 group-hover:scale-110">
                                        <Mail className="h-5 w-5 text-blue-700" />
                                    </div>
                                }
                                title="Newsletter"
                                titleClassName="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-tight text-foreground"
                                arrowClassName="mt-1 h-5 w-5 shrink-0 text-text-secondary opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-700 group-hover:opacity-100"
                            />

                            <div className="max-w-5xl flex-1">
                                {descriptions.newsletter.split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`newsletter-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm leading-relaxed tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                                <LatestTitles titles={newsletterTitles} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 to-indigo-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </a>

                    <a
                        href="/explorar?b=reportagem"
                        id="especial"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-700/12 via-yellow-500/8 to-card/90 backdrop-blur-sm transition-all duration-300 hover:from-amber-700/18 hover:via-yellow-500/12 hover:to-card/95 hover:border-amber-600/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] xl:col-span-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col gap-3 p-4 sm:p-5">
                            <CardHeader
                                icon={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/15 transition-transform duration-300 group-hover:scale-110">
                                        <Star className="h-5 w-5 text-amber-800" />
                                    </div>
                                }
                                title="Reportagem da Semana"
                                titleClassName="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground"
                                arrowClassName="mt-1 h-5 w-5 shrink-0 text-text-secondary opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-800 group-hover:opacity-100"
                            />

                            <div className="flex-1">
                                {descriptions["especial-semana"].split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`especial-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                                <LatestTitles titles={especialTitles} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-amber-600 via-yellow-500 to-yellow-600 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </a>

                    <a
                        href="/explorar?b=radar"
                        id="radar"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-orange-600/40 bg-gradient-to-br from-orange-700/12 via-red-500/8 to-card/90 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:from-orange-700/18 hover:via-red-500/12 hover:to-card/95 hover:border-orange-700/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] xl:col-span-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col gap-3 p-4 sm:p-5">
                            <CardHeader
                                icon={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-700/15 transition-transform duration-300 group-hover:scale-110">
                                        <Search className="h-5 w-5 text-orange-800" />
                                    </div>
                                }
                                title="Radar"
                                titleClassName="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground"
                                arrowClassName="mt-1 h-5 w-5 shrink-0 text-text-secondary opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-orange-800 group-hover:opacity-100"
                            />

                            <div className="flex-1">
                                {descriptions.radar.split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`radar-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                                <LatestTitles titles={radarTitles} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-orange-700 via-orange-600 to-red-600 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </a>

                    <a
                        href="/explorar?b=livro"
                        id="mini-livros"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-green-500/35 bg-gradient-to-br from-green-600/10 via-emerald-500/8 to-card/90 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:from-green-600/15 hover:via-emerald-500/10 hover:to-card/95 hover:border-green-500/55 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] xl:col-span-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col gap-3 p-4 sm:p-5">
                            <CardHeader
                                icon={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/15 transition-transform duration-300 group-hover:scale-110">
                                        <BookOpen className="h-5 w-5 text-green-700" />
                                    </div>
                                }
                                title="Enquanto é Tempo"
                                titleClassName="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground"
                                arrowClassName="mt-1 h-5 w-5 shrink-0 text-text-secondary opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-green-700 group-hover:opacity-100"
                            />

                            <div className="flex-1">
                                {descriptions["mini-livros"].split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`mini-livros-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                                <LatestTitles titles={miniLivrosTitles} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-green-500 to-emerald-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </a>

                    <a
                        href="/explorar?b=biblioteca"
                        id="biblioteca"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-purple-500/35 bg-gradient-to-br from-purple-600/10 via-violet-500/8 to-card/90 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:from-purple-600/15 hover:via-violet-500/10 hover:to-card/95 hover:border-purple-500/55 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] xl:col-span-2 xl:col-start-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col gap-3 p-4 sm:p-5">
                            <CardHeader
                                icon={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/15 transition-transform duration-300 group-hover:scale-110">
                                        <Library className="h-5 w-5 text-purple-700" />
                                    </div>
                                }
                                title="Biblioteca"
                                titleClassName="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground"
                                arrowClassName="mt-1 h-5 w-5 shrink-0 text-text-secondary opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-purple-700 group-hover:opacity-100"
                            />

                            <div className="flex-1">
                                {descriptions.biblioteca.split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`biblioteca-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                                <LatestTitles titles={bibliotecaTitles} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-purple-500 to-pink-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </a>

                    <a
                        href="/explorar?b=estudar"
                        id="estudar"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-blue-500/35 bg-gradient-to-br from-blue-600/10 via-cyan-500/8 to-card/90 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:from-blue-600/15 hover:via-cyan-500/10 hover:to-card/95 hover:border-blue-500/55 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] xl:col-span-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col gap-3 p-4 sm:p-5">
                            <CardHeader
                                icon={
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 transition-transform duration-300 group-hover:scale-110">
                                        <GraduationCap className="h-5 w-5 text-blue-700" />
                                    </div>
                                }
                                title="Estudar"
                                titleClassName="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground"
                                arrowClassName="mt-1 h-5 w-5 shrink-0 text-text-secondary opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-700 group-hover:opacity-100"
                            />

                            <div className="flex-1">
                                {descriptions.estudar.split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`estudar-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                                <LatestTitles titles={estudarTitles} />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 to-cyan-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </a>

                    <div
                        id="ensinar"
                        className="group relative block h-full overflow-hidden rounded-3xl border border-pink-500/35 bg-gradient-to-br from-pink-600/10 via-rose-500/8 to-card/90 backdrop-blur-sm transition-all duration-300 hover:from-pink-600/15 hover:via-rose-500/10 hover:to-card/95 hover:border-pink-500/55 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] xl:col-span-2"
                        style={{ scrollMarginTop: "100px" }}
                    >
                        <div className="relative z-10 flex h-full min-h-[310px] flex-col gap-3 p-4 sm:p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-600/15 transition-transform duration-300 group-hover:scale-110">
                                        <Heart className="h-5 w-5 text-pink-700" />
                                    </div>
                                    <h4 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
                                        Ensinar
                                    </h4>
                                </div>

                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/12 px-2.5 py-1 text-xs font-semibold text-pink-700">
                                    Em breve
                                </span>
                            </div>

                            <div className="flex-1">
                                {descriptions.ensinar.split("\n").filter(Boolean).map((line, index) => (
                                    <p
                                        key={`ensinar-desc-${index}`}
                                        className={
                                            index === 0
                                                ? "mb-0.5 text-sm font-medium tracking-tight text-text-secondary"
                                                : "text-sm tracking-tight text-text-secondary"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-linear-to-r from-pink-500 to-rose-500 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
