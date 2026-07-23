"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
    const pathname = usePathname();

    const links = [
        { href: "/axioma/perfil", label: "Triagem" },
        { href: "/axioma/tecnico", label: "Prova de IA" },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6 md:h-20">
                {/* Brand */}
                <div className="flex items-center gap-4">
                    {/* PP7+IAS wordmark */}
                    <Link
                        href="/"
                        className="group flex items-start gap-[2px] leading-none font-editorial"
                        aria-label="Voltar ao portal PP7+IAS"
                    >
                        <div className="flex flex-col items-stretch gap-[2px]">
                            <span className="text-xl font-semibold tracking-[-0.03em] text-ink">PP7</span>
                            <span className="h-[2px] w-full rounded-full bg-amber-600" />
                        </div>
                        <Plus className="mt-[3px] size-[13px] shrink-0 text-primary" strokeWidth={2} />
                        <div className="flex flex-col items-start gap-[2px]">
                            <span className="text-xl font-semibold tracking-[0.06em] text-ink">IAS</span>
                            <span className="h-[2px] w-[95%] rounded-full bg-primary" />
                        </div>
                    </Link>

                    {/* Divider */}
                    <span className="h-5 w-px bg-border" aria-hidden="true" />

                    {/* Axioma sub-brand */}
                    <Link href="/axioma" className="font-serif text-lg tracking-tight text-ink">
                        Axioma
                    </Link>
                </div>

                {/* Right side nav */}
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link
                        href="/"
                        className="hidden items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
                    >
                        <ArrowLeft className="size-3.5" aria-hidden="true" />
                        Voltar ao portal
                    </Link>

                    <span className="hidden h-5 w-px bg-border md:block" aria-hidden="true" />

                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`hidden md:inline-flex transition-colors ${
                                pathname === href
                                    ? "font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            style={pathname === href ? { color: "var(--block-estudar)" } : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
