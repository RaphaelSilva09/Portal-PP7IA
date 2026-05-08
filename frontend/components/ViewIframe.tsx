"use client";

import { useEffect, useRef, useState } from "react";

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
    const src = htmlPath;

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
            onBackgroundColorChange?.(getFrameBackgroundColor(iframe));

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
            cleanupFrameObservers();
            cancelScheduledSync();
            initialSyncTimeoutIds.forEach(timeoutId => window.clearTimeout(timeoutId));
        };
    }, [src, onBackgroundColorChange]);

    return (
        <iframe
            ref={iframeReference}
            src={src}
            className="block w-full overflow-hidden border-0"
            style={{ height: `${iframeHeight}px` }}
            title={title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            scrolling="no"
        />
    );
}
