"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";

interface ShareButtonProps {
    title: string;
}

function buildShareLinks(title: string, url: string) {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    return {
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    };
}

export default function ShareButton({ title }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [isOpen]);

    const handleClick = async () => {
        if (canNativeShare) {
            try {
                await navigator.share({ title, url: window.location.href });
            } catch {
                // usuário cancelou o share nativo — não é erro
            }
            return;
        }
        setIsOpen(v => !v);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard indisponível (contexto não seguro, permissão negada) — ignora silenciosamente
        }
    };

    const links = isOpen && typeof window !== "undefined" ? buildShareLinks(title, window.location.href) : null;

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={handleClick}
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                aria-haspopup={canNativeShare ? undefined : "menu"}
                aria-expanded={canNativeShare ? undefined : isOpen}
                aria-label="Compartilhar"
            >
                <Share2 className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Compartilhar</span>
            </button>

            {!canNativeShare && isOpen && links && (
                <div
                    role="menu"
                    aria-label="Compartilhar em"
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-background py-1.5 shadow-[var(--shadow-elevated)]"
                >
                    <a
                        role="menuitem"
                        href={links.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                    >
                        <MessageCircle className="size-4 text-muted-foreground" aria-hidden="true" />
                        WhatsApp
                    </a>
                    <a
                        role="menuitem"
                        href={links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                    >
                        <Linkedin className="size-4 text-muted-foreground" aria-hidden="true" />
                        LinkedIn
                    </a>
                    <a
                        role="menuitem"
                        href={links.email}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                    >
                        <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                        E-mail
                    </a>
                    <button
                        role="menuitem"
                        type="button"
                        onClick={handleCopyLink}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                    >
                        {copied ? (
                            <Check className="size-4 text-muted-foreground" aria-hidden="true" />
                        ) : (
                            <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        {copied ? "Copiado!" : "Copiar link"}
                    </button>
                </div>
            )}
        </div>
    );
}
