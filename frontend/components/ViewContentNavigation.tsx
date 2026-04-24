import type { ContentViewNavigationLink } from "@/application/usecases/GetContentViewNavigationUseCase";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ViewContentNavigationProps {
    previous: ContentViewNavigationLink | null;
    next: ContentViewNavigationLink | null;
}

type NavigationDirection = "previous" | "next";

function NavigationButton({
    direction,
    item,
}: {
    direction: NavigationDirection;
    item: ContentViewNavigationLink;
}) {
    const isPrevious = direction === "previous";
    const Icon = isPrevious ? ArrowLeft : ArrowRight;
    const label = isPrevious ? "Ir para o anterior" : "Ir para o próximo";
    const eyebrow = isPrevious ? "Anterior" : "Próximo";

    return (
        <Link
            href={item.href}
            aria-label={`${label}: ${item.title}`}
            className={cn(
                "group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 px-3.5 py-2.5 text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] sm:max-w-[calc(50%-0.5rem)]",
                isPrevious ? "justify-start text-left" : "justify-end text-right",
            )}
        >
            {isPrevious && <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)] transition-colors group-hover:text-current" />}
            <span className={cn("flex min-w-0 flex-col", isPrevious ? "items-start" : "items-end")}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] transition-colors group-hover:text-current/80">
                    {eyebrow}
                </span>
                <span className="truncate text-xs font-medium sm:text-sm">{item.title}</span>
            </span>
            {!isPrevious && <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)] transition-colors group-hover:text-current" />}
        </Link>
    );
}

export default function ViewContentNavigation({ previous, next }: ViewContentNavigationProps) {
    if (!previous && !next) {
        return null;
    }

    const justifyClassName = previous && next ? "justify-between" : previous ? "justify-start" : "justify-end";

    return (
        <section className="border-t border-[var(--border)] bg-transparent">
            <div className={cn(portalContentClass, "flex flex-wrap gap-3 py-6")}>
                <div className={cn("flex w-full flex-wrap gap-3", justifyClassName)}>
                    {previous && <NavigationButton direction="previous" item={previous} />}
                    {next && <NavigationButton direction="next" item={next} />}
                </div>
            </div>
        </section>
    );
}
