"use client";

import { useEffect, useState } from "react";
import type { ContentViewNavigationLink } from "@/application/usecases/GetContentViewNavigationUseCase";
import ChatBubble from "@/components/chat/ChatBubble";
import ContentReactions from "@/components/ContentReactions";
import ContentViewTracker from "@/components/ContentViewTracker";
import ExportPdfButton from "@/components/ExportPdfButton";
import Navbar from "@/components/Header";
import ReadingPrefsControl from "@/components/ReadingPrefsControl";
import SaveForLaterButton from "@/components/SaveForLaterButton";
import ShareButton from "@/components/ShareButton";
import ViewContentNavigation from "@/components/ViewContentNavigation";
import ViewIframe from "@/components/ViewIframe";
import { isSavableContentType } from "@/domain/entities/SavedContent";
import { cn } from "@/lib/utils";
import { ArrowLeft, Compass, RotateCcw, SearchX } from "lucide-react";
import Link from "next/link";

interface ViewContentFrameProps {
    htmlPath: string;
    title: string;
    previous: ContentViewNavigationLink | null;
    next: ContentViewNavigationLink | null;
    contentType?: string;
    /** Slug do conteúdo — usado para montar o link de exportação em PDF. */
    slug?: string;
    /** Rótulo da seção de origem (ex.: "Newsletter") para a barra de contexto. */
    sectionLabel?: string;
    /** Destino do link de voltar (ex.: /explorar?b=newsletter). */
    backHref?: string;
}

type Availability = "checking" | "ok" | "missing" | "error";

function ContentSkeleton() {
    return (
        <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-6 py-16" aria-hidden="true">
            <div className="h-8 w-3/4 rounded-lg bg-accent" />
            <div className="h-4 w-1/3 rounded-lg bg-accent" />
            <div className="mt-8 space-y-3">
                {[100, 95, 90, 100, 80, 95, 60].map((w, i) => (
                    <div key={i} className="h-4 rounded-lg bg-accent" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    );
}

function ContentError({ kind, backHref, sectionLabel, onRetry }: {
    kind: "missing" | "error";
    backHref: string;
    sectionLabel: string;
    onRetry: () => void;
}) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
                <SearchX className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-serif text-3xl tracking-tight text-ink">
                {kind === "missing" ? "Não encontramos este conteúdo." : "Não foi possível carregar."}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {kind === "missing"
                    ? "Ele pode ter sido movido ou o link veio quebrado. O restante da seção continua no lugar."
                    : "Algo falhou no caminho. Verifique sua conexão e tente novamente."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {kind === "error" && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background transition hover:bg-primary"
                    >
                        <RotateCcw className="size-4" aria-hidden="true" />
                        Tentar novamente
                    </button>
                )}
                <Link
                    href={backHref}
                    className={
                        kind === "missing"
                            ? "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-background transition hover:bg-primary"
                            : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                    }
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Voltar para {sectionLabel}
                </Link>
                <Link
                    href="/explorar"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                >
                    <Compass className="size-4" aria-hidden="true" />
                    Explorar conteúdos
                </Link>
            </div>
        </div>
    );
}

export default function ViewContentFrame({
    htmlPath,
    title,
    previous,
    next,
    contentType,
    slug,
    sectionLabel = "o portal",
    backHref = "/explorar",
}: ViewContentFrameProps) {
    const [shellBackgroundColor, setShellBackgroundColor] = useState<string | null>(null);
    const [availability, setAvailability] = useState<Availability>("checking");
    const [retryToken, setRetryToken] = useState(0);
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setAvailability("checking");
        // O proxy devolve JSON de erro em 404 — checar antes evita renderizar
        // JSON cru dentro do iframe (auditoria UX-001).
        fetch(htmlPath, { method: "HEAD" })
            .then(res => {
                if (cancelled) return;
                setAvailability(res.ok ? "ok" : "missing");
            })
            .catch(() => {
                if (!cancelled) setAvailability("error");
            });
        return () => { cancelled = true; };
    }, [htmlPath, retryToken]);

    return (
        <div
            className="min-h-screen bg-[var(--background)]"
            style={shellBackgroundColor ? { backgroundColor: shellBackgroundColor } : undefined}
        >
            <Navbar autoHideOnScroll onAutoHiddenChange={setIsHeaderHidden} />
            {contentType && availability === "ok" && <ContentViewTracker contentType={contentType} title={title} contentId={slug} />}

            {/* Barra de contexto: voltar à seção + compartilhar/exportar PDF.
                Sticky a top-16/20 (altura do header) — quando o header some por
                autoHideOnScroll, desloca a mesma distância via transform (não
                `top`, para casar com a transição por transform do próprio
                header) e assim fecha o vão que sobraria no topo.
                Os ajustes de leitura NÃO ficam aqui: são o botão flutuante
                `ReadingPrefsControl`, renderizado fora desta div — colocá-lo
                dentro criaria um novo bloco de contenção quando o header some
                (o `transform` acima passaria a ser o ponto de referência do
                `position: fixed` do botão, tirando-o do canto da tela). */}
            <div
                className={cn(
                    "sticky top-16 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md transition-transform duration-300 ease-out md:top-20",
                    isHeaderHidden && "-translate-y-16 md:-translate-y-20",
                )}
            >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2">
                    <Link
                        href={backHref}
                        className="inline-flex min-w-0 items-center gap-1.5 justify-self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate uppercase tracking-[0.18em]">{sectionLabel}</span>
                    </Link>

                    <p
                        className="hidden max-w-[min(60vw,32rem)] truncate text-center text-sm font-medium text-foreground sm:block"
                        title={title}
                    >
                        {title}
                    </p>

                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 justify-self-end">
                        {availability === "ok" && (
                            <>
                                <ShareButton title={title} />
                                {contentType && slug && <ExportPdfButton contentType={contentType} slug={slug} />}
                                {contentType && slug && isSavableContentType(contentType) && (
                                    <SaveForLaterButton contentType={contentType} contentId={slug} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {availability === "ok" && <ReadingPrefsControl />}

            <main id="conteudo">
                {availability === "checking" && <ContentSkeleton />}
                {availability === "ok" && (
                    <ViewIframe htmlPath={htmlPath} title={title} onBackgroundColorChange={setShellBackgroundColor} />
                )}
                {(availability === "missing" || availability === "error") && (
                    <ContentError
                        kind={availability}
                        backHref={backHref}
                        sectionLabel={sectionLabel}
                        onRetry={() => setRetryToken(t => t + 1)}
                    />
                )}
            </main>

            {availability === "ok" && contentType && slug && <ContentReactions contentType={contentType} contentId={slug} />}
            {availability === "ok" && <ViewContentNavigation previous={previous} next={next} />}

            {availability === "ok" && contentType && slug && process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false" && (
                <ChatBubble articleContext={{ contentType, contentId: slug }} />
            )}
        </div>
    );
}
