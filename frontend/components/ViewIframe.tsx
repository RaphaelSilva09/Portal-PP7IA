"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { applyFontScaleToDocument, buildReadingPrefsCss, loadReadingPrefs, READING_PREFS_EVENT } from "@/lib/readingPrefs";

// Tinge o conteúdo do iframe — este é HTML de conteúdo próprio (newsletter,
// biblioteca etc.), alheio ao tema do portal, então não há como fazê-lo
// reagir ao tema por dentro. Um `filter: sepia()` no próprio elemento
// <iframe> tinge o que for renderizado ali dentro, ignorando same-origin —
// é um filtro visual sobre a pintura final do elemento, não algo que exija
// acesso ao documento do iframe.
export const SEPIA_AMOUNT = 0.55;
const SEPIA_FILTER = `sepia(${SEPIA_AMOUNT})`;

/**
 * Reproduz em JS a mesma matriz que `filter: sepia()` aplica nos pixels do
 * iframe (spec do CSS Filter Effects), pra tingir a cor de fundo relatada ao
 * pai com o MESMO tom — sem isso, `ViewContentFrame` pintaria o resto da
 * página (avaliação do conteúdo, próximo/anterior) com a cor original,
 * destoando do conteúdo do iframe, que está visualmente sépia.
 */
export function applySepiaToColor(color: string, amount: number): string {
    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (!match) return color;

    const parts = match[1].split(",").map(part => parseFloat(part.trim()));
    const [r, g, b, a] = parts;
    if (![r, g, b].every(Number.isFinite)) return color;

    const sepiaR = 0.393 * r + 0.769 * g + 0.189 * b;
    const sepiaG = 0.349 * r + 0.686 * g + 0.168 * b;
    const sepiaB = 0.272 * r + 0.534 * g + 0.131 * b;

    const mix = (original: number, sepia: number) =>
        Math.min(255, Math.max(0, Math.round(original * (1 - amount) + sepia * amount)));

    const nr = mix(r, sepiaR);
    const ng = mix(g, sepiaG);
    const nb = mix(b, sepiaB);

    return Number.isFinite(a) ? `rgba(${nr}, ${ng}, ${nb}, ${a})` : `rgb(${nr}, ${ng}, ${nb})`;
}

const READING_PREFS_STYLE_ID = "pp7ias-reading-prefs";

/**
 * Faz links externos do conteúdo abrirem em nova aba.
 *
 * O HTML é exibido dentro de um <iframe>. Sem isso, um link sem `target`
 * navega o próprio iframe para o site externo — que costuma recusar ser
 * embedado (X-Frame-Options: DENY / frame-ancestors), resultando na tela
 * "another site has embedded it" no lugar do conteúdo. Abrir em nova aba
 * (target="_blank", já permitido por allow-popups) evita o embed e leva o
 * usuário direto ao destino. Âncoras internas (#...) e links relativos
 * ficam intactos.
 */
function openExternalLinksInNewTab(iframe: HTMLIFrameElement): void {
    const contentDocument = iframe.contentDocument;
    if (!contentDocument || typeof contentDocument.querySelectorAll !== "function") return;

    const anchors = contentDocument.querySelectorAll<HTMLAnchorElement>("a[href]");
    anchors.forEach(anchor => {
        const href = anchor.getAttribute("href")?.trim();
        if (!href) return;

        // Só links externos absolutos (http(s):// ou //). Ignora #âncora,
        // relativos, mailto:, tel: etc.
        const isExternal = /^(https?:)?\/\//i.test(href);
        if (!isExternal) return;

        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
    });
}

function applyReadingPrefs(iframe: HTMLIFrameElement): void {
    const contentDocument = iframe.contentDocument;
    if (!contentDocument?.head) return;

    const prefs = loadReadingPrefs();
    const css = buildReadingPrefsCss(prefs);
    let styleElement = contentDocument.getElementById(READING_PREFS_STYLE_ID);

    if (!css) {
        styleElement?.remove();
    } else {
        if (!styleElement) {
            styleElement = contentDocument.createElement("style");
            styleElement.id = READING_PREFS_STYLE_ID;
            contentDocument.head.appendChild(styleElement);
        }

        styleElement.textContent = css;
    }

    applyFontScaleToDocument(contentDocument, prefs.fontScale);
}

