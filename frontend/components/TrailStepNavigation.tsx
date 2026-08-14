import type { TrailStepNavigation as TrailStepNavigationData } from "@/domain/entities/ReadingTrail";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Route } from "lucide-react";
import Link from "next/link";

interface Props {
    trail: TrailStepNavigationData;
}

/**
 * Navegação anterior/próximo dentro de uma trilha de leitura — mesma ideia do
 * "próximo capítulo" do mini-livro (ViewContentNavigation), mas escopada à
 * sequência da trilha em vez do tipo de conteúdo. Só aparece quando o leitor
 * chegou ao conteúdo via um link com `?trilha=slug`.
 */
export default function TrailStepNavigation({ trail }: Props) {
    return (
        <section className="border-t border-border" style={{ backgroundColor: "var(--block-radar-soft)" }}>
            <div className={cn(portalContentClass, "py-6")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={`/trilhas/${trail.trailSlug}`}
                        className="group inline-flex min-w-0 items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-primary"
                    >
                        <Route className="size-4 shrink-0" style={{ color: "var(--block-radar)" }} aria-hidden="true" />
                        <span className="truncate">{trail.trailTitle}</span>
                    </Link>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        Passo {trail.position} de {trail.total}
                    </span>
                </div>

                {(trail.previous || trail.next) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        {trail.previous && (
                            <Link
                                href={trail.previous.href}
                                aria-label={`Passo anterior da trilha: ${trail.previous.title}`}
                                className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-foreground shadow-sm transition-colors hover:bg-accent sm:max-w-[calc(50%-0.5rem)]"
                            >
                                <ArrowLeft className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-current" aria-hidden="true" />
                                <span className="flex min-w-0 flex-col items-start">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Anterior</span>
                                    <span className="truncate text-xs font-medium sm:text-sm">{trail.previous.title}</span>
                                </span>
                            </Link>
                        )}
                        {trail.next && (
                            <Link
                                href={trail.next.href}
                                aria-label={`Próximo passo da trilha: ${trail.next.title}`}
                                className="group ml-auto flex min-w-0 flex-1 items-center justify-end gap-2.5 rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-right text-foreground shadow-sm transition-colors hover:bg-accent sm:max-w-[calc(50%-0.5rem)]"
                            >
                                <span className="flex min-w-0 flex-col items-end">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Próximo</span>
                                    <span className="truncate text-xs font-medium sm:text-sm">{trail.next.title}</span>
                                </span>
                                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-current" aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
