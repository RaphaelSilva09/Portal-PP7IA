import Navbar from "@/components/Header";
import Footer from "@/components/Footer";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft, Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Página não encontrada · PP7+IAS",
    description: "O conteúdo que você procura não está mais aqui — ou o link veio quebrado.",
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className={`${portalContentClass} flex flex-1 flex-col items-center justify-center py-24 text-center`}>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Erro 404
                </p>
                <h1 className="mt-3 font-serif text-5xl tracking-tight text-ink md:text-6xl">
                    Página não encontrada.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                    O conteúdo que você procura não está mais aqui — ou o link veio quebrado.
                    Sem ruído: escolha um caminho abaixo.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/explorar"
                        className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition hover:bg-primary"
                    >
                        <Compass className="size-4" aria-hidden="true" />
                        Índice do conteúdo publicado
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Voltar ao início
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