const MIN_IFRAME_HEIGHT_PX = 720;
const IFRAME_HEIGHT_BUFFER_PX = 24;

function getElementRectHeight(element: { getBoundingClientRect?: () => DOMRect }): number {
    return typeof element.getBoundingClientRect === "function"
        ? Math.ceil(element.getBoundingClientRect().height)
        : 0;
}

function getDeepestDescendantBottom(contentRoot: HTMLElement): number {
    const rootTop = typeof contentRoot.getBoundingClientRect === "function"
        ? contentRoot.getBoundingClientRect().top
        : 0;
    const descendants = typeof contentRoot.querySelectorAll === "function"
        ? Array.from(contentRoot.querySelectorAll("*"))
        : [];

    return descendants.reduce((maxBottom, node) => {
        if (typeof node.getBoundingClientRect !== "function") {
            return maxBottom;
        }

        const nodeBottom = node.getBoundingClientRect().bottom - rootTop;
        return Math.max(maxBottom, Math.ceil(nodeBottom));
    }, 0);
}

function getIframeContentHeight(iframe: HTMLIFrameElement): number {
    const body = iframe.contentDocument?.body;

    if (!body) {
        return MIN_IFRAME_HEIGHT_PX;
    }

    const deepestDescendantBottom = getDeepestDescendantBottom(body);
    const measuredHeight = deepestDescendantBottom > 0
        ? deepestDescendantBottom
        : Math.max(body.scrollHeight, body.offsetHeight, body.clientHeight, getElementRectHeight(body));

    return Math.max(measuredHeight + IFRAME_HEIGHT_BUFFER_PX, MIN_IFRAME_HEIGHT_PX);
}

function getFrameBackgroundColor(iframe: HTMLIFrameElement): string | null {
    const contentDocument = iframe.contentDocument;

    if (!contentDocument) {
        return null;
    }

    const candidates = [contentDocument.body, contentDocument.documentElement];

    for (const candidate of candidates) {
        const ownerWindow = candidate?.ownerDocument?.defaultView ?? contentDocument.defaultView;

        if (!candidate || !ownerWindow || typeof ownerWindow.getComputedStyle !== "function") {
            continue;
        }

        try {
            const backgroundColor = ownerWindow.getComputedStyle(candidate).backgroundColor?.trim();

            if (backgroundColor && backgroundColor !== "transparent" && backgroundColor !== "rgba(0, 0, 0, 0)") {
                return backgroundColor;
            }
        } catch {
            continue;
        }
    }

    return null;
}

interface ViewIframeProps {
    htmlPath: string;
    title: string;
    onBackgroundColorChange?: (color: string | null) => void;
}

export default function ViewIframe({ htmlPath, title, onBackgroundColorChange }: ViewIframeProps) {
    const iframeReference = useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState(MIN_IFRAME_HEIGHT_PX);
    const [rawBackgroundColor, setRawBackgroundColor] = useState<string | null>(null);
    const src = htmlPath;
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isSepia = mounted && resolvedTheme === "theme-sepia";

    // Reporta a cor de fundo (crua ou tingida de sépia) sempre que a cor lida
    // do iframe OU o tema mudarem — não só quando o iframe carrega. Sem isso,
    // trocar para sépia depois que o conteúdo já carregou não atualizaria a
    // cor repassada ao ViewContentFrame.
    useEffect(() => {
        if (rawBackgroundColor === null) {
            onBackgroundColorChange?.(null);
            return;
        }
        onBackgroundColorChange?.(isSepia ? applySepiaToColor(rawBackgroundColor, SEPIA_AMOUNT) : rawBackgroundColor);
    }, [rawBackgroundColor, isSepia, onBackgroundColorChange]);

    useEffect(() => {
        const iframe = iframeReference.current;

        if (!iframe) {
            return;
        }

        const initialSyncTimeoutIds: number[] = [];
        let animationFrameId: number | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let mutationObserver: MutationObserver | null = null;
        let detachDocumentListeners: (() => void) | null = null;

        const cancelScheduledSync = () => {
            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        const syncHeight = () => {
            const nextHeight = getIframeContentHeight(iframe);
            setIframeHeight(currentHeight => (currentHeight === nextHeight ? currentHeight : nextHeight));
        };

        const scheduleHeightSync = () => {
            cancelScheduledSync();
            animationFrameId = window.requestAnimationFrame(() => {
                animationFrameId = null;
                syncHeight();
            });
        };

        const cleanupFrameObservers = () => {
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            detachDocumentListeners?.();

            resizeObserver = null;
            mutationObserver = null;
            detachDocumentListeners = null;
        };

        const handleLoad = () => {
            cleanupFrameObservers();
            applyReadingPrefs(iframe);
            openExternalLinksInNewTab(iframe);
            setRawBackgroundColor(getFrameBackgroundColor(iframe));

            const contentDocument = iframe.contentDocument;
            const contentWindow = iframe.contentWindow;
            const rootElement = contentDocument?.documentElement;
            const bodyElement = contentDocument?.body;

            if (!contentDocument || !contentWindow) {
                scheduleHeightSync();
                return;
            }

            if (typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(() => scheduleHeightSync());
                if (rootElement instanceof Element) {
                    resizeObserver.observe(rootElement);
                }

                if (bodyElement instanceof Element) {
                    resizeObserver.observe(bodyElement);
                }
            }

            if (rootElement instanceof Node) {
                mutationObserver = new MutationObserver(() => scheduleHeightSync());
                mutationObserver.observe(rootElement, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true,
                });
            }

            contentWindow.addEventListener("resize", scheduleHeightSync);
            contentDocument.addEventListener("readystatechange", scheduleHeightSync);

            detachDocumentListeners = () => {
                contentWindow.removeEventListener("resize", scheduleHeightSync);
                contentDocument.removeEventListener("readystatechange", scheduleHeightSync);
            };

            scheduleHeightSync();
        };

        iframe.addEventListener("load", handleLoad);

        const handlePrefsChange = () => {
            applyReadingPrefs(iframe);
            scheduleHeightSync();
        };
        window.addEventListener(READING_PREFS_EVENT, handlePrefsChange);

        if (iframe.contentDocument?.readyState === "complete") {
            handleLoad();
        }

        [150, 600, 1800].forEach(delay => {
            const timeoutId = window.setTimeout(() => {
                handleLoad();
            }, delay);

            initialSyncTimeoutIds.push(timeoutId);
        });

        return () => {
            iframe.removeEventListener("load", handleLoad);
            window.removeEventListener(READING_PREFS_EVENT, handlePrefsChange);
            cleanupFrameObservers();
            cancelScheduledSync();
            initialSyncTimeoutIds.forEach(timeoutId => window.clearTimeout(timeoutId));
        };
    }, [src]);

    return (
        <iframe
            ref={iframeReference}
            src={src}
            className="block w-full overflow-hidden border-0 transition-[filter] duration-300 ease-out"
            style={{ height: `${iframeHeight}px`, filter: isSepia ? SEPIA_FILTER : undefined }}
            title={title}
            // Links externos são reescritos para target="_blank" (openExternalLinksInNewTab),
            // abrindo em nova aba em vez de navegar o iframe — que quebraria em sites que
            // recusam embed (X-Frame-Options). allow-popups-to-escape-sandbox faz o destino
            // abrir fora do sandbox (origem real), senão carregaria quebrado.
            // Conteúdo é HTML curado pelo admin (confiável), então afrouxar aqui é seguro.
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
            scrolling="no"
        />
    );
}
